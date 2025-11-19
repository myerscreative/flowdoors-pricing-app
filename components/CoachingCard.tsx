'use client';

import { CoachingSuggestion } from '@/types';

interface CoachingCardProps {
  suggestion: CoachingSuggestion;
  onDismiss?: () => void;
  compact?: boolean;
}

export default function CoachingCard({ suggestion, onDismiss, compact = false }: CoachingCardProps) {
  const getIcon = () => {
    switch (suggestion.type) {
      case 'reframe':
        return '🔄';
      case 'celebrate':
        return '🎉';
      case 'explore':
        return '🔍';
      case 'practice':
        return '🧘';
      default:
        return '💡';
    }
  };

  const getColorClasses = () => {
    switch (suggestion.type) {
      case 'reframe':
        return 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200';
      case 'celebrate':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
      case 'explore':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200';
      case 'practice':
        return 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200';
      default:
        return 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200';
    }
  };

  if (compact) {
    return (
      <div className={`rounded-lg border p-4 ${getColorClasses()}`}>
        <div className="flex items-start space-x-3">
          <div className="text-2xl flex-shrink-0">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">{suggestion.title}</h3>
            <p className="text-xs text-gray-700">{suggestion.message}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 transition-smooth flex-shrink-0"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border shadow-lg p-6 ${getColorClasses()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="text-3xl">{getIcon()}</div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{suggestion.title}</h3>
            <p className="text-xs text-gray-500 mt-1 capitalize">
              Based on {suggestion.basedOn === 'combination' ? 'pattern + sentiment' : suggestion.basedOn}
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-smooth"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <p className="text-gray-700 mb-4">{suggestion.message}</p>

      {suggestion.tips.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Try this:</p>
          <ul className="space-y-2">
            {suggestion.tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
