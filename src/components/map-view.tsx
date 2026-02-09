'use client';

import { APIProvider, AdvancedMarker, Map, Pin } from '@vis.gl/react-google-maps';
import type { SurveillanceReport } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type MapViewProps = {
  reports: SurveillanceReport[];
  center?: { lat: number; lng: number };
  zoom?: number;
};

export function MapView({ reports, center = { lat: 7.8731, lng: 80.7718 }, zoom = 8 }: MapViewProps) {
  const getMarkerColor = (riskLevel: number, isNeutralized: boolean) => {
    if (isNeutralized) return '#34D399'; // Green
    if (riskLevel > 8) return '#EF4444'; // Red
    if (riskLevel > 5) return '#F59E0B'; // Amber
    return '#60A5FA'; // Blue
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Live Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[400px] w-full overflow-hidden rounded-lg">
                <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                <Map
                    defaultCenter={center}
                    defaultZoom={zoom}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    mapId={'aedesguard-map'}
                >
                    {reports.map((report) => (
                    <AdvancedMarker key={report.id} position={report.location}>
                        <Pin
                            background={getMarkerColor(report.riskLevel, report.isNeutralized)}
                            borderColor={'#fff'}
                            glyphColor={'#fff'}
                        />
                    </AdvancedMarker>
                    ))}
                </Map>
                </APIProvider>
            </div>
        </CardContent>
    </Card>
  );
}
