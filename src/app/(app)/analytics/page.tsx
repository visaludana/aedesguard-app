'use client';

import { useMemo } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DistrictHealthReport } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsPage() {
  const { firestore } = useFirebase();

  const healthReportsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'district_health_reports'), orderBy('reportedDate', 'desc')) : null),
    [firestore]
  );

  const { data: reports, isLoading, error } = useCollection<DistrictHealthReport>(healthReportsQuery);

  const { chartData, totalCases, totalDeaths } = useMemo(() => {
    if (!reports) {
      return { chartData: [], totalCases: 0, totalDeaths: 0 };
    }

    const aggregated: { [key: string]: { name: string; cases: number; deaths: number } } = {};
    let totalCases = 0;
    let totalDeaths = 0;

    for (const report of reports) {
      if (!aggregated[report.districtName]) {
        aggregated[report.districtName] = {
          name: report.districtName,
          cases: 0,
          deaths: 0,
        };
      }
      aggregated[report.districtName].cases += report.cases;
      aggregated[report.districtName].deaths += report.deaths;
      totalCases += report.cases;
      totalDeaths += report.deaths;
    }

    return {
      chartData: Object.values(aggregated).sort((a, b) => b.cases - a.cases),
      totalCases,
      totalDeaths,
    };
  }, [reports]);
  
  if (error) {
    return (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
                You do not have permission to view this page. Please contact an administrator if you believe this is an error.
            </AlertDescription>
        </Alert>
    );
  }

  if (isLoading) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
        </div>
    )
  }

  if (!reports || reports.length === 0) {
      return (
          <Alert className="max-w-2xl mx-auto">
              <Info className="h-4 w-4" />
              <AlertTitle>No Data Available</AlertTitle>
              <AlertDescription>
                  There are no health reports to display yet. Start by submitting a report.
              </AlertDescription>
          </Alert>
      )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
          <Card>
              <CardHeader>
                  <CardTitle>Total Cases Reported</CardTitle>
                  <CardDescription>Aggregate of all cases from submitted reports.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="text-4xl font-bold">{totalCases.toLocaleString()}</div>
              </CardContent>
          </Card>
           <Card>
              <CardHeader>
                  <CardTitle>Total Deaths Reported</CardTitle>
                  <CardDescription>Aggregate of all deaths from submitted reports.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="text-4xl font-bold">{totalDeaths.toLocaleString()}</div>
              </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Statistics by District</CardTitle>
          <CardDescription>Aggregated cases and deaths per district.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} fontSize={12} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cases" fill="hsl(var(--primary))" name="Cases" />
              <Bar dataKey="deaths" fill="hsl(var(--destructive))" name="Deaths" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Health Reports</CardTitle>
          <CardDescription>The most recently submitted health statistic reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>District</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Cases</TableHead>
                  <TableHead className="text-right">Deaths</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.slice(0, 10).map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.districtName}</TableCell>
                    <TableCell>{format(new Date(report.reportedDate), 'PPP')}</TableCell>
                    <TableCell className="text-right">{report.cases}</TableCell>
                    <TableCell className="text-right">{report.deaths}</TableCell>
                    <TableCell>{format(new Date(report.reportedAt), 'Pp')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    