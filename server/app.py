from __future__ import annotations

import json
import platform
import shutil
import subprocess
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path

# --- 新しいライブラリのインポート ---
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn

# --- ディレクトリ設定 ---
BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_PATH = BASE_DIR / "templates" / "index.html"
STATIC_DIR = BASE_DIR / "static"
DATA_DIR = BASE_DIR / "data"
CONFIG_DIR = BASE_DIR / "config"
MEDIA_DIR = DATA_DIR / "media"
LIBRARY_PATH = DATA_DIR / "library.json"
SETTINGS_PATH = CONFIG_DIR / "settings.json"
DEFAULT_COVER = "/static/images/cover-rise-up.svg"

DEFAULT_SETTINGS = {
    "app": {
        "name": "SquashTerm",
        "version": "0.1.0",
        "api": "FastAPI",
        "build": "2024.11.18",
    },
    "device": "Raspberry Pi (prototype)",
    "storage": {
        "used_gb": 3.8,
        "total_gb": 9.0,
    },
    "playback_options": [
        {
            "id": "allow_remote",
            "label": "ネットワークからのアクセスを許可",
            "enabled": True,
        },
        {
            "id": "auto_scan",
            "label": "自動ライブラリスキャン",
            "enabled": False,
        },
    ],
}

# --- データモデル (Pydantic & Dataclass) ---

@dataclass
class Track:
    id: str
    title: str
    artist: str
    album: str
    cover: str
    duration: str
    bpm: int
    genre: str
    year: int
    file_url: str | None = None

class ImportRequest(BaseModel):
    url: str

# --- ヘルパー関数 (既存ロジックを流用) ---

def _ensure_data_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)

def _format_duration(seconds: int | None) -> str:
    if not seconds:
        return "--"
    minutes, remainder = divmod(int(seconds), 60)
    return f"{minutes}:{remainder:02d}"

def _parse_year(info: dict) -> int:
    for key in ("release_year", "year"):
        value = info.get(key)
        if isinstance(value, int):
            return value
    upload_date = info.get("upload_date")
    if isinstance(upload_date, str) and len(upload_date) >= 4:
        try:
            return int(upload_date[:4])
        except ValueError:
            return 0
    return 0

def _parse_track_from_info(info: dict) -> Track:
    return Track(
        id=f"yt_{info.get('id', uuid.uuid4().hex)}",
        title=info.get("track") or info.get("title") or "Unknown Title",
        artist=info.get("artist") or info.get("uploader") or "Unknown Artist",
        album=info.get("album") or "Unknown Album",
        cover=DEFAULT_COVER,
        duration=_format_duration(info.get("duration")),
        bpm=int(info.get("bpm") or 0),
        genre=info.get("genre") or "Unknown",
        year=_parse_year(info),
    )

def _resolve_thumbnail_path(info: dict) -> str | None:
    track_id = info.get("id")
    if not track_id:
        return None
    candidates: list[str] = []
    thumbnails = info.get("thumbnails") or []
    if isinstance(thumbnails, list):
        for thumb in thumbnails:
            if not isinstance(thumb, dict):
                continue
            ext = thumb.get("ext")
            if isinstance(ext, str):
                candidates.append(ext.lower())
            url = thumb.get("url")
            if isinstance(url, str) and "." in url:
                candidates.append(url.rsplit(".", 1)[-1].lower())
    thumbnail_url = info.get("thumbnail")
    if isinstance(thumbnail_url, str) and "." in thumbnail_url:
        candidates.append(thumbnail_url.rsplit(".", 1)[-1].lower())
    known_exts = [".webp", ".jpg", ".jpeg", ".png", ".avif"]
    ordered_exts = []
    for ext in candidates:
        ext_with_dot = f".{ext.lstrip('.')}"
        if ext_with_dot in known_exts and ext_with_dot not in ordered_exts:
            ordered_exts.append(ext_with_dot)
    for ext in known_exts:
        if ext not in ordered_exts:
            ordered_exts.append(ext)
    for ext in ordered_exts:
        candidate = MEDIA_DIR / f"{track_id}{ext}"
        if candidate.exists():
            return f"/media/{candidate.name}"
    for candidate in MEDIA_DIR.glob(f"{track_id}.*"):
        if candidate.suffix.lower() in {".json", ".mp3"}:
            continue
        return f"/media/{candidate.name}"
    return None

