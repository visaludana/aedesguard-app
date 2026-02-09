import { getReports } from '@/lib/data';
import type { SurveillanceReport } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

function getRiskBadgeVariant(riskLevel: number): 'destructive' | 'secondary' | 'default' {
  if (riskLevel > 8) return 'destructive';
  if (riskLevel > 5) return 'secondary';
  return 'default';
}

function StatusBadge({ isNeutralized }: { isNeutralized: boolean }) {
  if (isNeutralized) {
    return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Neutralized</Badge>;
  }
  return <Badge variant="destructive">Active</Badge>;
}

export default async function VerifyPage() {
  const reports = await getReports();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Neutralization</CardTitle>
        <CardDescription>
          Review reported breeding sites and verify if they have been successfully neutralized.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Genus</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Reported On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report: SurveillanceReport) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.locationName}</TableCell>
                  <TableCell>{report.larvaeGenus}</TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(report.riskLevel)}>{report.riskLevel}/10</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(report.reportedAt), 'PPP')}</TableCell>
                  <TableCell>
                    <StatusBadge isNeutralized={report.isNeutralized} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm" disabled={report.isNeutralized}>
                      <Link href={`/verify/${report.id}`}>
                        {report.isNeutralized ? 'Verified' : 'Verify'}
                        {!report.isNeutralized && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
