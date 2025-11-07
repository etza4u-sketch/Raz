export interface Question {
  id: number;
  text: string;
}

export interface AnswerOption {
  value: number;
  text: string;
}

export interface Category {
  id: number;
  title: string;
  questions: Question[];
}

export interface Answers {
  [questionId: number]: number;
}

export interface PatientDetails {
  name: string;
  phone: string;
  email: string;
}

export type AppState = 'welcome' | 'patientDetails' | 'questionnaire' | 'summary' | 'resources';
