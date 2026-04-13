from __future__ import annotations

import json
import shutil
import threading
import uuid
from contextlib import asynccontextmanager
from dataclasses import asdict
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

from html import escape

from fastapi import Cookie, FastAPI, File, Form, Header, HTTPException, Query, Request, Response, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.gzip import GZipMiddleware
import uvicorn

from library_service import (
    append_track_record,
    append_tracks_to_playlist,
    apply_playlist_album_names,
    batch_download_playlist,
    build_upload_track,
    ensure_data_dirs,
    fetch_playlists,
    fetch_tracks,
    import_local_folder,
    init_library,
    load_library,
    parse_bool,
    parse_positive_int,
    remove_media_asset,
    save_library,
)
from auth_service import (
    create_api_key,
    create_session,
    create_user,
    delete_user,
    get_session_user,
    get_user_by_api_key,
    init_auth_db,
    list_api_keys,
    list_users,
    revoke_session,
    authenticate_user,
    get_user_by_id,
    update_api_key,
    update_user,
    update_user_profile,
    fetch_user_favorites,
    save_user_favorites,
    remove_track_from_all_user_favorites,
)
from models import (
    ApiKeyCreateRequest,
    ApiKeyUpdateRequest,
    AuthLoginRequest,
    DownloadRequest,
    FavoritesUpdate,
    ImportRequest,
    LocalFolderImportRequest,
    PlaylistBatchImportRequest,
    PlaylistCreate,
    PlaylistUpdate,
    Track,
    TrackRegisterRequest,
    TrackUpdate,
    UserCreateRequest,
    UserUpdateRequest,
)
from paths import AUTO_SYNC_LOCK, MEDIA_DIR, STATIC_DIR, TEMPLATE_PATH
from settings_service import (
    DEFAULT_SETTINGS,
    build_settings_payload,
    build_system_payload,
    build_version_label,
    ensure_version_file,
    load_settings,
    set_base_url,
    set_design_settings,
    update_playback_option,
)
from sync_service import auto_sync_worker, sync_playlist_with_remote
from ytdlp_service import ingest_from_url, iter_ytdlp_events, is_single_video_url
from media_utils import scan_media_directory

REPO_ROOT = Path(__file__).resolve().parent.parent


@asynccontextmanager
async def lifespan(app_: "FastAPI"):  # noqa: F841
    # --- startup ---
    thread = threading.Thread(target=auto_sync_worker, daemon=True)
    thread.start()

    # 自動スキャンが有効なら起動時に実行
    settings = load_settings(DEFAULT_SETTINGS)
    auto_scan_enabled = any(
        opt.get("id") == "auto_scan" and opt.get("enabled")
        for opt in settings.get("playback_options", [])
    )
    if auto_scan_enabled:
        try:
            count = scan_media_directory()
            print(f"Auto scan: {count} files processed")
        except Exception as e:
            print(f"Auto scan failed: {e}")

    yield
    # --- shutdown (必要なら後処理をここに) ---


app = FastAPI(title="SquashTerm Server", version="0.1.0", lifespan=lifespan)

app.add_middleware(GZipMiddleware, minimum_size=512)

@app.middleware("http")
async def add_cache_headers(request: Request, call_next):
    response = await call_next(request)
    path = request.url.path
    if path.startswith("/static/"):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
    elif path.startswith("/media/"):
        response.headers.setdefault("Cache-Control", "public, max-age=86400")
    elif path in ("/", "/index.html"):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
    return response

init_library()
init_auth_db()
load_settings(DEFAULT_SETTINGS)
ensure_version_file()

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")



def _extract_api_key(authorization: str | None, x_api_key: str | None) -> str | None:
    if x_api_key:
        return x_api_key.strip()
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return None


def resolve_current_user(session_token: str | None, authorization: str | None, x_api_key: str | None, origin: str | None) -> dict | None:
    user = get_session_user(session_token)
    if user:
        return user
    api_key = _extract_api_key(authorization, x_api_key)
    return get_user_by_api_key(api_key, origin)


def require_login(user: dict | None) -> dict:
    if not user:
        raise HTTPException(status_code=401, detail="Login required")
    return user


def require_admin(user: dict | None) -> dict:
    user = require_login(user)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin required")
    return user


def can_view_playlist(user: dict | None, playlist: dict) -> bool:
    if playlist.get("is_public", True):
        return True
    if not user:
        return False
    if user.get("role") == "admin":
        return True
    return playlist.get("owner_id") == user.get("id")


