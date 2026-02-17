
'use client';

import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import type { SurveillanceSample } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import 'leaflet/dist/leaflet.css';
import { divIcon, type LatLng, type LocationEvent } from 'leaflet';
import { Skeleton } from './ui/skeleton';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Navigation } from 'lucide-react';

// === HELPER FUNCTIONS ===

/**
 * Calculates distance between two lat/lng coordinates in meters.
 * @param from - The starting point.
 * @param to - The destination point.
 * @returns The distance in meters.
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

/**
 * Calculates the bearing from one point to another.
 * @param start - The starting point.
 * @param end - The destination point.
 * @returns The bearing in degrees.
 */
function getBearing(start: { lat: number; lng: number }, end: { lat: number; lng: number }): number {
    const phi1 = start.lat * Math.PI / 180;
    const phi2 = end.lat * Math.PI / 180;
    const lambda1 = start.lng * Math.PI / 180;
    const lambda2 = end.lng * Math.PI / 180;

    const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) -
              Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);
    const theta = Math.atan2(y, x);
    return (theta * 180 / Math.PI + 360) % 360; // Convert to degrees
}


// === CHILD COMPONENTS ===

type MapViewProps = {
  reports: SurveillanceSample[];
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

// Component to get user location and pass it up
function UserLocationMarker({ onLocationFound }: { onLocationFound: (pos: LatLng) => void }) {
    const [position, setPosition] = useState<LatLng | null>(null);
    const map = useMap();

    useEffect(() => {
        map.locate({ watch: true, setView: false }); // Watch position without automatically setting view
        
        const handleLocation = (e: LocationEvent) => {
            setPosition(e.latlng);
            onLocationFound(e.latlng);
        };
        
        map.on("locationfound", handleLocation);

        return () => {
            map.off("locationfound", handleLocation);
        };
    }, [map, onLocationFound]);

    const userIcon = divIcon({
        html: `
            <div class="relative flex h-5 w-5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-5 w-5 bg-sky-500 border-2 border-white"></span>
            </div>
        `,
        className: 'bg-transparent border-0',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });

    return position === null ? null : (
        <Marker position={position} icon={userIcon}>
            <Popup>Your Location</Popup>
        </Marker>
    );
}

// Compass component to show direction to a nearby site
function Compass({ bearing, distance }: { bearing: number; distance: number }) {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2">
        <div className="bg-background/80 p-2 rounded-full shadow-lg backdrop-blur-sm">
            <Navigation
                className="h-10 w-10 text-primary transition-transform duration-500"
                style={{ transform: `rotate(${bearing}deg)` }}
            />
        </div>
        <p className="text-white bg-black/50 px-2 py-1 rounded-md text-sm font-medium">
            {distance.toFixed(0)}m
        </p>
    </div>
  );
}


// === MAIN MAP COMPONENT ===

export function MapView({ reports, center = { lat: 7.8731, lng: 80.7718 }, zoom = 8 }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  const mapTilerUrl = `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${apiKey}`;
  const maptilerAttribution = '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [nearbySite, setNearbySite] = useState<{ report: SurveillanceSample, distance: number } | null>(null);
  const [bearing, setBearing] = useState<number>(0);

  // Find the first high-risk, active report to center the map on.
  const highRiskReport = reports.find(r => !r.isNeutralized && r.riskLevel > 8);
  const initialCenter = highRiskReport ? { lat: highRiskReport.latitude, lng: highRiskReport.longitude } : center;
  const initialZoom = highRiskReport ? 13 : zoom;
  
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [userLocated, setUserLocated] = useState(false);

  const handleLocationFound = (latlng: LatLng) => {
    setUserPosition(latlng);
    if (!highRiskReport && !userLocated) {
        setMapCenter(latlng);
        setMapZoom(16);
        setUserLocated(true);
    }
  };

  // Effect for device orientation
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let currentHeading = null;
      if (event.webkitCompassHeading) { // For Apple devices
        currentHeading = event.webkitCompassHeading;
      } else if (event.alpha !== null) { // For standard devices
        currentHeading = 360 - event.alpha;
      }
      setHeading(currentHeading);
    };

    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Effect to calculate distance/bearing to nearby sites
  useEffect(() => {
    if (!userPosition) return;

    let closestSite: { report: SurveillanceSample, distance: number } | null = null;

    for (const report of reports) {
      if (report.isNeutralized) continue;
      
      const distance = getDistance(userPosition, { lat: report.latitude, lng: report.longitude });
      if (distance < 50) { // Check if within 50 meters
        if (!closestSite || distance < closestSite.distance) {
          closestSite = { report, distance };
        }
      }
    }
    setNearbySite(closestSite);

    if (closestSite && heading !== null) {
      const siteBearing = getBearing(userPosition, { lat: closestSite.report.latitude, lng: closestSite.report.longitude });
      // Adjust bearing relative to the device's heading
      setBearing(siteBearing - heading);
    }
  }, [userPosition, reports, heading]);

  if (typeof window === 'undefined') {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Live Surveillance Map</CardTitle>
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
                <CardTitle>Live Surveillance Map</CardTitle>
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

  return (
    <Card>
        <CardHeader>
            <CardTitle>Live Surveillance Map</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[400px] w-full overflow-hidden rounded-lg relative">
                {nearbySite && heading !== null && (
                    <Compass bearing={bearing} distance={nearbySite.distance} />
                )}
                <MapContainer
                    center={initialCenter}
                    zoom={initialZoom}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        url={mapTilerUrl}
                        attribution={maptilerAttribution}
                    />
                    <UserLocationMarker onLocationFound={handleLocationFound} />
                    {reports.map((report) => (
                    <Marker key={report.id} position={{ lat: report.latitude, lng: report.longitude }} icon={getMarkerIcon(report.riskLevel, report.isNeutralized)}>
                        <Popup minWidth={250}>
                            <div className="space-y-3">
                                <Image
                                    src={report.originalImageUrl}
                                    alt={report.habitatDescription}
                                    width={400}
                                    height={300}
                                    className="rounded-md object-cover w-full h-auto"
                                />
                                <div>
                                    <p className="text-sm font-medium">{report.locationName}</p>
                                    <p className="text-xs text-muted-foreground">{report.habitatDescription}</p>
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={report.uploaderAvatarUrl} alt={report.uploaderName} />
                                        <AvatarFallback>{report.uploaderName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs font-semibold">{report.uploaderName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Reported {formatDistanceToNow(new Date(report.timestamp), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                    ))}
                    <ChangeView center={mapCenter} zoom={mapZoom} />
                </MapContainer>
            </div>
        </CardContent>
    </Card>
  );
}
