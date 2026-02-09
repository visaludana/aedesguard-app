'use server';

/**
 * @fileOverview Generates a risk report in Sinhala, Tamil, and English when mosquito larvae are detected.
 *
 * - generateRiskReport - A function that handles the generation of the risk report.
 * - GenerateRiskReportInput - The input type for the generateRiskReport function.
 * - GenerateRiskReportOutput - The return type for the generateRiskReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRiskReportInputSchema = z.object({
  speciesType: z.string().describe('The species type of the mosquito larvae (Aedes aegypti or Culex).'),
  confidenceInterval: z.number().describe('The confidence interval of the larvae classification (0-1).'),
  habitatDescription: z.string().describe('The description of the mosquito larvae habitat (e.g., stagnant water in a discarded tire).'),
});
export type GenerateRiskReportInput = z.infer<typeof GenerateRiskReportInputSchema>;

const GenerateRiskReportOutputSchema = z.object({
  sinhalaReport: z.string().describe('The risk report in Sinhala.'),
  tamilReport: z.string().describe('The risk report in Tamil.'),
  englishReport: z.string().describe('The risk report in English.'),
});
export type GenerateRiskReportOutput = z.infer<typeof GenerateRiskReportOutputSchema>;

export async function generateRiskReport(input: GenerateRiskReportInput): Promise<GenerateRiskReportOutput> {
  return generateRiskReportFlow(input);
}

const riskReportPrompt = ai.definePrompt({
  name: 'riskReportPrompt',
  input: {schema: GenerateRiskReportInputSchema},
  output: {schema: GenerateRiskReportOutputSchema},
  prompt: `You are a public health expert tasked with generating risk reports about mosquito larvae.

  Based on the following information, generate a risk report in Sinhala, Tamil, and English that communicates the risks and necessary actions to the local community.

  Species Type: {{{speciesType}}}
  Confidence Interval: {{{confidenceInterval}}}
  Habitat Description: {{{habitatDescription}}}

  The reports should be clear, concise, and easy to understand for the general public.
  `,
});

const generateRiskReportFlow = ai.defineFlow(
  {
    name: 'generateRiskReportFlow',
    inputSchema: GenerateRiskReportInputSchema,
    outputSchema: GenerateRiskReportOutputSchema,
  },
  async input => {
    const {output} = await riskReportPrompt(input);
    return output!;
  }
);
