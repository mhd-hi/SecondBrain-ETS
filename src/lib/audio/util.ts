/**
 * Audio utility functions for creating pleasant notification sounds
 */

interface BeepOptions {
  frequency: number;
  startTime: number;
  duration?: number;
  volume?: number;
}

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
  { frequency, startTime, duration = 0.3, volume = 0.2 }: BeepOptions
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
export function playCompletionSound(): void {
  try {
    const audioContext = createAudioContext();
    if (!audioContext) return;

    // Friendly ascending melody with lower, warmer frequencies
    createBeep(audioContext, { frequency: 330, startTime: 0, duration: 0.4 });      // E4 - warm and friendly
    createBeep(audioContext, { frequency: 392, startTime: 0.25, duration: 0.4 });   // G4 - pleasant interval
    createBeep(audioContext, { frequency: 523, startTime: 0.5, duration: 0.6 });    // C5 - satisfying resolution
  } catch (error) {
    console.warn('Could not play completion sound:', error);
  }
}

/**
 * Plays a gentle notification sound for less important events
 * Single soft tone for subtle notifications
 */
export function playNotificationSound(): void {
  try {
    const audioContext = createAudioContext();
    if (!audioContext) return;

    createBeep(audioContext, { 
      frequency: 440, // A4 - standard reference tone
      startTime: 0, 
      duration: 0.3, 
      volume: 0.15 // Quieter for notifications
    });
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
}

/**
 * Plays an alert sound for important notifications
 * Two quick beeps to grab attention
 */
export function playAlertSound(): void {
  try {
    const audioContext = createAudioContext();
    if (!audioContext) return;

    createBeep(audioContext, { frequency: 587, startTime: 0, duration: 0.2 });       // D5
    createBeep(audioContext, { frequency: 659, startTime: 0.3, duration: 0.2 });     // E5
  } catch (error) {
    console.warn('Could not play alert sound:', error);
  }
}
