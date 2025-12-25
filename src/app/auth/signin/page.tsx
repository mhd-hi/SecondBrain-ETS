'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { CapybaraLoader } from '@/components/shared/CapybaraLoader';
import { SignInCard } from '@/components/shared/SignInCard';
import { Card, CardContent } from '@/components/ui/card';

function SignInContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CapybaraLoader />
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <CapybaraLoader />
            </div>
            <p>Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <SignInCard
        title="Welcome to SecondBrain ETS"
        className="shadow-lg border-0"
        callbackUrl={callbackUrl}
      />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={(
        <div className="min-h-screen flex items-center justify-center">
          <CapybaraLoader />
        </div>
      )}
    >
      <SignInContent />
    </Suspense>
  );
}
