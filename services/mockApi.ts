import { EventForm, Submission, User } from '../types';

// モックユーザーデータ
const mockUsers: User[] = [
  {
    id: 'user123',
    email: 'igafactory2023@gmail.com',
    name: 'Factory2023',
    role: 'user',
    profilePicture: 'https://lh3.googleusercontent.com/a/default-user',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'admin001',
    email: 'admin@sgformer.com',
    name: 'SGformer Admin',
    role: 'admin',
    profilePicture: 'https://lh3.googleusercontent.com/a/default-user',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// モック認証API
export const mockAuthApi = {
  googleLogin: async (
    idToken: string
  ): Promise<{ user: User; token: string }> => {
    // デモ用のトークン処理
    if (idToken === 'demo-user-token') {
      const user = mockUsers[0]; // 一般ユーザー
      const token = 'mock-jwt-token-user';
      localStorage.setItem('sgformer-token', token);
      return { user, token };
    } else if (idToken === 'demo-admin-token') {
      const user = mockUsers[1]; // 管理者
      const token = 'mock-jwt-token-admin';
      localStorage.setItem('sgformer-token', token);
      return { user, token };
    } else {
      // Google Sign-Inの場合は一般ユーザーとして処理
      const user = mockUsers[0];
      const token = 'mock-jwt-token-google';
      localStorage.setItem('sgformer-token', token);
      return { user, token };
    }
  },

  getMe: async (): Promise<{ user: User }> => {
    const token = localStorage.getItem('sgformer-token');
    if (token === 'mock-jwt-token-admin') {
      return { user: mockUsers[1] };
    }
    return { user: mockUsers[0] };
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('sgformer-token');
  },
};

export const getMockForms = (): EventForm[] => [
  {
    id: 'form-2024-info-session',
    title: '2024年度 学校説明会',
    description:
      '本校の教育理念、カリキュラム、進路実績について詳しくご説明いたします。',
    questions: [],
    options: [
      { id: 'session-am', label: '午前の部 (10:00-12:00)', limit: 50 },
      { id: 'session-pm', label: '午後の部 (14:00-16:00)', limit: 50 },
    ],
    settings: {
      allowAnonymous: false,
      requireLogin: true,
      maxSubmissions: 100,
      isActive: true,
    },
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    createdBy: 'admin001',
  },
  {
    id: 'form-2024-trial-lesson',
    title: '2024年度 体験授業',
    description:
      '実際の授業を体験していただき、本校の学習環境を体感してください。',
    questions: [],
    options: [
      { id: 'math', label: '数学 (代数)', limit: 30 },
      { id: 'science', label: '理科 (物理)', limit: 30 },
      { id: 'english', label: '英語 (会話)', limit: 25 },
    ],
    settings: {
      allowAnonymous: false,
      requireLogin: true,
      maxSubmissions: 85,
      isActive: true,
    },
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    createdBy: 'admin001',
  },
];

export const getMockSubmissions = (): Submission[] => [
  {
    id: 'sub-001',
    formId: 'form-2024-info-session',
    userId: 'user123',
    userName: '山田 太郎',
    userEmail: 'yamada.taro@example.com',
    selectedOptionId: 'session-am',
    answers: [],
    submittedAt: '2024-01-16T14:30:00Z',
    attended: false,
  },
  {
    id: 'sub-002',
    formId: 'form-2024-trial-lesson',
    userId: 'user456',
    userName: '佐藤 花子',
    userEmail: 'sato.hanako@example.com',
    selectedOptionId: 'math',
    answers: [],
    submittedAt: '2024-01-21T11:15:00Z',
    attended: true,
  },
];
