# SquashTerm

yt-dlpで楽曲を取得できる音楽アプリケーションです。

## 主な機能

  - モバイルフレンドリーなWebGUI
  - 簡単に操作できる画面構成
  - 楽曲登録・管理を容易にするyt-dlp連携
  - 軽量
  - 複雑な手順を踏まずデプロイ可能
## セットアップ

初回実行・アップデート時はライブラリの確認をお勧めします。

### リポジトリのクローン
```
git clone https://github.com/ibuto/squashterm
cd squashterm
```

### venvの作成
```bash
python -m venv venv
```

### venv環境へ入る
Windows:
```
venv\Scripts\activate
```
macOS:
```
source venv/bin/activate
```

### ライブラリの導入・起動
```
pip install -r requirements.txt
python server/app.py
```

## 使用

ブラウザで `http://localhost:8000` を開きます。
