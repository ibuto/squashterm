#!/bin/bash
# SquashTerm Docker ビルド＆起動スクリプト
# ビルド情報（Git commit、branch、日時）を環境変数として渡す

set -e

# Git情報取得
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
BUILD_DATE=$(TZ=Asia/Tokyo date +"%Y-%m-%d %H:%M:%S JST")

echo "================================"
echo "SquashTerm Docker Build"
echo "================================"
echo "Branch: $GIT_BRANCH"
echo "Commit: $GIT_COMMIT"
echo "Build:  $BUILD_DATE"
echo "================================"

# ビルド実行
docker-compose build \
  --build-arg GIT_COMMIT="$GIT_COMMIT" \
  --build-arg GIT_BRANCH="$GIT_BRANCH" \
  --build-arg BUILD_DATE="$BUILD_DATE"

echo ""
echo "ビルド完了！"
echo ""
echo "起動するには: docker-compose up -d"
echo "または: ./start.sh"
