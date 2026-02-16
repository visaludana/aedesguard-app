
'use client';

import type { District, DistrictRisk } from '@/lib/types';
import { districts, sriLankaDistrictsGeoJSON } from '@/lib/sri-lanka-districts';
import 'leaflet/dist/leaflet.css';
import type { Feature, GeoJsonObject } from 'geojson';
import type { Layer, StyleFunction } from 'leaflet';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { getRiskBadgeVariant } from '@/app/(app)/dashboard/page';
import { Progress } from './ui/progress';
import { useEffect, useMemo, useState } from 'react';
import { getDistrictRiskData } from '@/app/(app)/dashboard/actions';
import { differenceInHours } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

const STALE_THRESHOLD_HOURS = 1;

function getRiskColor(riskLevel: number | undefined): string {
  if (riskLevel === undefined) return '#A1A1AA'; // neutral gray for no data
  if (riskLevel > 8) return '#EF4444'; // red-500
  if (riskLevel > 5) return '#F59E0B'; // amber-500
  if (riskLevel > 2) return '#3B82F6'; // blue-500
  return '#10B981'; // green-500
}

export default function DistrictRiskMap({ initialDistrictsWithRisk, openWeatherApiKey }: { initialDistrictsWithRisk: DistrictRisk[], openWeatherApiKey?: string }) {
  const [districtsWithRisk, setDistrictsWithRisk] = useState<DistrictRisk[]>(initialDistrictsWithRisk);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const mapTilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

  useEffect(() => {
    if (!openWeatherApiKey) {
      setIsLoading(false);
      return;
    }
    
    const processDistricts = async () => {
        setIsLoading(true);
        const riskDataMap = new Map(initialDistrictsWithRisk.map(d => [d.name, d]));
        
        const promises = districts.map(district => {
            const existingData = riskDataMap.get(district.name);

            if (!existingData || differenceInHours(new Date(), new Date(existingData.updatedAt)) >= STALE_THRESHOLD_HOURS) {
                return getDistrictRiskData(district as District).finally(() => {
                    setLoadedCount(prev => prev + 1);
                });
            } else {
                setLoadedCount(prev => prev + 1);
                return Promise.resolve(existingData);
            }
        });

        const results = await Promise.all(promises);

        results.forEach(result => {
            if (result) {
                riskDataMap.set(result.name, result);
            }
        });

        setDistrictsWithRisk(Array.from(riskDataMap.values()));
        setIsLoading(false);
    };

    processDistricts();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openWeatherApiKey]);

  const districtsMap = useMemo(() => 
      new Map(districtsWithRisk.map(d => [d.name, d])), 
  [districtsWithRisk]);

  const mapTilerUrl = `https://api.maptiler.com/maps/dataviz/{z}/{x}/{y}.png?key=${mapTilerApiKey}`;
  const maptilerAttribution = '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

  const style: StyleFunction = (feature?: Feature) => {
    const districtName = feature?.properties.DISTRICT;
    const districtData = districtsMap.get(districtName);
    const riskLevel = districtData?.riskLevel;

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
    const districtName = feature.properties.DISTRICT;
    const districtData = districtsMap.get(districtName);
    
    let popupContent = `<div class="font-sans">`;
    popupContent += `<h3 class="font-bold text-base mb-2">${districtName}</h3>`;

    if (districtData) {
        const riskVariant = getRiskBadgeVariant(districtData.riskLevel);
        popupContent += `<div class="mb-2"><span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${riskVariant === 'destructive' ? 'bg-destructive text-destructive-foreground' : riskVariant === 'secondary' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}">Risk: ${districtData.riskLevel}/10</span></div>`;
        popupContent += `<p class="text-xs text-gray-500 mb-2">${districtData.assessment}</p>`;
        popupContent += `<div class="flex justify-around text-xs text-center border-t pt-2">
            <div class="flex flex-col items-center gap-1 w-1/3">
                <span class="font-bold">${districtData.temperature.toFixed(1)}°C</span><span class="text-gray-500">Temp</span>
            </div>
            <div class="flex flex-col items-center gap-1 w-1/3">
                <span class="font-bold">${districtData.humidity}%</span><span class="text-gray-500">Humidity</span>
            </div>
             <div class="flex flex-col items-center gap-1 w-1/3">
                <span class="font-bold">${districtData.rainfall} mm</span><span class="text-gray-500">Rain</span>
            </div>
        </div>`;
    } else if (isLoading && openWeatherApiKey) {
        popupContent += `<p class="text-xs text-gray-500">Calculating risk...</p>`;
    } else {
        popupContent += `<p class="text-xs text-gray-500">Risk data not available.</p>`;
    }

    popupContent += `</div>`;
    layer.bindPopup(popupContent);

    layer.on({
        mouseover: (e) => { e.target.setStyle({ weight: 3, fillOpacity: 0.9 }); e.target.openPopup(); },
        mouseout: (e) => { e.target.setStyle({ weight: 1, fillOpacity: 0.7 }); e.target.closePopup(); },
    });
  };

  const highestRiskDistrict = [...districtsWithRisk]
    .sort((a, b) => b.riskLevel - a.riskLevel)[0];

  const topFiveRisks = [...districtsWithRisk]
    .sort((a, b) => b.riskLevel - a.riskLevel)
    .slice(0, 5);
  
  if (!mapTilerApiKey) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>District Risk Map</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full flex items-center justify-center bg-muted rounded-lg text-center p-4">
                    <div>
                        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
                        <p className="mt-2 font-semibold">Map Service Not Configured</p>
                        <p className="text-muted-foreground text-sm mt-1">
                            Please set the <code className="font-mono text-xs bg-gray-200 dark:bg-gray-700 p-1 rounded">NEXT_PUBLIC_MAPTILER_API_KEY</code> environment variable.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Live District Risk Map</CardTitle>
          <CardDescription>Hover over a district to see live weather and AI risk assessment.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && openWeatherApiKey ? (
            <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
                <p className="text-sm text-muted-foreground">
                  Analyzing live weather data... ({loadedCount} / {districts.length})
                </p>
                <Progress value={(loadedCount / districts.length) * 100} className="w-3/4" />
            </div>
          ) : (
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
                <div className="absolute bottom-2 right-2 bg-background/80 p-2 rounded-md shadow-md z-10 backdrop-blur-sm">
                    <h4 className="text-xs font-bold mb-1">Risk Level</h4>
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{backgroundColor: getRiskColor(9)}}></span><span className="text-xs">Very High (9-10)</span></div>
                        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{backgroundColor: getRiskColor(7)}}></span><span className="text-xs">High (6-8)</span></div>
                        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{backgroundColor: getRiskColor(4)}}></span><span className="text-xs">Moderate (3-5)</span></div>
                        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{backgroundColor: getRiskColor(1)}}></span><span className="text-xs">Low (1-2)</span></div>
                        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{backgroundColor: getRiskColor(undefined)}}></span><span className="text-xs">No Data</span></div>
                    </div>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>District Risk Overview</CardTitle>
          <CardDescription>
            {openWeatherApiKey ? "AI-powered risk assessment based on live weather data." : "Showing cached risk data only. Live assessment disabled."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!openWeatherApiKey && (
             <div className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 p-3 rounded-md border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 mt-0.5"/>
                <div>
                    <span className="font-semibold">Live Analysis Disabled</span>
                    <p className="text-xs">
                        Set the <code className="font-mono text-xs bg-gray-200 dark:bg-gray-700 p-1 rounded">NEXT_PUBLIC_OPENWEATHER_API_KEY</code> to enable live weather risk analysis.
                    </p>
                </div>
             </div>
          )}
          {highestRiskDistrict ? (
            <div>
              <p className="text-sm">
                Highest risk district: <strong>{highestRiskDistrict.name}</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {highestRiskDistrict.assessment}
              </p>
            </div>
          ) : (
             <p className="text-sm text-muted-foreground">
                {isLoading && openWeatherApiKey ? "Risk data is being calculated for all districts..." : "No risk data available to display."}
            </p>
          )}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium">Top 5 High-Risk Districts</h4>
            {topFiveRisks.length > 0 ? (
                <ul className="space-y-2">
                {topFiveRisks.map(d => (
                    <li key={d.name} className="flex justify-between items-center text-sm">
                    <span>{d.name}</span>
                    <Badge variant={getRiskBadgeVariant(d.riskLevel)}>{d.riskLevel}/10 Risk</Badge>
                    </li>
                ))}
                </ul>
            ) : <p className="text-sm text-muted-foreground">No risk data to display.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
