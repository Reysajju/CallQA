import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface LoadingSpinnerProps {
  progress?: number;
  stage?: string;
  timeRemaining?: number;
}

export function LoadingSpinner({ progress, stage, timeRemaining }: LoadingSpinnerProps) {
  const stages = [
    'Preparing audio file',
    'Transcribing audio',
    'Analyzing content'
  ];

  const currentStageIndex = stages.indexOf(stage || '');

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        {progress !== undefined && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-semibold text-blue-600">
            {Math.round(progress)}%
          </div>
        )}
      </div>
      
      {stage && (
        <div className="w-full max-w-md">
          <div className="text-center mb-4">
            <p className="text-lg font-semibold text-gray-900">{stage}</p>
            {timeRemaining !== undefined && (
              <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                <Clock className="w-4 h-4" />
                Estimated time remaining: {Math.ceil(timeRemaining)}s
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            {stages.map((s, index) => {
              const isComplete = currentStageIndex > index;
              const isCurrent = currentStageIndex === index;
              
              return (
                <div
                  key={s}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isCurrent ? 'bg-blue-50' : isComplete ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : isCurrent ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                  <span
                    className={`text-sm ${
                      isCurrent
                        ? 'text-blue-700 font-medium'
                        : isComplete
                        ? 'text-green-700'
                        : 'text-gray-500'
                    }`}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {progress !== undefined && (
        <div className="w-full max-w-md">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}