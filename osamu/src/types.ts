
export type View = 'home' | 'assignments' | 'viva-voce';

export interface User {
  name: string;
  role: string;
  avatar: string;
  institution: string;
}

export interface GradingHistory {
  id: string;
  studentName: string;
  score: number;
  maxScore: number;
  date: string;
  feedback: string;
  status: 'draft' | 'published';
}

export interface VivaRecord {
  id: string;
  studentName: string;
  date: string;
  score: number;
  voiceUrl: string;
  transcription: string;
  criteriaScores: { [key: string]: number };
}

export interface Assignment {
  id: string;
  title: string;
  type: 'assignment' | 'test' | 'report' | 'ppt' | 'essay';
  dueDate: string;
  submissionCount: number;
}
