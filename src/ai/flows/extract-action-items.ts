
// 'use server';
/**
 * @fileOverview Extracts action items from meeting transcripts using a trained NLP model.
 *
 * - extractActionItems - A function that handles the action item extraction process.
 * - ExtractActionItemsInput - The input type for the extractActionItems function.
 * - ExtractActionItemsOutput - The return type for the extractActionItems function.
 */

'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ExtractActionItemsInputSchema = z.object({
  transcript: z
    .string()
    .describe('The meeting transcript in plain text format.'),
});
export type ExtractActionItemsInput = z.infer<typeof ExtractActionItemsInputSchema>;

const ActionItemSchema = z.object({
  action: z.string().describe('The specific task or commitment identified.'),
  assignee: z.string().optional().describe('The person responsible for completing the action item, if identified.'),
  assigner: z.string().optional().describe('The person who assigned the task, if explicitly mentioned or clearly implied.'),
  timeline: z.string().optional().describe('The deadline, due date, or timeframe for the action item, if specified (e.g., "by Friday", "next week", "EOD").'),
  context: z.string().describe('The surrounding sentence or phrase providing context for the action item.'),
});


const ExtractActionItemsOutputSchema = z.object({
  actionItems: z.array(ActionItemSchema)
  .describe('A list of extracted action items, each including the action, assignee, assigner, timeline, and context.'),
});
export type ExtractActionItemsOutput = z.infer<typeof ExtractActionItemsOutputSchema>;

export async function extractActionItems(input: ExtractActionItemsInput): Promise<ExtractActionItemsOutput> {
  // Basic check for empty transcript to avoid unnecessary AI calls
  if (!input.transcript || input.transcript.trim() === '') {
      return { actionItems: [] };
  }
  return extractActionItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractActionItemsPrompt',
  input: {
    schema: z.object({
      transcript: z
        .string()
        .describe('The meeting transcript in plain text format.'),
    }),
  },
  output: {
    schema: ExtractActionItemsOutputSchema, // Use the updated output schema
  },
  prompt: `You are an AI assistant specialized in analyzing meeting transcripts to extract actionable tasks. Carefully read the provided transcript and identify all sentences or phrases that represent a specific action item, task, or commitment.

For each action item identified, extract the following details:
1.  **action**: The core task or action to be performed.
2.  **assignee**: The individual or group responsible for executing the action item. If not mentioned, leave this field empty.
3.  **assigner**: The individual who assigned the task or made the request. This might be the speaker or another person mentioned. If not clear, leave this field empty.
4.  **timeline**: Any specified deadline, due date, or timeframe (e.g., "by Friday", "next week", "EOD", "before the next meeting"). If no timeline is mentioned, leave this field empty.
5.  **context**: The sentence or direct surrounding phrase where the action item was mentioned.

Transcript:
{{{transcript}}}

Present the extracted information as a JSON object containing a list named "actionItems". Each object in the list should represent one action item and have the fields: "action", "assignee", "assigner", "timeline", and "context". Ensure the output strictly adheres to the JSON format. If no action items are found, return an empty "actionItems" list.
`,
});

const extractActionItemsFlow = ai.defineFlow<
  typeof ExtractActionItemsInputSchema,
  typeof ExtractActionItemsOutputSchema
>({
  name: 'extractActionItemsFlow',
  inputSchema: ExtractActionItemsInputSchema,
  outputSchema: ExtractActionItemsOutputSchema,
}, async input => {
  try {
    const { output } = await prompt(input);
    // Ensure output is not null and actionItems is an array, even if empty
    return output ?? { actionItems: [] };
  } catch (error) {
    console.error("Error in extractActionItemsFlow:", error);
    // Return an empty list or re-throw depending on desired error handling
    return { actionItems: [] };
  }
});

