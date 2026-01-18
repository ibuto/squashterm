from __future__ import annotations

import json
import mimetypes
import subprocess
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_PATH = BASE_DIR / "templates" / "index.html"
STATIC_DIR = BASE_DIR / "static"
DATA_DIR = BASE_DIR / "data"
MEDIA_DIR = DATA_DIR / "media"
LIBRARY_PATH = DATA_DIR / "library.json"
DEFAULT_COVER = "/static/images/cover-rise-up.svg"


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


DEFAULT_TRACKS = [
    Track(
        id="trk_001",
        title="Morning Rally",
        artist="Squash Ensemble",
        album="Rise Up",
        cover="/static/images/cover-rise-up.svg",
        duration="3:42",
        bpm=128,
        genre="House",
        year=2021,
    ),
    Track(
        id="trk_002",
        title="Glass Court",
        artist="Neon Strings",
        album="City Lights",
        cover="/static/images/cover-city-lights.svg",
        duration="4:07",
        bpm=115,
        genre="Synthwave",
        year=2020,
    ),
    Track(
        id="trk_003",
        title="Final Serve",
        artist="Daylight Signals",
        album="Match Point",
        cover="/static/images/cover-match-point.svg",
        duration="2:58",
        bpm=140,
        genre="Pop",
        year=2022,
    ),
    Track(
        id="trk_004",
        title="Quiet Bounce",
        artist="Afterimage",
        album="Night Practice",
        cover="/static/images/cover-night-practice.svg",
        duration="5:12",
        bpm=98,
        genre="Ambient",
        year=2019,
    ),
]

DEFAULT_PLAYLISTS = [
    {
        "id": "pl_001",
        "name": "朝のルーティン",
        "track_ids": ["trk_001", "trk_003"],
    },
    {
        "id": "pl_002",
        "name": "クールダウン",
        "track_ids": ["trk_004"],
    },
]

DEFAULT_FAVORITES = ["trk_002", "trk_003"]


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


def _init_library() -> None:
    _ensure_data_dirs()
    if LIBRARY_PATH.exists():
        return
    data = {
        "tracks": [
            {
                **asdict(track),
                "file_path": None,
            }
            for track in DEFAULT_TRACKS
        ],
        "playlists": DEFAULT_PLAYLISTS,
        "favorites": DEFAULT_FAVORITES,
    }
    LIBRARY_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _load_library() -> dict:
    _ensure_data_dirs()
    if not LIBRARY_PATH.exists():
        _init_library()
    content = LIBRARY_PATH.read_text(encoding="utf-8")
    return json.loads(content)


def _save_library(data: dict) -> None:
    LIBRARY_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _fetch_tracks() -> list[Track]:
    data = _load_library()
    rows = data.get("tracks", [])
    return [
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
        )
        for row in rows
    ]


def _fetch_playlists() -> list[dict]:
    data = _load_library()
    return data.get("playlists", [])


def _fetch_favorites() -> list[str]:
    data = _load_library()
    return data.get("favorites", [])


def _ensure_playlist(data: dict, playlist_id: str | None, playlist_name: str | None) -> str | None:
    playlists = data.setdefault("playlists", [])
    if playlist_id:
        for playlist in playlists:
            if playlist["id"] == playlist_id:
                return playlist_id
    if playlist_name:
        playlist_id = playlist_id or f"pl_{uuid.uuid4().hex[:8]}"
        playlists.append({"id": playlist_id, "name": playlist_name, "track_ids": []})
        return playlist_id
    return None


def _download_with_ytdlp(url: str) -> list[dict]:
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
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "yt-dlp failed")
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
    return infos


def _store_downloaded_tracks(
    infos: list[dict],
    playlist_id: str | None,
    playlist_name: str | None,
) -> list[Track]:
    stored_tracks: list[Track] = []
    data = _load_library()
    ensured_playlist_id = _ensure_playlist(data, playlist_id, playlist_name)
    tracks = data.setdefault("tracks", [])
    track_map = {track["id"]: track for track in tracks}
    playlist_lookup = {
        playlist["id"]: playlist for playlist in data.get("playlists", [])
    }
    for info in infos:
        track = _parse_track_from_info(info)
        file_path = MEDIA_DIR / f"{info.get('id', track.id)}.mp3"
        if track.id not in track_map:
            track_entry = {**asdict(track), "file_path": str(file_path)}
            tracks.append(track_entry)
            track_map[track.id] = track_entry
        if ensured_playlist_id:
            playlist = playlist_lookup.get(ensured_playlist_id)
            if playlist is not None:
                playlist.setdefault("track_ids", [])
                if track.id not in playlist["track_ids"]:
                    playlist["track_ids"].append(track.id)
        stored_tracks.append(track)
    _save_library(data)
    return stored_tracks


def _ingest_from_url(payload: dict) -> list[Track]:
    url = payload.get("url")
    if not url:
        raise ValueError("url is required")
    infos = _download_with_ytdlp(url)
    return _store_downloaded_tracks(
        infos,
        payload.get("playlist_id"),
        payload.get("playlist_name"),
    )


class SquashTermHandler(BaseHTTPRequestHandler):
    def _send_json(self, payload: object) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, file_path: Path) -> None:
        if not file_path.exists() or not file_path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND, "Not Found")
            return

        content_type, _ = mimetypes.guess_type(file_path.name)
        content_type = content_type or "application/octet-stream"
        data = file_path.read_bytes()

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0:
            return {}
        payload = self.rfile.read(length).decode("utf-8")
        if not payload:
            return {}
        return json.loads(payload)

    def do_GET(self) -> None:  # noqa: N802 - keeping stdlib signature
        if self.path == "/" or self.path == "/index.html":
            self._send_file(TEMPLATE_PATH)
            return

        if self.path == "/api/library":
            self._send_json([asdict(track) for track in _fetch_tracks()])
            return

        if self.path == "/api/playlists":
            self._send_json(_fetch_playlists())
            return

        if self.path == "/api/favorites":
            self._send_json(_fetch_favorites())
            return

        if self.path == "/api/status":
            self._send_json(
                {
                    "version": "0.1.0",
                    "service": "SquashTerm",
                    "time": datetime.utcnow().isoformat(timespec="seconds"),
                    "device": "Raspberry Pi (prototype)",
                }
            )
            return

        if self.path.startswith("/static/"):
            static_path = STATIC_DIR / self.path.replace("/static/", "", 1)
            self._send_file(static_path)
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Not Found")

    def do_POST(self) -> None:  # noqa: N802 - keeping stdlib signature
        if self.path == "/api/library/import":
            try:
                payload = self._read_json()
                tracks = _ingest_from_url(payload)
            except (json.JSONDecodeError, ValueError) as exc:
                self.send_error(HTTPStatus.BAD_REQUEST, str(exc))
                return
            except FileNotFoundError:
                self.send_error(HTTPStatus.BAD_REQUEST, "yt-dlp is not installed")
                return
            except RuntimeError as exc:
                self.send_error(HTTPStatus.BAD_REQUEST, str(exc))
                return

            self._send_json([asdict(track) for track in tracks])
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Not Found")

def run(host: str = "0.0.0.0", port: int = 8000) -> None:
    _init_library()
    server = ThreadingHTTPServer((host, port), SquashTermHandler)
    print(f"SquashTerm server running on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run()
