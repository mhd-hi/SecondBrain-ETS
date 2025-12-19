import { SOUND_DEFAULT } from '@/lib/sound-manager';

export function filenameToDisplayKey(filename: string): string {
    return filename
        .replace('.mp3', '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

export function storageKeyToDisplayKey(storageKey: string): string {
    return storageKey
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

export function normalizeSoundKey(
    key: string,
    validKeys: Record<string, string>,
): string {
    if (key === 'none' || key.toLowerCase() === 'none') {
        return 'none';
    }

    if (key.includes(' ') || /[A-Z]/.test(key)) {
        if (key in validKeys) {
            return key;
        }
    }

    if (!key.includes(' ') && !key.match(/[A-Z]/)) {
        const displayKey = storageKeyToDisplayKey(key);
        if (displayKey in validKeys) {
            return displayKey;
        }
    }

    // Default to the default sound if no valid sound is found or key is empty
    return SOUND_DEFAULT;
}
