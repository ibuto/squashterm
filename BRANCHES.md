# ブランチ管理ルール

## ブランチ構成

```
upstream  ←→  fork元(ibuto/squashterm)へのPR専用ブランチ
    ↓ merge
  main    ←  upstream + 独自機能の結合点（Dockerや環境依存は含めない）
    ↓ merge
  docker  ←  Docker/Redis/Node.js等の環境依存・デプロイ専用ブランチ
```

## 各ブランチの役割と制約

### `upstream`
- fork元 (ibuto/squashterm) へのPRに使う標準機能のみ
- **Docker固有・環境依存のコードは絶対に含めない**
- mainやdockerからの逆流コミット禁止（不可逆コミット）

### `main`
- `upstream` の変更と独自機能をまとめる結合点
- **Docker固有のコード（Dockerfile, docker-compose.yml, Redis等）は絶対に含めない**
- upstreamの変更はここ経由でdockerへ渡す

### `docker`（旧: feature/custom）
- DockerfileやRedis・certifi等、デプロイ環境に依存するすべての変更
- mainをベースにDockerレイヤーを上乗せする形
- **upstream/mainへの逆流コミット禁止**

## マージフロー

```
upstream  → main  → docker   （変更の流れ）
```

1. 上流の機能・バグ修正 → `upstream` ブランチで実装・コミット
2. `upstream` → `main` へマージ（通常 fast-forward または merge commit）
3. `main` → `docker` へマージ（Dockerビルド用）

## cherry-pick

都度、一時ブランチを作成して実施する。

```bash
git checkout -b cherry-pick/fix-xxx <base-branch>
git cherry-pick <commit-hash>
# 確認後マージ
```

## ビルド

`docker` ブランチ上で `docker compose` を使う。  
バージョン情報（Git commit/branch/日時）は `.git` をread-onlyマウントしてコンテナ内から自動取得される。

```bash
git checkout docker

# 通常起動（コード変更はボリュームマウントで即時反映）
docker compose up -d

# Dockerfile や docker-compose.yml を変更した場合のみビルドが必要
docker compose build && docker compose up -d
```
