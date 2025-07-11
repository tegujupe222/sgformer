// APIのベースURL（開発時と本番時で切り替え）
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3000/api' 
  : 'https://your-vercel-app.vercel.app/api';

// 型定義
export interface FormSubmission {
  id: string;
  name: string;
  email: string;
  eventName: string;
  submissionDate: string;
  formData: any;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// フォーム送信API
export const submitForm = async (formData: any): Promise<ApiResponse<{ submissionId: string }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Form submission error:', error);
    return {
      success: false,
      message: 'フォーム送信に失敗しました'
    };
  }
};

// 送信内容取得API（管理者用）
export const getSubmissions = async (filters?: {
  status?: string;
  eventName?: string;
}): Promise<ApiResponse<{ submissions: FormSubmission[]; total: number }>> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.eventName) params.append('eventName', filters.eventName);

    const response = await fetch(`${API_BASE_URL}/submissions?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Get submissions error:', error);
    return {
      success: false,
      message: '送信内容の取得に失敗しました'
    };
  }
};

// 送信内容更新API（管理者用）
export const updateSubmission = async (
  id: string, 
  updates: { status?: string; adminNotes?: string }
): Promise<ApiResponse<FormSubmission>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Update submission error:', error);
    return {
      success: false,
      message: '送信内容の更新に失敗しました'
    };
  }
};

 