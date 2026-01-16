import * as cheerio from 'cheerio';
import { buildPlanETSUrl as buildPlanETSURL } from '@/lib/utils/url-util';
import { normalizeHtml } from './html-normalizer';

export type PlanETSContent = {
  html: string;
};

export async function fetchPlanETSContent(courseCode: string, term: string): Promise<PlanETSContent> {
  // 1) Build PlanETS URL
  const planUrl = buildPlanETSURL(courseCode, term);
  console.log(`Fetching course plan from: ${planUrl}`);

  // 2) Fetch the PlanETS page
  let pageHtml: string;
  try {
    const htmlResponse = await fetch(planUrl);
    if (!htmlResponse.ok) {
      throw new Error(`PlanETS fetch failed: ${htmlResponse.status} ${htmlResponse.statusText}`);
    }
    pageHtml = await htmlResponse.text();
    console.log(`Successfully fetched page. Length: ${pageHtml.length} characters`);
  } catch (networkErr) {
    const error = `Network error fetching PlanETS: ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`;
    console.log(error);
    throw new Error(error);
  }

  // 3) Extract only the relevant content using Cheerio
  console.log('Starting Cheerio content extraction...');
  const $ = cheerio.load(pageHtml);
  const contentDiv = $('#divContenusTrai');

  if (!contentDiv.length) {
    const availableDivs = $('div').map((_, el) => $(el).attr('id')).get();
    const error = `Content div not found. Available divs: ${JSON.stringify(availableDivs)}`;
    console.log(error);
    throw new Error('Content div not found in PlanETS page');
  }

  console.log(`Found content div. Length: ${contentDiv.length}`);
  const relevantHtml = contentDiv.html();
  if (!relevantHtml) {
    const error = `Content div is empty. Content div attributes: ${JSON.stringify(contentDiv.attr())}`;
    console.log(error);
    throw new Error('No HTML content found in divContenusTrai');
  }

  // 4) Normalize the HTML content
  console.log(`Preporcessed HTML length: ${relevantHtml.length} characters`);
  console.log('Normalizing HTML content...');
  const normalizedHtml = normalizeHtml(relevantHtml);
  console.log(`Normalized HTML length: ${normalizedHtml.length} characters`);
  return {
    html: normalizedHtml,
  };
}
