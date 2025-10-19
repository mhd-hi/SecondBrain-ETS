'use client';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/routes';

const errorMessages: Record<string, string> = {
  configuration: 'There is a problem with the server configuration.',
  accessdenied: 'You do not have permission to sign in.',
  verification: 'The verification token has expired or has already been used.',
  default: 'An error occurred during authentication.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessage = error ? errorMessages[error] ?? errorMessages.default : errorMessages.default;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-red-600">Authentication Error</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === 'OAuthAccountNotLinked' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                This email is already associated with another account. Please sign in with the original provider you used.
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href={ROUTES.SIGNIN}>Try Again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={ROUTES.HOME}>Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={(
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-red-600">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )}
    >
      <AuthErrorContent />
    </Suspense>
  );
}
