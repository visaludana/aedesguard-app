import { getReports } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldAlert, Target, BarChart, ClipboardPlus } from 'lucide-react';
import ClientMap from '@/components/client-map';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DistrictRiskMap from '@/components/district-risk-map';
import { getDistrictRisks } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function OfficerDashboardPage() {
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access your primary tools.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <Button asChild variant="outline">
                    <Link href="/analytics"><BarChart className="mr-2 h-4 w-4" /> Analytics</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/health-report"><ClipboardPlus className="mr-2 h-4 w-4" /> Report Cases</Link>
                </Button>
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
