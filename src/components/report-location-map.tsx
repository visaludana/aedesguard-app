'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, LatLngExpression } from 'leaflet';
import { useEffect } from 'react';

type ReportLocationMapProps = {
    location: { lat: number; lng: number; };
    setLocation: (location: { lat: number; lng: number; }) => void;
}

// Default icon setup for Leaflet
const defaultIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to handle map clicks
function MapClickHandler({ setLocation }: { setLocation: (location: { lat: number; lng: number; }) => void; }) {
  useMapEvents({
    click(e) {
      setLocation(e.latlng);
    },
  });
  return null;
}

// Component to get user's current location
function LocateUser({ setLocation }: { setLocation: (location: { lat: number; lng: number; }) => void; }) {
    const map = useMap();
    useEffect(() => {
        map.locate().on("locationfound", function (e) {
            setLocation(e.latlng);
            map.flyTo(e.latlng, 13);
        });
    }, [map, setLocation]);

    return null;
}

export function ReportLocationMap({ location, setLocation }: ReportLocationMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  const mapTilerUrl = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${apiKey}`;
  const maptilerAttribution = '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';
  
  if (!apiKey) {
    return (
        <div className="h-[300px] w-full flex items-center justify-center bg-muted rounded-lg">
            <p className="text-muted-foreground">MapTiler API key not configured.</p>
        </div>
    )
  }

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden">
        <MapContainer
            center={location as LatLngExpression}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
        >
          <TileLayer
            url={mapTilerUrl}
            attribution={maptilerAttribution}
          />
          <Marker position={location as LatLngExpression} icon={defaultIcon} />
          <MapClickHandler setLocation={setLocation} />
          <LocateUser setLocation={setLocation} />
        </MapContainer>
    </div>
  );
}
