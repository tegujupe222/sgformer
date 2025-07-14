# SGformer - 教育フォーム管理システム

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)

教育イベント登録とフォーム提出を管理するモダンなWebアプリケーションです。React、TypeScript、Vite、Express、MongoDBで構築されています。

## 🌟 デモ

[![デモ画像](https://via.placeholder.com/800x400/005A9C/FFFFFF?text=SGformer+Demo)](https://sgformer.vercel.app)

**ライブデモ**: [https://sgformer.vercel.app](https://sgformer.vercel.app)

## 機能

- **Google認証**: セキュアなGoogle OAuth2.0認証
- **ロールベースアクセス制御**: 管理者と一般ユーザーの分離されたインターフェース
- **フォーム管理**: 複数のオプションを持つイベント登録フォームの作成・管理
- **提出物追跡**: フォーム提出と出席の追跡
- **PDF生成**: バーコード付き確認書の生成
- **ファイルアップロード**: 添付ファイルのアップロード・管理
- **通知システム**: リアルタイム通知機能
- **レスポンシブデザイン**: Tailwind CSSで構築されたモダンなUI
- **MongoDB Atlas**: クラウドデータベースによるデータ永続化

## 技術スタック

- **フロントエンド**: React 18, TypeScript, Vite
- **バックエンド**: Express.js, Node.js
- **データベース**: MongoDB Atlas
- **認証**: Google OAuth2.0, JWT
- **スタイリング**: Tailwind CSS
- **ルーティング**: React Router DOM
- **PDF生成**: jsPDF, JsBarcode
- **ファイルアップロード**: Multer
- **デプロイ**: Vercel (フロントエンド), Railway/Render (バックエンド)

## 🚀 はじめに

### 前提条件

- Node.js (バージョン18以上)
- npm または yarn
- MongoDB Atlas アカウント
- Google Cloud Console アカウント

### 開発環境セットアップ

1. リポジトリをクローン:

   ```bash
   git clone https://github.com/your-username/sgformer.git
   cd sgformer
   ```

2. 依存関係をインストール:

   ```bash
   npm install
   cd server && npm install
   ```

3. 環境変数を設定:

   ```bash
   cp env.example .env.local
   cp server/env.example server/.env
   # .env.localとserver/.envファイルを編集
   ```

4. 開発サーバーを起動:

   ```bash
   # フロントエンドとバックエンドを同時に起動
   npm run dev:full

   # または個別に起動
   npm run dev:server  # バックエンドサーバー
   npm run dev         # フロントエンドサーバー（別ターミナル）
   ```

5. ブラウザで `http://localhost:3000` にアクセス

### 本番環境セットアップ

#### 1. MongoDB Atlas セットアップ

1. [MongoDB Atlas](https://www.mongodb.com/atlas)でアカウント作成
2. 新しいクラスタを作成
3. データベースユーザーを作成
4. ネットワークアクセスを設定（0.0.0.0/0で全許可）
5. 接続文字列を取得

#### 2. Google Cloud Console セットアップ

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクト作成
2. Google+ APIを有効化
3. OAuth 2.0クライアントIDを作成
4. 承認済みリダイレクトURIを設定:
   - 開発: `http://localhost:5173`
   - 本番: `https://sgformer.vercel.app`

#### 3. Vercel デプロイ

1. [Vercel](https://vercel.com/)でアカウント作成
2. GitHubリポジトリを接続
3. 環境変数を設定:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_API_URL=https://your-backend-url.com/api
   ```

#### 4. バックエンドデプロイ

1. [Railway](https://railway.app/)または[Render](https://render.com/)でデプロイ
2. 環境変数を設定:
   ```
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### クイックスタート

```bash
# リポジトリをクローン
git clone https://github.com/your-username/sgformer.git

# プロジェクトディレクトリに移動
cd sgformer

# 依存関係をインストール
npm install
cd server && npm install

# 環境変数を設定
cp env.example .env.local
cp server/env.example server/.env

# 開発サーバーを起動
cd server && npm run dev  # バックエンド
npm run dev               # フロントエンド
```

## 使用方法

### 認証

- **Google認証**: 「Googleでログイン」ボタンでGoogleアカウントを使用
- **デモモード**: 開発環境では「一般ユーザー（デモ）」「管理者（デモ）」ボタンが利用可能

### 管理者機能

- イベントフォームの作成・編集・削除
- フォーム提出物の表示・管理
- 提出データのエクスポート（CSV）
- 参加者のチェックイン
- 出席レポートの生成
- ユーザー管理

### ユーザー機能

- 利用可能なイベントの閲覧
- イベントへの登録
- 確認詳細の表示
- 確認PDFのダウンロード
- ファイルアップロード

## プロジェクト構造

```
sgformer/
├── components/          # Reactコンポーネント
│   ├── admin/          # 管理者専用コンポーネント
│   ├── auth/           # 認証コンポーネント
│   ├── layout/         # レイアウトコンポーネント
│   ├── ui/             # 再利用可能なUIコンポーネント
│   └── user/           # ユーザー専用コンポーネント
├── context/            # 状態管理用Reactコンテキスト
├── services/           # APIとユーティリティサービス
├── utils/              # ユーティリティ関数
├── locales/            # 国際化ファイル
├── server/             # Express.jsバックエンド
│   ├── models/         # MongoDBモデル
│   ├── routes/         # APIルート
│   ├── middleware/     # ミドルウェア
│   └── types/          # 型定義
├── types.ts            # TypeScript型定義
└── App.tsx             # メインアプリケーションコンポーネント
```

## 🛠️ 利用可能なスクリプト

| スクリプト                 | 説明                                   |
| -------------------------- | -------------------------------------- |
| `npm run dev`              | フロントエンド開発サーバーを起動       |
| `npm run dev:server`       | バックエンド開発サーバーを起動         |
| `npm run dev:full`         | フロントエンドとバックエンドを同時起動 |
| `npm run build`            | 本番用ビルド                           |
| `npm run preview`          | 本番ビルドのプレビュー                 |
| `npm run type-check`       | TypeScript型チェック                   |
| `npm run lint`             | ESLintでコードチェック                 |
| `npm run lint:fix`         | ESLintエラーを自動修正                 |
| `npm run format`           | Prettierでコードフォーマット           |
| `npm run format:check`     | フォーマットチェック                   |
| `cd server && npm run dev` | バックエンド開発サーバーを起動         |

## 🔧 環境変数

### フロントエンド (.env.local)

```bash
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# API Configuration
VITE_API_URL=http://localhost:3001/api

# App Configuration
VITE_APP_NAME=SGformer
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
```

### バックエンド (server/.env)

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sgformer

# Authentication
JWT_SECRET=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server Configuration
PORT=3001
NODE_ENV=development

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

## 📦 デプロイ

### Vercel (フロントエンド)

1. VercelでGitHubリポジトリを接続
2. 環境変数を設定
3. 自動デプロイが有効

### Railway/Render (バックエンド)

1. RailwayまたはRenderでリポジトリを接続
2. 環境変数を設定
3. 自動デプロイが有効

### 手動デプロイ

```bash
# フロントエンド
npm run build
# dist/ディレクトリをWebサーバーにアップロード

# バックエンド
cd server
npm install
npm start
```

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！詳細は[CONTRIBUTING.md](CONTRIBUTING.md)を参照してください。

### 開発ワークフロー

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは[MIT License](LICENSE)の下で公開されています。

## 📞 サポート

- **Issues**: [GitHub Issues](https://github.com/your-username/sgformer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/sgformer/discussions)
- **Email**: support@sgformer.com

## 🙏 謝辞

このプロジェクトは以下のオープンソースプロジェクトを使用しています：

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)

---

⭐ このプロジェクトが役に立ったら、スターを付けてください！
