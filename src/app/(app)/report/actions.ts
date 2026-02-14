'use server';

import { z } from 'zod';
import { generateRiskReport } from '@/ai/flows/generate-risk-report';
import { generateLocalizedSafetyAdvice } from '@/ai/flows/generate-localized-safety-advice';

const reportSchema = z.object({
  habitatDescription: z.string().min(10, 'Please provide a more detailed description.'),
  image: z.instanceof(File),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  locationName: z.string().min(1, 'Location name is required.'),
  language: z.enum(['Sinhala', 'Tamil', 'English']),
});

type ReportState = {
  message?: string;
  riskReport?: {
    sinhalaReport: string;
    tamilReport: string;
    englishReport: string;
  };
  safetyAdvice?: string;
  error?: string;
};

export async function reportBreedingSite(
  prevState: ReportState,
  formData: FormData
): Promise<ReportState> {
  const validatedFields = reportSchema.safeParse({
    habitatDescription: formData.get('habitatDescription'),
    image: formData.get('image'),
    lat: formData.get('lat'),
    lng: formData.get('lng'),
    locationName: formData.get('locationName'),
    language: formData.get('language'),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const errorMessage =
      fieldErrors.habitatDescription?.[0] ||
      fieldErrors.locationName?.[0] ||
      fieldErrors.image?.[0] ||
      'Invalid input. Please check all fields.';
    return {
      error: errorMessage,
    };
  }

  const { habitatDescription, language, locationName, lat, lng } = validatedFields.data;

  // Enhance surroundings description with location name for better AI context
  const surroundingsDescription = `${habitatDescription} near ${locationName}. Coordinates: ${lat.toFixed(
    5
  )}, ${lng.toFixed(5)}`;

  try {
    // In a real app, you would get species and confidence from your Vertex AI model.
    // Here we mock it.
    const mockClassification = {
      speciesType: 'Aedes aegypti',
      confidenceInterval: 0.92,
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

    // In a real app, you would save this to Firestore.
    // const newReport = {
    //   ...validatedFields.data,
    //   location: { lat, lng },
    //   ...mockClassification,
    //   ...riskReport,
    //   ...safetyAdviceResult
    // };
    // await db.collection('surveillance_map').add(newReport);

    return {
      message: 'Report submitted successfully. AI analysis complete.',
      riskReport: riskReport,
      safetyAdvice: safetyAdviceResult.safetyAdvice,
    };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to process report. AI service may be unavailable.' };
  }
}
