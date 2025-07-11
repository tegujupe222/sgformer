# SGformer API Server

SGformerのバックエンドAPIサーバーです。Express.js、MongoDB、Google認証を使用して構築されています。

## 機能

- **Google認証**: Google OAuth2を使用したユーザー認証
- **フォーム管理**: 多様な質問タイプに対応したフォーム作成・管理
- **提出物管理**: フォーム回答の収集・管理・エクスポート
- **ユーザー管理**: 管理者によるユーザー権限・アカウント管理
- **統計情報**: フォーム・提出物の統計情報提供

## 技術スタック

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: Google OAuth2
- **Language**: TypeScript
- **Security**: Helmet, CORS, Rate Limiting

## セットアップ

### 前提条件

- Node.js 18以上
- MongoDB
- Google Cloud Console プロジェクト（OAuth2設定用）

### インストール

1. 依存関係のインストール
```bash
cd server
npm install
```

2. 環境変数の設定
```bash
cp env.example .env
```

`.env`ファイルを編集して必要な値を設定：
- `MONGODB_URI`: MongoDB接続文字列（例: `mongodb://localhost:27017/sgformer`）
- `GOOGLE_CLIENT_ID`: Google OAuth2クライアントID
- `FRONTEND_URL`: フロントエンドのURL（例: `http://localhost:5173`）

3. 開発サーバーの起動
```bash
npm run dev
```

### Google OAuth2設定

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. OAuth2同意画面を設定
3. OAuth2クライアントIDを作成
4. 承認済みのリダイレクトURIに以下を追加：
   - `http://localhost:3001/api/auth/google`
   - `http://localhost:5173`（フロントエンド）

### MongoDB設定

ローカル開発の場合：
```bash
# MongoDBのインストール（macOS）
brew install mongodb-community

# MongoDBの起動
brew services start mongodb-community
```

本番環境の場合：
- MongoDB Atlasなどのクラウドサービスを使用
- 接続文字列を環境変数`MONGODB_URI`に設定

## API仕様

### 認証

#### POST /api/auth/google
Google認証でログイン

**Request Body:**
```json
{
  "idToken": "google-id-token"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "profile-picture-url",
    "role": "user",
    "isActive": true
  }
}
```

### フォーム管理

#### GET /api/forms
フォーム一覧取得（管理者用）

**Query Parameters:**
- `page`: ページ番号（デフォルト: 1）
- `limit`: 1ページあたりの件数（デフォルト: 10）
- `search`: 検索キーワード
- `status`: ステータス（active/inactive）

#### POST /api/forms
フォーム作成

**Request Body:**
```json
{
  "title": "フォームタイトル",
  "description": "フォーム説明",
  "questions": [
    {
      "id": "q-1",
      "type": "text",
      "label": "質問ラベル",
      "description": "質問説明",
      "required": true,
      "isPersonalInfo": false,
      "validation": {
        "minLength": 1,
        "maxLength": 100
      }
    }
  ],
  "settings": {
    "allowAnonymous": false,
    "requireLogin": true,
    "maxSubmissions": 100,
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z",
    "isActive": true
  }
}
```

### 提出物管理

#### POST /api/submissions
提出物作成

**Request Body:**
```json
{
  "formId": "form-id",
  "userName": "回答者名",
  "userEmail": "answer@example.com",
  "answers": [
    {
      "questionId": "q-1",
      "value": "回答内容"
    }
  ],
  "attended": false
}
```

#### GET /api/submissions/:formId/export
提出物エクスポート（CSV）

**Query Parameters:**
- `format`: エクスポート形式（csv/json）

### ユーザー管理

#### GET /api/users
ユーザー一覧取得（管理者用）

#### PUT /api/users/:id/role
ユーザー権限更新

**Request Body:**
```json
{
  "role": "admin"
}
```

## データベース設計

### User Collection
```javascript
{
  _id: ObjectId,
  googleId: String,
  email: String,
  name: String,
  picture: String,
  role: String, // 'admin' | 'user'
  isActive: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Form Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  questions: [{
    id: String,
    type: String,
    label: String,
    description: String,
    required: Boolean,
    isPersonalInfo: Boolean,
    options: [{
      id: String,
      label: String,
      value: String,
      limit: Number
    }],
    validation: {
      minLength: Number,
      maxLength: Number,
      min: Number,
      max: Number,
      pattern: String,
      customMessage: String
    },
    settings: {
      placeholder: String,
      defaultValue: Mixed,
      multiple: Boolean,
      rows: Number,
      scale: Number
    }
  }],
  settings: {
    allowAnonymous: Boolean,
    requireLogin: Boolean,
    maxSubmissions: Number,
    startDate: Date,
    endDate: Date,
    isActive: Boolean
  },
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Submission Collection
```javascript
{
  _id: ObjectId,
  formId: ObjectId,
  userId: ObjectId,
  userName: String,
  userEmail: String,
  answers: [{
    questionId: String,
    value: Mixed
  }],
  submittedAt: Date,
  attended: Boolean,
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## デプロイ

### 本番環境

1. ビルド
```bash
npm run build
```

2. 起動
```bash
npm start
```

### 環境変数（本番）

本番環境では以下の環境変数を設定してください：

- `NODE_ENV=production`
- `MONGODB_URI`: 本番MongoDB接続文字列
- `GOOGLE_CLIENT_ID`: 本番Google OAuth2クライアントID
- `FRONTEND_URL`: 本番フロントエンドURL

## セキュリティ

- **Helmet**: セキュリティヘッダーの設定
- **CORS**: クロスオリジンリクエストの制御
- **Rate Limiting**: APIレート制限
- **Input Validation**: 入力値の検証
- **Authentication**: Google OAuth2認証
- **Authorization**: ロールベースアクセス制御

## 開発

### スクリプト

- `npm run dev`: 開発サーバー起動（ホットリロード）
- `npm run build`: TypeScriptコンパイル
- `npm start`: 本番サーバー起動
- `npm run lint`: ESLint実行
- `npm run lint:fix`: ESLint自動修正

### ディレクトリ構造

```
server/
├── index.ts              # エントリーポイント
├── models/               # データベースモデル
│   ├── User.ts
│   ├── Form.ts
│   └── Submission.ts
├── routes/               # APIルート
│   ├── auth.ts
│   ├── forms.ts
│   ├── submissions.ts
│   └── users.ts
├── types/                # 型定義
│   └── express.d.ts
├── middleware/           # カスタムミドルウェア
├── utils/               # ユーティリティ関数
├── package.json
├── tsconfig.json
├── env.example
└── README.md
```

## トラブルシューティング

### よくある問題

1. **MongoDB接続エラー**
   - MongoDBが起動しているか確認
   - 接続文字列が正しいか確認

2. **Google認証エラー**
   - Google Cloud Consoleの設定を確認
   - クライアントIDが正しいか確認
   - リダイレクトURIが設定されているか確認

3. **CORSエラー**
   - フロントエンドURLが正しく設定されているか確認
   - 環境変数`FRONTEND_URL`を確認

4. **TypeScriptエラー**
   - `npm install`で依存関係が正しくインストールされているか確認
   - `tsconfig.json`の設定を確認

## ライセンス

MIT License 