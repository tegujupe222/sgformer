export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// 質問タイプの定義
export type QuestionType =
  | 'text' // テキスト入力
  | 'textarea' // テキストエリア
  | 'email' // メールアドレス
  | 'phone' // 電話番号
  | 'number' // 数値
  | 'select' // ドロップダウン選択
  | 'radio' // ラジオボタン
  | 'checkbox' // チェックボックス
  | 'date' // 日付
  | 'time' // 時間
  | 'datetime' // 日時
  | 'file' // ファイルアップロード
  | 'rating' // 評価（星など）
  | 'scale' // スケール（1-10など）
  | 'yesno'; // はい/いいえ

// 選択肢の型定義
export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  limit?: number; // 選択肢ごとの定員（select, radio, checkbox用）
}

// 質問項目の型定義
export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  required: boolean;
  isPersonalInfo: boolean; // 個人情報フラグ
  options?: QuestionOption[]; // select, radio, checkbox用
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string; // 正規表現
    customMessage?: string;
  };
  settings?: {
    placeholder?: string;
    defaultValue?: string | number | boolean;
    multiple?: boolean; // 複数選択可能か（checkbox用）
    rows?: number; // textarea用
    scale?: number; // rating, scale用
  };
}

// フォームの型定義（拡張版）
export interface EventForm {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  options?: FormOption[]; // 旧バージョンとの互換性
  settings: {
    allowAnonymous: boolean;
    requireLogin: boolean;
    maxSubmissions?: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string; // 作成者のユーザーID
}

// 回答の型定義
export interface Answer {
  questionId: string;
  value: string | string[] | number | boolean | Date;
}

// 提出物の型定義（拡張版）
export interface Submission {
  id: string;
  formId: string;
  userId?: string; // 匿名の場合はundefined
  userName: string;
  userEmail: string;
  answers: Answer[];
  selectedOptionId?: string; // 旧バージョンとの互換性
  submittedAt: string;
  attended: boolean;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  };
}

// 旧バージョンとの互換性のため残す
export interface FormOption {
  id: string;
  label: string;
  limit: number;
}
