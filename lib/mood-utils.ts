import { MoodCoordinate, MoodEntry } from '@/types';

// Convert mood coordinates to descriptive text
export function getMoodDescription(coord: MoodCoordinate): string {
  const happiness = 100 - coord.y; // Invert Y (top is happy)
  const motivation = coord.x;

  let happinessText = '';
  let motivationText = '';

  if (happiness >= 75) happinessText = 'Very happy';
  else if (happiness >= 50) happinessText = 'Moderately happy';
  else if (happiness >= 25) happinessText = 'Somewhat unhappy';
  else happinessText = 'Unhappy';

  if (motivation >= 75) motivationText = 'highly motivated';
  else if (motivation >= 50) motivationText = 'motivated';
  else if (motivation >= 25) motivationText = 'somewhat unmotivated';
  else motivationText = 'unmotivated';

  return `${happinessText}, ${motivationText}`;
}

// Determine which quadrant/zone a mood falls into
export function getMoodZone(coord: MoodCoordinate): string {
  const happiness = 100 - coord.y;
  const motivation = coord.x;

  if (happiness >= 50 && motivation >= 50) return 'Happy & Motivated';
  if (happiness >= 50 && motivation < 50) return 'Happy & Unmotivated';
  if (happiness < 50 && motivation >= 50) return 'Unhappy & Motivated';
  return 'Unhappy & Unmotivated';
}

// Calculate average mood from entries
export function calculateAverageMood(entries: MoodEntry[]): MoodCoordinate | null {
  if (entries.length === 0) return null;

  const sum = entries.reduce(
    (acc, entry) => ({
      x: acc.x + entry.mood_x,
      y: acc.y + entry.mood_y,
    }),
    { x: 0, y: 0 }
  );

  return {
    x: Math.round(sum.x / entries.length),
    y: Math.round(sum.y / entries.length),
  };
}

// Get CSS gradient background for mood coordinates
export function getMoodGradient(): string {
  return `
    linear-gradient(135deg,
      #FF6B6B 0%,   /* Top-left: Happy & Unmotivated (red-ish) */
      #4ECDC4 25%,  /* Transition */
      #45B7D1 50%,  /* Middle */
      #96CEB4 75%,  /* Transition */
      #FFEAA7 100%  /* Bottom-right: Unhappy & Motivated (yellow) */
    )
  `;
}

// Get gradient for the full spectrum
export function getFullMoodGradient(): string {
  return `
    radial-gradient(circle at 100% 0%, #FFD93D 0%, #6BCF7F 25%, #4D96FF 50%, #9B59B6 75%, #E74C3C 100%)
  `;
}