def can_manage_playlist(user: dict | None, playlist: dict) -> bool:
    if not user:
        return False
    if user.get("role") == "admin":
        return True
    if playlist.get("is_public", True):
        return False
    owner_id = playlist.get("owner_id")
    if owner_id is None:
        return False
    return owner_id == user.get("id")


@app.get("/")
@app.get("/index.html")
async def read_index():
    if not TEMPLATE_PATH.exists():
        raise HTTPException(status_code=404, detail="Index template not found")
    return FileResponse(TEMPLATE_PATH)


@app.get("/sw.js")
def get_service_worker():
    sw_path = STATIC_DIR / "sw.js"
    if not sw_path.exists():
        raise HTTPException(status_code=404, detail="Service worker not found")
    return FileResponse(sw_path, media_type="application/javascript")


@app.get("/favicon.ico")
def get_favicon():
    custom_favicon = MEDIA_DIR / "branding" / "favicon.ico"
    favicon_path = custom_favicon if custom_favicon.exists() else STATIC_DIR / "images" / "icon.png"
    if not favicon_path.exists():
        raise HTTPException(status_code=404, detail="Favicon not found")
    return FileResponse(favicon_path)


@app.get("/branding/logo")
def get_logo():
    custom_logo = MEDIA_DIR / "branding" / "logo.png"
    logo_path = custom_logo if custom_logo.exists() else STATIC_DIR / "images" / "logo.png"
    if not logo_path.exists():
        raise HTTPException(status_code=404, detail="Logo not found")
    return FileResponse(logo_path)


def build_track_share_url(track_id: str, base_url: str | None = None) -> str:
    raw_base_url = (base_url or "").strip()
    if not raw_base_url:
        settings = load_settings(DEFAULT_SETTINGS)
        app_settings = settings.get("app", {})
        raw_base_url = str(app_settings.get("base_url", "")).strip()

    normalized_base_url = raw_base_url.rstrip("/")
    if normalized_base_url and not normalized_base_url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Invalid base_url")

    track_path = f"/share/{quote(str(track_id))}"
    return f"{normalized_base_url}{track_path}" if normalized_base_url else track_path


@app.get("/api/share/track/{track_id}")
def get_track_share_url(track_id: str, base_url: str | None = Query(default=None)):
    tracks = fetch_tracks()
    track = next((item for item in tracks if item.id == track_id), None)
    if track is None:
        raise HTTPException(status_code=404, detail="Track not found")
    return {"track_id": track.id, "share_url": build_track_share_url(track.id, base_url)}




@app.get("/share/{track_id}", response_class=HTMLResponse)
def render_share_page(track_id: str, request: Request):
    """OGP ランディングページ。クローラーには meta タグを返し、人間には 8 秒後にアプリへリダイレクトする。"""
    tracks = fetch_tracks()
    track = next((t for t in tracks if t.id == track_id), None)
    if track is None:
        raise HTTPException(status_code=404, detail="Track not found")

    settings = load_settings(DEFAULT_SETTINGS)
    configured_base = str(settings.get("app", {}).get("base_url", "")).strip().rstrip("/")
    base_url = _resolve_base_url(request, configured_base)

    relative_cover = track.cover or "/static/images/icon.png"
    abs_cover = f"{base_url}{relative_cover}" if base_url and relative_cover.startswith("/") else relative_cover
    canonical = f"{base_url}/share/{quote(track.id)}" if base_url else f"/share/{quote(track.id)}"
    app_url = f"{base_url}/?id={quote(track.id)}" if base_url else f"/?id={quote(track.id)}"

    t = escape(track.title or "不明")
    artist = escape(track.artist or "不明")
    album = escape(track.album or "不明")
    desc = escape(f"{track.artist or '不明'} · {track.album or '不明'}")
    img = escape(abs_cover)
    url = escape(canonical)
    src_url = escape(track.source_url or "")

    return _build_share_html(t, artist, album, desc, img, url, app_url, src_url)


def _resolve_base_url(request: Request, settings_base_url: str) -> str:
    """base_url を解決する。設定値が空の場合はリクエストのプロキシヘッダーから自動検出する。

    優先順位: 設定値 > X-Forwarded-Proto + Host > request.base_url
    Cloudflare / nginx などのリバースプロキシ環境でも絶対 URL を生成できる。
    """
    if settings_base_url:
        return settings_base_url
    proto = request.headers.get("x-forwarded-proto", "").split(",")[0].strip().lower()
    if proto not in ("http", "https"):
        proto = ""
    host = request.headers.get("x-forwarded-host") or request.headers.get("host", "")
    if proto and host:
        return f"{proto}://{host}"
    return str(request.base_url).rstrip("/")


