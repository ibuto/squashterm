from __future__ import annotations

import json
import os
import shutil
import tempfile
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
from paths import DEFAULT_COVER, LIBRARY_PATH, LIBRARY_WRITE_LOCK, MEDIA_DIR


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


def parse_track_from_info(info: dict, source_url: str | None = None, playlist_name: str | None = None) -> Track:
    resolved_source_url = source_url
    # SoundCloud の場合、permalink_url が正規ページ URL なので優先する
    permalink = info.get("permalink_url")
    if isinstance(permalink, str):
        parsed_pl = urlparse(permalink)
        if parsed_pl.hostname in {"soundcloud.com", "www.soundcloud.com"}:
            resolved_source_url = permalink
    if not resolved_source_url or _is_soundcloud_api_url(resolved_source_url or ""):
        resolved_source_url = info.get("webpage_url") or info.get("original_url") or resolved_source_url
    bitrate_value = info.get("abr") or info.get("tbr")
    bitrate_kbps = None
    if isinstance(bitrate_value, (int, float)):
        bitrate_kbps = int(round(bitrate_value))
    return Track(
        id=str(info.get("id") or uuid.uuid4().hex),
        title=info.get("track") or info.get("title") or "Unknown Title",
        artist=info.get("artist") or info.get("uploader") or "Unknown Artist",
        album=info.get("album") or (playlist_name.strip() if playlist_name and playlist_name.strip() else None) or info.get("playlist_title") or info.get("playlist") or "Unknown Album",
        cover=DEFAULT_COVER,
        duration=format_duration(info.get("duration")),
        bpm=int(info.get("bpm") or 0),
        genre=info.get("genre") or "Unknown",
        year=parse_year(info),
        source_url=resolved_source_url,
        file_format=info.get("ext") or info.get("audio_ext"),
        bitrate_kbps=bitrate_kbps,
        video_url=None,  # populated with local /media/*.mp4 path after download
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


def _is_soundcloud_api_url(url: str) -> bool:
    """SoundCloud の内部 API URL（api.soundcloud.com / api-v2.soundcloud.com）か判定する。"""
    parsed = urlparse(url)
    hostname = parsed.hostname
    if not hostname:
        return False
    hostname = hostname.lower()
    return hostname in {"api.soundcloud.com", "api-v2.soundcloud.com"} or \
           hostname.endswith(".api.soundcloud.com")


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
    # permalink_url は SoundCloud の正規ページ URL。他の候補より優先する
    permalink = entry.get("permalink_url")
    if isinstance(permalink, str):
        parsed_pl = urlparse(permalink)
        if parsed_pl.hostname in {"soundcloud.com", "www.soundcloud.com"}:
            return permalink
    # API URL でない候補を順に試みる
    for candidate in (
        entry.get("webpage_url"),
        entry.get("original_url"),
        entry.get("url"),
    ):
        if not isinstance(candidate, str) or not candidate:
            continue
        if _is_soundcloud_api_url(candidate):
            # API URL はスキップして次の候補へ
            continue
        if candidate.startswith("http://") or candidate.startswith("https://"):
            return candidate
        ie_key = str(entry.get("ie_key") or "").lower()
        if ie_key in {"youtube", "youtubeweb"}:
            return f"https://www.youtube.com/watch?v={candidate}"
        return candidate
    # 全候補が API URL だった場合は permalink_url にフォールバック（あれば）
    if isinstance(permalink, str) and permalink.startswith("http"):
        return permalink
    return None


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
    """ライブラリを JSON ファイルに書き込む。

    tempfile + os.replace() でアトミック書き込みを行い、
    書き込み中のクラッシュによる JSON 破損を防止する。
    LIBRARY_WRITE_LOCK で同時書き込みを直列化する。
    """
    serialized = json.dumps(data, ensure_ascii=False, indent=2)
    with LIBRARY_WRITE_LOCK:
        fd, tmp_path = tempfile.mkstemp(
            dir=LIBRARY_PATH.parent, prefix=".library_tmp_", suffix=".json"
        )
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                f.write(serialized)
            os.replace(tmp_path, LIBRARY_PATH)
        except Exception:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
            raise


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
        video_url = row.get("video_url")
        if not video_url and file_path and Path(file_path).suffix.lower() in {".mp4", ".webm", ".mkv"}:
            video_url = file_url
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
                video_url=video_url,
            )
        )
    if library_updated:
        save_library(data)
    return tracks


