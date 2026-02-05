from __future__ import annotations

import importlib
import importlib.util
from pathlib import Path

from paths import MEDIA_DIR


def load_mutagen() -> tuple[object | None, object | None]:
    if importlib.util.find_spec("mutagen") is None:
        return None, None
    mutagen_module = importlib.import_module("mutagen")
    mutagen_id3 = importlib.import_module("mutagen.id3")
    return mutagen_module.File, mutagen_id3.ID3


def resolve_thumbnail_path(info: dict) -> str | None:
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


def extract_id3_metadata(file_path: Path, format_duration) -> dict:
    metadata = {
        "title": None,
        "artist": None,
        "album": None,
        "genre": None,
        "year": 0,
        "duration": "--",
    }
    mutagen_file, _ = load_mutagen()
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
            metadata["duration"] = format_duration(duration)
    return metadata


def extension_from_mime(mime: str | None) -> str:
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


def save_cover_from_id3(file_path: Path, track_id: str) -> str | None:
    _, mutagen_id3 = load_mutagen()
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
        ext = extension_from_mime(apic.mime) or ".jpg"
        cover_path = MEDIA_DIR / f"{track_id}_cover{ext}"
        cover_path.write_bytes(apic.data)
        return f"/media/{cover_path.name}"
    return None


def scan_media_directory() -> int:
    """メディアディレクトリをスキャンして未登録ファイルをlibrary.jsonに追加"""
    from library_service import load_library, save_library
    from paths import DEFAULT_COVER
    
    data = load_library()
    tracks = data.setdefault("tracks", [])
    track_map = {track["id"]: track for track in tracks}
    
    added_count = 0
    for mp3_file in MEDIA_DIR.glob("*.mp3"):
        file_id = f"yt_{mp3_file.stem}"
        
        if file_id in track_map:
            continue
        
        # カバー画像を探す
        cover_path = None
        for ext in [".jpg", ".jpeg", ".png", ".webp"]:
            potential_cover = MEDIA_DIR / f"{mp3_file.stem}{ext}"
            if potential_cover.exists():
                cover_path = f"/media/{potential_cover.name}"
                break
        
        track_entry = {
            "id": file_id,
            "title": mp3_file.stem,
            "artist": "Unknown Artist",
            "album": "Unknown Album",
            "cover": cover_path or DEFAULT_COVER,
            "duration": "0:00",
            "bpm": 0,
            "genre": "Unknown",
            "year": 0,
            "file_url": f"/media/{mp3_file.name}",
            "source_url": "",
            "file_path": str(mp3_file),
        }
        tracks.append(track_entry)
        track_map[file_id] = track_entry
        added_count += 1
    
    if added_count > 0:
        save_library(data)
        print(f"自動スキャン: {added_count}件の新しいメディアファイルをライブラリに追加しました")
    
    return added_count
