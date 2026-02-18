'use client';

import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { SurveillanceSample } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function VerifyPage() {
  const { firestore } = useFirebase();
  const reportsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'surveillanceSamples'), orderBy('timestamp', 'desc')) : null),
    [firestore]
  );
  const { data: reports, isLoading } = useCollection<SurveillanceSample>(reportsQuery);

  return (
    <Card>
      <CardHeader><CardTitle>Verify Neutralization</CardTitle><CardDescription>Review all reports.</CardDescription></CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader><TableRow><TableHead>Location</TableHead><TableHead>Species</TableHead><TableHead>Risk</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow> : reports?.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.locationName}</TableCell><TableCell>{report.speciesType}</TableCell>
                  <TableCell><Badge>{report.riskLevel}/10</Badge></TableCell>
                  <TableCell>{report.isNeutralized ? 'Neutralized' : 'Active'}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm" disabled={report.isNeutralized}>
                      <Link href={`/verify/${report.id}`}>Verify <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
