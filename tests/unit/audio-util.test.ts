import type { SoundStorageKey } from '@/lib/sound-manager';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { soundManager, STORAGE_TO_DISPLAY } from '@/lib/sound-manager';
import { playSelectedNotificationSound } from '../../src/lib/utils/audio-util';

// Mock the sound-manager module so tests are deterministic
vi.mock('@/lib/sound-manager', () => {
  const mockSoundManager = {
    resumeAudio: vi.fn(() => Promise.resolve()),
    setVolume: vi.fn(),
    play: vi.fn(),
  };

  const STORAGE_TO_DISPLAY = {
    sax: 'display-1',
    westminster_chimes: 'display-2',
  } as const;

  return {
    soundManager: mockSoundManager,
    STORAGE_TO_DISPLAY,
  };
});

describe('audio-util', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('plays mapped display key and sets volume after resuming audio', async () => {
    await playSelectedNotificationSound('sax' as SoundStorageKey, 0.75);

    expect(soundManager.resumeAudio).toHaveBeenCalledTimes(1);
    expect(soundManager.setVolume).toHaveBeenCalledWith(0.75);
    expect(soundManager.play).toHaveBeenCalledWith(STORAGE_TO_DISPLAY.sax);
  });

  it('throws when an invalid sound key is provided', async () => {
    await expect(
      playSelectedNotificationSound('invalid-key' as unknown as SoundStorageKey, 1),
    ).rejects.toThrow(/Invalid sound storage key/);
    // resumeAudio should still be awaited before the error is thrown
    expect(soundManager.resumeAudio).toHaveBeenCalledTimes(1);
  });
});
