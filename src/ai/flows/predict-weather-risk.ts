'use server';

/**
 * @fileOverview Predicts mosquito breeding risk based on weather data.
 * - predictWeatherRisk - A function that predicts risk.
 * - PredictWeatherRiskInput - The input type.
 * - PredictWeatherRiskOutput - The output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictWeatherRiskInputSchema = z.object({
  temperature: z.number().describe('The current temperature in Celsius.'),
  humidity: z.number().describe('The current humidity percentage.'),
  rainfall: z.number().describe('The rainfall in the last hour in millimeters.'),
});
export type PredictWeatherRiskInput = z.infer<typeof PredictWeatherRiskInputSchema>;

const PredictWeatherRiskOutputSchema = z.object({
  riskLevel: z.number().min(1).max(10).describe('The predicted risk level for mosquito breeding, from 1 to 10.'),
  assessment: z.string().describe('A brief assessment explaining the risk level based on the weather conditions.'),
});
export type PredictWeatherRiskOutput = z.infer<typeof PredictWeatherRiskOutputSchema>;

export async function predictWeatherRisk(
  input: PredictWeatherRiskInput
): Promise<PredictWeatherRiskOutput> {
  return predictWeatherRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictWeatherRiskPrompt',
  input: {schema: PredictWeatherRiskInputSchema},
  output: {schema: PredictWeatherRiskOutputSchema},
  prompt: `You are a public health expert specializing in entomology and epidemiology in Sri Lanka.
  
  Analyze the following weather data for a specific location to predict the risk of mosquito (Aedes aegypti and Culex) breeding.
  
  Current Weather:
  - Temperature: {{{temperature}}}°C
  - Humidity: {{{humidity}}}%
  - Rainfall (last hour): {{{rainfall}}} mm
  
  Based on this data, provide a risk level from 1 (very low) to 10 (very high) and a concise assessment.
  
  Consider these factors:
  - Mosquitoes thrive in warm and humid conditions.
  - Rainfall, even small amounts, creates new breeding sites in containers and puddles.
  - Ideal temperature for Aedes aegypti is between 24°C and 28°C.
  - High humidity helps adult mosquitoes live longer.
  
  Generate a response in the specified JSON format.`,
});

const predictWeatherRiskFlow = ai.defineFlow(
  {
    name: 'predictWeatherRiskFlow',
    inputSchema: PredictWeatherRiskInputSchema,
    outputSchema: PredictWeatherRiskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
