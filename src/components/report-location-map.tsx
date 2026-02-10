'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

type ReportLocationMapProps = {
    location: { lat: number; lng: number; };
    setLocation: (location: { lat: number; lng: number; }) => void;
}

export function ReportLocationMap({ location, setLocation }: ReportLocationMapProps) {

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setLocation(e.latlng);
      },
    });
    return null;
  }

  if (!accessToken) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg bg-muted p-4">
        <Alert variant="default" className="max-w-md">
          <Map className="h-4 w-4" />
          <AlertTitle>Mapbox Access Token Required</AlertTitle>
          <AlertDescription>
            Please add your Mapbox access token to your <code className="font-semibold">.env</code> file to display the map. You can get a free token from <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">Mapbox</a>.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <MapContainer
        center={location}
        zoom={8}
        style={{ height: '300px', width: '100%' }}
        className="rounded-lg z-0"
        scrollWheelZoom={false}
    >
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${accessToken}`}
        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={location} />
      <MapClickHandler />
    </MapContainer>
  );
}
