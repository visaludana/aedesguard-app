
'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where, doc, writeBatch } from 'firebase/firestore';
import Image from 'next/image';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DistrictHealthReport, NeutralizationVerification } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Info, ThumbsUp, ThumbsDown, Loader2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserRole } from '@/hooks/use-user-role';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

function AppealsConsole() {
    const { firestore } = useFirebase();
    const { toast } = useToast();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const appealsQuery = useMemoFirebase(
        () => (firestore ? query(collection(firestore, 'neutralizationVerifications'), where('appealStatus', '==', 'pending'), orderBy('verificationTimestamp', 'desc')) : null),
        [firestore]
    );
    const { data: appeals, isLoading, error } = useCollection<NeutralizationVerification>(appealsQuery);

    const handleDecision = async (verification: NeutralizationVerification, decision: 'approved' | 'rejected') => {
        if (!firestore || !verification.id) return;
        setUpdatingId(verification.id);
        
        try {
            const batch = writeBatch(firestore);

            const verificationRef = doc(firestore, 'neutralizationVerifications', verification.id);
            batch.update(verificationRef, { appealStatus: decision });

            if (decision === 'approved') {
                const sampleRef = doc(firestore, 'surveillanceSamples', verification.surveillanceSampleId);
                batch.update(sampleRef, { isNeutralized: true });
                // In a real app, you would also award points to the verifier here.
            }

            await batch.commit();

            toast({
                title: `Appeal ${decision}`,
                description: `The verification has been marked as ${decision}.`
            });
        } catch (err) {
            console.error(err);
            toast({
                variant: 'destructive',
                title: "Update Failed",
                description: "Could not update the appeal status."
            })
        } finally {
            setUpdatingId(null);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader><CardTitle>Verification Appeals</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (error) {
         return (
            <Card>
                <CardHeader><CardTitle>Verification Appeals</CardTitle></CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Error Loading Appeals</AlertTitle>
                        <AlertDescription>Could not load pending verification appeals. You may not have the required permissions.</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (!appeals || appeals.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Verification Appeals</CardTitle>
                    <CardDescription>Review user-submitted appeals for AI verification decisions.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>No Pending Appeals</AlertTitle>
                        <AlertDescription>There are currently no verification appeals to review.</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Verification Appeals ({appeals.length})</CardTitle>
                <CardDescription>Review user-submitted appeals for AI verification decisions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {appeals.map(appeal => (
                        <AccordionItem value={appeal.id!} key={appeal.id!}>
                            <AccordionTrigger>
                                <div className="flex justify-between items-center w-full pr-4">
                                    <span className="font-medium">Appeal by {appeal.verifierName}</span>
                                    <span className="text-sm text-muted-foreground">{format(new Date(appeal.verificationTimestamp), 'PP')}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">Before</h4>
                                        <Image src={appeal.originalImageUrl} alt="Before" width={400} height={300} className="rounded-md w-full aspect-video object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm mb-2">After</h4>
                                        <Image src={appeal.verificationImageUrl} alt="After" width={400} height={300} className="rounded-md w-full aspect-video object-cover" />
                                    </div>
                                </div>
                                <Alert variant="destructive">
                                    <XCircle className="h-4 w-4" />
                                    <AlertTitle>AI Decision: Not Neutralized</AlertTitle>
                                    <AlertDescription>{appeal.aiReason}</AlertDescription>
                                </Alert>
                                <div className="flex gap-2 justify-end pt-2">
                                     <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={updatingId === appeal.id}
                                        onClick={() => handleDecision(appeal, 'rejected')}
                                    >
                                        {updatingId === appeal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="mr-2 h-4 w-4" />}
                                        Reject Appeal
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        disabled={updatingId === appeal.id}
                                        onClick={() => handleDecision(appeal, 'approved')}
                                    >
                                        {updatingId === appeal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                                        Approve Neutralization
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    )
}


export default function AdminConsolePage() {
  const { firestore } = useFirebase();
  const role = useUserRole();

  const canFetchData = role === 'officer';

  const healthReportsQuery = useMemoFirebase(
    () => (firestore && canFetchData ? query(collection(firestore, 'district_health_reports'), orderBy('reportedDate', 'desc')) : null),
    [firestore, canFetchData]
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
  
  if (role !== 'officer') {
    return (
        <div className="max-w-2xl mx-auto mt-10">
            <Alert variant="destructive" >
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                    You do not have permission to view this page. Please contact an administrator if you believe this is an error.
                </AlertDescription>
            </Alert>
        </div>
    );
  }
  
  if ((isLoading && (!reports || reports.length === 0)) || role === 'loading') {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-64" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <AppealsConsole />

      {!reports || reports.length === 0 ? (
        <Card>
            <CardHeader>
                <CardTitle>Health Statistics</CardTitle>
            </CardHeader>
             <CardContent>
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No Health Reports Available</AlertTitle>
                    <AlertDescription>
                        There are no health reports to display yet. Submit a report from the "Report Cases" page to see statistics.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
