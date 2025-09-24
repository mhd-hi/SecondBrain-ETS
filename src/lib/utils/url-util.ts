import type { CustomLink } from '@/types/custom-link';
import { LINK_TYPES } from '@/types/custom-link';

export const DEFAULT_IMAGES: Record<CustomLink, string> = {
    [LINK_TYPES.PLANETS]: '/assets/logo_planets.png',
    [LINK_TYPES.MOODLE]: '/assets/moodle.png',
    [LINK_TYPES.NOTEBOOK_LM]: '/assets/notebooklm.png',
    [LINK_TYPES.SPOTIFY]: '/assets/spotify.png',
    [LINK_TYPES.YOUTUBE]: '/assets/youtube.svg',
    [LINK_TYPES.CUSTOM]: '/assets/pochita.webp',
};

export function buildPlanETSUrl(courseCode: string, term: string): string {
    return `https://planets.etsmtl.ca/public/Contenu.aspx?session=${term}&sigle=${courseCode}&groupe=00`;
}

const URL_REGEX = /^(?:https?:\/\/)?[\w.-]+\.\w{2,}(?:\/\S*)?$/;

export const validateUrl = (url: string): boolean => {
    return URL_REGEX.test(url);
};
