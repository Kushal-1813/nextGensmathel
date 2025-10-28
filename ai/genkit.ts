import { genkit, type GenkitError } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize the Genkit AI instance with the Google AI plugin
export const ai = genkit({
  plugins: [
    googleAI({
      // Specify the API version
      apiVersion: 'v1beta',
    }),
  ],
  // Log errors to the console
  logLevel: 'error',
  // Custom error handler to provide more context
  errorHandler: (err: GenkitError) => {
    console.error('Genkit Error:', {
      message: err.message,
      status: err.status,
      details: err.details,
      stack: err.stack,
    });
  },
});