def _init_library() -> None:
    _ensure_data_dirs()
    if LIBRARY_PATH.exists():
        return
    data = {
        "tracks": [],
        "playlists": [],
        "favorites": [],
    }
    LIBRARY_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def _init_settings() -> None:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    if SETTINGS_PATH.exists():
        return
    SETTINGS_PATH.write_text(
        json.dumps(DEFAULT_SETTINGS, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

def _load_library() -> dict:
    _ensure_data_dirs()
    if not LIBRARY_PATH.exists():
        _init_library()
    content = LIBRARY_PATH.read_text(encoding="utf-8")
    return json.loads(content)

def _load_settings() -> dict:
    _ensure_data_dirs()
    if not SETTINGS_PATH.exists():
        _init_settings()
    content = SETTINGS_PATH.read_text(encoding="utf-8")
    return json.loads(content)

def _save_library(data: dict) -> None:
    LIBRARY_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def _fetch_tracks() -> list[Track]:
    data = _load_library()
    rows = data.get("tracks", [])
    tracks = []
    for row in rows:
        file_path = row.get("file_path")
        file_url = f"/media/{Path(file_path).name}" if file_path else None
        tracks.append(
            Track(
                id=row["id"],
                title=row["title"],
                artist=row["artist"],
                album=row["album"],
                cover=row["cover"],
                duration=row["duration"],
                bpm=row["bpm"],
                genre=row["genre"],
                year=row["year"],
                file_url=file_url,
            )
        )
    return tracks

def _fetch_playlists() -> list[dict]:
    data = _load_library()
    return data.get("playlists", [])

def _fetch_favorites() -> list[str]:
    data = _load_library()
    return data.get("favorites", [])

def _build_settings_payload() -> dict:
    settings = _load_settings()
    app_settings = settings.get("app", {})
    storage = settings.get("storage", {})
    used_gb = storage.get("used_gb", 0)
    total_gb = storage.get("total_gb", 0)
    percent = int((used_gb / total_gb) * 100) if total_gb else 0
    return {
        "version": {
            "app": app_settings.get("version", ""),
            "api": app_settings.get("api", ""),
            "build": app_settings.get("build", ""),
        },
        "storage": {
            "used_gb": used_gb,
            "total_gb": total_gb,
            "percent": percent,
        },
        "playback_options": settings.get("playback_options", []),
    }

def _build_system_payload() -> dict:
    usage = shutil.disk_usage(DATA_DIR)
    total_gb = usage.total / (1024**3)
    free_gb = usage.free / (1024**3)
    used_gb = usage.used / (1024**3)
    percent = int((used_gb / total_gb) * 100) if total_gb else 0
    return {
        "storage": {
            "total_gb": round(total_gb, 1),
            "used_gb": round(used_gb, 1),
            "free_gb": round(free_gb, 1),
            "percent": percent,
        },
        "os": platform.platform(),
        "hostname": platform.node(),
    }

def _download_with_ytdlp(url: str) -> tuple[list[dict], str]:
    command = [
        "yt-dlp",
        "--no-playlist",
        "--print-json",
        "--write-info-json",
        "--write-thumbnail",
        "-x",
        "--audio-format",
        "mp3",
        "-o",
        str(MEDIA_DIR / "%(id)s.%(ext)s"),
        url,
    ]
    # 同期的に実行（FastAPIはdef関数をスレッドプールで実行するのでブロックしない）
    result = subprocess.run(
        command,
        check=False,
        capture_output=True,
        text=True,
    )
    log_output = "\n".join(
        line for line in [result.stdout.strip(), result.stderr.strip()] if line
    )
    if result.returncode != 0:
        raise RuntimeError(log_output or "yt-dlp failed")
    infos = []
    for line in result.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            infos.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    if not infos:
        raise RuntimeError("yt-dlp did not return metadata")
    return infos, log_output

def _store_downloaded_tracks(infos: list[dict]) -> list[Track]:
    stored_tracks: list[Track] = []
    data = _load_library()
    tracks = data.setdefault("tracks", [])
    track_map = {track["id"]: track for track in tracks}
    for info in infos:
        track = _parse_track_from_info(info)
        resolved_cover = _resolve_thumbnail_path(info)
        if resolved_cover:
            track.cover = resolved_cover
        file_path = MEDIA_DIR / f"{info.get('id', track.id)}.mp3"
        track.file_url = f"/media/{file_path.name}"
        if track.id not in track_map:
            track_entry = {**asdict(track), "file_path": str(file_path)}
            tracks.append(track_entry)
            track_map[track.id] = track_entry
        else:
            track_entry = track_map[track.id]
            if resolved_cover and track_entry.get("cover") in ("", DEFAULT_COVER):
                track_entry["cover"] = resolved_cover
        stored_tracks.append(track)
    _save_library(data)
    return stored_tracks

def _ingest_from_url(url: str) -> tuple[list[Track], str]:
    infos, log_output = _download_with_ytdlp(url)
    tracks = _store_downloaded_tracks(infos)
    return tracks, log_output

# --- FastAPI アプリケーション定義 ---

app = FastAPI(title="SquashTerm Server", version="0.1.0")

# 初期化
_init_library()
_init_settings()

# 静的ファイルの配信 (ここが重要: StaticFilesは自動的にRangeリクエストを処理します)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

@app.get("/")
@app.get("/index.html")
async def read_index():
    if not TEMPLATE_PATH.exists():
        raise HTTPException(status_code=404, detail="Index template not found")
    return FileResponse(TEMPLATE_PATH)

@app.get("/api/library")
def get_library():
    # データクラスを辞書化して返す
    return [asdict(track) for track in _fetch_tracks()]

@app.get("/api/playlists")
def get_playlists():
    return _fetch_playlists()

@app.get("/api/favorites")
def get_favorites():
    return _fetch_favorites()

@app.get("/api/status")
def get_status():
    settings = _load_settings()
    app_settings = settings.get("app", {})
    return {
        "version": app_settings.get("version", ""),
        "service": "SquashTerm",
        "time": datetime.utcnow().isoformat(timespec="seconds"),
        "device": settings.get("device", ""),
    }

@app.get("/api/settings")
def get_settings():
    return _build_settings_payload()

@app.get("/api/system")
def get_system():
    return _build_system_payload()

@app.post("/api/library/import")
def import_track(payload: ImportRequest):
    """
    URLからトラックをインポートする。
    処理が重いため、FastAPIはこれをスレッドプールで実行し、
    他のリクエスト(再生など)をブロックしません。
    """
    try:
        tracks, log_output = _ingest_from_url(payload.url)
        return {
            "tracks": [asdict(track) for track in tracks],
            "log": log_output,
        }
    except FileNotFoundError:
        raise HTTPException(status_code=400, detail="yt-dlp is not installed")
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

# --- 実行エントリポイント ---

def run(host: str = "0.0.0.0", port: int = 8000) -> None:
    print(f"SquashTerm server running on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    run()
