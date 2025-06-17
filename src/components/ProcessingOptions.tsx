import React from 'react';
import { CheckSquare, Square, FileText, Clock, MessageSquare, BarChart3, Lightbulb } from 'lucide-react';
import { ProcessingOptions as ProcessingOptionsType } from '../types';

interface ProcessingOptionsProps {
  options: ProcessingOptionsType;
  onChange: (options: ProcessingOptionsType) => void;
  disabled?: boolean;
}

export function ProcessingOptions({ options, onChange, disabled = false }: ProcessingOptionsProps) {
  const toggleOption = (key: keyof ProcessingOptionsType) => {
    onChange({
      ...options,
      [key]: !options[key]
    });
  };

  const optionsList = [
    {
      key: 'summary' as keyof ProcessingOptionsType,
      label: 'Summary',
      description: 'Generate a comprehensive summary of the call',
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'timestampedTranscription' as keyof ProcessingOptionsType,
      label: 'Timestamped Transcription',
      description: 'Create a timestamped breakdown of the conversation',
      icon: Clock,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'transcription' as keyof ProcessingOptionsType,
      label: 'Full Transcription',
      description: 'Complete text transcription of the audio',
      icon: MessageSquare,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'analysis' as keyof ProcessingOptionsType,
      label: 'Analysis',
      description: 'Detailed analysis based on preset questions',
      icon: BarChart3,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      key: 'chat' as keyof ProcessingOptionsType,
      label: 'Chat Capability',
      description: 'Enable interactive chat about the transcription',
      icon: Lightbulb,
      color: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  const selectedCount = Object.values(options).filter(Boolean).length;

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 dark:border-gray-700/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Processing Options
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {selectedCount} selected
        </span>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Select the features you want to process. Only selected features will be analyzed to save time and resources.
      </p>

      <div className="space-y-4">
        {optionsList.map((option) => {
          const Icon = option.icon;
          const isSelected = options[option.key];
          
          return (
            <div
              key={option.key}
              className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-gray-50/50 dark:bg-gray-700/20'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && toggleOption(option.key)}
            >
              <div className="flex-shrink-0 mt-1">
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${option.color}`} />
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {option.label}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {option.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCount === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please select at least one processing option to continue.
          </p>
        </div>
      )}
    </div>
  );
}