import type { SoundStorageKey } from '@/lib/sound-manager';
import { soundManager, STORAGE_TO_DISPLAY } from '@/lib/sound-manager';

export async function playSelectedNotificationSound(sound: SoundStorageKey, volume: number): Promise<void> {
  // Resume audio context on user interaction (required by browser policies)
  await soundManager.resumeAudio();

  soundManager.setVolume(volume);

  if (!Object.prototype.hasOwnProperty.call(STORAGE_TO_DISPLAY, sound)) {
    throw new Error(`Invalid sound storage key: ${String(sound)}`);
  }
  const displayKey = STORAGE_TO_DISPLAY[sound as SoundStorageKey];
  soundManager.play(displayKey);
}
