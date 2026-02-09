'use client';

import { notFound } from 'next/navigation';
import { getReportById } from '@/lib/data';
import { useEffect, useState } from 'react';
import type { SurveillanceReport } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Info, Loader2, Upload, XCircle } from 'lucide-react';
import { useFormState, useFormStatus } from 'react-dom';
import { verifyNeutralization } from './actions';
import { Skeleton } from '@/components/ui/skeleton';

const initialState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Verify Neutralization
    </Button>
  );
}

export default function VerifyDetailPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<SurveillanceReport | null | undefined>(undefined);
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(null);
  const [state, formAction] = useFormState(verifyNeutralization, initialState);

  useEffect(() => {
    getReportById(params.id).then(setReport);
  }, [params.id]);

  if (report === undefined) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
    );
  }

  if (report === null) {
    notFound();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Before Neutralization</CardTitle>
            <CardDescription>{report.habitatDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Image
              src={report.imageUrl}
              alt="Before neutralization"
              data-ai-hint={report.imageHint}
              width={800}
              height={600}
              className="rounded-lg object-cover"
            />
          </CardContent>
        </Card>

        <form action={formAction}>
          <input type="hidden" name="reportId" value={report.id} />
          <Card>
            <CardHeader>
              <CardTitle>After Neutralization</CardTitle>
              <CardDescription>Upload a photo of the site after cleaning.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="afterImage">Follow-up Photo</Label>
                {afterImagePreview ? (
                  <Image
                    src={afterImagePreview}
                    alt="After neutralization preview"
                    width={800}
                    height={600}
                    className="aspect-[4/3] w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                 <Input id="afterImage" name="afterImage" type="file" accept="image/*" required onChange={handleFileChange} />
              </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </Card>
        </form>
      </div>
      
      {state.message && (
        <Alert variant={state.isNeutralized ? 'default' : 'destructive'} className={state.isNeutralized ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : ''}>
            {state.isNeutralized ? <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle className={state.isNeutralized ? 'text-green-800 dark:text-green-300' : ''}>
                {state.isNeutralized ? 'Verification Successful: Site Neutralized' : 'Verification Failed: Site Not Neutralized'}
            </AlertTitle>
            <AlertDescription className={state.isNeutralized ? 'text-green-700 dark:text-green-400' : ''}>
                <strong>AI Reason:</strong> {state.reason}
            </AlertDescription>
        </Alert>
      )}
       {state.error && (
        <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

    </div>
  );
}
