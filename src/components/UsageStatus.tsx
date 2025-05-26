import React from 'react';
import { PieChart, Battery, MessageCircle } from 'lucide-react';
import { UsageMetrics } from '../lib/usage';
import { PricingTier, PRICING_TIERS } from '../lib/pricing';

interface UsageStatusProps {
  usage: UsageMetrics;
  tier: keyof typeof PRICING_TIERS;
}

export function UsageStatus({ usage, tier }: UsageStatusProps) {
  const limits = PRICING_TIERS[tier].limits;

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return -1; // Unlimited
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  const audioPercentage = getUsagePercentage(usage.audioMinutesUsed, limits.audioMinutes);
  const analysisPercentage = getUsagePercentage(usage.analysisCount, limits.analysisPerMonth);
  const chatPercentage = getUsagePercentage(usage.chatQuestionsToday, limits.chatQuestionsPerDay);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Usage Status</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <PieChart className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Audio Minutes</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {usage.audioMinutesUsed} / {limits.audioMinutes === -1 ? '∞' : limits.audioMinutes}
              </p>
              {audioPercentage !== -1 && (
                <span className={`text-sm font-medium ${
                  audioPercentage > 90 ? 'text-red-600' : 
                  audioPercentage > 70 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {audioPercentage}%
                </span>
              )}
            </div>
            {audioPercentage !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className={`h-1.5 rounded-full ${
                    audioPercentage > 90 ? 'bg-red-600' : 
                    audioPercentage > 70 ? 'bg-yellow-600' : 
                    'bg-green-600'
                  }`}
                  style={{ width: `${audioPercentage}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
          <Battery className="w-5 h-5 text-purple-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Monthly Analyses</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {usage.analysisCount} / {limits.analysisPerMonth === -1 ? '∞' : limits.analysisPerMonth}
              </p>
              {analysisPercentage !== -1 && (
                <span className={`text-sm font-medium ${
                  analysisPercentage > 90 ? 'text-red-600' : 
                  analysisPercentage > 70 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {analysisPercentage}%
                </span>
              )}
            </div>
            {analysisPercentage !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className={`h-1.5 rounded-full ${
                    analysisPercentage > 90 ? 'bg-red-600' : 
                    analysisPercentage > 70 ? 'bg-yellow-600' : 
                    'bg-green-600'
                  }`}
                  style={{ width: `${analysisPercentage}%` }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <MessageCircle className="w-5 h-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">Daily Chat Questions</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {usage.chatQuestionsToday} / {limits.chatQuestionsPerDay === -1 ? '∞' : limits.chatQuestionsPerDay}
              </p>
              {chatPercentage !== -1 && (
                <span className={`text-sm font-medium ${
                  chatPercentage > 90 ? 'text-red-600' : 
                  chatPercentage > 70 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {chatPercentage}%
                </span>
              )}
            </div>
            {chatPercentage !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className={`h-1.5 rounded-full ${
                    chatPercentage > 90 ? 'bg-red-600' : 
                    chatPercentage > 70 ? 'bg-yellow-600' : 
                    'bg-green-600'
                  }`}
                  style={{ width: `${chatPercentage}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}