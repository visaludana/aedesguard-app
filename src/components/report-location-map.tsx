'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setLocation(e.latlng);
      },
    });
    return null;
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
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={location} />
      <MapClickHandler />
    </MapContainer>
  );
}