def fetch_playlists() -> list[dict]:
    data = load_library()
    playlists = data.get("playlists", [])
    updated = False
    for playlist in playlists:
        if "is_public" not in playlist:
            playlist["is_public"] = True
            updated = True
        if "owner_id" not in playlist:
            playlist["owner_id"] = None
            updated = True
    if updated:
        save_library(data)
    return playlists


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
    infos: list[dict], source_url: str | None = None, playlist_id: str | None = None, playlist_name: str | None = None
) -> list[Track]:
    stored_tracks: list[Track] = []
    data = load_library()
    tracks = data.setdefault("tracks", [])
    track_map = {track["id"]: track for track in tracks}
    for info in infos:
        track = parse_track_from_info(info, source_url, playlist_name)
        resolved_cover = resolve_thumbnail_path(info)
        if resolved_cover:
            track.cover = resolved_cover
        track_id = info.get("id", track.id)
        # 動画本体と、より高音質な音声ファイルがあれば音声を優先して再生する
        video_path = _resolve_downloaded_media_path(track_id, ("mp4", "webm", "mkv", "mov", "avi"))
        preferred_audio_path = _resolve_downloaded_media_path(track_id, ("mp3", "flac", "m4a", "opus", "ogg", "aac"), preferred_suffixes=("_audio", ""))

        file_path = preferred_audio_path or video_path
        if file_path is None:
            raise FileNotFoundError(
                f"ダウンロード後のメディアファイルが見つかりません: track_id={track_id}"
            )
        track.file_url = f"/media/{file_path.name}"
        if video_path is not None:
            track.video_url = f"/media/{video_path.name}"
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
            if track.video_url and not track_entry.get("video_url"):
                track_entry["video_url"] = track.video_url
            track_entry["file_path"] = str(file_path)
        stored_tracks.append(track)
    save_library(data)
    append_tracks_to_playlist(playlist_id, [track.id for track in stored_tracks])
    return stored_tracks


def _resolve_downloaded_media_path(track_id: str, extensions: tuple[str, ...], preferred_suffixes: tuple[str, ...] = ("",)) -> Path | None:
    for suffix in preferred_suffixes:
        for extension in extensions:
            candidate = MEDIA_DIR / f"{track_id}{suffix}.{extension}"
            if candidate.exists():
                return candidate
    return None


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
        from media_utils import convert_image_to_webp
        
        cover_data = cover.file.read()
        cover.file.seek(0)
        webp_path = MEDIA_DIR / f"{track_id}_cover.webp"
        if convert_image_to_webp(cover_data, webp_path):
            cover_url = f"/media/{webp_path.name}"
        else:
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
    import threading

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
    
    playlist_title = entries[0].get("playlist_title") or entries[0].get("playlist")
    
    # 並列ダウンロードキューを作成
    queue = ThreadPoolDownloadQueue(max_workers=concurrency)
    
    completed_count = 0
    failed_count = 0
    results: list[Track] = []
    _expected = len(entries)
    _lock = threading.Lock()
    _callbacks_done = threading.Event()
    
    def download_single(entry_url: str, entry_id: str | None):
        """単一エントリのダウンロード。失敗は例外で通知しキューの failed カウンタを正しく更新する"""
        from ytdlp_service import download_with_ytdlp
        try:
            infos, _ = download_with_ytdlp(entry_url, no_playlist=True)
            tracks = store_downloaded_tracks(infos, entry_url, playlist_id, playlist_title)
            return {"success": True, "tracks": tracks}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def progress_callback(task, result):
        """進捗コールバック（通常関数 — generator にしてはいけない）
        
        ThreadPoolExecutor のワーカースレッドから呼ばれるため、共有変数の更新は
        _lock で保護する。全コールバック完了時に _callbacks_done を set する。
        """
        nonlocal completed_count, failed_count
        with _lock:
            if result.get("success"):
                completed_count += 1
                results.extend(result.get("tracks", []))
            else:
                failed_count += 1
            if completed_count + failed_count >= _expected:
                _callbacks_done.set()
    
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
    
    # キューのカウンタが total に達した後も最後のコールバックが実行中の場合があるため、
    # 全コールバック完了を最大 30 秒待ってから最終結果を送出する
    _callbacks_done.wait(timeout=30)
    
    # 最終結果: ロック内でローカルにコピーし、yield はロックの外で行う
    with _lock:
        final_expected = _expected
        final_completed = completed_count
        final_failed = failed_count
        final_tracks = [asdict(track) for track in results]

    yield {
        "type": "complete",
        "total": final_expected,
        "completed": final_completed,
        "failed": final_failed,
        "tracks": final_tracks,
    }




