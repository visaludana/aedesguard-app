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
import { useFirebase } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { generateReportAndAdvice } from '@/ai/flows/generate-report-and-advice';
import type { SurveillanceSample } from '@/lib/types';
import { classifyLarvae, ClassifyLarvaeOutput } from '@/ai/flows/classify-larvae';
import { useToast } from '@/hooks/use-toast';

const ReportLocationMap = dynamic(() => import('@/components/report-location-map').then(mod => mod.ReportLocationMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />
});

function bufferToDataURI(buffer: ArrayBuffer, mimeType: string): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return `data:${mimeType};base64,${btoa(binary)}`;
}

export default function ReportPage() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    const [state, setState] = useState<any>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [location, setLocation] = useState({ lat: 7.8731, lng: 80.7718 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const capturedImageDataUri = useRef<string | null>(null);

    const saveReport = async (formData: FormData, aiResult: ClassifyLarvaeOutput, appealStatus: string) => {
        if (!firestore) throw new Error("Firestore not available.");
        const habitatDescription = formData.get('habitatDescription') as string;
        const locationName = formData.get('locationName') as string;
        const language = formData.get('language') as any;
        const lat = parseFloat(formData.get('lat') as string);
        const lng = parseFloat(formData.get('lng') as string);

        const reportAndAdvice = await generateReportAndAdvice({
            speciesType: aiResult.speciesType,
            confidenceScore: aiResult.confidenceScore,
            habitatDescription: `${habitatDescription} at ${locationName}`,
            preferredLanguage: language,
        });

        const imageDataUri = capturedImageDataUri.current || (imageFile ? await bufferToDataURI(await imageFile.arrayBuffer(), imageFile.type) : '');

        const newReport: any = {
            timestamp: new Date().toISOString(),
            latitude: lat, longitude: lng, locationName,
            originalImageUrl: imageDataUri,
            speciesType: aiResult.speciesType,
            confidenceScore: aiResult.confidenceScore,
            habitatDescription,
            riskLevel: Math.floor(Math.random() * 5) + 5,
            isNeutralized: false,
            reportEnglish: reportAndAdvice.englishReport,
            reportSinhala: reportAndAdvice.sinhalaReport,
            reportTamil: reportAndAdvice.tamilReport,
            uploaderId: user?.uid || 'anonymous',
            uploaderName: user?.displayName || 'Anonymous',
            isVerifiedByAI: appealStatus !== 'pending',
            aiSubmissionReasoning: aiResult.reasoning,
            submissionAppealStatus: appealStatus,
        };

        await addDoc(collection(firestore, 'surveillanceSamples'), newReport);
        return { riskReport: reportAndAdvice, safetyAdvice: reportAndAdvice.safetyAdvice };
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        try {
            const photoDataUri = capturedImageDataUri.current || (imageFile ? await bufferToDataURI(await imageFile.arrayBuffer(), imageFile.type) : '');
            const aiResult = await classifyLarvae({ photoDataUri });
            if (aiResult.speciesType === 'No Larvae Detected') {
                setState({ isVerified: false, aiResult, formData });
            } else {
                const res = await saveReport(formData, aiResult, 'none');
                setState({ message: 'Submitted!', ...res, isVerified: true, aiResult });
            }
        } catch (e: any) { setState({ error: e.message }); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card><CardHeader><CardTitle>Report Breeding Site</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {imagePreview ? <Image src={imagePreview} alt="Preview" width={400} height={300} className="w-full h-full object-cover" /> : <Button type="button" onClick={() => fileInputRef.current?.click()}>Upload Photo</Button>}
                        <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) { setImageFile(file); const r = new FileReader(); r.onload = () => setImagePreview(r.result as string); r.readAsDataURL(file); }
                        }} />
                    </div>
                    <ReportLocationMap location={location} setLocation={setLocation} />
                    <input type="hidden" name="lat" value={location.lat} /><input type="hidden" name="lng" value={location.lng} />
                    <Textarea name="habitatDescription" placeholder="Habitat description" required />
                    <Input name="locationName" placeholder="Location name" required />
                    <Select name="language" defaultValue="English"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="English">English</SelectItem><SelectItem value="Sinhala">Sinhala</SelectItem><SelectItem value="Tamil">Tamil</SelectItem></SelectContent></Select>
                </CardContent>
                <CardFooter><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Processing...' : 'Submit Report'}</Button></CardFooter></Card>
            </form>
            <div className="space-y-4">
                {state.aiResult && <Alert variant={state.isVerified ? 'default' : 'destructive'}><AlertTitle>AI Result: {state.aiResult.speciesType}</AlertTitle><AlertDescription>{state.aiResult.reasoning}</AlertDescription></Alert>}
                {state.message && <Alert><CheckCircle className="h-4 w-4" /><AlertTitle>{state.message}</AlertTitle></Alert>}
            </div>
        </div>
    );
}
