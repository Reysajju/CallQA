import React from 'react';

interface LoadingSpinnerProps {
  progress?: number;
  stage?: string;
  timeRemaining?: number;
}

export function LoadingSpinner({ progress, stage, timeRemaining }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
        {progress !== undefined && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-semibold">
            {Math.round(progress)}%
          </div>
        )}
      </div>
      
      {stage && (
        <div className="text-center">
          <p className="text-gray-700 font-medium">{stage}</p>
          {timeRemaining !== undefined && (
            <p className="text-sm text-gray-500">
              Estimated time remaining: {Math.ceil(timeRemaining)}s
            </p>
          )}
        </div>
      )}
      
      {progress !== undefined && (
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}