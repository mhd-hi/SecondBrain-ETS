'use client';

import type { Quote } from '@/lib/util/quotes';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { nextQuote } from '@/lib/util/quotes';

type Props = {
  className?: string;
};

export function QuoteBubble({ className }: Props) {
  const [quote, setQuote] = useState<Quote>(() => nextQuote());

  const refresh = useCallback(() => {
    setQuote(nextQuote());
  }, []);

  return (
    <div className={className}>
      <div className="relative w-100 rounded-xl border bg-background/95 shadow-lg backdrop-blur px-4 py-3 space-y-2 text-sm">
        <span
          aria-hidden
          className="flex pointer-events-none absolute left-0 -top-1 w-1/3 items-center gap-2 -translate-y-4 px-4
          text-6xl font-semibold tracking-[0.14em] text-foreground/70 select-none"
        >
          "
        </span>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 w-full">
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Quote  of the day</p>
            <p className="leading-relaxed text-base text-foreground">
              {quote.content}
            </p>
            <p className="flex justify-end text-sm text-muted-foreground italic">
              —
              {quote.author}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={refresh}
            aria-label="Refresh quote"
            title="New quote"
          >
            ↻
          </Button>
        </div>
      </div>
    </div>
  );
}
