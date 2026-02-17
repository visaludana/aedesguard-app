
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2, Locate, ShieldAlert, Upload, Camera, XCircle, ShieldQuestion, CheckCircle } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase, errorEmitter } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { generateRiskReport } from '@/ai/flows/generate-risk-report';
import { generateLocalizedSafetyAdvice } from '@/ai/flows/generate-localized-safety-advice';
import type { SurveillanceSample } from '@/lib/types';
import { FirestorePermissionError } from '@/firebase/errors';
import { classifyLarvae, ClassifyLarvaeOutput } from '@/ai/flows/classify-larvae';
import { useToast } from '@/hooks/use-toast';

// Dynamically import the map component
const ReportLocationMap = dynamic(() => import('@/components/report-location-map').then(mod => mod.ReportLocationMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />
});

function bufferToDataURI(buffer: ArrayBuffer, mimeType: string): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return `data:${mimeType};base64,${btoa(binary)}`;
}

type SubmissionState = {
    message?: string;
    riskReport?: {
        sinhalaReport: string;
        tamilReport: string;
        englishReport: string;
    };
    safetyAdvice?: string;
    error?: string;
    
    // AI submission verification state
    aiResult?: ClassifyLarvaeOutput;
    isVerified?: boolean;
    formData?: FormData;
};

