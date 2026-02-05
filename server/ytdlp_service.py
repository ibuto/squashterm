from __future__ import annotations

import json
import re
import subprocess
from dataclasses import asdict

from library_service import store_downloaded_tracks
from models import Track
from paths import MEDIA_DIR


def download_with_ytdlp(url: str) -> tuple[list[dict], str]:
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


def build_ytdlp_command(url: str) -> list[str]:
    return [
        "yt-dlp",
        "--newline",
        "--progress",
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


def parse_progress(line: str) -> float | None:
    match = re.search(r"\[download\]\s+(\d+(?:\.\d+)?)%", line)
    if not match:
        return None
    try:
        return float(match.group(1))
    except ValueError:
        return None


def iter_ytdlp_events(url: str, playlist_id: str | None = None):
    command = build_ytdlp_command(url)
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
    tracks = store_downloaded_tracks(infos, url, playlist_id)
    yield {
        "type": "complete",
        "tracks": [asdict(track) for track in tracks],
    }


def ingest_from_url(
    url: str, playlist_id: str | None = None
) -> tuple[list[Track], str]:
    infos, log_output = download_with_ytdlp(url)
    tracks = store_downloaded_tracks(infos, url, playlist_id)
    return tracks, log_output
