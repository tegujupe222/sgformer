import type { User, EventForm, Submission } from '../types';

export interface AppContextType {
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
