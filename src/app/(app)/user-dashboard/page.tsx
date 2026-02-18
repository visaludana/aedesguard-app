'use client';

import { useState, useEffect } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { SurveillanceSample } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MapPin, Locate, Loader2 } from 'lucide-react';
import ClientMap from '@/components/client-map';
import { Skeleton } from '@/components/ui/skeleton';

function getDistance(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
    const R = 6371e3;
    const phi1 = from.lat * Math.PI / 180;
    const phi2 = to.lat * Math.PI / 180;
    const deltaPhi = (to.lat - from.lat) * Math.PI / 180;
    const deltaLambda = (to.lng - from.lng) * Math.PI / 180;
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getRiskBadgeVariant(riskLevel: number): 'destructive' | 'secondary' | 'default' {
  if (riskLevel > 8) return 'destructive';
  if (riskLevel > 5) return 'secondary';
  return 'default';
}

function StatusBadge({ isNeutralized }: { isNeutralized: boolean }) {
  if (isNeutralized) return <Badge variant="default" className="bg-green-500 text-white">Neutralized</Badge>;
  return <Badge variant="destructive">Active</Badge>;
}

export default function UserDashboardPage() {
    const { firestore } = useFirebase();
    const [nearbyReports, setNearbyReports] = useState<SurveillanceSample[]>([]);
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);

    const reportsQuery = useMemoFirebase(
      () => (firestore ? query(collection(firestore, 'surveillanceSamples'), orderBy('timestamp', 'desc')) : null),
      [firestore]
    );
    const { data: allReports, isLoading: isLoadingReports } = useCollection<SurveillanceSample>(reportsQuery);

    const findNearbyReports = () => {
        if (!navigator.geolocation) {
            setIsLoadingLocation(false);
            return;
        }
        setIsLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(position => {
            const currentLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
            setUserLocation(currentLocation);
            if (allReports) {
                 const nearby = allReports.filter(report => getDistance(currentLocation, { lat: report.latitude, lng: report.longitude }) <= 1000);
                setNearbyReports(nearby);
            }
            setIsLoadingLocation(false);
        }, () => setIsLoadingLocation(false));
    };
    
    useEffect(() => {
        if (allReports) findNearbyReports();
    }, [allReports]);

    return (
    <div className="space-y-6">
        <ClientMap reports={nearbyReports.length > 0 ? nearbyReports : (allReports || [])} center={userLocation ?? undefined} zoom={userLocation ? 15 : 8} />
        <Card>
            <CardHeader className='flex-row items-center justify-between'>
                <div><CardTitle>Surveillance Sites</CardTitle><CardDescription>Reports from the local area and beyond.</CardDescription></div>
                <Button onClick={findNearbyReports} disabled={isLoadingLocation} variant="outline" size="sm">
                    {isLoadingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Locate className="mr-2 h-4 w-4" />} Refresh Location
                </Button>
            </CardHeader>
            <CardContent>
                 {isLoadingReports ? (
                    <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
                 ) : allReports && allReports.length > 0 ? (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader><TableRow><TableHead>Location</TableHead><TableHead>Risk</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                            {(nearbyReports.length > 0 ? nearbyReports : allReports).map((report) => (
                                <TableRow key={report.id}>
                                <TableCell className="font-medium">{report.locationName}</TableCell>
                                <TableCell><Badge variant={getRiskBadgeVariant(report.riskLevel)}>{report.riskLevel}/10</Badge></TableCell>
                                <TableCell><StatusBadge isNeutralized={report.isNeutralized} /></TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`} target="_blank"><MapPin className="mr-2 h-4 w-4" />Directions</Link>
                                    </Button>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </div>
                 ) : <div className="text-center py-10 border-2 border-dashed rounded-lg"><p className="text-muted-foreground">No sites found.</p></div>}
            </CardContent>
        </Card>
    </div>
  );
}
