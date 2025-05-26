export interface PricingTier {
  name: string;
  limits: {
    audioMinutes: number;
    analysisPerMonth: number;
    chatQuestionsPerDay: number;
    maxFileSize: number;
  };
  features: string[];
}

export const PRICING_TIERS: { [key: string]: PricingTier } = {
  free: {
    name: 'Free',
    limits: {
      audioMinutes: -1, // unlimited
      analysisPerMonth: -1, // unlimited
      chatQuestionsPerDay: -1, // unlimited
      maxFileSize: 500, // 500MB
    },
    features: [
      'Unlimited audio transcription',
      'Advanced analysis with custom questions',
      'Unlimited chat capabilities',
      'Advanced export options',
      'Priority processing',
      'API access'
    ],
  }
};