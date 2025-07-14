# Google Cloud Console 設定手順

## 1. Google Cloud Console プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. プロジェクト名: `sgformer` (推奨)

## 2. Google+ API の有効化

1. 左側のメニューから「APIとサービス」→「ライブラリ」を選択
2. 以下のAPIを検索して有効化:
   - Google+ API
   - Google Identity and Access Management (IAM) API

## 3. OAuth 2.0 クライアントIDの作成

1. 「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「OAuth 2.0 クライアントID」を選択
3. アプリケーションの種類: 「ウェブアプリケーション」を選択
4. 名前: `SGformer Web Client`
5. 承認済みリダイレクトURI:
   - `http://localhost:5173`
   - `http://localhost:3000`
   - `https://your-domain.com` (本番環境用)

## 4. 認証情報の取得

作成後、以下の情報が表示されます:

- **クライアントID**: `your-client-id.apps.googleusercontent.com`
- **クライアントシークレット**: `your-client-secret`

## 5. 環境変数の設定

### フロントエンド (.env.local)

```bash
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_API_URL=http://localhost:3001/api
```

### サーバー (server/.env)

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb://localhost:27017/sgformer
FRONTEND_URL=http://localhost:5173
```

## 6. 本番環境での設定

### 追加の承認済みリダイレクトURI

- `https://your-domain.com`
- `https://your-domain.com/login`
- `https://your-domain.com/callback`

### 追加の承認済みJavaScriptオリジン

- `https://your-domain.com`

## 7. セキュリティ設定

### OAuth同意画面の設定

1. 「OAuth同意画面」タブを選択
2. アプリケーション名: `SGformer`
3. ユーザーサポートメール: あなたのメールアドレス
4. 開発者連絡先情報: あなたのメールアドレス
5. 承認済みドメイン: あなたのドメイン

### スコープの設定

必要なスコープ:

- `openid`
- `email`
- `profile`

## 8. テスト

設定完了後、以下を確認:

1. フロントエンドサーバーを起動: `npm run dev`
2. サーバーを起動: `cd server && npm run dev`
3. ブラウザで `http://localhost:5173` にアクセス
4. 「Googleでログイン」ボタンをクリック
5. Google認証画面が表示されることを確認

## トラブルシューティング

### よくある問題

1. **「リダイレクトURIが一致しません」エラー**
   - 承認済みリダイレクトURIに正確なURLを追加
   - プロトコル（http/https）とポート番号を確認

2. **「OAuth同意画面が設定されていません」エラー**
   - OAuth同意画面の設定を完了
   - 必要なスコープを追加

3. **「APIが有効化されていません」エラー**
   - Google+ APIが有効化されていることを確認

### デバッグ方法

1. ブラウザの開発者ツールでコンソールエラーを確認
2. サーバーログでエラーメッセージを確認
3. Google Cloud Consoleの「認証情報」で設定を再確認
