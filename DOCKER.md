# Docker環境での実行

SquashTermをDocker環境で実行する方法を説明します（独自実装）。

## 前提条件

- Docker
- Docker Compose

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

ブラウザで `http://localhost:8081` を開きます。  
※ `docker-compose.yml` でポート8081にマッピングしています。

## データの永続化

楽曲データとライブラリ情報は `./data` ディレクトリにマウントされています。

## Redis版（オプショナル）

より高度な分散処理が必要な場合、Redisを有効化できます。

### 有効化手順

1. `docker-compose.yml` のRedisサービスのコメントを外す：

```yaml
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

volumes:
  redis-data:
```

2. 環境変数 `REDIS_URL` を有効化：

```yaml
environment:
  - REDIS_URL=redis://redis:6379/0
```

3. depends_onを有効化：

```yaml
depends_on:
  - redis
```

4. 再起動：

```bash
docker compose down
docker compose up -d
```

### 確認

環境変数`REDIS_URL`が設定されていると、自動的にRedisベースのキューが使用されます。

ローカル環境で実行する場合：

```bash
export REDIS_URL=redis://localhost:6379/0
python server/app.py
```

## 依存パッケージ（独自版）

独自版では以下の追加パッケージを使用します：

- `redis`: Redis接続用
- `certifi`: SSL証明書検証用

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

## 開発時の使用

開発時にコード変更を即座に反映したい場合は、`docker-compose.yml`で以下の行をコメントアウト：

```yaml
# volumes:
#   - ./server:/app/server
```
