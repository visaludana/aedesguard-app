'use server';
/**
 * @fileOverview Verifies if a mosquito breeding site has been neutralized based on a follow-up photo.
 *
 * - verifyBreedingSiteNeutralization - A function that verifies breeding site neutralization.
 * - VerifyBreedingSiteNeutralizationInput - The input type for the verifyBreedingSiteNeutralization function.
 * - VerifyBreedingSiteNeutralizationOutput - The return type for the verifyBreedingSiteNeutralization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyBreedingSiteNeutralizationInputSchema = z.object({
  beforePhotoDataUri: z
    .string()
    .describe(
      "A photo of the breeding site before neutralization, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  afterPhotoDataUri: z
    .string()
    .describe(
      "A photo of the breeding site after neutralization, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VerifyBreedingSiteNeutralizationInput = z.infer<typeof VerifyBreedingSiteNeutralizationInputSchema>;

const VerifyBreedingSiteNeutralizationOutputSchema = z.object({
  isNeutralized: z
    .boolean()
    .describe('Whether or not the breeding site has been successfully neutralized.'),
  reason: z
    .string()
    .describe('The AI reasoning for the neutralization verification result.'),
});
export type VerifyBreedingSiteNeutralizationOutput = z.infer<typeof VerifyBreedingSiteNeutralizationOutputSchema>;

export async function verifyBreedingSiteNeutralization(
  input: VerifyBreedingSiteNeutralizationInput
): Promise<VerifyBreedingSiteNeutralizationOutput> {
  return verifyBreedingSiteNeutralizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyBreedingSiteNeutralizationPrompt',
  input: {schema: VerifyBreedingSiteNeutralizationInputSchema},
  output: {schema: VerifyBreedingSiteNeutralizationOutputSchema},
  prompt: `You are an expert in identifying mosquito breeding sites and verifying their neutralization.

You will be provided with two images: one of the breeding site before neutralization and one after.
Your task is to determine whether the breeding site has been successfully neutralized based on the changes observed in the images.

Consider the following factors when making your determination:
- Presence of standing water in the 'before' photo and its absence in the 'after' photo.
- Removal of containers or objects that could hold water.
- General cleanliness and lack of potential breeding grounds in the 'after' photo.

Provide a clear 'isNeutralized' boolean value (true if neutralized, false otherwise) and a detailed 'reason' explaining your decision.

Before Photo: {{media url=beforePhotoDataUri}}
After Photo: {{media url=afterPhotoDataUri}}`,
});

const verifyBreedingSiteNeutralizationFlow = ai.defineFlow(
  {
    name: 'verifyBreedingSiteNeutralizationFlow',
    inputSchema: VerifyBreedingSiteNeutralizationInputSchema,
    outputSchema: VerifyBreedingSiteNeutralizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
