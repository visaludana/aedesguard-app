'use server';
/**
 * @fileOverview Classifies an image to detect the presence and species of mosquito larvae.
 *
 * - classifyLarvae - A function that handles the larvae classification process.
 * - ClassifyLarvaeInput - The input type for the classifyLarvae function.
 * - ClassifyLarvaeOutput - The return type for the classifyLarvae function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ClassifyLarvaeInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a potential breeding site, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ClassifyLarvaeInput = z.infer<typeof ClassifyLarvaeInputSchema>;

export const ClassifyLarvaeOutputSchema = z.object({
  speciesType: z
    .enum(['Aedes aegypti', 'Culex', 'No Larvae Detected'])
    .describe('The classified species of mosquito larvae, or if none were detected.'),
  confidenceScore: z.number().min(0).max(1).describe('The confidence score of the classification (0.0 to 1.0).'),
  reasoning: z.string().describe('A brief explanation for the classification decision.'),
});
export type ClassifyLarvaeOutput = z.infer<typeof ClassifyLarvaeOutputSchema>;

export async function classifyLarvae(input: ClassifyLarvaeInput): Promise<ClassifyLarvaeOutput> {
  return classifyLarvaeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyLarvaePrompt',
  input: { schema: ClassifyLarvaeInputSchema },
  output: { schema: ClassifyLarvaeOutputSchema },
  prompt: `You are an expert entomologist specializing in identifying mosquito larvae from images.

Analyze the provided image to determine if it contains mosquito larvae.
- If larvae are present, identify the species as either 'Aedes aegypti' or 'Culex'.
- If no larvae are visible, classify as 'No Larvae Detected'.
- Provide a confidence score for your classification.
- Provide a brief reasoning for your decision (e.g., "Wriggler-type larvae visible in stagnant water," or "Image is clear but shows no signs of aquatic larvae.").

Photo: {{media url=photoDataUri}}`,
});

const classifyLarvaeFlow = ai.defineFlow(
  {
    name: 'classifyLarvaeFlow',
    inputSchema: ClassifyLarvaeInputSchema,
    outputSchema: ClassifyLarvaeOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
