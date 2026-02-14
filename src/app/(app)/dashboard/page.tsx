import { getReports } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Droplets, ShieldAlert, Target, Thermometer, Umbrella } from 'lucide-react';
import { getWeatherData, type WeatherData } from '@/lib/weather';
import { predictWeatherRisk, type PredictWeatherRiskOutput } from '@/ai/flows/predict-weather-risk';
import { Badge } from '@/components/ui/badge';

function getRiskBadgeVariant(riskLevel: number): 'destructive' | 'secondary' | 'default' {
  if (riskLevel > 8) return 'destructive';
  if (riskLevel > 5) return 'secondary';
  return 'default';
}

function WeatherRiskCard({ weatherData, riskPrediction }: { weatherData: WeatherData | null, riskPrediction: PredictWeatherRiskOutput | null }) {
  if (!weatherData || !riskPrediction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather-Based Risk Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Could not load weather data or risk prediction. Please ensure your OpenWeather API key is set in the .env file.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weather-Based Risk Forecast (Colombo)</span>
           <Badge variant={getRiskBadgeVariant(riskPrediction.riskLevel)}>{riskPrediction.riskLevel}/10 Risk</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-around text-center border-b pb-4">
            <div className="flex flex-col items-center gap-1 w-1/3">
                <Thermometer className="h-6 w-6 text-red-500" />
                <span className="font-bold">{weatherData.temperature.toFixed(1)}°C</span>
                <span className="text-xs text-muted-foreground">Temperature</span>
            </div>
            <div className="flex flex-col items-center gap-1 w-1/3">
                <Droplets className="h-6 w-6 text-blue-500" />
                <span className="font-bold">{weatherData.humidity}%</span>
                <span className="text-xs text-muted-foreground">Humidity</span>
            </div>
            <div className="flex flex-col items-center gap-1 w-1/3">
                <Umbrella className="h-6 w-6 text-gray-500" />
                <span className="font-bold">{weatherData.rainfall} mm</span>
                <span className="text-xs text-muted-foreground">Rain (1h)</span>
            </div>
        </div>
        <div>
            <h4 className="font-semibold text-sm">AI Assessment</h4>
            <p className="text-sm text-muted-foreground">{riskPrediction.assessment}</p>
        </div>
      </CardContent>
    </Card>
  );
}


export default async function DashboardPage() {
  // Fetch reports and weather data in parallel
  const [reports, weatherData] = await Promise.all([
    getReports(),
    // Using Colombo's coordinates as a default
    getWeatherData(6.9271, 79.8612) 
  ]);

  let riskPrediction: PredictWeatherRiskOutput | null = null;
  if (weatherData) {
    try {
      riskPrediction = await predictWeatherRisk({
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        rainfall: weatherData.rainfall,
      });
    } catch (e) {
      console.error("AI risk prediction failed:", e);
    }
  }

  const totalReports = reports.length;
  const neutralizedCount = reports.filter((r) => r.isNeutralized).length;
  const highRiskCount = reports.filter((r) => !r.isNeutralized && r.riskLevel > 8).length;

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">surveillance reports filed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites Neutralized</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{neutralizedCount}</div>
            <p className="text-xs text-muted-foreground">breeding grounds destroyed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High-Risk Zones</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskCount}</div>
            <p className="text-xs text-muted-foreground">active high-risk areas</p>
          </CardContent>
        </Card>
      </div>
      
      <WeatherRiskCard weatherData={weatherData} riskPrediction={riskPrediction} />
    </div>
  );
}
