'use server';
/**
 * @fileOverview Generates a risk report in multiple languages and localized safety advice.
 *
 * - generateReportAndAdvice - The function to call the flow.
 * - GenerateReportAndAdviceInput - The input type.
 * - GenerateReportAndAdviceOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateReportAndAdviceInputSchema = z.object({
  speciesType: z.string().describe('The species type of the mosquito larvae (e.g., Aedes aegypti).'),
  confidenceScore: z.number().describe('The confidence score of the larvae classification (0-1).'),
  habitatDescription: z.string().describe('A description of the mosquito larvae habitat and its surroundings.'),
  preferredLanguage: z.enum(['Sinhala', 'Tamil', 'English']).describe('The preferred language for the safety advice.'),
});
export type GenerateReportAndAdviceInput = z.infer<typeof GenerateReportAndAdviceInputSchema>;

const GenerateReportAndAdviceOutputSchema = z.object({
  sinhalaReport: z.string().describe('The risk report in Sinhala.'),
  tamilReport: z.string().describe('The risk report in Tamil.'),
  englishReport: z.string().describe('The risk report in English.'),
  safetyAdvice: z.string().describe('Localized safety advice in the preferred language.'),
});
export type GenerateReportAndAdviceOutput = z.infer<typeof GenerateReportAndAdviceOutputSchema>;

export async function generateReportAndAdvice(input: GenerateReportAndAdviceInput): Promise<GenerateReportAndAdviceOutput> {
  return generateReportAndAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportAndAdvicePrompt',
  input: { schema: GenerateReportAndAdviceInputSchema },
  output: { schema: GenerateReportAndAdviceOutputSchema },
  prompt: `You are a public health expert specializing in mosquito-borne diseases in Sri Lanka.

Based on the following information, generate two things:
1.  A risk report about the detected larvae. This report must be generated in all three languages: English, Sinhala, and Tamil. The report should be clear, concise, and easy for the general public to understand.
2.  Actionable, localized safety advice based on the habitat description. This advice should be generated *only* in the user's preferred language.

Information Provided:
-   Species Type: {{{speciesType}}}
-   Confidence Score: {{{confidenceScore}}}
-   Habitat Description: {{{habitatDescription}}}
-   Preferred Language for Safety Advice: {{{preferredLanguage}}}

Provide the complete output in the specified JSON format.`,
});

const generateReportAndAdviceFlow = ai.defineFlow(
  {
    name: 'generateReportAndAdviceFlow',
    inputSchema: GenerateReportAndAdviceInputSchema,
    outputSchema: GenerateReportAndAdviceOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
