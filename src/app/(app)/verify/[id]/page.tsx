
'use client';

import { notFound } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { verifyBreedingSiteNeutralization } from '@/ai/flows/verify-breeding-site-neutralization';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, CheckCircle, Loader2, Upload, XCircle, ShieldQuestion } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { SurveillanceSample, NeutralizationVerification } from '@/lib/types';


// Helper to convert a file buffer to a data URI
function bufferToDataURI(buffer: ArrayBuffer, mimeType: string): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return `data:${mimeType};base64,${btoa(binary)}`;
}


export default function VerifyDetailPage({ params }: { params: { id: string } }) {
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(null);
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null);

  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const reportRef = useMemoFirebase(() => (firestore ? doc(firestore, 'surveillanceSamples', params.id) : null), [firestore, params.id]);
  const { data: report, isLoading: isLoadingReport } = useDoc<SurveillanceSample>(reportRef);

  // State for the verification process
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ isNeutralized: boolean; reason: string; verificationId?: string; appealStatus?: NeutralizationVerification['appealStatus'] } | null>(null);

  // State for camera functionality
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenDataUriRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!showCamera) return;
    const getCameraPermission = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported by your browser.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };
    getCameraPermission();
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [showCamera]);

  if (isLoadingReport) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
    );
  }

  if (!report) {
    notFound();
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAfterImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterImagePreview(reader.result as string);
        hiddenDataUriRef.current = null;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setAfterImagePreview(dataUri);
        hiddenDataUriRef.current = dataUri;
        setAfterImageFile(null);
        setShowCamera(false);
    }
  };

  const clearPreview = () => {
    setAfterImagePreview(null);
    setAfterImageFile(null);
    hiddenDataUriRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!afterImageFile && !hiddenDataUriRef.current) {
        setError("An 'after' image is required. Please upload or take a photo.");
        return;
    }
    if (!firestore || !user) {
        setError("You must be logged in to verify a site.");
        return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
        let afterPhotoDataUri: string;
        if (hiddenDataUriRef.current) {
            afterPhotoDataUri = hiddenDataUriRef.current;
        } else if (afterImageFile) {
            const arrayBuffer = await afterImageFile.arrayBuffer();
            afterPhotoDataUri = bufferToDataURI(arrayBuffer, afterImageFile.type);
        } else {
            throw new Error("No 'after' image provided.");
        }

        const aiResult = await verifyBreedingSiteNeutralization({
            beforePhotoUrl: report.originalImageUrl,
            afterPhotoDataUri,
        });

        const verificationData: Omit<NeutralizationVerification, 'id'> = {
            surveillanceSampleId: report.id,
            originalImageUrl: report.originalImageUrl,
            verificationImageUrl: afterPhotoDataUri, // In a real app, upload this to storage and save URL
            verificationTimestamp: new Date().toISOString(),
            isVerifiedByAI: aiResult.isNeutralized,
            aiReason: aiResult.reason,
            verifierId: user.uid,
            verifierName: user.displayName || "Anonymous",
            pointsAwarded: aiResult.isNeutralized ? 10 : 0,
            appealStatus: 'none',
        };
        
        const verificationDocRef = await addDoc(collection(firestore, 'neutralizationVerifications'), verificationData);

        if (aiResult.isNeutralized && reportRef) {
            await updateDoc(reportRef, { isNeutralized: true });
        }
        
        setResult({ ...aiResult, verificationId: verificationDocRef.id, appealStatus: 'none' });

    } catch (err: any) {
        console.error(err);
        setError("AI verification failed. The service is unavailable or an error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleAppeal = async () => {
      if (!result?.verificationId || !firestore) return;
      
      const verificationDocRef = doc(firestore, 'neutralizationVerifications', result.verificationId);
      try {
          await updateDoc(verificationDocRef, { appealStatus: 'pending' });
          setResult(prev => prev ? {...prev, appealStatus: 'pending'} : null);
          toast({
              title: "Appeal Submitted",
              description: "A health officer will review your verification."
          });
      } catch (err) {
          console.error("Failed to submit appeal:", err);
          toast({
              variant: "destructive",
              title: "Appeal Failed",
              description: "Could not submit your appeal. Please try again later."
          })
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
              src={report.originalImageUrl}
              alt="Before neutralization"
              width={800}
              height={600}
              className="rounded-lg object-cover w-full aspect-video"
            />
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>After Neutralization</CardTitle>
              <CardDescription>Provide a photo of the site after cleaning.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {showCamera ? (
                  <div className="space-y-4">
                    <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                    {hasCameraPermission === false && (
                        <Alert variant="destructive">
                            <AlertTitle>Camera Access Denied</AlertTitle>
                            <AlertDescription>
                            Please enable camera permissions in your browser settings. You can still upload a file instead.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="flex gap-2">
                        <Button type="button" onClick={handleTakePhoto} disabled={hasCameraPermission !== true}>
                            <Camera className="mr-2 h-4 w-4" />
                            Capture Photo
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowCamera(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : afterImagePreview ? (
                  <div className="space-y-4">
                    <Image
                        src={afterImagePreview}
                        alt="After neutralization preview"
                        width={800}
                        height={600}
                        className="aspect-video w-full rounded-lg object-cover"
                    />
                    <Button type="button" variant="outline" onClick={clearPreview}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Retake or Upload
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 aspect-video w-full rounded-lg border-2 border-dashed bg-muted/50 p-4">
                    <div className="text-center">
                      <p className="font-semibold">Add follow-up photo</p>
                      <p className="text-sm text-muted-foreground">Take a new photo or upload one from your device.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button type="button" onClick={() => setShowCamera(true)}>
                            <Camera className="mr-2 h-4 w-4" />
                            Use Camera
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload File
                        </Button>
                    </div>
                  </div>
                )}
                <Input id="afterImage" name="afterImage" type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting || !!result}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Neutralization
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
      
      {result && (
        <Alert variant={result.isNeutralized ? 'default' : 'destructive'} className={result.isNeutralized ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : ''}>
            {result.isNeutralized ? <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle className={result.isNeutralized ? 'text-green-800 dark:text-green-300' : ''}>
                {result.isNeutralized ? 'Verification Successful: Site Neutralized' : 'Verification Failed: Site Not Neutralized'}
            </AlertTitle>
            <AlertDescription className={cn('flex flex-col gap-4', result.isNeutralized ? 'text-green-700 dark:text-green-400' : '')}>
                <span><strong>AI Reason:</strong> {result.reason}</span>
                {!result.isNeutralized && (
                    <div>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleAppeal}
                            disabled={result.appealStatus === 'pending'}
                        >
                           <ShieldQuestion className="mr-2 h-4 w-4" />
                           {result.appealStatus === 'pending' ? 'Appeal Submitted for Review' : 'Appeal AI Decision'}
                        </Button>
                    </div>
                )}
            </AlertDescription>
        </Alert>
      )}
       {error && (
        <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

    </div>
  );
}
