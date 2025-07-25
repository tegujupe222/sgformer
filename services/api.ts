import { User, EventForm, Submission } from '../types';
import { mockAuthApi } from './mockApi';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 開発環境では実際のAPIを使用（モックAPIはフォールバック用）
const USE_MOCK_API = false;

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'API request failed',
    }));
    throw new ApiError(errorData.message || 'API request failed');
  }
  return response.json();
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('sgformer-token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// 認証関連のAPI
export const authApi = {
  // Google認証でログイン
  googleLogin: async (
    idToken: string
  ): Promise<{ user: User; token: string }> => {
    if (USE_MOCK_API) {
      return mockAuthApi.googleLogin(idToken);
    }

    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    const data = await handleResponse(response);
    localStorage.setItem('sgformer-token', data.token);
    return data;
  },

  // ユーザー情報取得
  getMe: async (): Promise<{ user: User }> => {
    if (USE_MOCK_API) {
      return mockAuthApi.getMe();
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // 管理者権限チェック
  checkAdmin: async (): Promise<{ isAdmin: boolean }> => {
    if (USE_MOCK_API) {
      const { user } = await mockAuthApi.getMe();
      return { isAdmin: user.role === 'admin' };
    }

    const response = await fetch(`${API_BASE_URL}/auth/admin-check`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // ログアウト
  logout: async (): Promise<void> => {
    if (USE_MOCK_API) {
      return mockAuthApi.logout();
    }

    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    localStorage.removeItem('sgformer-token');
  },

  // デモログイン
  demoLogin: async (
    type: 'user' | 'admin'
  ): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    const data = await handleResponse(response);
    localStorage.setItem('sgformer-token', data.token);
    return data;
  },
};

// フォーム関連のAPI
export const formsApi = {
  // フォーム一覧取得
  getForms: async (): Promise<EventForm[]> => {
    const response = await fetch(`${API_BASE_URL}/forms`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // フォーム詳細取得
  getForm: async (id: string): Promise<EventForm> => {
    const response = await fetch(`${API_BASE_URL}/forms/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // フォーム作成
  createForm: async (
    form: Omit<EventForm, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EventForm> => {
    const response = await fetch(`${API_BASE_URL}/forms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(form),
    });
    return handleResponse(response);
  },

  // フォーム更新
  updateForm: async (
    id: string,
    form: Partial<EventForm>
  ): Promise<EventForm> => {
    const response = await fetch(`${API_BASE_URL}/forms/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(form),
    });
    return handleResponse(response);
  },

  // フォーム削除
  deleteForm: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/forms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// 提出物関連のAPI
export const submissionsApi = {
  // 提出物一覧取得
  getSubmissions: async (formId?: string): Promise<Submission[]> => {
    const url = formId
      ? `${API_BASE_URL}/submissions?formId=${formId}`
      : `${API_BASE_URL}/submissions`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // 提出物詳細取得
  getSubmission: async (id: string): Promise<Submission> => {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // 提出物作成
  createSubmission: async (
    submission: Omit<Submission, 'id' | 'submittedAt'>
  ): Promise<Submission> => {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(submission),
    });
    return handleResponse(response);
  },

  // 提出物更新
  updateSubmission: async (
    id: string,
    submission: Partial<Submission>
  ): Promise<Submission> => {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(submission),
    });
    return handleResponse(response);
  },

  // 提出物削除
  deleteSubmission: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // 出席確認
  markAttendance: async (
    id: string,
    attended: boolean
  ): Promise<Submission> => {
    const response = await fetch(
      `${API_BASE_URL}/submissions/${id}/attendance`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ attended }),
      }
    );
    return handleResponse(response);
  },
};

// ユーザー関連のAPI（管理者のみ）
export const usersApi = {
  // ユーザー一覧取得
  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // ユーザー詳細取得
  getUser: async (id: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // ユーザー更新
  updateUser: async (id: string, user: Partial<User>): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });
    return handleResponse(response);
  },

  // ユーザー削除
  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export { ApiError };
