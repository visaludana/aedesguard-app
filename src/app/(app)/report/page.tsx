
'use client';

import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2, Locate, ShieldAlert, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase, errorEmitter } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { generateRiskReport } from '@/ai/flows/generate-risk-report';
import { generateLocalizedSafetyAdvice } from '@/ai/flows/generate-localized-safety-advice';
import type { SurveillanceSample } from '@/lib/types';
import { FirestorePermissionError } from '@/firebase/errors';

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

type FormState = {
  message?: string;
  riskReport?: {
    sinhalaReport: string;
    tamilReport: string;
    englishReport: string;
  };
  safetyAdvice?: string;
  error?: string;
};

export default function ReportPage() {
  const { firestore, user } = useFirebase();
  
  const [state, setState] = useState<FormState>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [location, setLocation] = useState({ lat: 7.8731, lng: 80.7718 }); // Default to Sri Lanka center
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState({});
    setIsSubmitting(true);

    if (!user || !firestore) {
      setState({ error: "You must be logged in to submit a report." });
      setIsSubmitting(false);
      return;
    }
    if (!imageFile) {
        setState({ error: "Please upload an image." });
        setIsSubmitting(false);
        return;
    }

    const formData = new FormData(e.currentTarget);
    const habitatDescription = formData.get('habitatDescription') as string;
    const locationName = formData.get('locationName') as string;
    const language = formData.get('language') as 'Sinhala' | 'Tamil' | 'English';
    const lat = parseFloat(formData.get('lat') as string);
    const lng = parseFloat(formData.get('lng') as string);

    if (!habitatDescription || !locationName || !language || !lat || !lng) {
        setState({ error: "Please fill out all fields." });
        setIsSubmitting(false);
        return;
    }

    const surroundingsDescription = `${habitatDescription} near ${locationName}. Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    try {
        const mockClassification = {
            speciesType: 'Aedes aegypti',
            confidenceScore: 0.92,
        };

        const [riskReport, safetyAdviceResult] = await Promise.all([
            generateRiskReport({
                ...mockClassification,
                habitatDescription: surroundingsDescription,
            }),
            generateLocalizedSafetyAdvice({
                surroundingsDescription: surroundingsDescription,
                preferredLanguage: language,
            }),
        ]);

        const imageBuffer = await imageFile.arrayBuffer();
        const imageDataUri = bufferToDataURI(imageBuffer, imageFile.type);

        const newReport: Omit<SurveillanceSample, 'id'> = {
            timestamp: new Date().toISOString(),
            latitude: lat,
            longitude: lng,
            originalImageUrl: imageDataUri, // Saving as data URI for demo purposes
            speciesType: mockClassification.speciesType,
            confidenceScore: mockClassification.confidenceScore,
            habitatDescription: habitatDescription,
            locationName: locationName,
            riskLevel: Math.floor(Math.random() * 5) + 5, // Random risk from 5-9
            isNeutralized: false,
            reportEnglish: riskReport.englishReport,
            reportSinhala: riskReport.sinhalaReport,
            reportTamil: riskReport.tamilReport,
            uploaderId: user.uid,
            uploaderName: user.displayName || 'Anonymous',
            uploaderAvatarUrl: user.photoURL || '',
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

        setState({
            message: 'Report submitted successfully. AI analysis complete.',
            riskReport,
            safetyAdvice: safetyAdviceResult.safetyAdvice,
        });

    } catch (e: any) {
        console.error(e);
        setState({ error: e.message || 'Failed to process report. The AI service may be unavailable.' });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Report a Breeding Site</CardTitle>
            <CardDescription>
              Submit a photo and details of a potential mosquito breeding ground.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Upload Photo</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <Input id="image" name="image" type="file" accept="image/*" required onChange={handleFileChange} />
              </div>
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
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </CardFooter>
        </Card>
      </form>
      
      <div className="space-y-6">
        {state.error && (
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )}
        {state.message && !state.error && (
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
