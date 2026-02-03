# ワークフロー・ガイド

このプロジェクト（waya0125/squashterm fork）の開発ワークフローとブランチ戦略について説明します。

## ブランチ戦略

### 主要ブランチ

- **`main`**: 全機能を含むブランチ（標準機能 + 独自機能）
  - 直接PRには使用しない
  - 両方のfeatureブランチをマージして最新状態を維持

- **`feature/upstream`**: 上流リポジトリ（ibuto/squashterm）へのPR専用
  - 標準機能のみを実装
  - Docker、Redis、その他独自機能は含めない
  - このブランチからibuto/squashterm へPRを作成

- **`feature/custom`**: 独自機能専用
  - Docker対応
  - Redis対応
  - certifi等の追加依存関係
  - 独自の拡張機能

### ワークフロー

```
1. 標準機能を開発 → feature/upstream にコミット
2. 独自機能を開発 → feature/custom にコミット
3. 両方を main にマージ
4. feature/upstream から上流へPR作成
```

### 変更の反映ルール

**feature/upstreamで変更した場合:**
1. feature/upstreamにコミット・プッシュ
2. mainにマージまたはcherry-pick
3. feature/customにもcherry-pick（標準機能の修正なので両方に必要）

```bash
# 例: feature/upstreamでCSS修正
git checkout feature/upstream
git add server/static/styles.css
git commit -m "fix: CSSの修正"
git push fork feature/upstream

# mainに反映
git checkout main
git merge --no-ff feature/upstream

# customにも反映
git checkout feature/custom
git cherry-pick <commit-hash>
git push fork feature/custom
```

**feature/customで変更した場合:**
1. feature/customにコミット・プッシュ
2. mainにマージまたはcherry-pick
3. 必要に応じてfeature/upstreamにもcherry-pick（独自機能でない場合のみ）

```bash
# 例: feature/customで独自機能追加
git checkout feature/custom
git add docker-compose.yml
git commit -m "feat: Redis設定追加"
git push fork feature/custom

# mainに反映
git checkout main
git merge --no-ff feature/custom

# upstreamには反映しない（独自機能のため）
```

**両方に共通する変更の場合:**
- feature/upstreamで実装して両方に反映するのが推奨
- または、両ブランチで個別にコミット

## コミット方針

### コミットの分割

機能実装は以下の段階に分けてコミット：

1. **コア機能実装**: バックエンドのロジック追加
2. **UI実装**: フロントエンドの画面・機能追加
3. **CSS修正**: スタイルの調整・修正
4. **ドキュメント**: README、コメント等の更新

### コミットメッセージ

Conventional Commits形式を推奨：

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント変更
style: コードスタイル変更（機能に影響なし）
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・補助ツール変更
```

## 依存関係管理

### requirements.txt

- **feature/upstream**: 標準的な依存関係のみ
  ```
  fastapi
  mutagen
  python-multipart
  uvicorn[standard]
  yt-dlp
  ```

- **feature/custom / main**: 独自依存関係を追加
  ```
  fastapi
  mutagen
  python-multipart
  uvicorn[standard]
  yt-dlp
  redis
  certifi
  ```

### docker-compose.yml

- feature/upstream: 含めない
- feature/custom / main: Redis等のサービスを追加（コメントアウト可能）

## PR作成時の注意

### 上流（ibuto/squashterm）へのPR

1. feature/upstream ブランチを使用
2. Docker、Redis関連のコードが混入していないか確認
3. requirements.txt に独自パッケージが含まれていないか確認
4. コミット履歴をクリーンに保つ

### 自分のforkへのPR

- main ブランチに直接マージ可能
- 即座にマージしてOK

## リモートブランチ管理

### push時のターゲット

```bash
# main ブランチ
git push fork main

# PRブランチの更新
git push fork feature/upstream:feature/playlist-batch-download-upstream -f

# 機能ブランチ
git push fork feature/upstream
git push fork feature/custom
```

### 不要ブランチの削除

定期的にリモートの不要なブランチを削除：

```bash
# リモートブランチ一覧確認
git branch -r

# 不要なリモートブランチを削除
git push fork --delete <branch-name>

# ローカルの追跡参照をクリーンアップ
git fetch --prune
```

## Docker環境でのテスト

### 起動

```bash
docker compose up -d
```

### アクセス

- ローカル開発: http://127.0.0.1:8000/
- Docker環境: http://127.0.0.1:8081/

### Redis有効化

docker-compose.yml のRedisサービスのコメントを外す：

```yaml
  # Redis (Optional - for distributed task queue)
  redis:
    image: redis:7-alpine
    # ...（コメント解除）
```

環境変数 `REDIS_URL` を設定：

```yaml
environment:
  - REDIS_URL=redis://redis:6379/0
```

## トラブルシューティング

### PR に不要なコミットが混入した場合

1. 新しいクリーンなブランチを作成
2. origin/main から分岐
3. 必要なコミットのみをcherry-pick
4. PR用のリモートブランチを強制更新

```bash
git checkout -b clean-feature origin/main
git cherry-pick <commit1> <commit2> ...
git push -f fork clean-feature:feature/playlist-batch-download-upstream
```

### ブランチが混乱した場合

main ブランチを再構築：

```bash
# 現在のmainを退避
git branch -m main main-old

# 新しいmainを作成
git checkout -b main origin/main

# feature/upstreamとfeature/customをマージ
git merge --no-ff feature/upstream
git merge --no-ff feature/custom

# リモートに反映
git push -f fork main
```

## 参考情報

- 上流リポジトリ: https://github.com/ibuto/squashterm
- forkリポジトリ: https://github.com/waya0125/squashterm
- コードスタイル: AGENTS.md を参照
