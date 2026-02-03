from __future__ import annotations

import json
import importlib
import importlib.util
import platform
import re
import shutil
import subprocess
import threading
import time
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse, urlunparse

# --- 新しいライブラリのインポート ---
from fastapi import FastAPI, HTTPException, Request, File, UploadFile, Form, Response
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn

# --- ダウンロードキューモジュール ---
from download_queue import create_download_queue, DownloadTask

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
AUTO_SYNC_POLL_SECONDS = 60
AUTO_SYNC_LOCK = threading.Lock()

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
    source_url: str | None = None

class ImportRequest(BaseModel):
    url: str
    playlist_id: str | None = None
    auto_tag: bool | None = None

class PlaylistBatchImportRequest(BaseModel):
    url: str
    playlist_id: str | None = None
    concurrency: int = 10  # batch_size から concurrency に名称変更
    auto_tag: bool | None = None

class PlaylistCreate(BaseModel):
    name: str
    track_ids: list[str] = []
    auto_sync_url: str | None = None
    auto_sync_interval_minutes: int | None = None
    auto_sync_enabled: bool | None = None

class PlaylistUpdate(BaseModel):
    name: str | None = None
    track_ids: list[str] | None = None
    auto_sync_url: str | None = None
    auto_sync_interval_minutes: int | None = None
    auto_sync_enabled: bool | None = None

class FavoritesUpdate(BaseModel):
    track_ids: list[str]

class TrackUpdate(BaseModel):
    title: str | None = None
    artist: str | None = None
    album: str | None = None
    source_url: str | None = None

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

def _parse_track_from_info(info: dict, source_url: str | None = None) -> Track:
    resolved_source_url = source_url
    if not resolved_source_url:
        resolved_source_url = info.get("webpage_url") or info.get("original_url")
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
        source_url=resolved_source_url,
    )

def _parse_bool(value: str | bool | None, default: bool = False) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}

def _parse_positive_int(value: int | str | None) -> int | None:
    if value is None:
        return None
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return None
    if parsed <= 0:
        return None
    return parsed

def _normalize_source_url(url: str | None) -> str | None:
    if not url:
        return None
    stripped = url.strip()
    if not stripped:
        return None
    parsed = urlparse(stripped)
    if not parsed.scheme:
        return stripped
    netloc = parsed.netloc.lower()
    if "youtube.com" in netloc or "youtu.be" in netloc:
        video_id = None
        if "youtu.be" in netloc:
            parts = [part for part in parsed.path.split("/") if part]
            if parts:
                video_id = parts[0]
        if not video_id and parsed.path.startswith("/watch"):
            query = parse_qs(parsed.query)
            video_id = (query.get("v") or [None])[0]
        if not video_id and parsed.path.startswith("/shorts/"):
            parts = [part for part in parsed.path.split("/") if part]
            if len(parts) >= 2:
                video_id = parts[1]
        if not video_id and parsed.path.startswith("/embed/"):
            parts = [part for part in parsed.path.split("/") if part]
            if len(parts) >= 2:
                video_id = parts[1]
        if video_id:
            return f"https://www.youtube.com/watch?v={video_id}"
    sanitized = parsed._replace(fragment="")
    return urlunparse(sanitized)

def _entry_to_source_url(entry: dict) -> str | None:
    url = entry.get("webpage_url") or entry.get("original_url") or entry.get("url")
    if not isinstance(url, str) or not url:
        return None
    if url.startswith("http://") or url.startswith("https://"):
        return url
    ie_key = str(entry.get("ie_key") or "").lower()
    if ie_key in {"youtube", "youtubeweb"}:
        return f"https://www.youtube.com/watch?v={url}"
    return url

