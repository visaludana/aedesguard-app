'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

type ReportLocationMapProps = {
    location: { lat: number; lng: number; };
    setLocation: (location: { lat: number; lng: number; }) => void;
}

const defaultIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


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
      <Marker position={location} icon={defaultIcon} />
      <MapClickHandler />
    </MapContainer>
  );
}
