'use server';

import { z } from 'zod';
import { generateRiskReport } from '@/ai/flows/generate-risk-report';
import { generateLocalizedSafetyAdvice } from '@/ai/flows/generate-localized-safety-advice';

const reportSchema = z.object({
  habitatDescription: z.string().min(10, 'Please provide a more detailed description.'),
  image: z.instanceof(File),
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
    locationName: formData.get('locationName'),
    language: formData.get('language'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.habitatDescription?.[0] || validatedFields.error.flatten().fieldErrors.locationName?.[0] || 'Invalid input.',
    };
  }

  const { habitatDescription, language } = validatedFields.data;

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
        habitatDescription,
      }),
      generateLocalizedSafetyAdvice({
        surroundingsDescription: habitatDescription,
        preferredLanguage: language,
      }),
    ]);

    // In a real app, you would save this to Firestore.
    // const newReport = { ...validatedFields.data, ...mockClassification, ...riskReport, ...safetyAdviceResult };
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
