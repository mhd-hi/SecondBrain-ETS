import { Howl, Howler } from 'howler';
import { filenameToDisplayKey, storageKeyToDisplayKey } from '@/lib/sound-keys';

const SOUND_DIR = '/sounds/';
const SOUND_FILES = [
    'sax.mp3',
    'laugh.mp3',
    'fahh.mp3',
    'chicken_nuggets.mp3',
    'cash_out.mp3',
    'car_lock.mp3',
];

export const SOUND_KEYS = SOUND_FILES.reduce((acc, file) => {
    const displayKey = filenameToDisplayKey(file);
    acc[displayKey] = displayKey;
    return acc;
}, {} as Record<string, string>);

const SOUND_FILE_MAP = SOUND_FILES.reduce((acc, file) => {
    const displayKey = filenameToDisplayKey(file);
    acc[displayKey] = SOUND_DIR + file;
    return acc;
}, {} as Record<string, string>);

let audioReady = false;
let isInitializing = false;
let currentHowl: Howl | null = null;
const preloaded: Record<string, Howl> = {};
let globalVolume = 1;
const readyListeners: Set<(ready: boolean) => void> = new Set();

function isClient() {
    return typeof window !== 'undefined';
}

/**
 * Notify all listeners when ready state changes
 */
function notifyReadyStateChange() {
    readyListeners.forEach(listener => listener(audioReady));
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

            // Unlock audio context, required for sound playback on some browsers
            const firstKey = Object.keys(preloaded)[0];
            if (firstKey && preloaded[firstKey]) {
                preloaded[firstKey].play();
                preloaded[firstKey].stop();
            }
        } finally {
            isInitializing = false;
        }
    },

    setVolume(v: number) {
        globalVolume = Math.max(0, Math.min(1, v));
        Howler.volume(globalVolume);
        Object.values(preloaded).forEach((howl) => {
            howl.volume(globalVolume);
        });
    },

    play(key: string) {
        if (!isClient() || !audioReady) {
            return;
        }

        if (key === 'none' || key.toLowerCase() === 'none') {
            soundManager.stop();
            return;
        }

        let displayKey = key;
        if (!displayKey.includes(' ') && !displayKey.match(/[A-Z]/)) {
            displayKey = storageKeyToDisplayKey(key);
        }

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
