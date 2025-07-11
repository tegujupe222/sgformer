# SGformer - 教育フォーム管理システム

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)

教育イベント登録とフォーム提出を管理するモダンなWebアプリケーションです。React、TypeScript、Viteで構築されています。

## 🌟 デモ

[![デモ画像](https://via.placeholder.com/800x400/005A9C/FFFFFF?text=SGformer+Demo)](https://your-username.github.io/sgformer)

**ライブデモ**: [https://your-username.github.io/sgformer](https://your-username.github.io/sgformer)

## 機能

- **ロールベースアクセス制御**: 管理者と一般ユーザーの分離されたインターフェース
- **フォーム管理**: 複数のオプションを持つイベント登録フォームの作成・管理
- **提出物追跡**: フォーム提出と出席の追跡
- **PDF生成**: バーコード付き確認書の生成
- **レスポンシブデザイン**: Tailwind CSSで構築されたモダンなUI
- **ローカルストレージ**: ブラウザのlocalStorageを使用したデータ永続化

## 技術スタック

- **フロントエンド**: React 18, TypeScript, Vite
- **スタイリング**: Tailwind CSS
- **ルーティング**: React Router DOM
- **PDF生成**: jsPDF, JsBarcode
- **アイコン**: カスタムSVGアイコン

## 🚀 はじめに

### 前提条件

- Node.js (バージョン18以上)
- npm または yarn

### インストール

1. リポジトリをクローン:
   ```bash
   git clone https://github.com/your-username/sgformer.git
   cd sgformer
   ```

2. 依存関係をインストール:
   ```bash
   npm install
   ```

3. 環境変数を設定:
   ```bash
   cp env.example .env.local
   # .env.localファイルを編集して必要な環境変数を設定
   ```

4. 開発サーバーを起動:
   ```bash
   npm run dev
   ```

5. ブラウザで `http://localhost:5173` にアクセス

### クイックスタート

```bash
# リポジトリをクローン
git clone https://github.com/your-username/sgformer.git

# プロジェクトディレクトリに移動
cd sgformer

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

## 使用方法

### デモアカウント

- **管理者**: 「管理者としてログイン」をクリックして管理者機能にアクセス
- **一般ユーザー**: 「一般ユーザーとしてログイン」をクリックしてユーザー機能にアクセス

### 管理者機能

- イベントフォームの作成・編集
- フォーム提出物の表示
- 提出データのエクスポート
- 参加者のチェックイン
- 出席レポートの生成

### ユーザー機能

- 利用可能なイベントの閲覧
- イベントへの登録
- 確認詳細の表示
- 確認PDFのダウンロード

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
├── types.ts            # TypeScript型定義
└── App.tsx             # メインアプリケーションコンポーネント
```

## 🛠️ 利用可能なスクリプト

| スクリプト | 説明 |
|-----------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番用ビルド |
| `npm run preview` | 本番ビルドのプレビュー |
| `npm run type-check` | TypeScript型チェック |
| `npm run lint` | ESLintでコードチェック |
| `npm run lint:fix` | ESLintエラーを自動修正 |
| `npm run format` | Prettierでコードフォーマット |
| `npm run format:check` | フォーマットチェック |


## 🔧 環境変数

ルートディレクトリに `.env.local` ファイルを作成し、以下を追加してください：

```bash
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
VITE_APP_NAME=SGformer
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
```



## 📦 デプロイ

### GitHub Pages

このプロジェクトはGitHub Actionsを使用してGitHub Pagesに自動デプロイされます。

1. リポジトリの設定でGitHub Pagesを有効化
2. `main`ブランチにプッシュすると自動的にデプロイ

### その他のプラットフォーム

```bash
# ビルド
npm run build

# ビルド結果をデプロイ
# dist/ディレクトリの内容をWebサーバーにアップロード
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
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)

---

⭐ このプロジェクトが役に立ったら、スターを付けてください！
