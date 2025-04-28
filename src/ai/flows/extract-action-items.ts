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

const ExtractActionItemsOutputSchema = z.object({
  actionItems: z.array(
    z.object({
      action: z.string().describe('The extracted action item.'),
      assignee: z.string().optional().describe('The assignee of the action item, if identified.'),
      context: z.string().describe('The context of the action item.'),
    })
  ).describe('A list of extracted action items.'),
});
export type ExtractActionItemsOutput = z.infer<typeof ExtractActionItemsOutputSchema>;

export async function extractActionItems(input: ExtractActionItemsInput): Promise<ExtractActionItemsOutput> {
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
    schema: z.object({
      actionItems: z.array(
        z.object({
          action: z.string().describe('The extracted action item.'),
          assignee: z.string().optional().describe('The assignee of the action item, if identified.'),
          context: z.string().describe('The context of the action item.'),
        })
      ).describe('A list of extracted action items.'),
    }),
  },
  prompt: `You are an AI assistant tasked with extracting action items from meeting transcripts. An action item is a specific task or commitment that someone needs to complete. Identify the action, the person responsible (if mentioned), and the context of the action item.

Transcript:
{{transcript}}

Extract all action items from the transcript. For each action item, include the action, assignee (if identified), and context. Return the action items in JSON format.
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
  const {output} = await prompt(input);
  return output!;
});

