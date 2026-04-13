from __future__ import annotations

import json
import re
import shutil
import subprocess
from dataclasses import asdict
from urllib.parse import parse_qs, urlparse

from library_service import store_downloaded_tracks
from models import Track
from paths import MEDIA_DIR

# yt-dlp 2026以降はJS runtimeが必要（YouTube signature解決のため）
# node.jsが利用可能な環境でのみ有効化し、未インストール時は空リストにフォールバック
_YTDLP_JS_FLAGS = (
    ["--js-runtimes", "node", "--remote-components", "ejs:github"]
    if shutil.which("node")
    else []
)


def is_single_video_url(url: str) -> bool:
    """URLが単体動画かプレイリストかを判定"""
    parsed = urlparse(url)
    hostname = (parsed.hostname or "").lower()

    # YouTube判定
    if hostname in {"youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com"}:
        query_params = parse_qs(parsed.query)
        # v=パラメータがあれば単体動画（--no-playlist適用）
        if "v" in query_params:
            return True
        # /playlistパスまたはlist=のみならプレイリスト
        if "/playlist" in parsed.path or "list" in query_params:
            return False
        return True

    # SoundCloud判定
    if hostname in {"soundcloud.com", "www.soundcloud.com", "m.soundcloud.com"}:
        # /sets/を含むならプレイリスト、それ以外は単体
        return "/sets/" not in parsed.path

    # デフォルトは単体扱い
    return True


def _run_ytdlp_command(command: list[str]) -> tuple[list[dict], str]:
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
    return infos, log_output


def build_ytdlp_command(url: str, no_playlist: bool = False) -> list[str]:
    command = [
        "yt-dlp",
        *_YTDLP_JS_FLAGS,
        "--newline",
        "--progress",
        "--print-json",
        "--write-info-json",
        "--write-thumbnail",
    ]
    command.extend([
        "-f",
        "bv*+ba/best",
        "--merge-output-format",
        "mp4",
    ])
    command.extend([
        "-o",
        str(MEDIA_DIR / "%(id)s.%(ext)s"),
    ])
    if no_playlist:
        command.insert(1, "--no-playlist")
    command.append(url)
    return command


def build_audio_ytdlp_command(url: str, no_playlist: bool = False) -> list[str]:
    command = [
        "yt-dlp",
        *_YTDLP_JS_FLAGS,
        "--print-json",
        "--write-info-json",
        "--write-thumbnail",
        "-f",
        "bestaudio/best",
        "-x",
        "--audio-format",
        "m4a",
        "-o",
        str(MEDIA_DIR / "%(id)s_audio.%(ext)s"),
    ]
    if no_playlist:
        command.insert(1, "--no-playlist")
    command.append(url)
    return command


def download_with_ytdlp(url: str, no_playlist: bool = False) -> tuple[list[dict], str]:
    infos, primary_log = _run_ytdlp_command(build_ytdlp_command(url, no_playlist))
    audio_log = ""
    try:
        _, audio_log = _run_ytdlp_command(build_audio_ytdlp_command(url, no_playlist))
    except RuntimeError as exc:
        audio_log = f"Audio extraction skipped: {exc}"
    if not infos:
        raise RuntimeError("yt-dlp did not return metadata")
    log_output = "\n".join(part for part in [primary_log, audio_log] if part)
    return infos, log_output


def parse_progress(line: str) -> float | None:
    match = re.search(r"\[download\]\s+(\d+(?:\.\d+)?)%", line)
    if not match:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None


def iter_ytdlp_events(url: str, playlist_id: str | None = None, no_playlist: bool = False, playlist_name: str | None = None):
    command = build_ytdlp_command(url, no_playlist)
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
        yield {"type": "log", "message": line}
        progress_value = parse_progress(line)
        if progress_value is not None:
            yield {"type": "progress", "value": progress_value, "message": line}
    process.wait()
    if process.returncode != 0:
        error_message = "\n".join(log_lines[-8:]) or "yt-dlp failed"
        yield {"type": "error", "message": error_message}
        return
    if not infos:
        yield {"type": "error", "message": "yt-dlp did not return metadata"}
        return
    try:
        _, audio_log = _run_ytdlp_command(build_audio_ytdlp_command(url, no_playlist))
        if audio_log:
            yield {"type": "log", "message": "高音質音声の抽出が完了しました。"}
    except RuntimeError as exc:
        yield {"type": "log", "message": f"高音質音声の抽出をスキップしました: {exc}"}
    tracks = store_downloaded_tracks(infos, url, playlist_id)
    failed_count = len(infos) - len(tracks)
    yield {
        "type": "complete",
        "tracks": [asdict(track) for track in tracks],
        "completed": len(tracks),
        "failed": failed_count,
        "total": len(infos),
    }


def ingest_from_url(
    url: str, playlist_id: str | None = None, playlist_name: str | None = None
) -> tuple[list[Track], str]:
    infos, log_output = download_with_ytdlp(url)
    tracks = store_downloaded_tracks(infos, url, playlist_id, playlist_name)
    return tracks, log_output
