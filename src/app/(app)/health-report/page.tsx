'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar as CalendarIcon, CheckCircle, Loader2, ShieldAlert } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { districts } from '@/lib/sri-lanka-districts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useFirebase, errorEmitter } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { DistrictHealthReport } from '@/lib/types';
import { FirestorePermissionError } from '@/firebase/errors';

export default function HealthReportPage() {
  const { auth, firestore } = useFirebase();
  const [district, setDistrict] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [cases, setCases] = useState<string>('');
  const [deaths, setDeaths] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!auth?.currentUser) {
      setError('You must be logged in to submit a report.');
      return;
    }
    if (!district || !date || cases === '' || deaths === '') {
      setError('Please fill out all fields.');
      return;
    }

    setIsLoading(true);

    const reportData: Omit<DistrictHealthReport, 'id'> = {
      districtName: district,
      reportedDate: format(date, 'yyyy-MM-dd'),
      cases: parseInt(cases, 10),
      deaths: parseInt(deaths, 10),
      reportedById: auth.currentUser.uid,
      reportedAt: new Date().toISOString(),
    };

    try {
      if (!firestore) throw new Error("Firestore not initialized");

      const healthReportsCol = collection(firestore, 'district_health_reports');
      await addDoc(healthReportsCol, reportData);

      setSuccess('Health report submitted successfully.');
      // Reset form
      setDistrict('');
      setDate(new Date());
      setCases('');
      setDeaths('');
    } catch (err: any) {
      console.error(err);
      
      const contextualError = new FirestorePermissionError({
          operation: 'create',
          path: 'district_health_reports',
          requestResourceData: reportData,
      });

      errorEmitter.emit('permission-error', contextualError);
      setError('You do not have permission to submit this report. Please contact an administrator.');

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Report District Health Statistics</CardTitle>
            <CardDescription>
              Submit daily case and death counts for a district. This action is restricted to authorized personnel.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select value={district} onValueChange={setDistrict} required>
                  <SelectTrigger id="district">
                    <SelectValue placeholder="Select a district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map(d => (
                      <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cases">New Cases</Label>
                <Input
                  id="cases"
                  type="number"
                  placeholder="e.g., 150"
                  value={cases}
                  onChange={(e) => setCases(e.target.value)}
                  required
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deaths">New Deaths</Label>
                <Input
                  id="deaths"
                  type="number"
                  placeholder="e.g., 5"
                  value={deaths}
                  onChange={(e) => setDeaths(e.target.value)}
                  required
                  min="0"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
            {error && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Submission Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-300">Success</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">{success}</AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

    