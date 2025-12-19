import { normalizeSoundKey } from '@/lib/sound-keys';
import { SOUND_KEYS, soundManager } from '@/lib/sound-manager';

export async function playSelectedNotificationSound(sound: string, volume: number): Promise<void> {
  // Resume audio context on user interaction (required by browser policies)
  await soundManager.resumeAudio();

  soundManager.setVolume(volume);
  const normalizedSound = normalizeSoundKey(sound, SOUND_KEYS);
  soundManager.play(normalizedSound);
}
