'use client';

import { useState, useRef, useEffect } from 'react';
import { MoodCoordinate } from '@/types';

interface GradientSelectorProps {
  onSelect: (coord: MoodCoordinate) => void;
  onCancel: () => void;
  initialCoord?: MoodCoordinate;
}

export default function GradientSelector({ onSelect, onCancel, initialCoord }: GradientSelectorProps) {
  const [selectedCoord, setSelectedCoord] = useState<MoodCoordinate | null>(initialCoord || null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const gradientRef = useRef<HTMLDivElement>(null);

  const handleGradientClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gradientRef.current) return;

    const rect = gradientRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp values to 0-100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    setSelectedCoord({ x: clampedX, y: clampedY });
    setShowConfirmation(true);

    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = `${e.clientX - rect.left - 25}px`;
    ripple.style.top = `${e.clientY - rect.top - 25}px`;
    gradientRef.current.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const handleConfirm = () => {
    if (selectedCoord) {
      onSelect(selectedCoord);
    }
  };

  const handleChooseAgain = () => {
    setShowConfirmation(false);
    setSelectedCoord(null);
  };

  useEffect(() => {
    // Announce for screen readers
    if (selectedCoord) {
      const happiness = Math.round(100 - selectedCoord.y);
      const motivation = Math.round(selectedCoord.x);
      const announcement = `Selected mood: ${happiness}% happiness, ${motivation}% motivation`;

      // Create an aria-live region announcement
      const liveRegion = document.getElementById('gradient-live-region');
      if (liveRegion) {
        liveRegion.textContent = announcement;
      }
    }
  }, [selectedCoord]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {!showConfirmation ? (
          /* Gradient selector view */
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Tap where you feel right now
              </h2>
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 transition-smooth"
                aria-label="Cancel"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Gradient */}
            <div className="relative aspect-square max-h-[70vh]">
              <div
                ref={gradientRef}
                onClick={handleGradientClick}
                className="w-full h-full mood-gradient cursor-crosshair relative"
                role="button"
                tabIndex={0}
                aria-label="Mood gradient selector. Tap to select your mood based on happiness (vertical) and motivation (horizontal)"
              >
                {/* Axis labels */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium px-4 py-2 bg-black bg-opacity-40 rounded-full pointer-events-none">
                  Happy
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium px-4 py-2 bg-black bg-opacity-40 rounded-full pointer-events-none">
                  Unhappy
                </div>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-white text-sm font-medium px-4 py-2 bg-black bg-opacity-40 rounded-full pointer-events-none">
                  Unmotivated
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 -rotate-90 text-white text-sm font-medium px-4 py-2 bg-black bg-opacity-40 rounded-full pointer-events-none">
                  Motivated
                </div>

                {/* Selected position marker */}
                {selectedCoord && (
                  <div
                    className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                      left: `${selectedCoord.x}%`,
                      top: `${selectedCoord.y}%`,
                    }}
                  >
                    <div className="w-full h-full bg-white rounded-full shadow-lg animate-pulse" />
                    <div className="absolute inset-0 bg-white rounded-full opacity-50 animate-ping" />
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="p-6 bg-gray-50 text-center">
              <p className="text-sm text-gray-600">
                Tap anywhere on the gradient above to express your current mood
              </p>
            </div>
          </div>
        ) : (
          /* Confirmation view */
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Does this feel right?
            </h2>

            {/* Preview of selected mood */}
            <div className="relative w-64 h-64 mx-auto mb-8 rounded-3xl overflow-hidden mood-gradient">
              {selectedCoord && (
                <div
                  className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${selectedCoord.x}%`,
                    top: `${selectedCoord.y}%`,
                  }}
                >
                  <div className="w-full h-full bg-white rounded-full shadow-xl" />
                  <div className="absolute inset-0 bg-white rounded-full opacity-30 scale-150" />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-smooth focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Looks right
              </button>
              <button
                onClick={handleChooseAgain}
                className="w-full bg-white hover:bg-gray-50 text-blue-600 font-semibold py-4 px-6 rounded-xl border-2 border-blue-600 transition-smooth focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Choose again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Screen reader live region */}
      <div id="gradient-live-region" className="sr-only" role="status" aria-live="polite" aria-atomic="true" />
    </div>
  );
}
