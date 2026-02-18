'use client';

import { useState, useEffect } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
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

/**
 * Calculates distance between two lat/lng coordinates in meters.
 */
function getDistance(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
    const R = 6371e3; // Earth's radius in metres
    const phi1 = from.lat * Math.PI / 180;
    const phi2 = to.lat * Math.PI / 180;
    const deltaPhi = (to.lat - from.lat) * Math.PI / 180;
    const deltaLambda = (to.lng - from.lng) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function getRiskBadgeVariant(riskLevel: number): 'destructive' | 'secondary' | 'default' {
  if (riskLevel > 8) return 'destructive';
  if (riskLevel > 5) return 'secondary';
  return 'default';
}

function StatusBadge({ isNeutralized }: { isNeutralized: boolean }) {
  if (isNeutralized) {
    return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Neutralized</Badge>;
  }
  return <Badge variant="destructive">Active</Badge>;
}

export default function UserDashboardPage() {
    const { firestore } = useFirebase();
    const [nearbyReports, setNearbyReports] = useState<SurveillanceSample[]>([]);
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const reportsQuery = useMemoFirebase(
      () => (firestore ? query(
          collection(firestore, 'surveillanceSamples'), 
          where('submissionAppealStatus', 'in', ['none', 'approved']),
          orderBy('timestamp', 'desc')
      ) : null),
      [firestore]
    );
    const { data: allReports, isLoading: isLoadingReports } = useCollection<SurveillanceSample>(reportsQuery);

    const findNearbyReports = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setIsLoadingLocation(false);
            return;
        }

        setIsLoadingLocation(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const currentLocation = { lat: latitude, lng: longitude };
            setUserLocation(currentLocation);

            if (allReports) {
                 const nearby = allReports.filter(report => {
                    const distance = getDistance(currentLocation, { lat: report.latitude, lng: report.longitude });
                    return distance <= 500; // 500 meters radius
                });
                setNearbyReports(nearby);
            }
            setIsLoadingLocation(false);
        }, (error) => {
            console.error("Error getting user location", error);
            setError("Could not get your location. Please ensure location services are enabled for this site.");
            setIsLoadingLocation(false);
        });
    };
    
    useEffect(() => {
        if (allReports) {
            findNearbyReports();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allReports]);

    const isLoading = isLoadingReports || isLoadingLocation;

    return (
    <div className="space-y-6">
        <ClientMap reports={nearbyReports} center={userLocation ?? undefined} zoom={userLocation ? 15 : 8} />
        <Card>
            <CardHeader className='flex-row items-center justify-between'>
                <div>
                    <CardTitle>Nearby Breeding Sites (500m)</CardTitle>
                    <CardDescription>A list of reported breeding sites near your current location.</CardDescription>
                </div>
                <Button onClick={findNearbyReports} disabled={isLoadingLocation}>
                    {isLoadingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Locate className="mr-2 h-4 w-4" />}
                    Refresh Location
                </Button>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                 ) : error ? (
                    <div className="text-center text-destructive py-10 border-2 border-dashed border-destructive/50 rounded-lg">
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                 ) : nearbyReports.length > 0 ? (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Location</TableHead>
                                <TableHead>Risk</TableHead>
                                <TableHead>Reported</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {nearbyReports.map((report: SurveillanceSample) => (
                                <TableRow key={report.id}>
                                <TableCell className="font-medium">{report.locationName}</TableCell>
                                <TableCell>
                                    <Badge variant={getRiskBadgeVariant(report.riskLevel)}>{report.riskLevel}/10</Badge>
                                </TableCell>
                                <TableCell>{format(new Date(report.timestamp), 'PPP')}</TableCell>
                                <TableCell>
                                    <StatusBadge isNeutralized={report.isNeutralized} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`} target="_blank" rel="noopener noreferrer">
                                            <MapPin className="mr-2 h-4 w-4" />
                                            Get Directions
                                        </Link>
                                    </Button>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </div>
                 ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No breeding sites found within a 500m radius of your location.</p>
                         <Button asChild className="mt-4">
                            <Link href="/report">Report a New Site</Link>
                        </Button>
                    </div>
                 )}
            </CardContent>
        </Card>
    </div>
  );
}
