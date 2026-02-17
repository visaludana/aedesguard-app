import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// 1. Read all potential API keys from environment variables.
const apiKeys: string[] = [];
// Look for GEMINI_API_KEY_1, GEMINI_API_KEY_2, ... up to 5
for (let i = 1; i <= 5; i++) {
  const key = process.env[`GEMINI_API_KEY_${i}`];
  if (key && key.trim() !== '') {
    apiKeys.push(key);
  }
}

// As a fallback, also check for the single GEMINI_API_KEY
if (apiKeys.length === 0 && process.env.GEMINI_API_KEY) {
  const key = process.env.GEMINI_API_KEY;
  if (key && key.trim() !== '') {
    apiKeys.push(key);
  }
}

if (apiKeys.length === 0) {
    console.warn("Gemini API key not found. Please set GEMINI_API_KEY or GEMINI_API_KEY_1, etc. in your environment variables. AI features may not work.");
}

// 2. Simple function to rotate through the keys in a round-robin fashion.
let keyIndex = 0;
function getNextApiKey(): string | undefined {
  if (apiKeys.length === 0) {
    // If no keys are provided, return undefined.
    // The googleAI plugin will then fall back to its default behavior.
    return undefined;
  }
  const key = apiKeys[keyIndex];
  keyIndex = (keyIndex + 1) % apiKeys.length;
  return key;
}


export const ai = genkit({
  plugins: [googleAI({ apiKey: getNextApiKey })], // Pass the key-provider function to the plugin
  model: 'googleai/gemini-2.5-flash',
});
