from __future__ import annotations

import json
import shutil
import threading
import uuid
from dataclasses import asdict
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Response, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

from library_service import (
    append_track_record,
    append_tracks_to_playlist,
    batch_download_playlist,
    build_upload_track,
    ensure_data_dirs,
    fetch_favorites,
    fetch_playlists,
    fetch_tracks,
    init_library,
    load_library,
    parse_positive_int,
    remove_media_asset,
    save_library,
)
from models import (
    FavoritesUpdate,
    ImportRequest,
    PlaylistBatchImportRequest,
    PlaylistCreate,
    PlaylistUpdate,
    TrackUpdate,
)
from paths import AUTO_SYNC_LOCK, MEDIA_DIR, STATIC_DIR, TEMPLATE_PATH
from settings_service import (
    DEFAULT_SETTINGS,
    build_settings_payload,
    build_system_payload,
    build_version_label,
    ensure_version_file,
    load_settings,
)
from sync_service import auto_sync_worker, sync_playlist_with_remote
from ytdlp_service import ingest_from_url, iter_ytdlp_events, is_single_video_url

REPO_ROOT = Path(__file__).resolve().parent.parent

app = FastAPI(title="SquashTerm Server", version="0.1.0")

init_library()
load_settings(DEFAULT_SETTINGS)
ensure_version_file()

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")


@app.on_event("startup")
def start_auto_sync_thread() -> None:
    thread = threading.Thread(target=auto_sync_worker, daemon=True)
    thread.start()


@app.get("/")
@app.get("/index.html")
async def read_index():
    if not TEMPLATE_PATH.exists():
        raise HTTPException(status_code=404, detail="Index template not found")
    return FileResponse(TEMPLATE_PATH)


@app.get("/api/library")
def get_library():
    return [asdict(track) for track in fetch_tracks()]


@app.put("/api/library/{track_id}")
def update_track(track_id: str, payload: TrackUpdate):
    data = load_library()
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
    save_library(data)
    file_path = track.get("file_path")
    file_url = f"/media/{Path(file_path).name}" if file_path else None
    updated = track.copy()
    updated["file_url"] = file_url
    return updated


@app.delete("/api/library/{track_id}", status_code=204)
def delete_track(track_id: str):
    data = load_library()
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
        playlist["track_ids"] = [
            item for item in playlist.get("track_ids", []) if item != track_id
        ]
    save_library(data)
    remove_media_asset(removed.get("file_path"))
    remove_media_asset(removed.get("cover"))
    return Response(status_code=204)


@app.get("/api/playlists")
def get_playlists():
    return fetch_playlists()


@app.post("/api/playlists")
def create_playlist(payload: PlaylistCreate):
    data = load_library()
    playlists = data.setdefault("playlists", [])
    auto_sync_interval = parse_positive_int(payload.auto_sync_interval_minutes)
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
    save_library(data)
    return playlist


@app.put("/api/playlists/{playlist_id}")
def update_playlist(playlist_id: str, payload: PlaylistUpdate):
    data = load_library()
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
        playlist["auto_sync_interval_minutes"] = parse_positive_int(
            payload.auto_sync_interval_minutes
        )
    if payload.auto_sync_enabled is not None:
        playlist["auto_sync_enabled"] = payload.auto_sync_enabled
    save_library(data)
    return playlist


@app.delete("/api/playlists/{playlist_id}", status_code=204)
def delete_playlist(playlist_id: str):
    data = load_library()
    playlists = data.get("playlists", [])
    target_index = next(
        (index for index, item in enumerate(playlists) if item.get("id") == playlist_id),
        None,
    )
    if target_index is None:
        raise HTTPException(status_code=404, detail="Playlist not found")
    playlists.pop(target_index)
    save_library(data)
    return Response(status_code=204)


@app.post("/api/playlists/{playlist_id}/sync")
def sync_playlist(playlist_id: str):
    try:
        with AUTO_SYNC_LOCK:
            return sync_playlist_with_remote(playlist_id)
    except FileNotFoundError:
        raise HTTPException(status_code=400, detail="yt-dlp is not installed")
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/favorites")
def get_favorites():
    return fetch_favorites()


@app.put("/api/favorites")
def update_favorites(payload: FavoritesUpdate):
    data = load_library()
    data["favorites"] = payload.track_ids
    save_library(data)
    return data["favorites"]


@app.get("/api/status")
def get_status():
    settings = load_settings(DEFAULT_SETTINGS)
    return {
        "version": build_version_label(REPO_ROOT),
        "service": "SquashTerm",
        "time": datetime.utcnow().isoformat(timespec="seconds"),
        "device": settings.get("device", ""),
    }


@app.get("/api/settings")
def get_settings():
    return build_settings_payload(REPO_ROOT)


@app.get("/api/system")
def get_system():
    return build_system_payload()


@app.post("/api/library/import")
def import_track(payload: ImportRequest):
    """URLからトラックをインポートする。"""
    try:
        tracks, log_output = ingest_from_url(payload.url, payload.playlist_id)
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
            # URL自動判定
            no_playlist = is_single_video_url(payload.url)
            for event in iter_ytdlp_events(payload.url, payload.playlist_id, no_playlist):
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
    """プレイリストを並列ダウンロード"""
    def event_generator():
        try:
            # URL自動判定：単体動画ならストリーム版に切り替え
            if is_single_video_url(payload.url):
                for event in iter_ytdlp_events(payload.url, payload.playlist_id, no_playlist=True):
                    yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
            else:
                # プレイリストなら並列ダウンロード
                for event in batch_download_playlist(
                    payload.url, payload.playlist_id, payload.concurrency
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
    ensure_data_dirs()
    extension = Path(file.filename).suffix or ".mp3"
    track_id = f"local_{uuid.uuid4().hex}"
    file_path = MEDIA_DIR / f"{track_id}{extension}"
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    track = build_upload_track(
        file_path,
        track_id,
        title,
        artist,
        album,
        genre,
        year,
        source_url,
        auto_tag,
        cover,
    )
    append_track_record(track, file_path)
    append_tracks_to_playlist(playlist_id, [track.id])
    return asdict(track)


def run(host: str = "0.0.0.0", port: int = 8000) -> None:
    print(f"SquashTerm server running on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    run()
