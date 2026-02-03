# SquashTerm

yt-dlpで楽曲を取得できる音楽アプリケーションです。

## 主な画面

- **メディア**: ID3 タグを基にアルバムカバー、アーティスト、タイトルを一覧表示。
- **プレイリスト / お気に入り**: プレイリストの作成・お気に入りの再生を想定した UI。
- **楽曲管理**: yt-dlp を使った楽曲追加、ID3 タグ編集のフォーム。
- **設定**: バージョン情報、ストレージ、再生設定の概要。

## セットアップ

```bash
python server/app.py
```

ブラウザで `http://localhost:8000` を開きます。

## Docker環境

```bash
docker compose up -d
```

ブラウザで `http://localhost:8081` を開きます。

## 新機能: プレイリスト分割ダウンロード

大規模なプレイリスト（YouTube、SoundCloud、Bandcamp等）を効率的にダウンロードできます。

### 使い方

1. **楽曲管理**タブを開く
2. **プレイリスト一括ダウンロード（分割並列実行）** チェックボックスをオンにする
3. **並列ダウンロード数**を設定（1-10、デフォルト: 5）
4. プレイリストのURLを入力して**ライブラリに追加**をクリック

### 特徴

- **並列処理**: 複数の動画を同時にダウンロード（ThreadPoolExecutor使用）
- **進捗表示**: リアルタイムで進捗状況を確認
- **対応サイト**: YouTube、SoundCloud、Bandcamp等、yt-dlpが対応する全サイト
- **柔軟な設定**: 並列度を調整可能

### Redis版（オプショナル）

より高度な分散処理が必要な場合、Redisを有効化できます：

環境変数`REDIS_URL`を設定すると、自動的にRedisベースのキューが使用されます。

```bash
export REDIS_URL=redis://localhost:6379/0
python server/app.py
```

Docker環境では、`docker-compose.yml`のRedisサービスのコメントを外してください。

## 補足

- yt-dlp を使った楽曲取り込みは `POST /api/library/import` で実行します。
  - 送信例: `{ "url": "...", "playlist_id": "pl_001", "playlist_name": "未分類" }`
- サーバー初回起動時に `data/library.json` を作成し、デモ用のデータを初期登録します。
