'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { reportBreedingSite } from './actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2, ShieldAlert, Upload } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ReportLocationMap = dynamic(() => import('@/components/report-location-map').then(mod => mod.ReportLocationMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />
});

const initialState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Submit Report
    </Button>
  );
}

export default function ReportPage() {
  const [state, formAction] = useFormState(reportBreedingSite, initialState);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState({ lat: 7.8731, lng: 80.7718 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={formAction} className="space-y-6">
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
              <Label htmlFor="habitatDescription">Habitat Description</Label>
              <Textarea
                id="habitatDescription"
                name="habitatDescription"
                placeholder="e.g., Stagnant water in a discarded tire behind the house."
                required
                rows={4}
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
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Mark Location</CardTitle>
            <CardDescription>Click on the map to pinpoint the location of the breeding site.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full rounded-lg overflow-hidden">
                <ReportLocationMap location={location} setLocation={setLocation} />
            </div>
            <input type="hidden" name="lat" value={location.lat} />
            <input type="hidden" name="lng" value={location.lng} />
          </CardContent>
          <CardFooter>
            <SubmitButton />
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
