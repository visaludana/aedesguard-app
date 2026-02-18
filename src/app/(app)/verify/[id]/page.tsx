'use client';

import { notFound } from 'next/navigation';
import React, { useState, useRef } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { verifyBreedingSiteNeutralization } from '@/ai/flows/verify-breeding-site-neutralization';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { SurveillanceSample } from '@/lib/types';

function bufferToDataURI(buffer: ArrayBuffer, mimeType: string): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return `data:${mimeType};base64,${btoa(binary)}`;
}

export default function VerifyDetailPage({ params }: { params: { id: string } }) {
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(null);
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null);
  const { firestore, user } = useFirebase();
  const reportRef = useMemoFirebase(() => (firestore ? doc(firestore, 'surveillanceSamples', params.id) : null), [firestore, params.id]);
  const { data: report, isLoading } = useDoc<SurveillanceSample>(reportRef);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!report) notFound();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!afterImageFile || !firestore) return;
    setIsSubmitting(true);
    try {
        const afterPhotoDataUri = await bufferToDataURI(await afterImageFile.arrayBuffer(), afterImageFile.type);
        const aiRes = await verifyBreedingSiteNeutralization({ beforePhotoUrl: report.originalImageUrl, afterPhotoDataUri });
        await addDoc(collection(firestore, 'neutralizationVerifications'), {
            surveillanceSampleId: report.id, originalImageUrl: report.originalImageUrl, verificationImageUrl: afterPhotoDataUri,
            verificationTimestamp: new Date().toISOString(), isVerifiedByAI: aiRes.isNeutralized, aiReason: aiRes.reason,
            verifierId: user?.uid || 'anonymous', verifierName: user?.displayName || "Anonymous", appealStatus: 'none',
        });
        if (aiRes.isNeutralized) await updateDoc(reportRef!, { isNeutralized: true });
        setResult(aiRes);
    } catch (err) { console.error(err); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Before</CardTitle></CardHeader><CardContent><Image src={report.originalImageUrl} alt="Before" width={400} height={300} className="rounded-lg w-full" /></CardContent></Card>
        <Card><CardHeader><CardTitle>After</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {afterImagePreview ? <Image src={afterImagePreview} alt="After" width={400} height={300} className="rounded-lg w-full" /> : <Button onClick={() => fileInputRef.current?.click()}>Upload After Photo</Button>}
            <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { setAfterImageFile(file); const r = new FileReader(); r.onload = () => setAfterImagePreview(r.result as string); r.readAsDataURL(file); }
            }} />
          </CardContent>
          <CardFooter><Button onClick={handleSubmit} disabled={isSubmitting || !!result}>{isSubmitting ? 'Verifying...' : 'Verify'}</Button></CardFooter></Card>
      </div>
      {result && <Alert variant={result.isNeutralized ? 'default' : 'destructive'}><AlertTitle>{result.isNeutralized ? 'Success' : 'Failed'}</AlertTitle><AlertDescription>{result.reason}</AlertDescription></Alert>}
    </div>
  );
}
