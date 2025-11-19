'use client';

import { getSentimentLabel } from '@/lib/sentiment-analysis';

interface SentimentFeedbackProps {
  score: number;
  label?: string;
  compact?: boolean;
}

export default function SentimentFeedback({ score, label, compact = false }: SentimentFeedbackProps) {
  const sentimentLabel = label || getSentimentLabel(score);

  const getColorClasses = () => {
    if (score >= 2) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 0.5) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score > -0.5) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (score > -2) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getEmoji = () => {
    if (score >= 2) return '😊';
    if (score >= 0.5) return '🙂';
    if (score > -0.5) return '😐';
    if (score > -2) return '😕';
    return '😔';
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${getColorClasses()}`}>
        <span>{getEmoji()}</span>
        <span>{sentimentLabel}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${getColorClasses()}`}>
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{getEmoji()}</div>
        <div className="flex-1">
          <p className="font-medium">{sentimentLabel}</p>
          <p className="text-xs opacity-75 mt-0.5">Sentiment score: {score.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
