'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/use-user-role';
import { Loader2 } from 'lucide-react';

/**
 * Main dashboard redirector.
 * Automatically routes users to the appropriate dashboard based on their role.
 */
export default function DashboardPage() {
  const router = useRouter();
  const role = useUserRole();

  useEffect(() => {
    if (role === 'loading') return;

    if (role === 'officer') {
      router.replace('/officer-dashboard');
    } else if (role === 'user') {
      router.replace('/user-dashboard');
    } else {
      router.replace('/public-dashboard');
    }
  }, [role, router]);

  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Routing to your dashboard...</p>
    </div>
  );
}
