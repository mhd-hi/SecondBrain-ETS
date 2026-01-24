import { Howl, Howler } from 'howler';

enum Sound {
  Sax = 'Sax',
  WestminsterChimes = 'Westminster Chimes',
  CashOut = 'Cash Out',
  CarLock = 'Car Lock',
  Fahh = 'Fahh',
  Laugh = 'Laugh',
  ChickenNuggets = 'Chicken Nuggets',
}

export type SoundStorageKey = 'sax' | 'westminster_chimes' | 'cash_out' | 'car_lock' | 'fahh' | 'laugh' | 'chicken_nuggets';
export const SOUND_DEFAULT_STORAGE: SoundStorageKey = 'westminster_chimes';
const SOUND_DIR = '/sounds/';

type SoundFilename = `${SoundStorageKey}.mp3`;
type SoundFilePath = `${typeof SOUND_DIR}${SoundFilename}`;

const SOUND_FILE_NAMES: Record<Sound, SoundFilename> = {
  [Sound.Sax]: 'sax.mp3',
  [Sound.WestminsterChimes]: 'westminster_chimes.mp3',
  [Sound.CashOut]: 'cash_out.mp3',
  [Sound.CarLock]: 'car_lock.mp3',
  [Sound.Fahh]: 'fahh.mp3',
  [Sound.Laugh]: 'laugh.mp3',
  [Sound.ChickenNuggets]: 'chicken_nuggets.mp3',
};

const SOUND_FILE_MAP = Object.fromEntries(
  Object.entries(SOUND_FILE_NAMES).map(([key, file]) => [key, SOUND_DIR + file]),
) as Record<Sound, SoundFilePath>;

export const STORAGE_TO_DISPLAY: Record<SoundStorageKey, Sound> = {
  sax: Sound.Sax,
  westminster_chimes: Sound.WestminsterChimes,
  cash_out: Sound.CashOut,
  car_lock: Sound.CarLock,
  fahh: Sound.Fahh,
  laugh: Sound.Laugh,
  chicken_nuggets: Sound.ChickenNuggets,
};

export const SOUND_OPTIONS: { value: SoundStorageKey; label: Sound }[] = Object.entries(STORAGE_TO_DISPLAY).map(
  ([k, v]) => ({ value: k as SoundStorageKey, label: v }),
);

let audioReady = false;
let isInitializing = false;
let currentHowl: Howl | null = null;
const preloaded: Record<string, Howl> = {};
let globalVolume = 1;
const readyListeners: Set<(ready: boolean) => void> = new Set();

function isClient() {
  return typeof window !== 'undefined';
}

// Prevent Howler from auto-suspending the AudioContext in client environments
if (isClient()) {
  // Howler types may not include these properties
  const howlerExt = Howler as unknown as { autoSuspend?: boolean; autoUnlock?: boolean };
  howlerExt.autoSuspend = false;
  howlerExt.autoUnlock = true;
}

/**
 * Notify all listeners when ready state changes
 */
function notifyReadyStateChange() {
  readyListeners.forEach(listener => listener(audioReady));
}

/**
 * Resume AudioContext, should be called after a user gesture
 * Required by browser autoplay policies
 */
async function resumeAudioContext(): Promise<void> {
  if (!isClient()) {
    return;
  }

  try {
    // Access Howler's internal AudioContext
    const ctx = (Howler as { ctx?: AudioContext }).ctx;
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
  } catch (error) {
    console.log('Failed to resume AudioContext:', error);
  }
}

export const soundManager = {
  /**
   * Initialize sound manager - idempotent, safe to call multiple times
   * Returns a promise that resolves when initialization is complete
   */
  async init(): Promise<void> {
    if (!isClient()) {
      return;
    }

    // Already initialized or initializing
    if (audioReady || isInitializing) {
      return;
    }

    isInitializing = true;

    try {
      Object.entries(SOUND_FILE_MAP).forEach(([displayKey, src]) => {
        if (!preloaded[displayKey]) {
          preloaded[displayKey] = new Howl({
            src: [src],
            volume: globalVolume,
          });
        }
      });

      audioReady = true;
      notifyReadyStateChange();
    } finally {
      isInitializing = false;
    }
  },

  /**
   * Resume audio context - call this on user interaction before playing sounds
   * Returns true if successful, false otherwise
   */
  async resumeAudio(): Promise<boolean> {
    if (!isClient()) {
      return false;
    }

    try {
      await resumeAudioContext();
      return true;
    } catch (error) {
      console.log('Failed to resume audio:', error);
      return false;
    }
  },

  setVolume(v: number) {
    globalVolume = Math.max(0, Math.min(1, v));
    Howler.volume(globalVolume);
    Object.values(preloaded).forEach((howl) => {
      howl.volume(globalVolume);
    });
  },

  play(key: Sound) {
    if (!isClient() || !audioReady) {
      return;
    }

    const displayKey = key;

    soundManager.stop();

    const howl = preloaded[displayKey];
    if (howl) {
      currentHowl = howl;
      howl.volume(globalVolume);
      howl.play();
    }
  },

  stop() {
    if (currentHowl) {
      currentHowl.stop();
      currentHowl = null;
    }
  },

  isReady(): boolean {
    return audioReady;
  },

  isInitializing(): boolean {
    return isInitializing;
  },

  /**
   * Subscribe to ready state changes
   * Returns unsubscribe function
   */
  onReadyStateChange(listener: (ready: boolean) => void): () => void {
    readyListeners.add(listener);
    return () => {
      readyListeners.delete(listener);
    };
  },
};