export default function ReportPage() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    
    const [state, setState] = useState<SubmissionState>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [location, setLocation] = useState({ lat: 7.8731, lng: 80.7718 }); // Default to Sri Lanka center
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Camera state
    const [showCamera, setShowCamera] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const capturedImageDataUri = useRef<string | null>(null);

    useEffect(() => {
        if (!showCamera) {
          if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
          return;
        }
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                capturedImageDataUri.current = null;
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
            setImagePreview(dataUri);
            capturedImageDataUri.current = dataUri;
            setImageFile(null);
            setShowCamera(false);
        }
    };

    const clearPreview = () => {
        setImagePreview(null);
        setImageFile(null);
        capturedImageDataUri.current = null;
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setState({}); // Clear any previous AI results
    };

    const saveReport = async (formData: FormData, aiResult: ClassifyLarvaeOutput, appealStatus: 'pending' | 'none') => {
        if (!user || !firestore) {
            throw new Error("User not logged in or Firestore not available.");
        }

        const habitatDescription = formData.get('habitatDescription') as string;
        const locationName = formData.get('locationName') as string;
        const language = formData.get('language') as 'Sinhala' | 'Tamil' | 'English';
        const lat = parseFloat(formData.get('lat') as string);
        const lng = parseFloat(formData.get('lng') as string);
        const surroundingsDescription = `${habitatDescription} near ${locationName}. Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        const [riskReport, safetyAdviceResult] = await Promise.all([
            generateRiskReport({
                speciesType: aiResult.speciesType,
                confidenceInterval: aiResult.confidenceScore,
                habitatDescription: surroundingsDescription,
            }),
            generateLocalizedSafetyAdvice({
                surroundingsDescription: surroundingsDescription,
                preferredLanguage: language,
            }),
        ]);

        let imageDataUri: string;
        if (capturedImageDataUri.current) {
            imageDataUri = capturedImageDataUri.current;
        } else if (imageFile) {
            const imageBuffer = await imageFile.arrayBuffer();
            imageDataUri = bufferToDataURI(imageBuffer, imageFile.type);
        } else {
            throw new Error("No image provided.");
        }

        const newReport: Omit<SurveillanceSample, 'id'> = {
            timestamp: new Date().toISOString(),
            latitude: lat,
            longitude: lng,
            originalImageUrl: imageDataUri, // For demo, saving as data URI. In prod, upload to Storage.
            speciesType: aiResult.speciesType,
            confidenceScore: aiResult.confidenceScore,
            habitatDescription: habitatDescription,
            locationName: locationName,
            riskLevel: appealStatus === 'pending' ? 5 : Math.floor(Math.random() * 5) + 5, // Assign a moderate base risk for appealed, random for verified
            isNeutralized: false,
            reportEnglish: riskReport.englishReport,
            reportSinhala: riskReport.sinhalaReport,
            reportTamil: riskReport.tamilReport,
            uploaderId: user.uid,
            uploaderName: user.displayName || 'Anonymous',
            uploaderAvatarUrl: user.photoURL || '',
            isVerifiedByAI: appealStatus !== 'pending',
            aiSubmissionReasoning: aiResult.reasoning,
            submissionAppealStatus: appealStatus,
        };

        const reportsCol = collection(firestore, 'surveillanceSamples');
        await addDoc(reportsCol, newReport).catch(err => {
            const contextualError = new FirestorePermissionError({
                operation: 'create',
                path: reportsCol.path,
                requestResourceData: newReport,
            });
            errorEmitter.emit('permission-error', contextualError);
            throw new Error("Failed to save report to database. You may not have permissions.");
        });

        return { riskReport, safetyAdvice: safetyAdviceResult.safetyAdvice };
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setState({});
        setIsSubmitting(true);

        if (!user) {
          setState({ error: "You must be logged in to submit a report." });
          setIsSubmitting(false);
          return;
        }
        if (!imageFile && !capturedImageDataUri.current) {
            setState({ error: "Please upload or take a photo." });
            setIsSubmitting(false);
            return;
        }

        const currentFormData = new FormData(e.currentTarget);
        const lat = currentFormData.get('lat') as string;
        if (!lat || !currentFormData.get('habitatDescription') || !currentFormData.get('locationName')) {
            setState({ error: "Please fill out all required fields." });
            setIsSubmitting(false);
            return;
        }

        try {
            let photoDataUri: string;
            if (capturedImageDataUri.current) {
                photoDataUri = capturedImageDataUri.current;
            } else if (imageFile) {
                const buffer = await imageFile.arrayBuffer();
                photoDataUri = bufferToDataURI(buffer, imageFile.type);
            } else {
                throw new Error("No image data available");
            }
            
            const submissionAiResult = await classifyLarvae({ photoDataUri });

            if (submissionAiResult.speciesType === 'No Larvae Detected') {
                // AI rejected, show appeal option
                setState({
                    isVerified: false,
                    aiResult: submissionAiResult,
                    formData: currentFormData,
                    error: `AI analysis determined no larvae were present.`
                });
            } else {
                // AI approved, save the report
                const { riskReport, safetyAdvice } = await saveReport(currentFormData, submissionAiResult, 'none');
                setState({
                    message: 'Report submitted successfully. AI analysis complete.',
                    riskReport,
                    safetyAdvice,
                    isVerified: true,
                    aiResult: submissionAiResult
                });
            }
        } catch (e: any) {
            console.error(e);
            setState({ error: e.message || 'Failed to process report. The AI service is unavailable.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleAppealAndSubmit = async () => {
        if (!state.formData || !state.aiResult) return;
        setIsSubmitting(true);
        setState(s => ({ ...s, error: undefined, message: undefined }));
        
        try {
            await saveReport(state.formData, state.aiResult, 'pending');
            toast({
                title: "Appeal Submitted",
                description: "Your report has been submitted for manual review by a health officer."
            });
            setState({ message: "Report submitted for manual review." });
            // Clear the form after successful appeal
            clearPreview();
        } catch (e: any) {
            console.error(e);
            setState(s => ({ ...s, error: e.message || 'Failed to submit appeal.' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const isResultState = state.message || state.error;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Report a Breeding Site</CardTitle>
            <CardDescription>
              Submit a photo and details of a potential mosquito breeding ground. AI will pre-verify your submission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Site Photo</Label>
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
                ) : imagePreview ? (
                  <div className="space-y-4">
                    <Image
                        src={imagePreview}
                        alt="Breeding site preview"
                        width={800}
                        height={600}
                        className="aspect-video w-full rounded-lg object-cover"
                    />
                    <Button type="button" variant="outline" onClick={clearPreview}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Remove Photo
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 aspect-video w-full rounded-lg border-2 border-dashed bg-muted/50 p-4">
                    <div className="text-center">
                      <p className="font-semibold">Add site photo</p>
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
                <Input id="image" name="image" type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="location">Breeding Site Location</Label>
                <div className='text-xs text-muted-foreground flex items-center gap-2'><Locate className='size-3' /> Click the map to pin the location or allow location access.</div>
                <ReportLocationMap location={location} setLocation={setLocation} />
                <input type="hidden" name="lat" value={location.lat} />
                <input type="hidden" name="lng" value={location.lng} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="habitatDescription">Habitat Description</Label>
              <Textarea
                id="habitatDescription"
                name="habitatDescription"
                placeholder="e.g., Stagnant water in a discarded tire behind the house."
                required
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationName">Location Name / Address</Label>
              <Input
                id="locationName"
                name="locationName"
                placeholder="e.g., No. 123, Galle Road, Colombo 3"
                required
              />
            </div>
             <div className="space-y-2">
              <Label>Preferred Language for Advice</Label>
               <Select name="language" defaultValue='English'>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Sinhala">Sinhala</SelectItem>
                  <SelectItem value="Tamil">Tamil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || isResultState} className="w-full md:w-auto">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit for AI Verification
            </Button>
          </CardFooter>
        </Card>
      </form>
      
      <div className="space-y-6">
        {state.aiResult && (
             <Alert variant={state.isVerified ? 'default' : 'destructive'} className={state.isVerified ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : ''}>
                {state.isVerified ? <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle className={state.isVerified ? 'text-green-800 dark:text-green-300' : ''}>
                    AI Verification: {state.isVerified ? 'Larvae Detected' : 'No Larvae Detected'}
                </AlertTitle>
                <AlertDescription className={cn('flex flex-col gap-4', state.isVerified ? 'text-green-700 dark:text-green-400' : '')}>
                    <span><strong>AI Reason:</strong> {state.aiResult.reasoning}</span>
                    <span><strong>Species:</strong> {state.aiResult.speciesType} ({ (state.aiResult.confidenceScore * 100).toFixed(1) }%)</span>
                    {state.isVerified === false && (
                        <div className="flex gap-2 items-center">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleAppealAndSubmit}
                                disabled={isSubmitting}
                            >
                               {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                               <ShieldQuestion className="mr-2 h-4 w-4" />
                               Appeal & Submit Anyway
                            </Button>
                        </div>
                    )}
                </AlertDescription>
            </Alert>
        )}

        {state.error && !state.aiResult && (
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )}

        {state.message && state.isVerified && (
          <div className="space-y-6">
            <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-300">Report Processed</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">{state.message}</AlertDescription>
            </Alert>
            
            {state.safetyAdvice && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Localized Safety Advice</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{state.safetyAdvice}</p>
                    </CardContent>
                </Card>
            )}

            {state.riskReport && (
                <Card>
                    <CardHeader>
                        <CardTitle>AI-Generated Risk Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold">English</h3>
                            <p className="text-sm text-muted-foreground">{state.riskReport.englishReport}</p>
                        </div>
                         <div>
                            <h3 className="font-semibold">Sinhala</h3>
                            <p className="text-sm text-muted-foreground">{state.riskReport.sinhalaReport}</p>
                        </div>
                         <div>
                            <h3 className="font-semibold">Tamil</h3>
                            <p className="text-sm text-muted-foreground">{state.riskReport.tamilReport}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