def _build_share_html(
    title: str,
    artist: str,
    album: str,
    description: str,
    image_url: str,
    canonical_url: str,
    app_url: str,
    source_url: str,
) -> str:
    source_link = (
        f'<a class="src-link" href="{source_url}" target="_blank" rel="noopener noreferrer">'
        f"元の作品を開く ↗</a>"
        if source_url
        else ""
    )
    return f"""<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} - SquashTerm</title>
    <!-- OGP -->
    <meta property="og:type" content="music.song" />
    <meta property="og:site_name" content="SquashTerm" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{description}" />
    <meta property="og:image" content="{image_url}" />
    <meta property="og:url" content="{canonical_url}" />
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title}" />
    <meta name="twitter:description" content="{description}" />
    <meta name="twitter:image" content="{image_url}" />
    <style>
      *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
      body {{
        min-height: 100dvh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0f0f0f;
        color: #e5e7eb;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        padding: 1rem;
      }}
      .card {{
        background: #1a1a1a;
        border: 1px solid #2d2d2d;
        border-radius: 12px;
        max-width: 420px;
        width: 100%;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,.5);
      }}
      .cover {{
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
        display: block;
        background: #111;
      }}
      .info {{ padding: 1.25rem 1.25rem 0.75rem; }}
      .info h1 {{ font-size: 1.2rem; font-weight: 700; line-height: 1.3; margin-bottom: 0.35rem; }}
      .info p  {{ font-size: 0.9rem; color: #9ca3af; }}
      .info p + p {{ margin-top: 0.15rem; }}
      .actions {{ padding: 0.75rem 1.25rem 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; }}
      .btn-open {{
        display: block; width: 100%;
        background: #93c5fd; color: #0f172a;
        border: none; border-radius: 8px;
        padding: 0.7rem 1rem; font-size: 0.95rem; font-weight: 600;
        cursor: pointer; text-align: center; text-decoration: none;
        transition: opacity .15s;
      }}
      .btn-open:hover {{ opacity: .85; }}
      .src-link {{
        display: block; text-align: center;
        color: #6b7280; font-size: 0.8rem;
        text-decoration: none;
      }}
      .src-link:hover {{ color: #9ca3af; }}
      .redirect-note {{
        text-align: center; font-size: 0.78rem; color: #4b5563; padding: 0 1.25rem 1rem;
      }}
    </style>
  </head>
  <body>
    <div class="card">
      <img class="cover" src="{image_url}" alt="カバー画像" loading="lazy" />
      <div class="info">
        <h1>{title}</h1>
        <p>{artist}</p>
        <p>{album}</p>
      </div>
      <div class="actions">
        <a class="btn-open" href="{escape(app_url)}">SquashTerm で開く</a>
        {source_link}
      </div>
      <p class="redirect-note" id="note"><span id="sec">8</span> 秒後に自動でアプリを開きます</p>
    </div>
    <script>
      /* app_url は生 URL のまま渡す: href は escape() 済み、JS は json.dumps() でエスケープ */
      const appUrl = {json.dumps(app_url)};
      let t = 8;
      const el = document.getElementById("sec");
      const note = document.getElementById("note");
      const iv = setInterval(() => {{
        t--;
        if (el) el.textContent = t;
        if (t <= 0) {{
          clearInterval(iv);
          if (note) note.textContent = "アプリを開いています...";
          window.location.replace(appUrl);
        }}
      }}, 1000);
    </script>
  </body>
</html>"""



@app.get("/share/{track_id}", response_class=HTMLResponse)
def render_share_page(track_id: str, request: Request):
    """OGP ランディングページ。クローラーには meta タグを返し、人間には 8 秒後にアプリへリダイレクトする。"""
    tracks = fetch_tracks()
    track = next((t for t in tracks if t.id == track_id), None)
    if track is None:
        raise HTTPException(status_code=404, detail="Track not found")

    settings = load_settings(DEFAULT_SETTINGS)
    configured_base = str(settings.get("app", {}).get("base_url", "")).strip().rstrip("/")
    base_url = _resolve_base_url(request, configured_base)

    relative_cover = track.cover or "/static/images/icon.png"
    abs_cover = f"{base_url}{relative_cover}" if base_url and relative_cover.startswith("/") else relative_cover
    canonical = f"{base_url}/share/{quote(track.id)}" if base_url else f"/share/{quote(track.id)}"
    app_url = f"{base_url}/?id={quote(track.id)}" if base_url else f"/?id={quote(track.id)}"

    t = escape(track.title or "不明")
    artist = escape(track.artist or "不明")
    album = escape(track.album or "不明")
    desc = escape(f"{track.artist or '不明'} · {track.album or '不明'}")
    img = escape(abs_cover)
    url = escape(canonical)
    src_url = escape(track.source_url or "")

    return _build_share_html(t, artist, album, desc, img, url, app_url, src_url)


