import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export interface UsageMetrics {
  audioMinutesUsed: number;
  analysisCount: number;
  chatQuestionsToday: number;
}

export async function trackAudioAnalysis(durationMinutes: number, fileSize: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('usage_metrics').insert({
      user_id: user.id,
      audio_minutes: durationMinutes,
      file_size: fileSize,
      type: 'audio_analysis'
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to track audio analysis:', error);
  }
}

export async function trackChatQuestion() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.from('usage_metrics').insert({
      user_id: user.id,
      type: 'chat_question'
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to track chat question:', error);
  }
}

export async function getCurrentUsage(): Promise<UsageMetrics> {
  return {
    audioMinutesUsed: 0,
    analysisCount: 0,
    chatQuestionsToday: 0
  };
}

export async function checkUsageLimits(fileSize: number, durationMinutes: number): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  return { allowed: true };
}