def _fetch_flat_playlist_entries(url: str) -> list[dict]:
    command = ["yt-dlp", "--flat-playlist", "--print-json", url]
    result = subprocess.run(
        command,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        error_output = "\n".join(
            line for line in [result.stdout.strip(), result.stderr.strip()] if line
        )
        raise RuntimeError(error_output or "yt-dlp failed")
    entries = []
    for line in result.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            parsed = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(parsed, dict):
            entries.append(parsed)
    return entries

def _collect_playlist_source_urls(playlist: dict, data: dict) -> set[str]:
    track_ids = playlist.get("track_ids", [])
    track_map = {track["id"]: track for track in data.get("tracks", [])}
    urls = set()
    for track_id in track_ids:
        track = track_map.get(track_id)
        if not track:
            continue
        normalized = _normalize_source_url(track.get("source_url"))
        if normalized:
            urls.add(normalized)
    return urls

def _sync_playlist_with_remote(playlist_id: str) -> dict:
    data = _load_library()
    playlists = data.get("playlists", [])
    playlist = next((item for item in playlists if item.get("id") == playlist_id), None)
    if not playlist:
        raise RuntimeError("Playlist not found")
    auto_sync_url = playlist.get("auto_sync_url")
    if not auto_sync_url:
        raise RuntimeError("Auto sync URL is missing")
    entries = _fetch_flat_playlist_entries(auto_sync_url)
    entry_urls = []
    for entry in entries:
        candidate = _entry_to_source_url(entry)
        normalized = _normalize_source_url(candidate)
        if normalized:
            entry_urls.append(normalized)
    existing_urls = _collect_playlist_source_urls(playlist, data)
    missing_urls = [url for url in entry_urls if url not in existing_urls]
    added_tracks: list[Track] = []
    errors: list[str] = []
    for url in missing_urls:
        try:
            tracks, _ = _ingest_from_url(url, playlist_id)
            added_tracks.extend(tracks)
        except Exception as exc:
            errors.append(f"{url}: {exc}")
    latest_data = _load_library()
    latest_playlists = latest_data.get("playlists", [])
    latest_playlist = next(
        (item for item in latest_playlists if item.get("id") == playlist_id), None
    )
    if latest_playlist is not None:
        latest_playlist["auto_sync_last_run"] = datetime.utcnow().isoformat(timespec="seconds")
        latest_playlist["auto_sync_last_error"] = "\n".join(errors)
        _save_library(latest_data)
    return {
        "missing_count": len(missing_urls),
        "added_count": len(added_tracks),
        "added_tracks": [asdict(track) for track in added_tracks],
        "errors": errors,
    }

def _should_auto_sync_playlist(playlist: dict, now: datetime) -> bool:
    auto_sync_url = playlist.get("auto_sync_url")
    if not auto_sync_url:
        return False
    interval = _parse_positive_int(playlist.get("auto_sync_interval_minutes"))
    if not interval:
        return False
    if playlist.get("auto_sync_enabled") is False:
        return False
    last_run = playlist.get("auto_sync_last_run")
    if not last_run:
        return True
    try:
        last_run_time = datetime.fromisoformat(last_run)
    except ValueError:
        return True
    elapsed_minutes = (now - last_run_time).total_seconds() / 60
    return elapsed_minutes >= interval

def _run_due_auto_sync() -> None:
    now = datetime.utcnow()
    data = _load_library()
    playlists = data.get("playlists", [])
    due_ids = [
        playlist.get("id")
        for playlist in playlists
        if playlist.get("id") and _should_auto_sync_playlist(playlist, now)
    ]
    if not due_ids:
        return
    for playlist_id in due_ids:
        try:
            _sync_playlist_with_remote(playlist_id)
        except Exception:
            continue

def _auto_sync_worker() -> None:
    while True:
        time.sleep(AUTO_SYNC_POLL_SECONDS)
        if AUTO_SYNC_LOCK.locked():
            continue
        with AUTO_SYNC_LOCK:
            try:
                _run_due_auto_sync()
            except Exception:
                continue

def _load_mutagen() -> tuple[object | None, object | None]:
    if importlib.util.find_spec("mutagen") is None:
        return None, None
    mutagen_module = importlib.import_module("mutagen")
    mutagen_id3 = importlib.import_module("mutagen.id3")
    return mutagen_module.File, mutagen_id3.ID3

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

def _extract_id3_metadata(file_path: Path) -> dict:
    metadata = {
        "title": None,
        "artist": None,
        "album": None,
        "genre": None,
        "year": 0,
        "duration": "--",
    }
    mutagen_file, _ = _load_mutagen()
    if not mutagen_file:
        return metadata
    audio = mutagen_file(file_path, easy=True)
    if audio:
        tags = audio.tags or {}
        metadata["title"] = (tags.get("title") or [None])[0]
        metadata["artist"] = (tags.get("artist") or [None])[0]
        metadata["album"] = (tags.get("album") or [None])[0]
        metadata["genre"] = (tags.get("genre") or [None])[0]
        date_value = (tags.get("date") or tags.get("year") or [None])[0]
        if isinstance(date_value, str) and date_value[:4].isdigit():
            metadata["year"] = int(date_value[:4])
        duration = getattr(audio.info, "length", None)
        if duration:
            metadata["duration"] = _format_duration(duration)
    return metadata

def _extension_from_mime(mime: str | None) -> str:
    if not mime:
        return ""
    normalized = mime.lower()
    if "jpeg" in normalized or "jpg" in normalized:
        return ".jpg"
    if "png" in normalized:
        return ".png"
    if "webp" in normalized:
        return ".webp"
    if "gif" in normalized:
        return ".gif"
    return ""

def _save_cover_from_id3(file_path: Path, track_id: str) -> str | None:
    _, mutagen_id3 = _load_mutagen()
    if not mutagen_id3:
        return None
    try:
        id3 = mutagen_id3(file_path)
    except Exception:
        return None
    for key in id3.keys():
        if not key.startswith("APIC"):
            continue
        apic = id3.get(key)
        if not apic:
            continue
        ext = _extension_from_mime(apic.mime) or ".jpg"
        cover_path = MEDIA_DIR / f"{track_id}_cover{ext}"
        cover_path.write_bytes(apic.data)
        return f"/media/{cover_path.name}"
    return None

def _append_tracks_to_playlist(playlist_id: str | None, track_ids: list[str]) -> None:
    if not playlist_id:
        return
    data = _load_library()
    playlists = data.get("playlists", [])
    playlist = next((item for item in playlists if item.get("id") == playlist_id), None)
    if not playlist:
        return
    current_ids = playlist.get("track_ids", [])
    for track_id in track_ids:
        if track_id not in current_ids:
            current_ids.append(track_id)
    playlist["track_ids"] = current_ids
    _save_library(data)

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

def _remove_media_asset(path_value: str | None) -> None:
    if not path_value:
        return
    if path_value.startswith("/media/"):
        path = MEDIA_DIR / Path(path_value).name
    else:
        path = Path(path_value)
    try:
        resolved = path.resolve()
    except FileNotFoundError:
        return
    if MEDIA_DIR not in resolved.parents and resolved != MEDIA_DIR:
        return
    if resolved.exists():
        resolved.unlink()

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
                source_url=row.get("source_url"),
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

def _build_ytdlp_command(url: str, no_playlist: bool = False) -> list[str]:
    cmd = [
        "yt-dlp",
        "--newline",
        "--progress",
        "--print-json",
        "--write-info-json",
        "--write-thumbnail",
        "-x",
        "--audio-format",
        "mp3",
        "-o",
        str(MEDIA_DIR / "%(id)s.%(ext)s"),
    ]
    if no_playlist:
        cmd.append("--no-playlist")
    cmd.append(url)
    return cmd

def _parse_progress(line: str) -> float | None:
    match = re.search(r"\[download\]\s+(\d+(?:\.\d+)?)%", line)
    if not match:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None

def _iter_ytdlp_events(url: str, playlist_id: str | None = None, no_playlist: bool = False):
    command = _build_ytdlp_command(url, no_playlist=no_playlist)
    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    if not process.stdout:
        raise RuntimeError("yt-dlp did not return output")
    infos: list[dict] = []
    log_lines: list[str] = []
    
    # 単体ダウンロードの場合は total=1, completed=0 からスタート
    yield {"type": "start", "total": 1, "completed": 0, "message": "ダウンロード準備中..."}
    
    for raw_line in process.stdout:
        line = raw_line.strip()
        if not line:
            continue
        parsed = None
        if line.lstrip().startswith("{"):
            try:
                parsed = json.loads(line)
            except json.JSONDecodeError:
                parsed = None
        if isinstance(parsed, dict):
            infos.append(parsed)
            continue
        log_lines.append(line)
        yield {"type": "log", "message": line, "total": 1, "completed": 0}
        progress_value = _parse_progress(line)
        if progress_value is not None:
            yield {"type": "progress", "value": progress_value, "message": line, "total": 1, "completed": 0}
    process.wait()
    if process.returncode != 0:
        error_message = "\n".join(log_lines[-8:]) or "yt-dlp failed"
        yield {"type": "error", "message": error_message}
        return
    if not infos:
        yield {"type": "error", "message": "yt-dlp did not return metadata"}
        return
    tracks = _store_downloaded_tracks(infos, url, playlist_id)
    yield {
        "type": "complete",
        "tracks": [asdict(track) for track in tracks],
        "total": len(tracks),
        "completed": len(tracks),
        "failed": 0,
    }

def _store_downloaded_tracks(
    infos: list[dict], source_url: str | None = None, playlist_id: str | None = None
) -> list[Track]:
    stored_tracks: list[Track] = []
    data = _load_library()
    tracks = data.setdefault("tracks", [])
    track_map = {track["id"]: track for track in tracks}
    for info in infos:
        track = _parse_track_from_info(info, source_url)
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
            if track.source_url and not track_entry.get("source_url"):
                track_entry["source_url"] = track.source_url
        stored_tracks.append(track)
    _save_library(data)
    _append_tracks_to_playlist(playlist_id, [track.id for track in stored_tracks])
    return stored_tracks

def _ingest_from_url(
    url: str, playlist_id: str | None = None
) -> tuple[list[Track], str]:
    infos, log_output = _download_with_ytdlp(url)
    tracks = _store_downloaded_tracks(infos, url, playlist_id)
    return tracks, log_output

def _download_single_track_from_url(url: str, playlist_id: str | None = None) -> list[Track]:
    """単一トラックのダウンロード（プレイリスト分割ダウンロード用）"""
    infos, _ = _download_with_ytdlp(url)
    tracks = _store_downloaded_tracks(infos, url, playlist_id)
    return tracks

def _batch_download_playlist(url: str, playlist_id: str | None = None, batch_size: int = 5):
    """プレイリストを分割して並列ダウンロード（ジェネレーター）"""
    # 最初のyieldで実行を開始させる
    yield {"type": "start", "message": "プレイリスト取得中..."}
    
    # プレイリストのエントリを取得
    try:
        entries = _fetch_flat_playlist_entries(url)
    except Exception as e:
        yield {
            "type": "error",
            "message": f"エントリ取得エラー: {str(e)}",
        }
        return
    
    if not entries:
        yield {
            "type": "error",
            "message": "プレイリストが空です、または取得できませんでした",
        }
        return
    
    total = len(entries)
    yield {
        "type": "playlist_info",
        "total": total,
        "message": f"{total}件のエントリを検出しました",
    }
    
    # ダウンロードキューを作成
    queue = create_download_queue(max_workers=batch_size)
    
    downloaded_tracks = []
    completed = 0
    failed = 0
    
    def progress_callback(task: DownloadTask, result: Any):
        """進捗コールバック"""
        nonlocal completed, failed, downloaded_tracks
        
        if isinstance(result, dict) and "error" in result:
            failed += 1
        else:
            completed += 1
            if isinstance(result, list):
                downloaded_tracks.extend(result)
    
    # プレイリストダウンロードを開始
    try:
        task_id = queue.enqueue_playlist(
            entries=entries,
            download_func=_download_single_track_from_url,
            playlist_id=playlist_id,
            progress_callback=progress_callback,
        )
        
        # 進捗を監視
        while completed + failed < total:
            yield {
                "type": "progress",
                "completed": completed,
                "failed": failed,
                "total": total,
                "percentage": int((completed + failed) / total * 100),
            }
            time.sleep(0.5)
        
        # 完了
        yield {
            "type": "complete",
            "completed": completed,
            "failed": failed,
            "total": total,
            "tracks": [asdict(track) for track in downloaded_tracks],
        }
        
    except Exception as exc:
        yield {
            "type": "error",
            "message": str(exc),
        }


# --- FastAPI アプリケーション定義 ---

app = FastAPI(title="SquashTerm Server", version="0.1.0")

# 初期化
_init_library()
_init_settings()

# 静的ファイルの配信 (ここが重要: StaticFilesは自動的にRangeリクエストを処理します)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

@app.on_event("startup")
def start_auto_sync_thread() -> None:
    thread = threading.Thread(target=_auto_sync_worker, daemon=True)
    thread.start()

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

@app.put("/api/library/{track_id}")
def update_track(track_id: str, payload: TrackUpdate):
    data = _load_library()
    tracks = data.get("tracks", [])
    track = next((item for item in tracks if item.get("id") == track_id), None)
    if track is None:
        raise HTTPException(status_code=404, detail="Track not found")
    if payload.title is not None:
        track["title"] = payload.title
    if payload.artist is not None:
        track["artist"] = payload.artist
    if payload.album is not None:
        track["album"] = payload.album
    if payload.source_url is not None:
        track["source_url"] = payload.source_url
    _save_library(data)
    file_path = track.get("file_path")
    file_url = f"/media/{Path(file_path).name}" if file_path else None
    updated = Track(
        id=track["id"],
        title=track["title"],
        artist=track["artist"],
        album=track["album"],
        cover=track["cover"],
        duration=track["duration"],
        bpm=track["bpm"],
        genre=track["genre"],
        year=track["year"],
        file_url=file_url,
        source_url=track.get("source_url"),
    )
    return asdict(updated)

@app.delete("/api/library/{track_id}", status_code=204)
def delete_track(track_id: str):
    data = _load_library()
    tracks = data.get("tracks", [])
    target_index = next(
        (index for index, item in enumerate(tracks) if item.get("id") == track_id),
        None,
    )
    if target_index is None:
        raise HTTPException(status_code=404, detail="Track not found")
    removed = tracks.pop(target_index)
    data["favorites"] = [item for item in data.get("favorites", []) if item != track_id]
    for playlist in data.get("playlists", []):
        playlist["track_ids"] = [item for item in playlist.get("track_ids", []) if item != track_id]
    _save_library(data)
    _remove_media_asset(removed.get("file_path"))
    _remove_media_asset(removed.get("cover"))
    return Response(status_code=204)

@app.get("/api/playlists")
def get_playlists():
    return _fetch_playlists()

@app.post("/api/playlists")
def create_playlist(payload: PlaylistCreate):
    data = _load_library()
    playlists = data.setdefault("playlists", [])
    auto_sync_interval = _parse_positive_int(payload.auto_sync_interval_minutes)
    auto_sync_url = payload.auto_sync_url.strip() if payload.auto_sync_url else None
    auto_sync_enabled = payload.auto_sync_enabled
    if auto_sync_enabled is None:
        auto_sync_enabled = bool(auto_sync_url and auto_sync_interval)
    playlist = {
        "id": f"pl_{uuid.uuid4().hex}",
        "name": payload.name,
        "track_ids": payload.track_ids,
        "auto_sync_url": auto_sync_url,
        "auto_sync_interval_minutes": auto_sync_interval,
        "auto_sync_enabled": auto_sync_enabled,
        "auto_sync_last_run": None,
        "auto_sync_last_error": "",
    }
    playlists.append(playlist)
    _save_library(data)
    return playlist

@app.put("/api/playlists/{playlist_id}")
def update_playlist(playlist_id: str, payload: PlaylistUpdate):
    data = _load_library()
    playlists = data.get("playlists", [])
    playlist = next((item for item in playlists if item.get("id") == playlist_id), None)
    if playlist is None:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if payload.name is not None:
        playlist["name"] = payload.name
    if payload.track_ids is not None:
        playlist["track_ids"] = payload.track_ids
    if payload.auto_sync_url is not None:
        auto_sync_url = payload.auto_sync_url.strip() if payload.auto_sync_url else None
        playlist["auto_sync_url"] = auto_sync_url
        if not auto_sync_url:
            playlist["auto_sync_enabled"] = False
            playlist["auto_sync_last_run"] = None
            playlist["auto_sync_last_error"] = ""
    if payload.auto_sync_interval_minutes is not None:
        playlist["auto_sync_interval_minutes"] = _parse_positive_int(
            payload.auto_sync_interval_minutes
        )
    if payload.auto_sync_enabled is not None:
        playlist["auto_sync_enabled"] = payload.auto_sync_enabled
    _save_library(data)
    return playlist

@app.delete("/api/playlists/{playlist_id}", status_code=204)
def delete_playlist(playlist_id: str):
    data = _load_library()
    playlists = data.get("playlists", [])
    target_index = next(
        (index for index, item in enumerate(playlists) if item.get("id") == playlist_id),
        None,
    )
    if target_index is None:
        raise HTTPException(status_code=404, detail="Playlist not found")
    playlists.pop(target_index)
    _save_library(data)
    return Response(status_code=204)

@app.post("/api/playlists/{playlist_id}/sync")
def sync_playlist(playlist_id: str):
    try:
        with AUTO_SYNC_LOCK:
            return _sync_playlist_with_remote(playlist_id)
    except FileNotFoundError:
        raise HTTPException(status_code=400, detail="yt-dlp is not installed")
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@app.get("/api/favorites")
def get_favorites():
    return _fetch_favorites()

@app.put("/api/favorites")
def update_favorites(payload: FavoritesUpdate):
    data = _load_library()
    data["favorites"] = payload.track_ids
    _save_library(data)
    return data["favorites"]

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
        tracks, log_output = _ingest_from_url(payload.url, payload.playlist_id)
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

@app.post("/api/library/import/stream")
def import_track_stream(payload: ImportRequest):
    def event_generator():
        try:
            for event in _iter_ytdlp_events(payload.url, payload.playlist_id):
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        except FileNotFoundError:
            message = {"type": "error", "message": "yt-dlp is not installed"}
            yield f"data: {json.dumps(message, ensure_ascii=False)}\n\n"
        except Exception as exc:
            message = {"type": "error", "message": str(exc)}
            yield f"data: {json.dumps(message, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/api/library/import/playlist-batch")
