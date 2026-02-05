from __future__ import annotations

import json
import platform
import shutil
import subprocess
from datetime import datetime
from pathlib import Path

from paths import CONFIG_DIR, DATA_DIR, SETTINGS_PATH, VERSION_PATH

DEFAULT_SETTINGS = {
    "app": {
        "name": "SquashTerm",
        "api": "FastAPI",
    },
    "device": "Raspberry Pi (prototype)",
    "storage": {
        "used_gb": 3.8,
        "total_gb": 9.0,
    },
    "playback_options": [
        {
            "id": "allow_remote",
            "label": "ネットワークからのアクセスを許可",
            "enabled": True,
        },
        {
            "id": "auto_scan",
            "label": "自動ライブラリスキャン",
            "enabled": False,
        },
    ],
}

DEFAULT_VERSION = {
    "version": "0.1.0",
}


def ensure_version_file() -> None:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    if VERSION_PATH.exists():
        return
    VERSION_PATH.write_text(
        json.dumps(DEFAULT_VERSION, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def load_version_data() -> dict:
    ensure_version_file()
    content = VERSION_PATH.read_text(encoding="utf-8")
    return json.loads(content)


def resolve_git_hash(repo_root: Path) -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short=8", "HEAD"],
            check=False,
            capture_output=True,
            text=True,
            cwd=repo_root,
        )
    except FileNotFoundError:
        return "unknown"
    if result.returncode != 0:
        return "unknown"
    return result.stdout.strip() or "unknown"


def resolve_build_time() -> str:
    if not VERSION_PATH.exists():
        return ""
    timestamp = VERSION_PATH.stat().st_mtime
    build_time = datetime.fromtimestamp(timestamp)
    return build_time.strftime("%Y.%m.%d %H:%M")


def build_version_label(repo_root: Path) -> str:
    version_data = load_version_data()
    version = version_data.get("version", "")
    git_hash = resolve_git_hash(repo_root)
    if not version:
        return git_hash
    return f"{version}@{git_hash}"


def load_settings(default_settings: dict) -> dict:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    if not SETTINGS_PATH.exists():
        SETTINGS_PATH.write_text(
            json.dumps(default_settings, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    content = SETTINGS_PATH.read_text(encoding="utf-8")
    return json.loads(content)


def build_settings_payload(repo_root: Path) -> dict:
    settings = load_settings(DEFAULT_SETTINGS)
    app_settings = settings.get("app", {})
    storage = settings.get("storage", {})
    used_gb = storage.get("used_gb", 0)
    total_gb = storage.get("total_gb", 0)
    percent = int((used_gb / total_gb) * 100) if total_gb else 0
    return {
        "version": {
            "app": build_version_label(repo_root),
            "api": app_settings.get("api", ""),
            "build": resolve_build_time(),
        },
        "storage": {
            "used_gb": used_gb,
            "total_gb": total_gb,
            "percent": percent,
        },
        "playback_options": settings.get("playback_options", []),
    }


def build_system_payload() -> dict:
    usage = shutil.disk_usage(DATA_DIR)
    total_gb = usage.total / (1024**3)
    free_gb = usage.free / (1024**3)
    used_gb = usage.used / (1024**3)
    percent = int((used_gb / total_gb) * 100) if total_gb else 0
    return {
        "storage": {
            "total_gb": round(total_gb, 1),
            "used_gb": round(used_gb, 1),
            "free_gb": round(free_gb, 1),
            "percent": percent,
        },
        "os": platform.platform(),
        "hostname": platform.node(),
    }