def _resolve_base_url(request: Request, settings_base_url: str) -> str:
    """base_url を解決する。設定値が空の場合はリクエストのプロキシヘッダーから自動検出する。

    優先順位: 設定値 > X-Forwarded-Proto + Host > request.base_url
    Cloudflare / nginx などのリバースプロキシ環境でも絶対 URL を生成できる。
    """
    if settings_base_url:
        return settings_base_url
    proto = request.headers.get("x-forwarded-proto", "").split(",")[0].strip().lower()
    if proto not in ("http", "https"):
        proto = ""
    host = request.headers.get("x-forwarded-host") or request.headers.get("host", "")
    if proto and host:
        return f"{proto}://{host}"
    return str(request.base_url).rstrip("/")


def _build_share_html(
    title: str,
    artist: str,
    album: str,
    description: str,
    image_url: str,
    canonical_url: str,
    app_url: str,
    source_url: str,
) -> str:
    source_link = (
        f'<a class="src-link" href="{source_url}" target="_blank" rel="noopener noreferrer">'
        f"元の作品を開く ↗</a>"
        if source_url
        else ""
    )
    return f"""<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} - SquashTerm</title>
    <!-- OGP -->
    <meta property="og:type" content="music.song" />
    <meta property="og:site_name" content="SquashTerm" />
    <meta property="og:title" content="{title}" />
    <meta property="og:description" content="{description}" />
    <meta property="og:image" content="{image_url}" />
    <meta property="og:url" content="{canonical_url}" />
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{title}" />
    <meta name="twitter:description" content="{description}" />
    <meta name="twitter:image" content="{image_url}" />
    <style>
      *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
      body {{
        min-height: 100dvh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #0f0f0f;
        color: #e5e7eb;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        padding: 1rem;
      }}
      .card {{
        background: #1a1a1a;
        border: 1px solid #2d2d2d;
        border-radius: 12px;
        max-width: 420px;
        width: 100%;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,.5);
      }}
      .cover {{
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
        display: block;
        background: #111;
      }}
      .info {{ padding: 1.25rem 1.25rem 0.75rem; }}
      .info h1 {{ font-size: 1.2rem; font-weight: 700; line-height: 1.3; margin-bottom: 0.35rem; }}
      .info p  {{ font-size: 0.9rem; color: #9ca3af; }}
      .info p + p {{ margin-top: 0.15rem; }}
      .actions {{ padding: 0.75rem 1.25rem 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; }}
      .btn-open {{
        display: block; width: 100%;
        background: #93c5fd; color: #0f172a;
        border: none; border-radius: 8px;
        padding: 0.7rem 1rem; font-size: 0.95rem; font-weight: 600;
        cursor: pointer; text-align: center; text-decoration: none;
        transition: opacity .15s;
      }}
      .btn-open:hover {{ opacity: .85; }}
      .src-link {{
        display: block; text-align: center;
        color: #6b7280; font-size: 0.8rem;
        text-decoration: none;
      }}
      .src-link:hover {{ color: #9ca3af; }}
      .redirect-note {{
        text-align: center; font-size: 0.78rem; color: #4b5563; padding: 0 1.25rem 1rem;
      }}
    </style>
  </head>
  <body>
    <div class="card">
      <img class="cover" src="{image_url}" alt="カバー画像" loading="lazy" />
      <div class="info">
        <h1>{title}</h1>
        <p>{artist}</p>
        <p>{album}</p>
      </div>
      <div class="actions">
        <a class="btn-open" href="{escape(app_url)}">SquashTerm で開く</a>
        {source_link}
      </div>
      <p class="redirect-note" id="note"><span id="sec">8</span> 秒後に自動でアプリを開きます</p>
    </div>
    <script>
      /* app_url は生 URL のまま渡す: href は escape() 済み、JS は json.dumps() でエスケープ */
      const appUrl = {json.dumps(app_url)};
      let t = 8;
      const el = document.getElementById("sec");
      const note = document.getElementById("note");
      const iv = setInterval(() => {{
        t--;
        if (el) el.textContent = t;
        if (t <= 0) {{
          clearInterval(iv);
          if (note) note.textContent = "アプリを開いています...";
          window.location.replace(appUrl);
        }}
      }}, 1000);
    </script>
  </body>
</html>"""



