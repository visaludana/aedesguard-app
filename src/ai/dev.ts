'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/classify-larvae.ts';
import '@/ai/flows/generate-risk-report.ts';
import '@/ai/flows/generate-localized-safety-advice.ts';
import '@/ai/flows/verify-breeding-site-neutralization.ts';
import '@/ai/flows/predict-weather-risk.ts';
