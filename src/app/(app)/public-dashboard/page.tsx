'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldAlert, Target } from 'lucide-react';
import ClientMap from '@/components/client-map';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDistrictRisks } from '@/lib/db';
import type { SurveillanceSample, DistrictRisk } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const DistrictRiskMap = dynamic(() => import('@/components/district-risk-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-[460px] w-full" />,
});

export default function PublicDashboardPage() {
  const { firestore } = useFirebase();
  const [cachedDistrictRisks, setCachedDistrictRisks] = React.useState<DistrictRisk[]>([]);

  // Fetch all reports without permissions gating
  const reportsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'surveillanceSamples'), orderBy('timestamp', 'desc')) : null),
    [firestore]
  );
  const { data: reports, isLoading: isLoadingReports } = useCollection<SurveillanceSample>(reportsQuery);

  React.useEffect(() => {
    getDistrictRisks().then(setCachedDistrictRisks);
  }, []);

  if (isLoadingReports || !reports) {
    return <div className="grid gap-6"><Skeleton className="h-28" /><Skeleton className="h-[500px]" /></div>;
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Reports</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{reports.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Sites Neutralized</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{reports.filter(r => r.isNeutralized).length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">High-Risk Zones</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{reports.filter(r => !r.isNeutralized && r.riskLevel > 8).length}</div></CardContent></Card>
      </div>

      <Tabs defaultValue="surveillance">
        <TabsList><TabsTrigger value="surveillance">Surveillance Map</TabsTrigger><TabsTrigger value="risk">District Risk Map</TabsTrigger></TabsList>
        <TabsContent value="surveillance" className="mt-4"><ClientMap reports={reports} /></TabsContent>
        <TabsContent value="risk" className="mt-4"><DistrictRiskMap initialDistrictsWithRisk={cachedDistrictRisks} openWeatherApiKey={process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY} /></TabsContent>
      </Tabs>
    </div>
  );
}
