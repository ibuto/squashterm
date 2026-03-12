from __future__ import annotations

from dataclasses import dataclass

from pydantic import BaseModel


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
    file_url: str | None = None
    source_url: str | None = None
    file_format: str | None = None
    bitrate_kbps: int | None = None
    video_url: str | None = None




class AuthLoginRequest(BaseModel):
    username: str
    password: str


class UserCreateRequest(BaseModel):
    username: str
    password: str
    role: str = "user"
    display_name: str | None = None
    icon_url: str | None = None


class UserUpdateRequest(BaseModel):
    username: str | None = None
    password: str | None = None
    role: str | None = None
    is_active: bool | None = None
    display_name: str | None = None
    icon_url: str | None = None


class ApiKeyCreateRequest(BaseModel):
    name: str
    origin: str | None = None


class ApiKeyUpdateRequest(BaseModel):
    name: str | None = None
    origin: str | None = None
    is_active: bool | None = None


class ImportRequest(BaseModel):
    url: str
    playlist_id: str | None = None
    auto_tag: bool | None = None




class DownloadRequest(BaseModel):
    url: str
    playlist_id: str | None = None


class PlaylistBatchImportRequest(BaseModel):
    """プレイリスト一括インポートリクエスト"""
    url: str
    playlist_id: str | None = None
    concurrency: int = 10
    auto_tag: bool | None = None


class LocalFolderImportRequest(BaseModel):
    path: str
    playlist_id: str | None = None
    auto_tag: bool | None = None


class PlaylistCreate(BaseModel):
    name: str
    track_ids: list[str] = []
    auto_sync_url: str | None = None
    auto_sync_interval_minutes: int | None = None
    auto_sync_enabled: bool | None = None
    is_public: bool = True


class PlaylistUpdate(BaseModel):
    name: str | None = None
    track_ids: list[str] | None = None
    auto_sync_url: str | None = None
    auto_sync_interval_minutes: int | None = None
    auto_sync_enabled: bool | None = None
    is_public: bool | None = None


class FavoritesUpdate(BaseModel):
    track_ids: list[str]


class TrackUpdate(BaseModel):
    title: str | None = None
    artist: str | None = None
    album: str | None = None
    source_url: str | None = None


class ManualTrackMetadata(BaseModel):
    title: str
    artist: str
    album: str
    genre: str = "Unknown"
    year: int = 0
    duration: str = "--"
    bpm: int = 0
    source_url: str | None = None


class TrackRegisterRequest(BaseModel):
    file_path: str
    scan_meta: bool = True
    playlist_id: str | None = None
    metadata: ManualTrackMetadata | None = None


class PlaybackOptionUpdate(BaseModel):
    """再生設定の更新"""
    option_id: str
    enabled: bool
