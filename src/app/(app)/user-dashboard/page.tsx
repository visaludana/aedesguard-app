import { getReports } from '@/lib/data';
import type { SurveillanceReport } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MapPin, ShieldPlus } from 'lucide-react';
import ClientMap from '@/components/client-map';

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

export default async function UserDashboardPage() {
  const allReports = await getReports();
  // In a real app, we would filter by the current user's ID from the database.
  // For this demo, we'll filter by a mock user name from the mock data to simulate a user's view.
  const userReports = allReports.filter(report => report.reportedBy === 'Nimal Perera');

  return (
    <div className="space-y-6">
        <ClientMap reports={userReports} />
        <Card>
            <CardHeader className='flex-row items-center justify-between'>
                <div>
                    <CardTitle>My Submitted Reports</CardTitle>
                    <CardDescription>A list of all breeding sites you have reported.</CardDescription>
                </div>
                <Button asChild>
                    <Link href="/report"> <ShieldPlus className="mr-2 h-4 w-4" /> Report New Site</Link>
                </Button>
            </CardHeader>
            <CardContent>
                 {userReports.length > 0 ? (
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Location</TableHead>
                                <TableHead>Risk Level</TableHead>
                                <TableHead>Reported On</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {userReports.map((report: SurveillanceReport) => (
                                <TableRow key={report.id}>
                                <TableCell className="font-medium">{report.locationName}</TableCell>
                                <TableCell>
                                    <Badge variant={getRiskBadgeVariant(report.riskLevel)}>{report.riskLevel}/10</Badge>
                                </TableCell>
                                <TableCell>{format(new Date(report.reportedAt), 'PPP')}</TableCell>
                                <TableCell>
                                    <StatusBadge isNeutralized={report.isNeutralized} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`https://www.google.com/maps/dir/?api=1&destination=${report.location.lat},${report.location.lng}`} target="_blank" rel="noopener noreferrer">
                                            <MapPin className="mr-2 h-4 w-4" />
                                            Get Directions
                                        </Link>
                                    </Button>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </div>
                 ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">You have not submitted any reports yet.</p>
                        <Button asChild className="mt-4">
                            <Link href="/report">Report Your First Site</Link>
                        </Button>
                    </div>
                 )}
            </CardContent>
        </Card>
    </div>
  );
}
