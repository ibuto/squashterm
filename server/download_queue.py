"""
プレイリストダウンロードのキュー管理モジュール

Redisが利用可能な場合はRedisベースのキューを、
そうでない場合はThreadPoolExecutorベースの実装を提供する。
"""

import os
import json
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import Callable, Any
from dataclasses import dataclass


@dataclass
class DownloadTask:
    """ダウンロードタスクの情報"""
    task_id: str
    url: str
    index: int
    total: int
    entry_id: str | None = None
    title: str | None = None


class DownloadQueue:
    """ダウンロードキューの抽象インターフェース"""
    
    def enqueue_playlist(
        self,
        entries: list[dict],
        download_func: Callable[[str, str | None], Any],
        playlist_id: str | None = None,
        progress_callback: Callable[[DownloadTask, Any], None] | None = None,
    ) -> str:
        """プレイリストのエントリをキューに追加してダウンロード開始"""
        raise NotImplementedError
    
    def get_status(self, task_id: str) -> dict:
        """タスクの進捗状況を取得"""
        raise NotImplementedError


class ThreadPoolDownloadQueue(DownloadQueue):
    """ThreadPoolExecutorベースのダウンロードキュー（標準実装）"""
    
    def __init__(self, max_workers: int = 5):
        self.max_workers = max_workers
        self._active_tasks = {}
        self._executor = ThreadPoolExecutor(max_workers=max_workers)
    
    def enqueue_playlist(
        self,
        entries: list[dict],
        download_func: Callable[[str, str | None], Any],
        playlist_id: str | None = None,
        progress_callback: Callable[[DownloadTask, Any], None] | None = None,
    ) -> str:
        """プレイリストを並列ダウンロード"""
        task_id = f"task_{uuid.uuid4().hex}"
        total = len(entries)
        
        self._active_tasks[task_id] = {
            "total": total,
            "completed": 0,
            "failed": 0,
            "results": [],
            "futures": [],
        }
        
        def process_entry(entry: dict, index: int):
            """単一エントリのダウンロード処理"""
            # URLを適切に抽出
            url = entry.get("webpage_url") or entry.get("original_url") or entry.get("url")
            if not url:
                # IDからYouTube URLを生成
                ie_key = str(entry.get("ie_key") or "").lower()
                if ie_key in {"youtube", "youtubeweb"}:
                    url = f"https://www.youtube.com/watch?v={entry.get('id')}"
                else:
                    url = entry.get("url", "")
            
            task = DownloadTask(
                task_id=task_id,
                url=url,
                index=index,
                total=total,
                entry_id=entry.get("id"),
                title=entry.get("title"),
            )
            
            try:
                result = download_func(url, playlist_id)
                self._active_tasks[task_id]["completed"] += 1
                self._active_tasks[task_id]["results"].append(result)
                
                if progress_callback:
                    progress_callback(task, result)
                
                return result
            except Exception as exc:
                self._active_tasks[task_id]["failed"] += 1
                if progress_callback:
                    progress_callback(task, {"error": str(exc)})
                return {"error": str(exc)}
        
        # 各エントリを非同期にサブミット
        for idx, entry in enumerate(entries):
            future = self._executor.submit(process_entry, entry, idx)
            self._active_tasks[task_id]["futures"].append(future)
        
        return task_id
    
    def get_status(self, task_id: str) -> dict:
        """タスクの進捗状況を取得"""
        task_data = self._active_tasks.get(task_id, {})
        return {
            "total": task_data.get("total", 0),
            "completed": task_data.get("completed", 0),
            "failed": task_data.get("failed", 0),
        }


class RedisDownloadQueue(DownloadQueue):
    """Redisベースのダウンロードキュー（オプショナル実装）"""
    
    def __init__(self, redis_url: str, max_workers: int = 5):
        try:
            import redis
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            self.max_workers = max_workers
            # 接続テスト
            self.redis_client.ping()
        except Exception as exc:
            raise RuntimeError(f"Redis connection failed: {exc}")
    
    def enqueue_playlist(
        self,
        entries: list[dict],
        download_func: Callable[[str, str | None], Any],
        playlist_id: str | None = None,
        progress_callback: Callable[[DownloadTask, Any], None] | None = None,
    ) -> str:
        """プレイリストのエントリをRedisキューに追加"""
        task_id = f"task_{uuid.uuid4().hex}"
        total = len(entries)
        
        # タスクメタデータを保存
        self.redis_client.hset(
            f"task:{task_id}",
            mapping={
                "total": total,
                "completed": 0,
                "failed": 0,
                "playlist_id": playlist_id or "",
            }
        )
        
        # 各エントリをキューに追加
        for idx, entry in enumerate(entries):
            # URLを適切に抽出
            url = entry.get("webpage_url") or entry.get("original_url") or entry.get("url")
            if not url:
                # IDからYouTube URLを生成
                ie_key = str(entry.get("ie_key") or "").lower()
                if ie_key in {"youtube", "youtubeweb"}:
                    url = f"https://www.youtube.com/watch?v={entry.get('id')}"
                else:
                    url = entry.get("url", "")
            
            task_data = {
                "task_id": task_id,
                "url": url,
                "index": idx,
                "total": total,
                "entry_id": entry.get("id"),
                "title": entry.get("title"),
                "playlist_id": playlist_id,
            }
            self.redis_client.rpush("download_queue", json.dumps(task_data))
        
        return task_id
    
    def get_status(self, task_id: str) -> dict:
        """タスクの進捗状況を取得"""
        task_data = self.redis_client.hgetall(f"task:{task_id}")
        if not task_data:
            return {}
        
        return {
            "total": int(task_data.get("total", 0)),
            "completed": int(task_data.get("completed", 0)),
            "failed": int(task_data.get("failed", 0)),
        }


def create_download_queue(max_workers: int = 5) -> DownloadQueue:
    """
    環境に応じたダウンロードキューを作成
    
    REDIS_URLが設定されている場合はRedis版、
    そうでない場合はThreadPool版を返す
    """
    redis_url = os.getenv("REDIS_URL")
    
    if redis_url:
        try:
            return RedisDownloadQueue(redis_url, max_workers)
        except Exception:
            # Redisに接続できない場合は標準実装にフォールバック
            pass
    
    return ThreadPoolDownloadQueue(max_workers)


def start_redis_worker(download_func: Callable[[str, str | None], Any]):
    """
    Redisワーカープロセス
    download_queue から取得して処理を実行
    """
    redis_url = os.getenv("REDIS_URL")
    if not redis_url:
        raise RuntimeError("REDIS_URL environment variable is not set")
    
    import redis
    redis_client = redis.from_url(redis_url, decode_responses=True)
    
    print("Redis worker started, waiting for tasks...")
    
    while True:
        # キューからタスクを取得（ブロッキング、タイムアウト1秒）
        task_data = redis_client.blpop("download_queue", timeout=1)
        
        if not task_data:
            continue
        
        try:
            task = json.loads(task_data[1])
            task_id = task["task_id"]
            url = task["url"]
            playlist_id = task.get("playlist_id")
            
            print(f"Processing: {task.get('title', url)} ({task['index']+1}/{task['total']})")
            
            # ダウンロード実行
            result = download_func(url, playlist_id)
            
            # 進捗を更新
            redis_client.hincrby(f"task:{task_id}", "completed", 1)
            redis_client.rpush(f"task:{task_id}:results", json.dumps(result))
            
        except Exception as exc:
            print(f"Error processing task: {exc}")
            if task:
                redis_client.hincrby(f"task:{task_id}", "failed", 1)