@app.put("/api/settings/base-url")
def update_base_url(
    payload: dict,
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(user)
    base_url = payload.get("base_url", "")
    if base_url is None:
        base_url = ""
    base_url = str(base_url).strip()
    if base_url and not base_url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="base_url must start with http:// or https://")
    return set_base_url(base_url)


@app.put("/api/settings/design")
def update_design_settings(
    payload: dict,
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(user)
    accent_color = str(payload.get("accent_color", "")).strip()
    if not accent_color:
        raise HTTPException(status_code=400, detail="accent_color is required")
    return set_design_settings(accent_color)


@app.post("/api/settings/design/logo")
async def upload_logo(
    file: UploadFile = File(...),
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(user)
    if not file.filename:
        raise HTTPException(status_code=400, detail="logo file is required")
    branding_dir = MEDIA_DIR / "branding"
    branding_dir.mkdir(parents=True, exist_ok=True)
    logo_path = branding_dir / "logo.png"
    with logo_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"success": True, "logo_url": "/branding/logo"}


@app.post("/api/settings/design/favicon")
async def upload_favicon(
    file: UploadFile = File(...),
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(user)
    if not file.filename:
        raise HTTPException(status_code=400, detail="favicon file is required")
    branding_dir = MEDIA_DIR / "branding"
    branding_dir.mkdir(parents=True, exist_ok=True)
    favicon_path = branding_dir / "favicon.ico"
    with favicon_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"success": True, "favicon_url": "/favicon.ico"}






@app.delete("/api/settings/design/logo")
def reset_logo(
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(user)
    logo_path = MEDIA_DIR / "branding" / "logo.png"
    if logo_path.exists():
        logo_path.unlink()
    return {"success": True, "logo_url": "/branding/logo"}


@app.delete("/api/settings/design/favicon")
def reset_favicon(
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(user)
    favicon_path = MEDIA_DIR / "branding" / "favicon.ico"
    if favicon_path.exists():
        favicon_path.unlink()
    return {"success": True, "favicon_url": "/favicon.ico"}


@app.get("/api/auth/me")
def get_auth_me(
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    role = user.get("role") if user else "guest"
    return {"user": user, "role": role}


@app.post("/api/auth/login")
def login(payload: AuthLoginRequest, response: Response):
    user = authenticate_user(payload.username.strip(), payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_session(user["id"])
    response.set_cookie("session_token", token, httponly=True, samesite="lax", max_age=30*24*60*60)
    return {"user": user, "role": user["role"]}


@app.post("/api/auth/logout")
def logout(response: Response, session_token: str | None = Cookie(default=None)):
    if session_token:
        revoke_session(session_token)
    response.delete_cookie("session_token")
    return {"ok": True}




@app.put("/api/auth/profile")
def update_auth_profile(
    payload: dict,
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    user = require_login(user)
    display_name = payload.get("display_name")
    if display_name is not None:
        display_name = str(display_name).strip()
    show_video_on_player = payload.get("show_video_on_player")
    if show_video_on_player is not None:
        show_video_on_player = bool(show_video_on_player)
    updated = update_user_profile(
        user["id"],
        display_name=display_name,
        show_video_on_player=show_video_on_player,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


@app.post("/api/auth/profile/icon")
async def upload_auth_profile_icon(
    file: UploadFile = File(...),
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    user = require_login(user)
    if not file.filename:
        raise HTTPException(status_code=400, detail="icon file is required")
    extension = Path(file.filename).suffix.lower() or ".png"
    icon_dir = MEDIA_DIR / "user_icons"
    icon_dir.mkdir(parents=True, exist_ok=True)
    icon_path = icon_dir / f"user_{user['id']}{extension}"
    with icon_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    icon_url = f"/media/user_icons/{icon_path.name}"
    updated = update_user_profile(user["id"], icon_url=icon_url)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


@app.post("/api/admin/users/{user_id}/icon")
async def upload_admin_user_icon(
    user_id: int,
    file: UploadFile = File(...),
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    actor = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(actor)
    target = get_user_by_id(user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if not file.filename:
        raise HTTPException(status_code=400, detail="icon file is required")
    extension = Path(file.filename).suffix.lower() or ".png"
    icon_dir = MEDIA_DIR / "user_icons"
    icon_dir.mkdir(parents=True, exist_ok=True)
    icon_path = icon_dir / f"user_{user_id}{extension}"
    with icon_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    icon_url = f"/media/user_icons/{icon_path.name}"
    updated = update_user_profile(user_id, icon_url=icon_url)
    return updated


@app.get("/api/admin/users")
def get_admin_users(
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(user)
    users = list_users()
    user_map = {row["id"]: row["username"] for row in users}
    track_map = {track.id: track.title for track in fetch_tracks()}
    playlist_map: dict[int, list[dict]] = {}
    for playlist in fetch_playlists():
        owner_id = playlist.get("owner_id")
        if owner_id is None:
            continue
        track_items = [
            {"id": track_id, "title": track_map.get(track_id, "(不明な楽曲)")}
            for track_id in playlist.get("track_ids", [])
        ]
        playlist_map.setdefault(owner_id, []).append(
            {
                "id": playlist.get("id"),
                "name": playlist.get("name"),
                "is_public": bool(playlist.get("is_public", True)),
                "owner_id": owner_id,
                "owner_name": user_map.get(owner_id, "(不明なユーザー)"),
                "tracks": track_items,
            }
        )
    for row in users:
        row["playlists"] = playlist_map.get(row["id"], [])
    return users


@app.post("/api/admin/users")
def post_admin_user(
    payload: UserCreateRequest,
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(user)
    role = payload.role if payload.role in {"user", "admin"} else "user"
    try:
        return create_user(payload.username.strip(), payload.password, role, payload.display_name, payload.icon_url)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.put("/api/admin/users/{user_id}")
def put_admin_user(
    user_id: int,
    payload: UserUpdateRequest,
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    actor = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(actor)
    updated = update_user(user_id, payload.username, payload.password, payload.role, payload.is_active, payload.display_name, payload.icon_url)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


@app.delete("/api/admin/users/{user_id}", status_code=204)
def remove_admin_user(
    user_id: int,
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    actor = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(actor)
    if not delete_user(user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return Response(status_code=204)


@app.get("/api/admin/api-keys")
def get_admin_api_keys(
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(user)
    return list_api_keys()


@app.post("/api/admin/api-keys")
def post_admin_api_key(
    payload: ApiKeyCreateRequest,
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(user)
    row, raw_key = create_api_key(payload.name.strip(), payload.origin.strip() if payload.origin else None, user["id"])
    row["key"] = raw_key
    return row


@app.put("/api/admin/api-keys/{key_id}")
def put_admin_api_key(
    key_id: int,
    payload: ApiKeyUpdateRequest,
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(user)
    updated = update_api_key(key_id, payload.name, payload.origin, payload.is_active)
    if not updated:
        raise HTTPException(status_code=404, detail="API key not found")
    return updated


@app.get("/api/library")
def get_library():
    return [asdict(track) for track in fetch_tracks()]


@app.put("/api/library/{track_id}")
def update_track(track_id: str, payload: TrackUpdate, session_token: str | None = Cookie(default=None), authorization: str | None = Header(default=None), x_api_key: str | None = Header(default=None), origin: str | None = Header(default=None)):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(user)
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
def delete_track(track_id: str, delete_file: bool = True, session_token: str | None = Cookie(default=None), authorization: str | None = Header(default=None), x_api_key: str | None = Header(default=None), origin: str | None = Header(default=None)):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(user)
    data = load_library()
    tracks = data.get("tracks", [])
    target_index = next(
        (index for index, item in enumerate(tracks) if item.get("id") == track_id),
        None,
    )
    if target_index is None:
        raise HTTPException(status_code=404, detail="Track not found")
    removed = tracks.pop(target_index)
    for playlist in data.get("playlists", []):
        playlist["track_ids"] = [
            item for item in playlist.get("track_ids", []) if item != track_id
        ]
    save_library(data)
    remove_track_from_all_user_favorites(track_id)
    if delete_file:
        remove_media_asset(removed.get("file_path"))
        remove_media_asset(removed.get("cover"))
    return Response(status_code=204)


@app.get("/api/playlists")
def get_playlists(
    include_public: bool = Query(default=False),
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    playlists = fetch_playlists()
    if not user:
        return [playlist for playlist in playlists if playlist.get("is_public", True)]
    if user.get("role") == "admin":
        return playlists
    own_playlists = [playlist for playlist in playlists if playlist.get("owner_id") == user.get("id")]
    if include_public:
        public_others = [
            playlist for playlist in playlists
            if playlist.get("is_public", True) and playlist.get("owner_id") != user.get("id")
        ]
        return own_playlists + public_others
    return own_playlists


@app.post("/api/playlists")
def create_playlist(
    payload: PlaylistCreate,
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    user = require_login(user)
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
        "owner_id": user["id"],
        "is_public": bool(payload.is_public),
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
def update_playlist(
    playlist_id: str,
    payload: PlaylistUpdate,
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    data = load_library()
    playlists = data.get("playlists", [])
    playlist = next((item for item in playlists if item.get("id") == playlist_id), None)
    if playlist is None:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if not can_manage_playlist(user, playlist):
        raise HTTPException(status_code=403, detail="Forbidden")
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
    if payload.is_public is not None:
        playlist["is_public"] = payload.is_public
    save_library(data)
    return playlist


@app.delete("/api/playlists/{playlist_id}", status_code=204)
def delete_playlist(
    playlist_id: str,
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    data = load_library()
    playlists = data.get("playlists", [])
    target_index = next(
        (index for index, item in enumerate(playlists) if item.get("id") == playlist_id),
        None,
    )
    if target_index is None:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if not can_manage_playlist(user, playlists[target_index]):
        raise HTTPException(status_code=403, detail="Forbidden")
    playlists.pop(target_index)
    save_library(data)
    return Response(status_code=204)


@app.post("/api/playlists/{playlist_id}/sync")
def sync_playlist(playlist_id: str, session_token: str | None = Cookie(default=None), authorization: str | None = Header(default=None), x_api_key: str | None = Header(default=None), origin: str | None = Header(default=None)):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    user = require_login(user)
    playlists = fetch_playlists()
    playlist = next((item for item in playlists if item.get("id") == playlist_id), None)
    if playlist is None:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if not can_manage_playlist(user, playlist):
        raise HTTPException(status_code=403, detail="Forbidden")
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
def get_favorites(session_token: str | None = Cookie(default=None), authorization: str | None = Header(default=None), x_api_key: str | None = Header(default=None), origin: str | None = Header(default=None)):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    if not user:
        return []
    return fetch_user_favorites(user["id"])


@app.put("/api/favorites")
def update_favorites(payload: FavoritesUpdate, session_token: str | None = Cookie(default=None), authorization: str | None = Header(default=None), x_api_key: str | None = Header(default=None), origin: str | None = Header(default=None)):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    user = require_login(user)
    return save_user_favorites(user["id"], payload.track_ids)


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


@app.post("/api/library/apply-playlist-album-names")
def api_apply_playlist_album_names(
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),
):
    """既存楽曲のうち album 未設定のものに所属プレイリスト名を遡及適用する。"""
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_admin(user)
    try:
        result = apply_playlist_album_names()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/settings/playback-options")
def update_playback_options(payload: dict):
    """再生設定を更新"""
    try:
        option_id = payload.get("option_id")
        enabled = payload.get("enabled")
        if option_id is None or enabled is None:
            raise HTTPException(status_code=400, detail="option_id and enabled are required")
        return update_playback_option(option_id, enabled)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/system")
def get_system(session_token: str | None = Cookie(default=None), authorization: str | None = Header(default=None), x_api_key: str | None = Header(default=None), origin: str | None = Header(default=None)):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    payload = build_system_payload()
    if not user or user.get("role") != "admin":
        return {
            "storage": payload.get("storage"),
            "os": None,
            "hostname": None,
            "forbidden": True,
        }
    payload["forbidden"] = False
    return payload


@app.post("/api/library/download")
def download_track(payload: DownloadRequest, base_url: str | None = Query(default=None), session_token: str | None = Cookie(default=None), authorization: str | None = Header(default=None), x_api_key: str | None = Header(default=None), origin: str | None = Header(default=None)):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_login(user)
    """URLから楽曲をダウンロードし、登録済みトラックの共有リンクを返す。"""
    try:
        tracks, _ = ingest_from_url(payload.url, payload.playlist_id)
        if not tracks:
            raise HTTPException(status_code=400, detail="No tracks were registered")
        share_links = [
            {"track_id": track.id, "share_url": build_track_share_url(track.id, base_url)}
            for track in tracks
        ]
        if len(share_links) == 1:
            return share_links[0]
        return {"share_links": share_links}
    except FileNotFoundError:
        raise HTTPException(status_code=400, detail="yt-dlp is not installed")
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/library/import")
def import_track(payload: ImportRequest, session_token: str | None = Cookie(default=None), authorization: str | None = Header(default=None), x_api_key: str | None = Header(default=None), origin: str | None = Header(default=None)):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_login(user)
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
def import_track_stream(payload: ImportRequest, session_token: str | None = Cookie(default=None), authorization: str | None = Header(default=None), x_api_key: str | None = Header(default=None), origin: str | None = Header(default=None)):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_login(user)
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
def import_playlist_batch(payload: PlaylistBatchImportRequest, session_token: str | None = Cookie(default=None), authorization: str | None = Header(default=None), x_api_key: str | None = Header(default=None), origin: str | None = Header(default=None)):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_login(user)
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


@app.post("/api/library/import/local-folder")
def import_local_folder_route(payload: LocalFolderImportRequest, session_token: str | None = Cookie(default=None), authorization: str | None = Header(default=None), x_api_key: str | None = Header(default=None), origin: str | None = Header(default=None)):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_login(user)
    try:
        tracks = import_local_folder(payload.path, payload.playlist_id, payload.auto_tag)
        return {"added": len(tracks), "tracks": [asdict(track) for track in tracks]}
    except FileNotFoundError:
        raise HTTPException(status_code=400, detail="Folder not found")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/library/register")
def register_track(payload: TrackRegisterRequest, session_token: str | None = Cookie(default=None), authorization: str | None = Header(default=None), x_api_key: str | None = Header(default=None), origin: str | None = Header(default=None)):
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_login(user)
    """既存ファイルをライブラリへ登録する。

    - scan_meta=true: mutagen でメタデータを読み取って登録
    - scan_meta=false: metadata で手動指定した値を登録
    """
    source_path = Path(payload.file_path).expanduser()
    if not source_path.exists() or not source_path.is_file():
        raise HTTPException(status_code=400, detail="file_path does not exist")

    ensure_data_dirs()
    track_id = f"local_{uuid.uuid4().hex}"
    extension = source_path.suffix or ".mp3"
    dest_path = MEDIA_DIR / f"{track_id}{extension}"
    shutil.copy2(source_path, dest_path)

    if payload.scan_meta:
        track = build_upload_track(
            dest_path,
            track_id,
            None,
            None,
            None,
            None,
            None,
            None,
            True,
            None,
        )
    else:
        if payload.metadata is None:
            raise HTTPException(status_code=400, detail="metadata is required when scan_meta is false")
        manual_meta = payload.metadata
        parsed_year = manual_meta.year if manual_meta.year and manual_meta.year > 0 else 0
        parsed_bpm = manual_meta.bpm if manual_meta.bpm and manual_meta.bpm > 0 else 0
        track = Track(
            id=track_id,
            title=manual_meta.title,
            artist=manual_meta.artist,
            album=manual_meta.album,
            cover="/static/images/icon.png",
            duration=manual_meta.duration or "--",
            bpm=parsed_bpm,
            genre=manual_meta.genre or "Unknown",
            year=parsed_year,
            file_url=f"/media/{dest_path.name}",
            source_url=manual_meta.source_url,
            file_format=dest_path.suffix.lstrip(".").lower() or None,
            bitrate_kbps=None,
        )

    append_track_record(track, dest_path)
    append_tracks_to_playlist(payload.playlist_id, [track.id])
    return {"track": asdict(track), "scan_meta": parse_bool(payload.scan_meta, True)}


@app.post("/api/library/upload")
async def upload_track(
    session_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    origin: str | None = Header(default=None),

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
    user = resolve_current_user(session_token, authorization, x_api_key, origin)
    require_login(user)
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


# ---------------------------------------------------------------------------
# Maintenance endpoints
# ---------------------------------------------------------------------------

@app.post("/api/maintenance/apply-album-from-source-playlists")
def apply_album_from_playlists(payload: dict | list[dict]):
    """プレイリストURLに基づきトラックのAlbumを遡及設定する (one-shot)。

    Body (推奨):
      {"playlists": [{"url": "...", "album_name": "..."}, ...]}

    互換性のため、ルート配列形式も受け付けます:
      [{"url": "...", "album_name": "..."}, ...]

    album_name は省略可（yt-dlp の playlist_title を自動使用）。
    """
    from library_service import apply_album_from_source_playlists

    if isinstance(payload, dict):
        playlists = payload.get("playlists", [])
        if not isinstance(playlists, list):
            raise HTTPException(status_code=400, detail="'playlists' field must be a list")
    else:
        playlists = payload

    return apply_album_from_source_playlists(playlists)


def run(host: str = "0.0.0.0", port: int = 8000) -> None:
    print(f"SquashTerm server running on http://{host}:{port}")

    try:
        import uvloop  # noqa: F401
        loop = "uvloop"
    except ImportError:
        loop = "asyncio"

    try:
        import httptools  # noqa: F401
        http = "httptools"
    except ImportError:
        http = "auto"

    uvicorn.run(
        app,
        host=host,
        port=port,
        loop=loop,
        http=http,
        timeout_keep_alive=65,  # Cloudflare Tunnel の keepalive と合わせる
        access_log=False,       # アクセスログ無効化でホットパス削減
    )


if __name__ == "__main__":
    run()
