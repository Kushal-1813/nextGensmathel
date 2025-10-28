import { genkit, type GenkitError } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize the Genkit AI instance with the Google AI plugin
export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
});
