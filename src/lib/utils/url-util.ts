import type { CustomLink } from '@/types/custom-link';
import { LINK_TYPES } from '@/types/custom-link';

const DEFAULT_IMAGES: Record<CustomLink, string> = {
    [LINK_TYPES.PLANETS]: '/assets/logo_planets.png',
    [LINK_TYPES.MOODLE]: '/assets/moodle.png',
    [LINK_TYPES.NOTEBOOK_LM]: '/assets/notebooklm.png',
    [LINK_TYPES.SPOTIFY]: '/assets/spotify.png',
    [LINK_TYPES.YOUTUBE]: '/assets/youtube.svg',
    [LINK_TYPES.CUSTOM]: '/assets/pochita.webp',
};

export function isCustomLink(value: unknown): value is CustomLink {
    return typeof value === 'string' && (Object.values(LINK_TYPES) as string[]).includes(value as string);
}

export function getDefaultImageFor(value: unknown): string {
    if (isCustomLink(value)) {
        return DEFAULT_IMAGES[value];
    }
    return DEFAULT_IMAGES[LINK_TYPES.CUSTOM];
}

export function buildPlanETSUrl(courseCode: string, term: string): string {
    return `https://planets.etsmtl.ca/public/Contenu.aspx?session=${term}&sigle=${courseCode}&groupe=00`;
}

const URL_REGEX = /^(?:https?:\/\/)?[\w.-]+\.\w{2,}(?:\/\S*)?$/;

export const validateUrl = (url: string): boolean => {
    return URL_REGEX.test(url);
};
