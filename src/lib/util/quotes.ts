import quotesData from '@/data/quotes.json';

export type Quote = { content: string; author: string };

function getQuotes(): Quote[] {
  return quotesData;
}

const CYCLE_KEY = 'sb_quotes_cycle:all';
const memoryCycles = new Map<string, number[]>();
const isBrowser = typeof window !== 'undefined';

function shuffledIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    if (i === j) {
      continue;
    }

    const high = Math.max(i, j);
    const low = Math.min(i, j);
    const highVal = indices.at(high);
    const lowVal = indices.at(low);

    if (highVal === undefined || lowVal === undefined) {
      continue;
    }

    indices.splice(high, 1, lowVal);
    indices.splice(low, 1, highVal);
  }
  return indices;
}

function readCycleFromLocalStorage(): number[] {
  if (!isBrowser) {
    return memoryCycles.get(CYCLE_KEY) ?? [];
  }
  try {
    const raw = window.localStorage.getItem(CYCLE_KEY);
    return raw ? JSON.parse(raw) as number[] : [];
  } catch {
    return [];
  }
}

function writeCycleInLocalStorage(cycle: number[]): void {
  if (!isBrowser) {
    memoryCycles.set(CYCLE_KEY, cycle);
    return;
  }
  try {
    window.localStorage.setItem(CYCLE_KEY, JSON.stringify(cycle));
  } catch {
    // ignore quota errors
  }
}

export function nextQuote(): Quote {
  const list = getQuotes();
  if (list.length === 0) {
    throw new Error('No quotes available');
  }

  let cycle = readCycleFromLocalStorage().filter(i => i >= 0 && i < list.length);
  if (cycle.length === 0) {
    cycle = shuffledIndices(list.length);
  }

  const nextIndex = cycle.shift();
  if (nextIndex === undefined) {
    throw new Error('Quote index unavailable');
  }

  writeCycleInLocalStorage(cycle);

  const quote = list[nextIndex];
  if (!quote) {
    throw new Error('Quote unavailable');
  }

  return quote;
}
