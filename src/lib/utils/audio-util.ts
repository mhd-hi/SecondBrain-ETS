import { normalizeSoundKey } from '@/lib/sound-keys';
import { SOUND_KEYS, soundManager } from '@/lib/sound-manager';

export function playSelectedNotificationSound(sound: string, volume: number): void {
  soundManager.setVolume(volume);
  const normalizedSound = normalizeSoundKey(sound, SOUND_KEYS);
  soundManager.play(normalizedSound);
}
