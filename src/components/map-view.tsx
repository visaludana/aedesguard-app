'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import type { SurveillanceReport } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import 'leaflet/dist/leaflet.css';
import { divIcon } from 'leaflet';
import { Skeleton } from './ui/skeleton';
import { useEffect } from 'react';

type MapViewProps = {
  reports: SurveillanceReport[];
  center?: { lat: number; lng: number };
  zoom?: number;
};

// Component to fly to new center
function ChangeView({ center, zoom }: { center: { lat: number, lng: number }, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function MapView({ reports, center = { lat: 7.8731, lng: 80.7718 }, zoom = 8 }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  const mapTilerUrl = `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${apiKey}`;
  const maptilerAttribution = '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

  if (typeof window === 'undefined') {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Live Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[400px] w-full" />
            </CardContent>
        </Card>
    );
  }

  if (!apiKey) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Live Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full flex items-center justify-center bg-muted rounded-lg">
                    <p className="text-muted-foreground">MapTiler API key not configured.</p>
                </div>
            </CardContent>
        </Card>
    )
  }
  
  const getMarkerIcon = (riskLevel: number, isNeutralized: boolean) => {
    const color = isNeutralized ? '#34D399' : // Green
                  riskLevel > 8 ? '#EF4444' : // Red
                  riskLevel > 5 ? '#F59E0B' : // Amber
                  '#60A5FA'; // Blue

    // This creates a simple pulsing dot effect for high-risk, active sites
    const animation = !isNeutralized && riskLevel > 8 
        ? `
        @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }
        animation: pulse 1.5s infinite;
        ` 
        : '';
        
    return divIcon({
      html: `<span style="background-color: ${color}; width: 1rem; height: 1rem; display: block; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px ${color}; ${animation}"></span>`,
      className: 'bg-transparent border-0',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };
  
  // Find the first high-risk, active report to center the map on.
  const highRiskReport = reports.find(r => !r.isNeutralized && r.riskLevel > 8);
  const mapCenter = highRiskReport ? highRiskReport.location : center;
  const mapZoom = highRiskReport ? 13 : zoom;


  return (
    <Card>
        <CardHeader>
            <CardTitle>Live Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[400px] w-full overflow-hidden rounded-lg">
                <MapContainer
                    center={center} // Initial center, will be updated by ChangeView
                    zoom={zoom}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        url={mapTilerUrl}
                        attribution={maptilerAttribution}
                    />
                    {reports.map((report) => (
                    <Marker key={report.id} position={report.location} icon={getMarkerIcon(report.riskLevel, report.isNeutralized)}>
                    </Marker>
                    ))}
                    <ChangeView center={mapCenter} zoom={mapZoom} />
                </MapContainer>
            </div>
        </CardContent>
    </Card>
  );
}
