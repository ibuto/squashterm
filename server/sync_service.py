from __future__ import annotations

import json
import subprocess
from dataclasses import asdict
from datetime import datetime, timezone, timedelta
import time

from library_service import (
    entry_to_source_url,
    load_library,
    normalize_source_url,
    parse_positive_int,
    update_playlist_sync_status,
)
from paths import AUTO_SYNC_LOCK, AUTO_SYNC_POLL_SECONDS
from ytdlp_service import ingest_from_url

# JST (UTC+9) timezone
JST = timezone(timedelta(hours=9))


def fetch_flat_playlist_entries(url: str) -> list[dict]:
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


def collect_playlist_source_urls(playlist: dict, data: dict) -> set[str]:
    track_ids = playlist.get("track_ids", [])
    track_map = {track["id"]: track for track in data.get("tracks", [])}
    urls = set()
    for track_id in track_ids:
        track = track_map.get(track_id)
        if not track:
            continue
        normalized = normalize_source_url(track.get("source_url"))
        if normalized:
            urls.add(normalized)
    return urls


def sync_playlist_with_remote(playlist_id: str) -> dict:
    data = load_library()
    playlists = data.get("playlists", [])
    playlist = next((item for item in playlists if item.get("id") == playlist_id), None)
    if not playlist:
        raise RuntimeError("Playlist not found")
    auto_sync_url = playlist.get("auto_sync_url")
    if not auto_sync_url:
        raise RuntimeError("Auto sync URL is missing")
    entries = fetch_flat_playlist_entries(auto_sync_url)

    existing_urls = collect_playlist_source_urls(playlist, data)

    # SoundCloud flat extraction returns only api-v2 URLs (no title/permalink_url).
    # Fall back to track ID comparison: library track ids use "yt_{sc_track_id}" format.
    existing_track_ids: set[str] = set()
    _track_map = {t["id"]: t for t in data.get("tracks", [])}
    for tid in playlist.get("track_ids", []):
        if tid.startswith("yt_"):
            existing_track_ids.add(tid[3:])

    missing_urls: list[str] = []
    for entry in entries:
        candidate = entry_to_source_url(entry)
        normalized = normalize_source_url(candidate)
        if normalized and normalized in existing_urls:
            continue
        sc_id = str(entry.get("id") or "")
        if sc_id and sc_id in existing_track_ids:
            continue
        # Use api-v2 URL directly if no proper source URL was derived
        entry_url = normalized or entry.get("url") or entry.get("webpage_url")
        if entry_url:
            missing_urls.append(entry_url)

    added_tracks = []
    errors: list[str] = []
    playlist_name = playlist.get("name")
    for url in missing_urls:
        try:
            tracks, _ = ingest_from_url(url, playlist_id, playlist_name)
            added_tracks.extend(tracks)
        except Exception as exc:
            errors.append(f"{url}: {exc}")
    update_playlist_sync_status(playlist_id, errors, datetime.now(JST))
    return {
        "missing_count": len(missing_urls),
        "added_count": len(added_tracks),
        "added_tracks": [asdict(track) for track in added_tracks],
        "errors": errors,
    }


def should_auto_sync_playlist(playlist: dict, now: datetime) -> bool:
    auto_sync_url = playlist.get("auto_sync_url")
    if not auto_sync_url:
        return False
    interval = parse_positive_int(playlist.get("auto_sync_interval_minutes"))
    if not interval:
        return False
    if playlist.get("auto_sync_enabled") is False:
        return False
    last_run = playlist.get("auto_sync_last_run")
    if not last_run:
        return True
    try:
        last_run_time = datetime.fromisoformat(last_run)
        # 旧バージョンで保存されたnaiveなタイムスタンプはJSTとして扱う
        if last_run_time.tzinfo is None:
            last_run_time = last_run_time.replace(tzinfo=JST)
    except ValueError:
        return True
    elapsed_minutes = (now - last_run_time).total_seconds() / 60
    return elapsed_minutes >= interval


def run_due_auto_sync() -> None:
    now = datetime.now(JST)
    data = load_library()
    playlists = data.get("playlists", [])
    due_ids = [
        playlist.get("id")
        for playlist in playlists
        if playlist.get("id") and should_auto_sync_playlist(playlist, now)
    ]
    if not due_ids:
        return
    for playlist_id in due_ids:
        try:
            sync_playlist_with_remote(playlist_id)
        except Exception:
            continue


def auto_sync_worker() -> None:
    while True:
        time.sleep(AUTO_SYNC_POLL_SECONDS)
        if AUTO_SYNC_LOCK.locked():
            continue
        with AUTO_SYNC_LOCK:
            try:
                run_due_auto_sync()
            except Exception:
                continue
