'use client';

import { useCallback, useState } from 'react';

type Term = { id: string; label: string };

export const useTerms = () => {
    const [terms, setTerms] = useState<Term[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTerms = useCallback(async (): Promise<Term[]> => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/terms/exists');
            if (!res.ok) {
                throw new Error(`Failed to fetch terms: ${res.status}`);
            }
            const payload = await res.json() as { terms?: Term[] };
            const got = payload.terms ?? [];
            setTerms(got);
            return got;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { terms, loading, error, fetchTerms } as const;
};
