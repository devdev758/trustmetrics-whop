/**
 * Authentication Error Page
 *
 * Displays authentication errors to users
 */

import Link from 'next/link';

interface AuthErrorPageProps {
  searchParams: {
    error?: string;
  };
}

export default function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const errorMessage = searchParams.error || 'An unknown error occurred';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Authentication Error
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            There was a problem signing you in
          </p>
        </div>

        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/api/auth/whop"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
