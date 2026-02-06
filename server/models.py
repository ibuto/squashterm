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


class ImportRequest(BaseModel):
    url: str
    playlist_id: str | None = None
    auto_tag: bool | None = None


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


class PlaylistUpdate(BaseModel):
    name: str | None = None
    track_ids: list[str] | None = None
    auto_sync_url: str | None = None
    auto_sync_interval_minutes: int | None = None
    auto_sync_enabled: bool | None = None


class FavoritesUpdate(BaseModel):
    track_ids: list[str]


class TrackUpdate(BaseModel):
    title: str | None = None
    artist: str | None = None
    album: str | None = None
    source_url: str | None = None


class PlaybackOptionUpdate(BaseModel):
    """再生設定の更新"""
    option_id: str
    enabled: bool
