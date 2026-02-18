'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, ClipboardPlus } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ClientMap from '@/components/client-map';
import type { SurveillanceSample } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserRole } from '@/hooks/use-user-role';

export default function OfficerDashboardPage() {
  const { firestore } = useFirebase();
  const role = useUserRole();
  
  // Fetch everything without filters
  const reportsQuery = useMemoFirebase(
    () => (firestore ? query(
        collection(firestore, 'surveillanceSamples'), 
        orderBy('timestamp', 'desc')
    ) : null),
    [firestore]
  );
  const { data: reports, isLoading } = useCollection<SurveillanceSample>(reportsQuery);

  if (role === 'loading') {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Health Officer Tools</CardTitle>
          <CardDescription>
            Report daily health statistics, view analytics, and monitor surveillance data.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/health-report"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'h-20 text-base py-2 flex items-center justify-start text-left w-full'
            )}
          >
            <ClipboardPlus className="mr-4 h-8 w-8" />
            <div>
              <p className="font-semibold text-lg">Report Cases & Deaths</p>
              <p className="font-normal text-sm text-primary-foreground/80">
                Submit daily statistics for your district.
              </p>
            </div>
          </Link>
          <Link
            href="/admin-dashboard"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-20 text-base py-2 flex items-center justify-start text-left w-full'
            )}
          >
            <BarChart className="mr-4 h-8 w-8" />
            <div>
              <p className="font-semibold text-lg">View Health Analytics</p>
              <p className="font-normal text-sm text-muted-foreground">
                Analyze trends across all districts.
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>
      
      {isLoading && <Skeleton className="h-[500px]" />}
      {reports && <ClientMap reports={reports} />}
      
    </div>
  );
}
