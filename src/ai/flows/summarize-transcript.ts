// SummarizeTranscript
'use server';

/**
 * @fileOverview Summarizes a meeting transcript to provide key discussion points.
 *
 * - summarizeTranscript - A function that summarizes the transcript.
 * - SummarizeTranscriptInput - The input type for the summarizeTranscript function.
 * - SummarizeTranscriptOutput - The return type for the summarizeTranscript function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const SummarizeTranscriptInputSchema = z.object({
  transcript: z.string().describe('The meeting transcript to summarize.'),
});
export type SummarizeTranscriptInput = z.infer<typeof SummarizeTranscriptInputSchema>;

const SummarizeTranscriptOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the meeting transcript.'),
});
export type SummarizeTranscriptOutput = z.infer<typeof SummarizeTranscriptOutputSchema>;

export async function summarizeTranscript(input: SummarizeTranscriptInput): Promise<SummarizeTranscriptOutput> {
  return summarizeTranscriptFlow(input);
}

const summarizeTranscriptPrompt = ai.definePrompt({
  name: 'summarizeTranscriptPrompt',
  input: {
    schema: z.object({
      transcript: z.string().describe('The meeting transcript to summarize.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise summary of the meeting transcript.'),
    }),
  },
  prompt: `Summarize the following meeting transcript in a concise manner, highlighting the key discussion points:\n\nTranscript:\n{{{transcript}}}`, 
});

const summarizeTranscriptFlow = ai.defineFlow<
  typeof SummarizeTranscriptInputSchema,
  typeof SummarizeTranscriptOutputSchema
>({
  name: 'summarizeTranscriptFlow',
  inputSchema: SummarizeTranscriptInputSchema,
  outputSchema: SummarizeTranscriptOutputSchema,
}, async (input) => {
  const { output } = await summarizeTranscriptPrompt(input);
  return output!;
});
