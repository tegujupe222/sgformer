
import type { EventForm, Submission } from '../types';

export const getMockForms = (): EventForm[] => [
  {
    id: 'form-2024-info-session',
    title: '2024年度秋学期 学校説明会',
    description: 'カリキュラム、施設、入学手続きについて学ぶ説明会です。来年度の入学を検討されている生徒・保護者の方を対象としています。',
    createdAt: new Date('2024-07-01T10:00:00Z').toISOString(),
    options: [
      { id: 'session-am', label: '午前の部 (9:00 - 11:00)', limit: 50 },
      { id: 'session-pm', label: '午後の部 (13:00 - 15:00)', limit: 50 },
      { id: 'session-online', label: 'オンライン説明会 (19:00 - 20:30)', limit: 100 },
    ],
  },
  {
    id: 'form-2024-trial-lesson',
    title: 'STEM体験授業',
    description: '科学、技術、工学、数学プログラムに興味のある生徒向けの体験授業です。定員に限りがあります。',
    createdAt: new Date('2024-07-15T10:00:00Z').toISOString(),
    options: [
      { id: 'trial-robotics', label: 'ロボティクス・プログラミング', limit: 15 },
      { id: 'trial-chemistry', label: '化学実験', limit: 20 },
      { id: 'trial-coding', label: 'Python入門', limit: 15 },
    ],
  },
];

export const getMockSubmissions = (): Submission[] => [
    // Some mock submissions for the info session to show functionality
    {
        id: 'sub-001',
        formId: 'form-2024-info-session',
        userId: 'user-abc',
        userName: '田中 花子',
        userEmail: 'tanaka.hanako@example.com',
        selectedOptionId: 'session-am',
        submittedAt: new Date().toISOString(),
        attended: false,
    },
    {
        id: 'sub-002',
        formId: 'form-2024-info-session',
        userId: 'user-def',
        userName: '佐藤 太郎',
        userEmail: 'sato.taro@example.com',
        selectedOptionId: 'session-pm',
        submittedAt: new Date().toISOString(),
        attended: true,
    }
];
