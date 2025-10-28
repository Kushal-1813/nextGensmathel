'use server';
/**
 * @fileOverview This file defines the Genkit flow for simplifying navigation instructions.
 *
 * It exports the following:
 * - `generateInstructions`: The main function to call the AI flow.
 * - `InstructionInputSchema`: The Zod schema for the input.
 * - `InstructionOutputSchema`: The Zod schema for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// 1. Define the input schema with Zod
export const InstructionInputSchema = z.object({
  text: z.string().describe('The raw navigation instruction from Google Maps, e.g., "Turn left onto Main St."'),
});
export type InstructionInput = z.infer<typeof InstructionInputSchema>;

// 2. Define the output schema with Zod
export const InstructionOutputSchema = z.object({
  instructions: z.string().describe(`A simplified instruction for a helmet display, formatted as "arrow,distance". 
    Valid arrow values: "left", "right", "straight", "slight left", "slight right", "u-turn", "destination", "rerouting", "idle".
    Distance is in meters. Example: "left,50"`),
});
export type InstructionOutput = z.infer<typeof InstructionOutputSchema>;

// 3. Define the main function that clients will call
export async function generateInstructions(input: InstructionInput): Promise<InstructionOutput | null> {
  try {
    const output = await instructionFlow(input);
    // Ensure the output is trimmed and clean before returning
    if (output?.instructions) {
      output.instructions = output.instructions.trim();
    }
    return output;
  } catch (error) {
    console.error("Error in generateInstructions flow:", error);
    return null; // Return null on error to be handled by the caller
  }
}

// 4. Define the Genkit prompt
const helmetInstructionSimplifier = ai.definePrompt({
    name: 'helmetInstructionSimplifier',
    input: { schema: InstructionInputSchema },
    output: { schema: InstructionOutputSchema },
    prompt: `You are an assistant for a smart motorcycle helmet. Your task is to convert a verbose Google Maps navigation instruction into a simple, machine-readable format for the helmet's display.

The format MUST be: "arrow,distance"

- The "arrow" indicates the direction of the maneuver.
- The "distance" is the distance in meters until the maneuver, which you must extract from the text. If no distance is mentioned, use 0.

Here are the valid "arrow" values:
- "left"
- "right"
- "straight"
- "slight left"
- "slight right"
- "u-turn"
- "destination" (use for arrival messages)
- "rerouting" (use if the instruction implies being off-route)
- "idle" (use for starting or stopped states, though rarely needed here)

Example transformations:
- "Turn left onto Rue de Rivoli. You will hear instructions in 200 meters." -> "left,200"
- "At the roundabout, take the 2nd exit onto Avenue des Champs-Élysées" -> "straight,0"
- "Keep right to continue on I-95 N" -> "slight right,0"
- "You have arrived." -> "destination,0"
- "Proceed to the route." -> "rerouting,0"

User's instruction:
{{{text}}}
`,
});

// 5. Define the Genkit flow
const instructionFlow = ai.defineFlow(
  {
    name: 'instructionFlow',
    inputSchema: InstructionInputSchema,
    outputSchema: InstructionOutputSchema,
  },
  async (input) => {
    const { output } = await helmetInstructionSimplifier(input);
    return output ?? { instructions: 'idle,0' };
  }
);
