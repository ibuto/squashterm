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
        "base_url": "",
    },
    "device": "Raspberry Pi (prototype)",

    "design": {
        "accent_color": "#38bdf8",
    },
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


def resolve_git_branch(repo_root: Path) -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
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


def resolve_git_commit_date(repo_root: Path) -> str:
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%ci"],
            check=False,
            capture_output=True,
            text=True,
            cwd=repo_root,
        )
    except FileNotFoundError:
        return ""
    if result.returncode != 0 or not result.stdout.strip():
        return ""
    try:
        dt = datetime.strptime(result.stdout.strip()[:19], "%Y-%m-%d %H:%M:%S")
        return dt.strftime("%Y.%m.%d %H:%M")
    except ValueError:
        return result.stdout.strip()[:16]


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
    storage = settings.get("storage", {})
    used_gb = storage.get("used_gb", 0)
    total_gb = storage.get("total_gb", 0)
    percent = int((used_gb / total_gb) * 100) if total_gb else 0
    app_settings = settings.get("app", {})
    return {
        "version": get_dynamic_version(repo_root),
        "app": {
            "base_url": app_settings.get("base_url", ""),
        },
        "storage": {
            "used_gb": used_gb,
            "total_gb": total_gb,
            "percent": percent,
        },
        "playback_options": settings.get("playback_options", []),
        "design": settings.get("design", DEFAULT_SETTINGS["design"]),
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


def update_playback_option(option_id: str, enabled: bool) -> dict:
    """playback_optionsの設定を更新"""
    settings = load_settings(DEFAULT_SETTINGS)
    playback_options = settings.get("playback_options", [])
    
    updated = False
    for option in playback_options:
        if option.get("id") == option_id:
            option["enabled"] = enabled
            updated = True
            break

    if not updated:
        fallback_option = next(
            (option for option in DEFAULT_SETTINGS.get("playback_options", []) if option.get("id") == option_id),
            None,
        )
        if fallback_option is None:
            raise ValueError(f"Option not found: {option_id}")
        playback_options.append({
            "id": option_id,
            "label": fallback_option.get("label", option_id),
            "enabled": enabled,
        })
    
    settings["playback_options"] = playback_options
    SETTINGS_PATH.write_text(
        json.dumps(settings, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    
    return {"success": True, "option_id": option_id, "enabled": enabled}


def get_dynamic_version(repo_root: Path) -> dict:
    """環境変数ベースの動的バージョン情報（優先）、fallbackでversion.json"""
    import os
    
    # 環境変数優先（Docker環境）
    git_commit = os.getenv("GIT_COMMIT")
    git_branch = os.getenv("GIT_BRANCH")
    build_date = os.getenv("BUILD_DATE")
    
    if git_commit and git_branch and git_commit != "unknown" and git_branch != "unknown":
        import fastapi
        return {
            "app": f"{git_branch}@{git_commit}",
            "api": f"FastAPI {fastapi.__version__}",
            "build": build_date or "unknown"
        }
    
    # Fallback: 上流のバージョンロジック（Python直接起動時）
    try:
        git_hash = resolve_git_hash(repo_root)
        git_branch = resolve_git_branch(repo_root)
        import fastapi
        return {
            "app": f"{git_branch}@{git_hash}",
            "api": f"FastAPI {fastapi.__version__}",
            "build": resolve_git_commit_date(repo_root)
        }
    except Exception:
        # Git情報取得失敗時のフォールバック
        import fastapi
        return {
            "app": "unknown@unknown",
            "api": f"FastAPI {fastapi.__version__}",
            "build": "unknown"
        }


def set_base_url(base_url: str) -> dict:
    """アプリケーションの共有用ベースURLを更新する。"""
    settings = load_settings(DEFAULT_SETTINGS)
    app_settings = settings.get("app", {})
    app_settings["base_url"] = base_url
    settings["app"] = app_settings
    SETTINGS_PATH.write_text(
        json.dumps(settings, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return {"success": True, "base_url": base_url}


def set_design_settings(accent_color: str) -> dict:
    """デザイン設定を更新する。"""
    settings = load_settings(DEFAULT_SETTINGS)
    settings["design"] = {
        "accent_color": accent_color,
    }
    SETTINGS_PATH.write_text(
        json.dumps(settings, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return {"success": True, "design": settings["design"]}
