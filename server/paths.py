from __future__ import annotations

import threading
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_PATH = BASE_DIR / "templates" / "index.html"
STATIC_DIR = BASE_DIR / "static"
DATA_DIR = BASE_DIR / "data"
CONFIG_DIR = BASE_DIR / "config"
MEDIA_DIR = DATA_DIR / "media"
LIBRARY_PATH = DATA_DIR / "library.json"
SETTINGS_PATH = CONFIG_DIR / "settings.json"
VERSION_PATH = CONFIG_DIR / "version.json"
DEFAULT_COVER = "/static/images/cover-rise-up.svg"
AUTO_SYNC_POLL_SECONDS = 60
AUTO_SYNC_LOCK = threading.Lock()
