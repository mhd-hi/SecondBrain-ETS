export function buildPlanETSUrl(courseCode: string, term: string): string {
    return `https://planets.etsmtl.ca/public/Contenu.aspx?session=${term}&sigle=${courseCode}&groupe=00`;
}
