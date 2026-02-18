'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import type { SurveillanceSample } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function VerifyPage() {
  const { firestore } = useFirebase();
  const reportsQuery = useMemoFirebase(
    () => (firestore ? query(
        collection(firestore, 'surveillanceSamples'), 
        where('submissionAppealStatus', 'in', ['none', 'approved']),
        orderBy('timestamp', 'desc')
    ) : null),
    [firestore]
  );
  const { data: reports, isLoading } = useCollection<SurveillanceSample>(reportsQuery);

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
                <TableHead>Species</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Reported On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <>
                  <TableRow><TableCell colSpan={6}><Skeleton className="h-8" /></TableCell></TableRow>
                  <TableRow><TableCell colSpan={6}><Skeleton className="h-8" /></TableCell></TableRow>
                  <TableRow><TableCell colSpan={6}><Skeleton className="h-8" /></TableCell></TableRow>
                </>
              )}
              {reports && reports.map((report: SurveillanceSample) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.locationName}</TableCell>
                  <TableCell>{report.speciesType}</TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(report.riskLevel)}>{report.riskLevel}/10</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(report.timestamp), 'PPP')}</TableCell>
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
          {!isLoading && (!reports || reports.length === 0) && (
            <div className="text-center p-8 text-muted-foreground">
              No surveillance reports found.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