def apply_playlist_album_names() -> dict:
    """既存楽曲のうち album が未設定のものに、所属プレイリスト名を遡及適用する。

    album が "Unknown Album"（またはそれと等価の空値）の楽曲のみを対象とし、
    ユーザーが手動で設定した album 値は変更しない。

    Returns:
        {"updated": int, "skipped": int}
    """
    data = load_library()
    tracks = data.get("tracks", [])
    playlists = data.get("playlists", [])

    # track_id → track_entry の参照マップ
    track_map = {t["id"]: t for t in tracks}

    updated = 0
    skipped = 0

    for playlist in playlists:
        playlist_name = playlist.get("name", "").strip()
        if not playlist_name:
            continue
        for track_id in playlist.get("track_ids", []):
            track = track_map.get(track_id)
            if not track:
                continue
            current_album = (track.get("album") or "").strip()
            if current_album and current_album != "Unknown Album":
                skipped += 1
                continue
            track["album"] = playlist_name
            updated += 1

    if updated:
        save_library(data)

    return {"updated": updated, "skipped": skipped}


def apply_album_from_source_playlists(
    playlist_defs: list[dict],
) -> dict:
    """プレイリストURLに含まれる動画IDとライブラリトラックをマッチし、Album名を遡及設定する。

    Args:
        playlist_defs: [{"url": "...", "album_name": "..."}] のリスト。
                       album_name 省略時はyt-dlpが返す playlist_title を使用。

    Returns:
        {"updated": N, "skipped": M, "details": [...]}
    """
    import subprocess

    data = load_library()
    tracks = data.get("tracks", [])
    track_map: dict[str, dict] = {}
    for track in tracks:
        track_id = str(track.get("id", ""))
        if not track_id:
            continue
        track_map[track_id] = track
        if track_id.startswith("yt_"):
            track_map[track_id[3:]] = track

    updated = 0
    skipped = 0
    details: list[dict] = []

    for pdef in playlist_defs:
        url = pdef.get("url", "")
        forced_name: str | None = pdef.get("album_name")
        if not url:
            continue
        try:
            # --dump-single-json でプレイリストタイトルとエントリを一括取得
            result = subprocess.run(
                ["yt-dlp", "--flat-playlist", "--dump-single-json", url],
                capture_output=True, text=True, check=False,
            )
            if result.returncode != 0:
                raise RuntimeError(result.stderr.strip() or "yt-dlp failed")
            pdata = json.loads(result.stdout)
        except Exception as e:
            details.append({"url": url, "error": str(e)})
            continue

        # playlist_title を自動検出（forced_name 優先）
        playlist_title: str | None = forced_name or pdata.get("title") or pdata.get("playlist_title")
        if not playlist_title:
            playlist_title = url

        entries = pdata.get("entries") or []
        matched = 0
        album_protected = 0
        not_found = 0
        for entry in entries:
            eid = (entry or {}).get("id")
            if not eid:
                continue
            track = track_map.get(eid)
            if track is None:
                not_found += 1
                continue
            current_album = (track.get("album") or "").strip()
            if current_album and current_album != "Unknown Album":
                # 手動設定済みのAlbumは上書きしない
                album_protected += 1
                continue
            track["album"] = playlist_title
            matched += 1
            updated += 1

        skipped += album_protected + not_found
        details.append({
            "url": url,
            "album_name": playlist_title,
            "matched": matched,
            "not_found": not_found,
            "album_protected": album_protected,
        })

    if updated > 0:
        save_library(data)
    return {"updated": updated, "skipped": skipped, "details": details}
