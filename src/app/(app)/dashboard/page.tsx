import { getReports } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShieldAlert, Target } from 'lucide-react';
import ClientMap from '@/components/client-map';

export default async function DashboardPage() {
  const reports = await getReports();

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
      <div>
        <ClientMap reports={reports} />
      </div>
    </div>
  );
}
