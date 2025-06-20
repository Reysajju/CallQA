export interface TranscriptionItem {
  id: string;
  fileName: string;
  transcription?: string;
  summary?: string;
  timestampedTranscription?: {
    speaker: string;
    timestamp: string;
    text: string;
  }[];
  analysis?: string[];
  date: string;
  department?: string;
  topic?: string;
  sharedWith?: string[];
  duration?: string;
  fileSize?: string;
  processingSteps?: {
    stage: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress?: number;
  }[];
  processedFeatures?: {
    summary: boolean;
    timestampedTranscription: boolean;
    transcription: boolean;
    analysis: boolean;
    chat: boolean;
  };
}

export interface QAEntry {
  id: string;
  question: string;
  answer: string;
  date: string;
  department?: string;
  topic?: string;
}

export interface ProcessingOptions {
  summary: boolean;
  timestampedTranscription: boolean;
  transcription: boolean;
  analysis: boolean;
  chat: boolean;
}