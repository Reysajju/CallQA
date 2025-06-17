import { TranscriptionItem } from '../types';

const STORAGE_KEY = 'callqa_transcriptions';
const SETTINGS_KEY = 'callqa_settings';

export interface AppSettings {
  presetQuestions: string[];
  theme: 'light' | 'dark';
}

export const defaultSettings: AppSettings = {
  presetQuestions: [
    'What are the main topics discussed?',
    'What are the key action items?',
    'Were there any deadlines mentioned?',
    'What decisions were made?',
    'Who are the key stakeholders mentioned?'
  ],
  theme: 'light'
};

export function saveTranscriptions(transcriptions: TranscriptionItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transcriptions));
  } catch (error) {
    console.error('Failed to save transcriptions:', error);
    // Fallback to sessionStorage if localStorage is full
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(transcriptions));
    } catch (sessionError) {
      console.error('Failed to save to sessionStorage:', sessionError);
    }
  }
}

export function loadTranscriptions(): TranscriptionItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load transcriptions:', error);
  }
  return [];
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
}

export function deleteTranscription(id: string): void {
  const transcriptions = loadTranscriptions();
  const filtered = transcriptions.filter(t => t.id !== id);
  saveTranscriptions(filtered);
}

export function updateTranscription(updatedItem: TranscriptionItem): void {
  const transcriptions = loadTranscriptions();
  const index = transcriptions.findIndex(t => t.id === updatedItem.id);
  if (index !== -1) {
    transcriptions[index] = updatedItem;
    saveTranscriptions(transcriptions);
  }
}

export function addTranscription(item: TranscriptionItem): void {
  const transcriptions = loadTranscriptions();
  transcriptions.unshift(item);
  
  // Keep only the latest 100 transcriptions to prevent storage overflow
  if (transcriptions.length > 100) {
    transcriptions.splice(100);
  }
  
  saveTranscriptions(transcriptions);
}

export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}

export function exportData(): string {
  const transcriptions = loadTranscriptions();
  const settings = loadSettings();
  return JSON.stringify({
    transcriptions,
    settings,
    exportDate: new Date().toISOString(),
    version: '1.0'
  }, null, 2);
}

export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    if (data.transcriptions && Array.isArray(data.transcriptions)) {
      saveTranscriptions(data.transcriptions);
    }
    if (data.settings) {
      saveSettings({ ...defaultSettings, ...data.settings });
    }
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}