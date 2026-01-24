import type { SoundStorageKey } from '@/lib/sound-manager';
import { soundManager, STORAGE_TO_DISPLAY } from '@/lib/sound-manager';

export async function playSelectedNotificationSound(sound: SoundStorageKey, volume: number): Promise<void> {
  // Resume audio context on user interaction (required by browser policies)
  await soundManager.resumeAudio();

  soundManager.setVolume(volume);
  const displayKey = STORAGE_TO_DISPLAY[sound as SoundStorageKey];
  if (!displayKey) {
    throw new Error(`Unknown sound storage key: ${String(sound)}`);
  }
  soundManager.play(displayKey);
}
