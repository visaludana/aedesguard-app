
'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, ClipboardPlus, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ClientMap from '@/components/client-map';
import type { SurveillanceSample } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserRole } from '@/hooks/use-user-role';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function OfficerDashboardPage() {
  const { firestore } = useFirebase();
  const role = useUserRole();
  const canFetchData = role === 'officer';
  
  const reportsQuery = useMemoFirebase(
    () => (firestore && canFetchData ? query(
        collection(firestore, 'surveillanceSamples'), 
        where('submissionAppealStatus', 'in', ['none', 'approved', 'pending']),
        orderBy('timestamp', 'desc')
    ) : null),
    [firestore, canFetchData]
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

  if (role !== 'officer') {
    return (
        <div className="max-w-2xl mx-auto mt-10">
            <Alert variant="destructive" >
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                    You do not have permission to view this page. This dashboard is for Health Officers only.
                </AlertDescription>
            </Alert>
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
            href="/admin-console"
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
