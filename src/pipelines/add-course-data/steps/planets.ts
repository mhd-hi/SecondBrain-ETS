import * as cheerio from 'cheerio';

export type PlanETSContent = {
  html: string;
  logs: string[];
};

export async function fetchPlanETSContent(courseCode: string, term: string): Promise<PlanETSContent> {
  const logs: string[] = [];
  const log = (message: string) => {
    // eslint-disable-next-line no-console
    console.log(message);
    logs.push(message);
  };

  // 1) Build PlanETS URL
  const planUrl = `https://planets.etsmtl.ca/public/Contenu.aspx?session=${term}&sigle=${courseCode}&groupe=00`;
  log(`Fetching course plan from: ${planUrl}`);

  // 2) Fetch the PlanETS page
  let pageHtml: string;
  try {
    const htmlResponse = await fetch(planUrl);
    if (!htmlResponse.ok) {
      throw new Error(`PlanETS fetch failed: ${htmlResponse.status} ${htmlResponse.statusText}`);
    }
    pageHtml = await htmlResponse.text();
    log(`Successfully fetched page. Length: ${pageHtml.length} characters`);
  } catch (networkErr) {
    const error = `Network error fetching PlanETS: ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`;
    log(error);
    throw new Error(error);
  }

  // 3) Extract only the relevant content using Cheerio
  log('Starting Cheerio content extraction...');
  const $ = cheerio.load(pageHtml);
  const contentDiv = $('#divContenusTrai');

  if (!contentDiv.length) {
    const availableDivs = $('div').map((_, el) => $(el).attr('id')).get();
    const error = `Content div not found. Available divs: ${JSON.stringify(availableDivs)}`;
    log(error);
    throw new Error('Content div not found in PlanETS page');
  }

  log(`Found content div. Length: ${contentDiv.length}`);
  const relevantHtml = contentDiv.html();
  if (!relevantHtml) {
    const error = `Content div is empty. Content div attributes: ${JSON.stringify(contentDiv.attr())}`;
    log(error);
    throw new Error('No HTML content found in divContenusTrai');
  }

  log(`Extracted HTML content length: ${relevantHtml.length} characters`);
  log(`First 200 characters of extracted content: ${relevantHtml.substring(0, 200)}`);

  return {
    html: relevantHtml,
    logs,
  };
}
