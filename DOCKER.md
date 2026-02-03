# Docker Compose環境用のSquashTerm

このプロジェクトをDocker Composeで実行する手順です。

## 起動方法

```bash
# コンテナをビルドして起動
docker compose up -d

# ログを確認
docker compose logs -f

# 停止
docker compose down
```

## アクセス

ブラウザで `http://localhost:8000` を開きます。  
※ただし、ポートを変更した場合は、変更後のポートへアクセスしてください。

## データの永続化

音楽ライブラリのデータと設定は以下のDockerボリュームに永続化されます：
- `squashterm_data`: 音楽ファイルとライブラリデータ
- `squashterm_config`: アプリケーション設定

## 開発時の使用

開発時にコード変更を即座に反映したい場合は、`docker-compose.yml`で以下の行をコメントアウト：

```yaml
# volumes:
#   - ./server:/app/server
```

## トラブルシューティング

### コンテナの再ビルド
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### データのリセット
```bash
docker compose down
docker volume rm squashterm-docker_squashterm_data squashterm-docker_squashterm_config
docker compose up -d
```

## 使用するAPIエンドポイント

- `POST /api/library/import`: yt-dlpを使った楽曲追加
  - 例: `{ "url": "...", "playlist_id": "pl_001", "playlist_name": "未分類" }`
