import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, Clock, Loader2, Sparkles } from 'lucide-react';

interface StageDetail {
  key: string;
  label: string;
  description: string;
}

const STAGE_DETAILS: StageDetail[] = [
  {
    key: 'Preparing audio file',
    label: 'Warming up your audio',
    description: 'Boosting clarity and organizing the file before any heavy lifting.'
  },
  {
    key: 'Transcribing audio',
    label: 'Catching every word',
    description: 'Turning spoken conversation into trustworthy, searchable text.'
  },
  {
    key: 'Processing selected features',
    label: 'Building your insights',
    description: 'Summaries, timestamps, analysis, and chat data are crafted here.'
  }
];

const STAGE_ORDER = STAGE_DETAILS.map(stage => stage.key);

const STAGE_MESSAGES: Record<string, string> = {
  'Preparing audio file': 'Tuning levels and tidying up the waveform so nothing gets missed.',
  'Transcribing audio': 'Typing along with the conversation in real time.',
  'Processing selected features': 'Layering on summaries, timelines, and smart analysis for you.'
};

const DEFAULT_STAGE_MESSAGE = 'Turning your call into a clean, human-friendly story.';

const FALLBACK_STAGE: StageDetail = {
  key: 'fallback',
  label: 'Working on your request',
  description: 'Gathering everything we need for a polished handoff.'
};

const MIN_STAGE_BOOST = 8;

type StageStatus = 'complete' | 'current' | 'upcoming';

interface LoadingSpinnerProps {
  progress?: number;
  stage?: string;
  timeRemaining?: number;
}

export function LoadingSpinner({ progress, stage, timeRemaining }: LoadingSpinnerProps) {
  const [timeLeft, setTimeLeft] = useState(timeRemaining ?? 0);

  useEffect(() => {
    if (typeof timeRemaining === 'number') {
      setTimeLeft(Math.max(0, timeRemaining));
    }
  }, [timeRemaining]);

  useEffect(() => {
    if (!stage) return;

    const countdown = setInterval(() => {
      setTimeLeft(prev => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [stage]);

  const currentStageIndex = stage ? STAGE_ORDER.indexOf(stage) : -1;
  const safeStageIndex = currentStageIndex >= 0 ? currentStageIndex : 0;
  const stageDetail = currentStageIndex >= 0 ? STAGE_DETAILS[safeStageIndex] : FALLBACK_STAGE;
  const stageCount = STAGE_DETAILS.length;
  const perStageShare = 100 / stageCount;
  const normalizedProgress = typeof progress === 'number' ? Math.min(Math.max(progress, 0), 100) : 0;
  const baseProgress = currentStageIndex >= 0 ? safeStageIndex * perStageShare : 0;

  let computedProgress = currentStageIndex >= 0
    ? baseProgress + (normalizedProgress / 100) * perStageShare
    : normalizedProgress;

  if (currentStageIndex >= 0 && normalizedProgress === 0) {
    computedProgress = Math.min(
      100,
      Math.max(
        computedProgress,
        baseProgress + Math.min(perStageShare * 0.35, MIN_STAGE_BOOST)
      )
    );
  }

  const progressBarWidth = Math.max(0, Math.min(Number(computedProgress.toFixed(2)), 100));
  const friendlyMessage = (stage && STAGE_MESSAGES[stage]) || DEFAULT_STAGE_MESSAGE;
  const etaLabel = timeLeft > 0 ? `~${Math.ceil(timeLeft)}s left` : 'Almost there...';
  const stepNumber = currentStageIndex >= 0 ? currentStageIndex + 1 : 1;

  const resolveStatus = (index: number): StageStatus => {
    if (currentStageIndex === -1) {
      return index === 0 ? 'current' : 'upcoming';
    }
    if (index < currentStageIndex) return 'complete';
    if (index === currentStageIndex) return 'current';
    return 'upcoming';
  };

  const iconWrapperClasses: Record<StageStatus, string> = {
    complete: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-200',
    current: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200',
    upcoming: 'bg-gray-100 text-gray-400 dark:bg-gray-700/40 dark:text-gray-300'
  };

  const statusClasses: Record<StageStatus, string> = {
    complete: 'bg-green-50/80 border-green-200 dark:bg-green-900/20 dark:border-green-700/40',
    current: 'bg-blue-50/80 border-blue-200 dark:bg-blue-900/30 dark:border-blue-600/60',
    upcoming: 'bg-white/70 border-white/40 dark:bg-gray-800/60 dark:border-gray-700/60'
  };

  return (
    <div className="w-full flex flex-col gap-5 items-stretch">
      <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white p-6 shadow-xl space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Sparkles className="w-6 h-6 text-white/80" />
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/70">Call magic in progress</p>
          <h3 className="text-2xl font-semibold">{stageDetail.label}</h3>
          <p className="text-sm text-white/80 max-w-md">{friendlyMessage}</p>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold">
              Step {Math.min(stageCount, stepNumber)} of {stageCount}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {etaLabel}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-white via-blue-100 to-blue-200 shadow-lg transition-[width] duration-700 ease-out"
              style={{ width: `${progressBarWidth}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/80">
            <span>{stageDetail.description}</span>
            <span>{Math.round(progressBarWidth)}% ready</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {STAGE_DETAILS.map((detail, index) => {
          const status = resolveStatus(index);
          const iconClass = iconWrapperClasses[status];
          const cardClass = statusClasses[status];
          const headingClass =
            status === 'current'
              ? 'text-blue-900 dark:text-blue-100'
              : status === 'complete'
                ? 'text-green-800 dark:text-green-100'
                : 'text-gray-800 dark:text-gray-100';
          const descriptionClass =
            status === 'upcoming'
              ? 'text-gray-600 dark:text-gray-300'
              : 'text-gray-700 dark:text-gray-200';

          return (
            <div
              key={detail.key}
              className={`flex gap-3 rounded-2xl border p-3 backdrop-blur-sm transition-colors ${cardClass}`}
            >
              <div className={`p-2 rounded-full ${iconClass}`}>
                {status === 'complete' && <CheckCircle className="w-4 h-4" />}
                {status === 'current' && <Loader2 className="w-4 h-4 animate-spin" />}
                {status === 'upcoming' && <Circle className="w-4 h-4" />}
              </div>
              <div>
                <p className={`text-sm font-semibold ${headingClass}`}>{detail.label}</p>
                <p className={`text-xs leading-relaxed ${descriptionClass}`}>{detail.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-600 dark:text-gray-300">
        We’ll deliver your transcription, summaries, and insights in a clean, human-friendly format.
      </p>
    </div>
  );
}
