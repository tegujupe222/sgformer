import { createContext, useState, useEffect, ReactNode } from 'react';
import type { User, EventForm, Submission } from '../types';
import { authApi, formsApi, submissionsApi, ApiError } from '../services/api';

interface AppContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  forms: EventForm[];
  submissions: Submission[];
  addForm: (
    form: Omit<EventForm, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateForm: (form: EventForm) => Promise<void>;
  deleteForm: (formId: string) => Promise<void>;
  addSubmission: (
    submission: Omit<Submission, 'id' | 'submittedAt'>
  ) => Promise<void>;
  updateSubmission: (submission: Submission) => Promise<void>;
  markAttendance: (submissionId: string, attended: boolean) => Promise<void>;
  getFormById: (id: string) => EventForm | undefined;
  getSubmissionsByFormId: (formId: string) => Submission[];
  getSubmissionById: (id: string) => Submission | undefined;
  refreshData: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

type AppProviderProps = { children: ReactNode };

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [forms, setForms] = useState<EventForm[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初期化時にトークンをチェックしてユーザー情報を取得
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem('sgformer-token');
        if (token) {
          const { user: userData } = await authApi.getMe();
          setUser(userData);
          await loadData();
        }
      } catch {
        // Initialization error handled
        localStorage.removeItem('sgformer-token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const loadData = async () => {
    try {
      const [formsData, submissionsData] = await Promise.all([
        formsApi.getForms(),
        submissionsApi.getSubmissions(),
      ]);
      setForms(formsData);
      setSubmissions(submissionsData);
    } catch {
      setError('データの読み込みに失敗しました');
    }
  };

  const login = async (idToken: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { user: userData } = await authApi.googleLogin(idToken);
      setUser(userData);
      await loadData();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('ログインに失敗しました');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Logout error handled silently
    } finally {
      setUser(null);
      setForms([]);
      setSubmissions([]);
      window.location.hash = '/login';
    }
  };

  const addForm = async (
    form: Omit<EventForm, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      setError(null);
      const newForm = await formsApi.createForm(form);
      setForms(prev => [...prev, newForm]);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('フォームの作成に失敗しました');
      }
      throw error;
    }
  };

  const updateForm = async (updatedForm: EventForm) => {
    try {
      setError(null);
      const { id, ...formData } = updatedForm;
      const updated = await formsApi.updateForm(id, formData);
      setForms(prev => prev.map(f => (f.id === id ? updated : f)));
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('フォームの更新に失敗しました');
      }
      throw error;
    }
  };

  const deleteForm = async (formId: string) => {
    try {
      setError(null);
      await formsApi.deleteForm(formId);
      setForms(prev => prev.filter(f => f.id !== formId));
      setSubmissions(prev => prev.filter(s => s.formId !== formId));
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('フォームの削除に失敗しました');
      }
      throw error;
    }
  };

  const addSubmission = async (
    submission: Omit<Submission, 'id' | 'submittedAt'>
  ) => {
    try {
      setError(null);
      const newSubmission = await submissionsApi.createSubmission(submission);
      setSubmissions(prev => [...prev, newSubmission]);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('提出物の作成に失敗しました');
      }
      throw error;
    }
  };

  const updateSubmission = async (updatedSubmission: Submission) => {
    try {
      setError(null);
      const { id, ...submissionData } = updatedSubmission;
      const updated = await submissionsApi.updateSubmission(id, submissionData);
      setSubmissions(prev => prev.map(s => (s.id === id ? updated : s)));
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('提出物の更新に失敗しました');
      }
      throw error;
    }
  };

  const markAttendance = async (submissionId: string, attended: boolean) => {
    try {
      setError(null);
      const updated = await submissionsApi.markAttendance(
        submissionId,
        attended
      );
      setSubmissions(prev =>
        prev.map(s => (s.id === submissionId ? updated : s))
      );
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('出席確認の更新に失敗しました');
      }
      throw error;
    }
  };

  const getFormById = (id: string) => forms.find(f => f.id === id);
  const getSubmissionsByFormId = (formId: string) =>
    submissions.filter(s => s.formId === formId);
  const getSubmissionById = (id: string) => submissions.find(s => s.id === id);

  const refreshData = async () => {
    await loadData();
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    forms,
    submissions,
    addForm,
    updateForm,
    deleteForm,
    addSubmission,
    updateSubmission,
    markAttendance,
    getFormById,
    getSubmissionsByFormId,
    getSubmissionById,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// useAppフックは別ファイルに分離
