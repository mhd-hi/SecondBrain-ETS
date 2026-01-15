'use client';

import { useEffect } from 'react';

export function VersionLogger() {
  useEffect(() => {
    const version = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev';
    const buildId = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || 'local';

    console.log(
      `%c🧠 SecondBrain ETS %cv${version} %c(${buildId})`,
      'color: #3b82f6; font-weight: bold; font-size: 14px',
      'color: #10b981; font-weight: bold',
      'color: #6b7280',
    );
  }, []);

  return null;
}
