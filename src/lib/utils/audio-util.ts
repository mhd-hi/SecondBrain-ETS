/**
 * Plays the selected notification sound based on user settings
 */
export function playSelectedNotificationSound(sound: string, volume: number) {
  switch (sound) {
    case 'chime':
      playNotificationSound(volume);
      break;
    case 'bell':
      playAlertSound(volume);
      break;
    case 'none':
      // No sound
      break;
    default:
      playCompletionSound(volume);
      break;
  }
}
/**
 * Audio utility functions for creating pleasant notification sounds
 */

type BeepOptions = {
  frequency: number;
  startTime: number;
  duration?: number;
  volume?: number;
};

/**
 * Creates a Web Audio API context with fallback for different browsers
 */
function createAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    return new AudioContextClass();
  } catch (error) {
    console.warn('Could not create audio context:', error);
    return null;
  }
}

/**
 * Creates a single beep sound with specified parameters
 */
function createBeep(
  audioContext: AudioContext,
  { frequency, startTime, duration = 0.3, volume = 0.2 }: BeepOptions,
): void {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
  oscillator.type = 'sine'; // Sine wave is softer than square or sawtooth

  // Gentle volume curve for a softer sound
  gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + startTime + 0.05);
  gainNode.gain.linearRampToValueAtTime(volume * 0.75, audioContext.currentTime + startTime + duration * 0.7);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + startTime + duration);

  oscillator.start(audioContext.currentTime + startTime);
  oscillator.stop(audioContext.currentTime + startTime + duration);
}

/**
 * Plays a friendly completion sound with an ascending melody
 * Uses musical notes E4-G4-C5 for a warm and pleasant notification
 */
export function playCompletionSound(volume?: number): void {
  try {
    const audioContext = createAudioContext();
    if (!audioContext) {
      return;
    }
    const v = typeof volume === 'number' ? volume : 0.2;
    createBeep(audioContext, { frequency: 330, startTime: 0, duration: 0.4, volume: v });
    createBeep(audioContext, { frequency: 392, startTime: 0.25, duration: 0.4, volume: v });
    createBeep(audioContext, { frequency: 523, startTime: 0.5, duration: 0.6, volume: v });
  } catch (error) {
    console.warn('Could not play completion sound:', error);
  }
}

/**
 * Plays a gentle notification sound for less important events
 * Single soft tone for subtle notifications
 */
export function playNotificationSound(volume?: number): void {
  try {
    const audioContext = createAudioContext();
    if (!audioContext) {
      return;
    }
    const v = typeof volume === 'number' ? volume : 0.15;
    createBeep(audioContext, {
      frequency: 440,
      startTime: 0,
      duration: 0.3,
      volume: v,
    });
  } catch (error) {
    console.warn('Could not play alert sound:', error);
  }
}

/**
 * Plays an alert sound for important notifications
 * Two quick beeps to grab attention
 */
export function playAlertSound(volume?: number): void {
  try {
    const audioContext = createAudioContext();
    if (!audioContext) {
      return;
    }
    const v = typeof volume === 'number' ? volume : 0.2;
    createBeep(audioContext, { frequency: 587, startTime: 0, duration: 0.2, volume: v });
    createBeep(audioContext, { frequency: 659, startTime: 0.3, duration: 0.2, volume: v });
  } catch (error) {
    console.warn('Could not play alert sound:', error);
  }
}
