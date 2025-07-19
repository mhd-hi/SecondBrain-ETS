// Predefined duration options - includes classic and alternative Pomodoro variants
export const POMODORO_DURATION_OPTIONS = [
  { label: '00:03', value: 0.05 },
  { label: '15:00', value: 15 }, // Short focused session
  { label: '20:00', value: 20 }, // Alternative short session
  { label: '25:00', value: 25 }, // Classic Pomodoro
  { label: '30:00', value: 30 }, // Extended focus
  { label: '45:00', value: 45 }, // Deep work session
  { label: '52:00', value: 52 }, // 52/17 variant (popular alternative)
  { label: '1:00:00', value: 60 }, // Full hour session
  { label: '1:30:00', value: 90 }, // Ultradian rhythm session
];

export const formatTime = (minutes: number) => {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
