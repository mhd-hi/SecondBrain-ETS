// src/lib/sound-manager.ts
// Centralized Sound Manager for Pomodoro app using Howler.js
import { Howl, Howler } from 'howler';

// Dynamically generate sound keys and file mapping from /public/sounds
const SOUND_DIR = '/sounds/';
const SOUND_FILES = [
    'car_lock.mp3',
    'cash_out.mp3',
    'chicken_nuggets.mp3',
    'fahh.mp3',
    'laugh.mp3',
    'sax.mp3',
];

// Helper to convert filename to key: e.g. car_lock.mp3 -> Car Lock
function filenameToKey(filename: string) {
    return filename.replace('.mp3', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const SOUND_KEYS = SOUND_FILES.reduce((acc, file) => {
    const key = filenameToKey(file);
    acc[key] = key;
    return acc;
}, {} as Record<string, string>);

const SOUND_FILE_MAP = SOUND_FILES.reduce((acc, file) => {
    const key = filenameToKey(file);
    acc[key] = SOUND_DIR + file;
    return acc;
}, {} as Record<string, string>);

let audioReady = false;
let currentHowl: Howl | null = null;
const preloaded: Record<string, Howl> = {};
let globalVolume = 1;

function isClient() {
    return typeof window !== 'undefined';
}

export const soundManager = {
    init() {
        if (!isClient() || audioReady) {
            return;
        }
        // Preload all sounds
        Object.entries(SOUND_FILE_MAP).forEach(([key, src]) => {
            preloaded[key] = new Howl({ src: [src], volume: globalVolume });
        });
        audioReady = true;
        // Optionally play a silent sound to unlock audio context
        const firstKey = Object.keys(preloaded)[0];
        if (firstKey && preloaded[firstKey]) {
            preloaded[firstKey].play();
            preloaded[firstKey].stop();
        }
    },
    setVolume(v: number) {
        globalVolume = Math.max(0, Math.min(1, v));
        Howler.volume(globalVolume);
    },
    play(key: string) {
        if (!isClient() || !audioReady) {
            return;
        }
        if (key && key.toLowerCase() === 'none') {
            soundManager.stop();
            return;
        }
        soundManager.stop();
        const fallbackKey = Object.keys(preloaded)[0];
        const howl = preloaded[key] ?? (fallbackKey ? preloaded[fallbackKey] : undefined);
        if (howl) {
            try {
                currentHowl = howl;
                howl.volume(globalVolume);
                howl.play();
            } catch (e) {
                // Log once per session
                if (!(window as unknown as { __soundErrorLogged?: boolean }).__soundErrorLogged) {
                    console.warn('Sound playback failed:', e);
                    (window as unknown as { __soundErrorLogged?: boolean }).__soundErrorLogged = true;
                }
            }
        }
    },
    stop() {
        if (currentHowl) {
            currentHowl.stop();
            currentHowl = null;
        }
    },
    isReady() {
        return audioReady;
    },
};
