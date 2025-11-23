import type { Daypart, StudyBlock } from '@/types/study-block';
import { useState } from 'react';
import { toast } from 'sonner';
import { withLoadingState } from '@/lib/utils/api/loading-util';
import { ErrorHandlers } from '@/lib/utils/errors/error';

export function useStudyBlock() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addStudyBlock = async ({ daypart, startAt, endAt, courseIds }: {
        daypart: Daypart;
        startAt: Date;
        endAt: Date;
        courseIds: string[];
    }) => {
        setError(null);
        return withLoadingState(async () => {
            try {
                // TODO: Implement API call when study blocks API is ready
                // await api.post('/api/study-blocks', {
                //   daypart,
                //   startAt: startAt.toISOString(),
                //   endAt: endAt.toISOString(),
                //   courseIds,
                // });

                // For now, just show a success message
                console.log('Adding study block:', { daypart, startAt, endAt, courseIds });
                toast.success('Study block added successfully (API not implemented yet)');
                return true;
            } catch (err) {
                ErrorHandlers.api(err, 'Failed to add study block');
                setError('Failed to add study block');
                return false;
            }
        }, setIsLoading);
    };

    return { addStudyBlock, isLoading, error };
}

// TODO: Implement these functions when API is ready
export const fetchStudyBlocks = async (_weekStart: Date, _weekEnd: Date): Promise<StudyBlock[]> => {
    // const response = await fetch(`/api/study-blocks/weekly?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch study blocks');
    // }
    // return response.json() as Promise<StudyBlock[]>;

    // Return empty array for now
    return [];
};
