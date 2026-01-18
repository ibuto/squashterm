from __future__ import annotations

import json
import mimetypes
from dataclasses import asdict, dataclass
from datetime import datetime
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_PATH = BASE_DIR / "templates" / "index.html"
STATIC_DIR = BASE_DIR / "static"


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


TRACKS = [
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

PLAYLISTS = [
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

FAVORITES = ["trk_002", "trk_003"]


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

    def do_GET(self) -> None:  # noqa: N802 - keeping stdlib signature
        if self.path == "/" or self.path == "/index.html":
            self._send_file(TEMPLATE_PATH)
            return

        if self.path == "/api/library":
            self._send_json([asdict(track) for track in TRACKS])
            return

        if self.path == "/api/playlists":
            self._send_json(PLAYLISTS)
            return

        if self.path == "/api/favorites":
            self._send_json(FAVORITES)
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


def run(host: str = "0.0.0.0", port: int = 8000) -> None:
    server = ThreadingHTTPServer((host, port), SquashTermHandler)
    print(f"SquashTerm server running on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run()
