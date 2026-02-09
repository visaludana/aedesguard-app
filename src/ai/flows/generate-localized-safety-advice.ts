'use server';

/**
 * @fileOverview Generates localized safety advice based on the surroundings of detected mosquito larvae.
 *
 * - generateLocalizedSafetyAdvice - A function that generates localized safety advice.
 * - GenerateLocalizedSafetyAdviceInput - The input type for the generateLocalizedSafetyAdvice function.
 * - GenerateLocalizedSafetyAdviceOutput - The return type for the generateLocalizedSafetyAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLocalizedSafetyAdviceInputSchema = z.object({
  surroundingsDescription: z
    .string()
    .describe('The description of the surroundings where mosquito larvae were detected.'),
  preferredLanguage: z.enum(['Sinhala', 'Tamil', 'English']).describe('The preferred language for the safety advice.'),
});

export type GenerateLocalizedSafetyAdviceInput = z.infer<typeof GenerateLocalizedSafetyAdviceInputSchema>;

const GenerateLocalizedSafetyAdviceOutputSchema = z.object({
  safetyAdvice: z.string().describe('Localized safety advice based on the surroundings.'),
});

export type GenerateLocalizedSafetyAdviceOutput = z.infer<typeof GenerateLocalizedSafetyAdviceOutputSchema>;

export async function generateLocalizedSafetyAdvice(
  input: GenerateLocalizedSafetyAdviceInput
): Promise<GenerateLocalizedSafetyAdviceOutput> {
  return generateLocalizedSafetyAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'localizedSafetyAdvicePrompt',
  input: {schema: GenerateLocalizedSafetyAdviceInputSchema},
  output: {schema: GenerateLocalizedSafetyAdviceOutputSchema},
  prompt: `You are an expert in public health and safety, providing localized advice to prevent the spread of diseases carried by mosquito larvae.

You will analyze the surroundings where mosquito larvae were detected and provide specific safety advice in the user's preferred language.

Surroundings Description: {{{surroundingsDescription}}}
Preferred Language: {{{preferredLanguage}}}

Provide safety advice in {{{preferredLanguage}}} based on the surroundings description. The advice should be clear, concise, and actionable to mitigate the risks associated with mosquito larvae.
`,
});

const generateLocalizedSafetyAdviceFlow = ai.defineFlow(
  {
    name: 'generateLocalizedSafetyAdviceFlow',
    inputSchema: GenerateLocalizedSafetyAdviceInputSchema,
    outputSchema: GenerateLocalizedSafetyAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
