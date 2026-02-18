'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Legacy path redirector.
 * Automatically routes users to the updated /admin-dashboard.
 */
export default function AdminConsoleRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin-dashboard');
  }, [router]);

  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Redirecting to Admin Dashboard...</p>
    </div>
  );
}
