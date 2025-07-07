// Predefined duration options - includes classic and alternative Pomodoro variants
export const POMODORO_DURATION_OPTIONS = [
  { label: '0.03 min', value: 0.05 }, // For testing
  { label: '15 min', value: 15 }, // Short focused session
  { label: '20 min', value: 20 }, // Alternative short session
  { label: '25 min', value: 25 }, // Classic Pomodoro
  { label: '30 min', value: 30 }, // Extended focus
  { label: '45 min', value: 45 }, // Deep work session
  { label: '52 min', value: 52 }, // 52/17 variant (popular alternative)
  { label: '60 min', value: 60 }, // Full hour session
  { label: '90 min', value: 90 }, // Ultradian rhythm session
];

export const formatTime = (minutes: number) => {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
