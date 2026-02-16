'use client';

import { notFound } from 'next/navigation';
import { getReportById } from '@/lib/data';
import React, { useEffect, useState } from 'react';
import type { SurveillanceReport } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, CheckCircle, Loader2, Upload, XCircle } from 'lucide-react';
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

  // State for camera functionality
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const hiddenDataUriInputRef = React.useRef<HTMLInputElement>(null);


  useEffect(() => {
    getReportById(params.id).then(setReport);
  }, [params.id]);

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
        if (hiddenDataUriInputRef.current) {
          hiddenDataUriInputRef.current.value = ''; // Clear the data URI if a file is uploaded
        }
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
        
        if (hiddenDataUriInputRef.current) {
          hiddenDataUriInputRef.current.value = dataUri;
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Clear the file input
        }
        setShowCamera(false); // Hide camera after taking photo
    }
  };

  const clearPreview = () => {
    setAfterImagePreview(null);
    if (hiddenDataUriInputRef.current) {
        hiddenDataUriInputRef.current.value = '';
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
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
              className="rounded-lg object-cover w-full aspect-video"
            />
          </CardContent>
        </Card>

        <form action={formAction}>
          <input type="hidden" name="reportId" value={report.id} />
           <input type="hidden" name="afterImageDataUri" ref={hiddenDataUriInputRef} />
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
                {/* Hidden file input, controlled by the "Upload File" button */}
                <Input id="afterImage" name="afterImage" type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
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
