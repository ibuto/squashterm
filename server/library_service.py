from __future__ import annotations

import json
import shutil
import uuid
from dataclasses import asdict
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qs, urlparse, urlunparse

from media_utils import (
    extract_id3_metadata,
    extension_from_mime,
    resolve_thumbnail_path,
    save_cover_from_id3,
)
from models import Track
from paths import DEFAULT_COVER, LIBRARY_PATH, MEDIA_DIR


def ensure_data_dirs() -> None:
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)


def format_duration(seconds: int | None) -> str:
    if not seconds:
        return "--"
    minutes, remainder = divmod(int(seconds), 60)
    return f"{minutes}:{remainder:02d}"


def parse_year(info: dict) -> int:
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


def parse_track_from_info(info: dict, source_url: str | None = None) -> Track:
    resolved_source_url = source_url
    if not resolved_source_url:
        resolved_source_url = info.get("webpage_url") or info.get("original_url")
    bitrate_value = info.get("abr") or info.get("tbr")
    bitrate_kbps = None
    if isinstance(bitrate_value, (int, float)):
        bitrate_kbps = int(round(bitrate_value))
    return Track(
        id=f"yt_{info.get('id', uuid.uuid4().hex)}",
        title=info.get("track") or info.get("title") or "Unknown Title",
        artist=info.get("artist") or info.get("uploader") or "Unknown Artist",
        album=info.get("album") or "Unknown Album",
        cover=DEFAULT_COVER,
        duration=format_duration(info.get("duration")),
        bpm=int(info.get("bpm") or 0),
        genre=info.get("genre") or "Unknown",
        year=parse_year(info),
        source_url=resolved_source_url,
        file_format=info.get("ext") or info.get("audio_ext"),
        bitrate_kbps=bitrate_kbps,
    )


def parse_bool(value: str | bool | None, default: bool = False) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def parse_positive_int(value: int | str | None) -> int | None:
    if value is None:
        return None
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return None
    if parsed <= 0:
        return None
    return parsed


def normalize_source_url(url: str | None) -> str | None:
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


def entry_to_source_url(entry: dict) -> str | None:
    url = entry.get("webpage_url") or entry.get("original_url") or entry.get("url")
    if not isinstance(url, str) or not url:
        return None
    if url.startswith("http://") or url.startswith("https://"):
        return url
    ie_key = str(entry.get("ie_key") or "").lower()
    if ie_key in {"youtube", "youtubeweb"}:
        return f"https://www.youtube.com/watch?v={url}"
    return url


def init_library() -> None:
    ensure_data_dirs()
    if LIBRARY_PATH.exists():
        return
    data = {
        "tracks": [],
        "playlists": [],
        "favorites": [],
    }
    LIBRARY_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def load_library() -> dict:
    ensure_data_dirs()
    if not LIBRARY_PATH.exists():
        init_library()
    content = LIBRARY_PATH.read_text(encoding="utf-8")
    return json.loads(content)


def save_library(data: dict) -> None:
    LIBRARY_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def remove_media_asset(path_value: str | None) -> None:
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


def fetch_tracks() -> list[Track]:
    data = load_library()
    rows = data.get("tracks", [])
    tracks = []
    library_updated = False
    for row in rows:
        file_path = row.get("file_path")
        file_format = row.get("file_format")
        bitrate_kbps = row.get("bitrate_kbps")
        if file_path and (not file_format or not bitrate_kbps):
            path_obj = Path(file_path)
            if path_obj.exists():
                parsed = extract_id3_metadata(path_obj, format_duration)
                if not file_format:
                    file_format = (
                        parsed.get("file_format")
                        or path_obj.suffix.lstrip(".").lower()
                        or None
                    )
                    row["file_format"] = file_format
                    library_updated = True
                if not bitrate_kbps and parsed.get("bitrate_kbps"):
                    bitrate_kbps = parsed.get("bitrate_kbps")
                    row["bitrate_kbps"] = bitrate_kbps
                    library_updated = True
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
                file_format=file_format,
                bitrate_kbps=bitrate_kbps,
            )
        )
    if library_updated:
        save_library(data)
    return tracks


def fetch_playlists() -> list[dict]:
    data = load_library()
    return data.get("playlists", [])


def fetch_favorites() -> list[str]:
    data = load_library()
    return data.get("favorites", [])


def append_tracks_to_playlist(playlist_id: str | None, track_ids: list[str]) -> None:
    if not playlist_id:
        return
    data = load_library()
    playlists = data.get("playlists", [])
    playlist = next((item for item in playlists if item.get("id") == playlist_id), None)
    if not playlist:
        return
    current_ids = playlist.get("track_ids", [])
    for track_id in track_ids:
        if track_id not in current_ids:
            current_ids.append(track_id)
    playlist["track_ids"] = current_ids
    save_library(data)


def store_downloaded_tracks(
    infos: list[dict], source_url: str | None = None, playlist_id: str | None = None
) -> list[Track]:
    stored_tracks: list[Track] = []
    data = load_library()
    tracks = data.setdefault("tracks", [])
    track_map = {track["id"]: track for track in tracks}
    for info in infos:
        track = parse_track_from_info(info, source_url)
        resolved_cover = resolve_thumbnail_path(info)
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
    save_library(data)
    append_tracks_to_playlist(playlist_id, [track.id for track in stored_tracks])
    return stored_tracks


