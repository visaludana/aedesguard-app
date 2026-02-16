'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { SurveillanceReport } from '@/lib/types';

const MapView = dynamic(() => import('@/components/map-view').then(mod => mod.MapView), { 
  ssr: false,
  loading: () => (
    <Card>
      <CardHeader>
        <CardTitle>Live Surveillance Map</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </Card>
  )
});

type ClientMapProps = {
  reports: SurveillanceReport[];
  center?: { lat: number; lng: number };
  zoom?: number;
};

export default function ClientMap({ reports, center, zoom }: ClientMapProps) {
  return <MapView reports={reports} center={center} zoom={zoom} />;
}
