
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, EventForm, Submission } from '../types';
import { getMockForms, getMockSubmissions } from '../services/mockApi';

interface AppContextType {
  user: User | null;
  login: (role: 'admin' | 'user') => void;
  logout: () => void;
  forms: EventForm[];
  submissions: Submission[];
  addForm: (form: EventForm) => void;
  updateForm: (form: EventForm) => void;
  deleteForm: (formId: string) => void;
  addSubmission: (submission: Submission) => void;
  updateSubmission: (submission: Submission) => void;
  getFormById: (id: string) => EventForm | undefined;
  getSubmissionsByFormId: (formId: string) => Submission[];
  getSubmissionById: (id: string) => Submission | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

type AppProviderProps = { children: React.ReactNode };
export const AppProvider = (props: any) => {
  const { children } = props;
  const [user, setUser] = useLocalStorage<User | null>('sgformer-user', null);
  const [forms, setForms] = useLocalStorage<EventForm[]>('sgformer-forms', []);
  const [submissions, setSubmissions] = useLocalStorage<Submission[]>('sgformer-submissions', []);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
        const initialForms = getMockForms();
        const initialSubmissions = getMockSubmissions();
        if(localStorage.getItem('sgformer-forms') === null) {
            setForms(initialForms);
        }
        if(localStorage.getItem('sgformer-submissions') === null) {
            setSubmissions(initialSubmissions);
        }
        setInitialized(true);
    }
  }, [initialized, setForms, setSubmissions]);


  const login = (role: 'admin' | 'user') => {
    const mockUser: User = {
      id: role === 'admin' ? 'admin001' : 'user123',
      name: role === 'admin' ? '管理者' : '山田 太郎',
      email: role === 'admin' ? 'admin@sgformer.edu' : 'yamada.taro@example.com',
      role: role,
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
    window.location.hash = '/login';
  };

  const addForm = (form: EventForm) => setForms(prev => [...prev, form]);
  const updateForm = (updatedForm: EventForm) => setForms(prev => prev.map(f => f.id === updatedForm.id ? updatedForm : f));
  const deleteForm = (formId: string) => {
    setForms(prev => prev.filter(f => f.id !== formId));
    setSubmissions(prev => prev.filter(s => s.formId !== formId));
  };
  
  const addSubmission = (submission: Submission) => setSubmissions(prev => [...prev, submission]);
  const updateSubmission = (updatedSubmission: Submission) => setSubmissions(prev => prev.map(s => s.id === updatedSubmission.id ? updatedSubmission : s));

  const getFormById = (id: string) => forms.find(f => f.id === id);
  const getSubmissionsByFormId = (formId: string) => submissions.filter(s => s.formId === formId);
  const getSubmissionById = (id: string) => submissions.find(s => s.id === id);


  const value = {
    user,
    login,
    logout,
    forms,
    submissions,
    addForm,
    updateForm,
    deleteForm,
    addSubmission,
    updateSubmission,
    getFormById,
    getSubmissionsByFormId,
    getSubmissionById,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