def build_upload_track(
    file_path: Path,
    track_id: str,
    title: str | None,
    artist: str | None,
    album: str | None,
    genre: str | None,
    year: str | None,
    source_url: str | None,
    auto_tag: str | bool | None,
    cover,
) -> Track:
    parsed = {}
    if parse_bool(auto_tag, True):
        parsed = extract_id3_metadata(file_path, format_duration)
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
    resolved_bitrate = parsed.get("bitrate_kbps")
    resolved_format = parsed.get("file_format") or file_path.suffix.lstrip(".").lower() or None
    cover_url = DEFAULT_COVER
    if cover and cover.filename:
        cover_extension = Path(cover.filename).suffix
        if not cover_extension:
            cover_extension = extension_from_mime(cover.content_type) or ".jpg"
        cover_path = MEDIA_DIR / f"{track_id}_cover{cover_extension}"
        with cover_path.open("wb") as buffer:
            shutil.copyfileobj(cover.file, buffer)
        cover_url = f"/media/{cover_path.name}"
    else:
        id3_cover = save_cover_from_id3(file_path, track_id)
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
        file_format=resolved_format,
        bitrate_kbps=resolved_bitrate,
    )
    return track


def append_track_record(track: Track, file_path: Path) -> None:
    data = load_library()
    tracks = data.setdefault("tracks", [])
    tracks.append({**asdict(track), "file_path": str(file_path)})
    save_library(data)


def import_local_folder(
    folder_path: str, playlist_id: str | None, auto_tag: str | bool | None
) -> list[Track]:
    ensure_data_dirs()
    resolved_path = Path(folder_path).expanduser()
    if not resolved_path.exists() or not resolved_path.is_dir():
        raise FileNotFoundError("Folder does not exist")
    data = load_library()
    tracks = data.setdefault("tracks", [])
    existing_paths = {track.get("file_path") for track in tracks}
    supported_exts = {".mp3", ".m4a", ".flac", ".wav", ".ogg", ".opus", ".aac"}
    added_tracks: list[Track] = []
    for file_path in sorted(resolved_path.iterdir()):
        if not file_path.is_file() or file_path.suffix.lower() not in supported_exts:
            continue
        if str(file_path) in existing_paths:
            continue
        track_id = f"local_{uuid.uuid4().hex}"
        extension = file_path.suffix or ".mp3"
        dest_path = MEDIA_DIR / f"{track_id}{extension}"
        shutil.copy2(file_path, dest_path)
        track = build_upload_track(
            dest_path,
            track_id,
            None,
            None,
            None,
            None,
            None,
            None,
            auto_tag,
            None,
        )
        append_track_record(track, dest_path)
        added_tracks.append(track)
    append_tracks_to_playlist(playlist_id, [track.id for track in added_tracks])
    return added_tracks


def update_playlist_sync_status(
    playlist_id: str, errors: list[str], updated_at: datetime | None
) -> None:
    latest_data = load_library()
    latest_playlists = latest_data.get("playlists", [])
    latest_playlist = next(
        (item for item in latest_playlists if item.get("id") == playlist_id), None
    )
    if latest_playlist is not None:
        latest_playlist["auto_sync_last_run"] = (
            updated_at.isoformat(timespec="seconds") if updated_at else None
        )
        latest_playlist["auto_sync_last_error"] = "\n".join(errors)
        save_library(latest_data)


def batch_download_playlist(url: str, playlist_id: str | None, concurrency: int):
    """プレイリストを並列ダウンロード（download_queue使用）"""
    from download_queue import ThreadPoolDownloadQueue
    import subprocess
    import time
    
    # プレイリスト情報を取得
    cmd = [
        "yt-dlp",
        "--flat-playlist",
        "--print-json",
        "--no-warnings",
        url,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        raise RuntimeError(f"Failed to fetch playlist: {result.stderr}")
    
    entries = []
    for line in result.stdout.strip().split("\n"):
        if line.strip():
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    
    if not entries:
        raise RuntimeError("Playlist is empty or could not be fetched")
    
    # 並列ダウンロードキューを作成
    queue = ThreadPoolDownloadQueue(max_workers=concurrency)
    
    completed_count = 0
    failed_count = 0
    results = []
    
    def download_single(entry_url: str, entry_id: str | None):
        """単一エントリのダウンロード"""
        from ytdlp_service import download_with_ytdlp
        try:
            infos, _ = download_with_ytdlp(entry_url, no_playlist=True)
            tracks = store_downloaded_tracks(infos, entry_url, playlist_id)
            return {"success": True, "tracks": tracks}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def progress_callback(task, result):
        """進捗コールバック"""
        nonlocal completed_count, failed_count
        if result.get("success"):
            completed_count += 1
            results.extend(result.get("tracks", []))
        else:
            failed_count += 1
        yield {
            "type": "progress",
            "total": len(entries),
            "completed": completed_count,
            "failed": failed_count,
            "message": f"{task.index + 1}/{task.total}: {task.title or task.entry_id}",
        }
    
    # ダウンロード開始
    task_id = queue.enqueue_playlist(
        entries,
        download_single,
        playlist_id,
        progress_callback,
    )
    
    # 完了まで待機
    while True:
        status = queue.get_status(task_id)
        total = status.get("total", 0)
        completed = status.get("completed", 0)
        failed = status.get("failed", 0)
        
        yield {
            "type": "progress",
            "total": total,
            "completed": completed,
            "failed": failed,
            "message": f"Downloading {completed}/{total} (Failed: {failed})",
        }
        
        if completed + failed >= total:
            break
        time.sleep(1)
    
    # 最終結果
    yield {
        "type": "complete",
        "total": len(entries),
        "completed": completed_count,
        "failed": failed_count,
        "tracks": [asdict(track) for track in results],
    }
