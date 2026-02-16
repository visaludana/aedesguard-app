'use server';

import { z } from 'zod';
import { verifyBreedingSiteNeutralization } from '@/ai/flows/verify-breeding-site-neutralization';
import { getReportById } from '@/lib/data';

const verifySchema = z.object({
  reportId: z.string(),
  afterImage: z.instanceof(File).optional(),
  afterImageDataUri: z.string().optional(),
}).refine(
    (data) => (data.afterImage && data.afterImage.size > 0) || (data.afterImageDataUri && data.afterImageDataUri.length > 0),
    {
        message: "An 'after' image is required. Please upload or take a photo.",
        path: ["afterImage"],
    }
);

type VerifyState = {
  isNeutralized?: boolean;
  reason?: string;
  error?: string;
  message?: string;
};

// Helper to convert a buffer to a data URI
function bufferToDataURI(buffer: Buffer, mimeType: string): string {
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

async function imageUrlToDataUri(imageUrl: string): Promise<string> {
  // If it's already a data URI, just return it.
  if (imageUrl.startsWith('data:image')) {
    return imageUrl;
  }

  // If it is a web URL, fetch and convert it.
  if (imageUrl.startsWith('http')) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const buffer = Buffer.from(await response.arrayBuffer());
      return bufferToDataURI(buffer, contentType);
    } catch (error) {
      console.error("Failed to convert image URL to data URI", error);
      // Return a placeholder pixel to avoid breaking the AI call if fetch fails.
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    }
  }

  // Fallback for any other case
  console.warn(`Could not process imageUrl: ${imageUrl}`);
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
}


export async function verifyNeutralization(
  prevState: VerifyState,
  formData: FormData
): Promise<VerifyState> {
  const validatedFields = verifySchema.safeParse({
    reportId: formData.get('reportId'),
    afterImage: formData.get('afterImage'),
    afterImageDataUri: formData.get('afterImageDataUri'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.afterImage?.[0] || 'Invalid input.',
    };
  }
  
  const { reportId, afterImage, afterImageDataUri } = validatedFields.data;

  try {
    const report = await getReportById(reportId);
    if (!report) {
      return { error: 'Report not found.' };
    }
    
    let finalAfterPhotoDataUri: string;
    if (afterImageDataUri) {
      finalAfterPhotoDataUri = afterImageDataUri;
    } else if (afterImage) {
        // Convert the 'after' image file to a data URI
        const afterImageBuffer = Buffer.from(await afterImage.arrayBuffer());
        finalAfterPhotoDataUri = bufferToDataURI(afterImageBuffer, afterImage.type);
    } else {
        // This case should be caught by the schema validation, but as a fallback:
        return { error: 'No after image provided.' };
    }
    
    // Convert the 'before' image URL to a data URI.
    const beforePhotoDataUri = await imageUrlToDataUri(report.imageUrl);

    const result = await verifyBreedingSiteNeutralization({
        beforePhotoDataUri,
        afterPhotoDataUri: finalAfterPhotoDataUri
    });

    if (result.isNeutralized) {
      // In a real app, update Firestore:
      // await db.collection('surveillance_map').doc(reportId).update({ isNeutralized: true });
    }

    return {
      isNeutralized: result.isNeutralized,
      reason: result.reason,
      message: 'Verification complete.'
    };
  } catch (e) {
    console.error(e);
    return { error: 'AI verification failed. The service is unavailable.' };
  }
}