def import_playlist_batch(payload: PlaylistBatchImportRequest):
    """プレイリスト自動判定ダウンロード（SSE）"""
    def event_generator():
        try:
            yield f"data: {json.dumps({'type': 'log', 'message': 'URLを解析中...'}, ensure_ascii=False)}\n\n"
            
            # URLを解析して判定
            parsed = urlparse(payload.url)
            query_params = parse_qs(parsed.query)
            is_single_video = False
            
            # YouTubeの判定
            if 'youtube.com' in parsed.netloc or 'youtu.be' in parsed.netloc:
                # v= パラメータがある場合は単体動画（list=があっても無視）
                if 'v' in query_params:
                    is_single_video = True
                    yield f"data: {json.dumps({'type': 'log', 'message': '単体動画として検出しました'}, ensure_ascii=False)}\n\n"
                # /playlist パスまたは list= のみの場合はプレイリスト
                elif '/playlist' in parsed.path or 'list' in query_params:
                    is_single_video = False
                    yield f"data: {json.dumps({'type': 'log', 'message': 'プレイリストとして検出しました'}, ensure_ascii=False)}\n\n"
            # SoundCloudの単体トラック判定（/sets/が含まれていない）
            elif 'soundcloud.com' in parsed.netloc:
                if '/sets/' in parsed.path:
                    is_single_video = False
                    yield f"data: {json.dumps({'type': 'log', 'message': 'プレイリストとして検出しました'}, ensure_ascii=False)}\n\n"
                else:
                    is_single_video = True
                    yield f"data: {json.dumps({'type': 'log', 'message': '単体トラックとして検出しました'}, ensure_ascii=False)}\n\n"
            
            if is_single_video:
                # 単体動画：通常ダウンロード（--no-playlistフラグ付き）
                yield f"data: {json.dumps({'type': 'log', 'message': '通常ダウンロードを開始'}, ensure_ascii=False)}\n\n"
                for event in _iter_ytdlp_events(payload.url, payload.playlist_id, no_playlist=True):
                    yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
            else:
                # プレイリスト：曲数を確認
                cmd = ["yt-dlp", "--flat-playlist", "--dump-json", payload.url]
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                
                if result.returncode != 0:
                    raise Exception(f"yt-dlp failed: {result.stderr}")
                
                # エントリー数をカウント
                entries = [line for line in result.stdout.strip().split("\n") if line]
                entry_count = len(entries)
                
                yield f"data: {json.dumps({'type': 'log', 'message': f'プレイリスト: {entry_count}曲を検出'}, ensure_ascii=False)}\n\n"
                
                # 並列ダウンロード
                yield f"data: {json.dumps({'type': 'log', 'message': f'並列ダウンロードを開始（並列度: {payload.concurrency}）'}, ensure_ascii=False)}\n\n"
                for event in _batch_download_playlist(
                    payload.url,
                    payload.playlist_id,
                    payload.concurrency
                ):
                    yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
                    
        except FileNotFoundError:
            message = {"type": "error", "message": "yt-dlp is not installed"}
            yield f"data: {json.dumps(message, ensure_ascii=False)}\n\n"
        except Exception as exc:
            message = {"type": "error", "message": str(exc)}
            yield f"data: {json.dumps(message, ensure_ascii=False)}\n\n"
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/api/library/upload")
async def upload_track(
    file: UploadFile = File(...),
    cover: UploadFile | None = File(None),
    title: str | None = Form(None),
    artist: str | None = Form(None),
    album: str | None = Form(None),
    genre: str | None = Form(None),
    year: str | None = Form(None),
    source_url: str | None = Form(None),
    auto_tag: str | bool | None = Form(True),
    playlist_id: str | None = Form(None),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="File is required")
    _ensure_data_dirs()
    extension = Path(file.filename).suffix or ".mp3"
    track_id = f"local_{uuid.uuid4().hex}"
    file_path = MEDIA_DIR / f"{track_id}{extension}"
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    parsed = {}
    if _parse_bool(auto_tag, True):
        parsed = _extract_id3_metadata(file_path)
    resolved_title = title or parsed.get("title") or "Unknown Title"
    resolved_artist = artist or parsed.get("artist") or "Unknown Artist"
    resolved_album = album or parsed.get("album") or "Unknown Album"
    resolved_genre = genre or parsed.get("genre") or "Unknown"
    resolved_year = 0
    year_text = year or ""
    if year_text.isdigit():
        resolved_year = int(year_text)
    elif parsed.get("year"):
        resolved_year = parsed.get("year", 0)
    resolved_duration = parsed.get("duration") or "--"
    cover_url = DEFAULT_COVER
    if cover and cover.filename:
        cover_extension = Path(cover.filename).suffix
        if not cover_extension:
            cover_extension = _extension_from_mime(cover.content_type) or ".jpg"
        cover_path = MEDIA_DIR / f"{track_id}_cover{cover_extension}"
        with cover_path.open("wb") as buffer:
            shutil.copyfileobj(cover.file, buffer)
        cover_url = f"/media/{cover_path.name}"
    else:
        id3_cover = _save_cover_from_id3(file_path, track_id)
        if id3_cover:
            cover_url = id3_cover
    track = Track(
        id=track_id,
        title=resolved_title,
        artist=resolved_artist,
        album=resolved_album,
        cover=cover_url,
        duration=resolved_duration,
        bpm=0,
        genre=resolved_genre,
        year=resolved_year,
        file_url=f"/media/{file_path.name}",
        source_url=source_url,
    )
    data = _load_library()
    tracks = data.setdefault("tracks", [])
    tracks.append({**asdict(track), "file_path": str(file_path)})
    _save_library(data)
    _append_tracks_to_playlist(playlist_id, [track.id])
    return asdict(track)

# --- 実行エントリポイント ---

def run(host: str = "0.0.0.0", port: int = 8000) -> None:
    print(f"SquashTerm server running on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)

if __name__ == "__main__":
    run()
