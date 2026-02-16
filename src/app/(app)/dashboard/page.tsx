import { getReports } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldAlert, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ClientMap from '@/components/client-map';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DistrictRiskMap from '@/components/district-risk-map';
import { getDistrictRisks } from '@/lib/db';

export function getRiskBadgeVariant(riskLevel: number): 'destructive' | 'secondary' | 'default' {
  if (riskLevel > 8) return 'destructive';
  if (riskLevel > 5) return 'secondary';
  return 'default';
}

export default async function DashboardPage() {
  const [reports, cachedDistrictRisks] = await Promise.all([
    getReports(),
    getDistrictRisks()
  ]);

  const highestRiskDistrictName = [...cachedDistrictRisks]
    .sort((a,b) => b.riskLevel - a.riskLevel)[0]?.name ?? '...';

  const totalReports = reports.length;
  const neutralizedCount = reports.filter((r) => r.isNeutralized).length;
  const highRiskCount = reports.filter((r) => !r.isNeutralized && r.riskLevel > 8).length;

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Highest District Risk</CardTitle>
                <ShieldAlert className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {highestRiskDistrictName}
                </div>
                <p className="text-xs text-muted-foreground">based on live weather data</p>
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="surveillance">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
            <TabsTrigger value="surveillance">Surveillance Map</TabsTrigger>
            <TabsTrigger value="risk">District Risk Map</TabsTrigger>
        </TabsList>
        <TabsContent value="surveillance" className="mt-4">
            <ClientMap reports={reports} />
        </TabsContent>
        <TabsContent value="risk" className="mt-4">
            <DistrictRiskMap 
              initialDistrictsWithRisk={cachedDistrictRisks} 
              openWeatherApiKey={process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}
            />
        </TabsContent>
      </Tabs>
    </div>
  );
}
