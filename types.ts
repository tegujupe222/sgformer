
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface FormOption {
  id: string;
  label: string;
  limit: number;
}

export interface EventForm {
  id: string;
  title: string;
  description: string;
  options: FormOption[];
  createdAt: string;
}

export interface Submission {
  id: string;
  formId: string;
  userId: string;
  userName: string;
  userEmail: string;
  selectedOptionId: string;
  submittedAt: string;
  attended: boolean;
  [key: string]: any; // for other dynamic fields
}
