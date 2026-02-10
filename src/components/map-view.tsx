'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import type { SurveillanceReport } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Map } from 'lucide-react';

// This is to fix the default icon issue with webpack
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

type MapViewProps = {
  reports: SurveillanceReport[];
  center?: { lat: number; lng: number };
  zoom?: number;
};

export function MapView({ reports, center = { lat: 7.8731, lng: 80.7718 }, zoom = 8 }: MapViewProps) {
  const getMarkerIcon = (riskLevel: number, isNeutralized: boolean) => {
    const color = isNeutralized ? '#34D399' : // Green
                  riskLevel > 8 ? '#EF4444' : // Red
                  riskLevel > 5 ? '#F59E0B' : // Amber
                  '#60A5FA'; // Blue

    return L.divIcon({
      html: `<span style="background-color: ${color}; width: 1rem; height: 1rem; display: block; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px ${color};"></span>`,
      className: 'bg-transparent border-0',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  return (
    <Card>
        <CardHeader>
            <CardTitle>Live Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[400px] w-full overflow-hidden rounded-lg">
                {accessToken ? (
                  <MapContainer
                      center={center}
                      zoom={zoom}
                      style={{ height: '100%', width: '100%' }}
                      className="z-0"
                  >
                      <TileLayer
                          url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${accessToken}`}
                          attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      {reports.map((report) => (
                      <Marker key={report.id} position={report.location} icon={getMarkerIcon(report.riskLevel, report.isNeutralized)}>
                      </Marker>
                      ))}
                  </MapContainer>
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted p-4">
                    <Alert variant="default" className="max-w-md">
                      <Map className="h-4 w-4" />
                      <AlertTitle>Mapbox Access Token Required</AlertTitle>
                      <AlertDescription>
                        Please add your Mapbox access token to your <code className="font-semibold">.env</code> file to display the map. You can get a free token from <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">Mapbox</a>.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
