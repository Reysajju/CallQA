import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export interface AnalysisResult {
  transcription: string;
  qualityScore: number;
  insights: string;
}

interface AnalysisProps {
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
}

export function Analysis({ result, loading, error }: AnalysisProps) {
  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center space-x-2 text-red-600 mb-4">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-semibold">Error</h3>
        </div>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-brand-light rounded-lg border border-brand-primary/20">
        <div className="flex items-center space-x-2 text-brand-primary">
          <Clock className="w-5 h-5 animate-spin" />
          <p className="font-medium">Analyzing your audio file...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg border border-brand-light shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-brand-accent">
          <CheckCircle2 className="w-5 h-5" />
          <h3 className="font-semibold">Analysis Complete</h3>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Quality Score</h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-2 bg-brand-light rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-accent rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(result.qualityScore / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-brand-dark">
                {result.qualityScore}/5
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Transcription</h4>
            <div className="p-4 bg-brand-light rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{result.transcription}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Key Insights</h4>
            <div className="p-4 bg-brand-light rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{result.insights}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}