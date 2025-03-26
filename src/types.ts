export interface TranscriptionItem {
  id: string;
  fileName: string;
  transcription: string;
  analysis: string[];
  date: string;
  department?: string;
  topic?: string;
  sharedWith?: string[];
}

export interface UserSettings {
  name: string;
  sopQuestions: string[];
  department?: string;
  notifications: boolean;
}

export interface QAEntry {
  id: string;
  question: string;
  answer: string;
  date: string;
  topic?: string;
  department?: string;
  sharedWith?: string[];
}