
'use client';

import type { DistrictRisk } from '@/app/(app)/dashboard/page';
import { sriLankaDistrictsGeoJSON } from '@/lib/sri-lanka-districts';
import 'leaflet/dist/leaflet.css';
import type { Feature, GeoJsonObject } from 'geojson';
import type { Layer, StyleFunction } from 'leaflet';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { getRiskBadgeVariant } from '@/app/(app)/dashboard/page';
import { Droplets, Thermometer, Umbrella } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

function getRiskColor(riskLevel: number | undefined): string {
  if (riskLevel === undefined) return '#A1A1AA'; // neutral gray for no data
  if (riskLevel > 8) return '#EF4444'; // red-500
  if (riskLevel > 5) return '#F59E0B'; // amber-500
  if (riskLevel > 2) return '#3B82F6'; // blue-500
  return '#10B981'; // green-500
}

export default function DistrictRiskMap({ districtsWithRisk }: { districtsWithRisk: DistrictRisk[] }) {
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
  const mapTilerUrl = `https://api.maptiler.com/maps/dataviz/{z}/{x}/{y}.png?key=${apiKey}`;
  const maptilerAttribution = '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

  const isLoading = districtsWithRisk.some(d => d.weather === undefined || d.risk === undefined);

  if (isLoading) {
    return <Card className='h-full'><CardHeader><CardTitle>District Risk Map</CardTitle><CardDescription>Loading live weather and risk data for all districts...</CardDescription></CardHeader><CardContent><Skeleton className="h-[400px] w-full" /></CardContent></Card>
  }
  
  if (!apiKey) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>District Risk Map</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full flex items-center justify-center bg-muted rounded-lg">
                    <p className="text-muted-foreground">MapTiler API key not configured.</p>
                </div>
            </CardContent>
        </Card>
    )
  }

  const style: StyleFunction = (feature?: Feature) => {
    const districtName = feature?.properties.name;
    const districtData = districtsWithRisk.find(d => d.name === districtName);
    const riskLevel = districtData?.risk?.riskLevel;

    return {
      fillColor: getRiskColor(riskLevel),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const districtName = feature.properties.name;
    const districtData = districtsWithRisk.find(d => d.name === districtName);
    
    if (districtData) {
        let popupContent = `<div class="font-sans">`;
        popupContent += `<h3 class="font-bold text-base mb-2">${districtName}</h3>`;

        if (districtData.risk && districtData.weather) {
            const riskVariant = getRiskBadgeVariant(districtData.risk.riskLevel);
            popupContent += `<div class="mb-2"><span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${riskVariant === 'destructive' ? 'bg-destructive text-destructive-foreground' : riskVariant === 'secondary' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}">Risk: ${districtData.risk.riskLevel}/10</span></div>`;
            popupContent += `<p class="text-xs text-gray-500 mb-2">${districtData.risk.assessment}</p>`;
            popupContent += `<div class="flex justify-around text-xs text-center border-t pt-2">
                <div class="flex flex-col items-center gap-1 w-1/3">
                    <span class="font-bold">${districtData.weather.temperature.toFixed(1)}°C</span><span class="text-gray-500">Temp</span>
                </div>
                <div class="flex flex-col items-center gap-1 w-1/3">
                    <span class="font-bold">${districtData.weather.humidity}%</span><span class="text-gray-500">Humidity</span>
                </div>
                 <div class="flex flex-col items-center gap-1 w-1/3">
                    <span class="font-bold">${districtData.weather.rainfall} mm</span><span class="text-gray-500">Rain</span>
                </div>
            </div>`;
        } else {
            popupContent += `<p class="text-xs text-gray-500">Weather or risk data unavailable.</p>`;
        }
        popupContent += `</div>`;

        layer.bindPopup(popupContent);
        layer.on({
            mouseover: (e) => { e.target.setStyle({ weight: 3, fillOpacity: 0.9 }); e.target.openPopup(); },
            mouseout: (e) => { e.target.setStyle({ weight: 1, fillOpacity: 0.7 }); e.target.closePopup(); },
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live District Risk Map</CardTitle>
        <CardDescription>Hover over a district to see live weather and AI risk assessment.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full rounded-lg overflow-hidden relative">
            <MapContainer
                center={{ lat: 7.8731, lng: 80.7718 }}
                zoom={8}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                className='z-0'
            >
                <TileLayer url={mapTilerUrl} attribution={maptilerAttribution} />
                <GeoJSON data={sriLankaDistrictsGeoJSON as GeoJsonObject} style={style} onEachFeature={onEachFeature} />
            </MapContainer>
            <div className="absolute bottom-2 right-2 bg-white/80 p-2 rounded-md shadow-md z-10">
                <h4 className="text-xs font-bold mb-1">Risk Level</h4>
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{backgroundColor: getRiskColor(1)}}></span><span className="text-xs">Low (1-2)</span></div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{backgroundColor: getRiskColor(4)}}></span><span className="text-xs">Moderate (3-5)</span></div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{backgroundColor: getRiskColor(7)}}></span><span className="text-xs">High (6-8)</span></div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{backgroundColor: getRiskColor(9)}}></span><span className="text-xs">Very High (9-10)</span></div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{backgroundColor: getRiskColor(undefined)}}></span><span className="text-xs">No Data</span></div>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
