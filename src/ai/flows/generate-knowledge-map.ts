
'use server';
/**
 * @fileOverview Generates a knowledge map from extracted action items.
 *
 * - generateKnowledgeMap - A function that handles the knowledge map generation process.
 * - GenerateKnowledgeMapInput - The input type for the generateKnowledgeMap function.
 * - GenerateKnowledgeMapOutput - The return type for the generateKnowledgeMap function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import type { ExtractActionItemsOutput } from './extract-action-items'; // Import the type

// Define the input schema based on the output of the action item extraction
const GenerateKnowledgeMapInputSchema = z.object({
  actionItems: z.array(z.object({
      action: z.string().describe('The specific task or commitment identified.'),
      assignee: z.string().optional().describe('The person responsible for completing the action item, if identified.'),
      assigner: z.string().optional().describe('The person who assigned the task, if explicitly mentioned or clearly implied.'),
      timeline: z.string().optional().describe('The deadline, due date, or timeframe for the action item, if specified (e.g., "by Friday", "next week", "EOD").'),
      context: z.string().describe('The surrounding sentence or phrase providing context for the action item.'),
  })).describe('A list of extracted action items from the meeting transcript.')
});
export type GenerateKnowledgeMapInput = z.infer<typeof GenerateKnowledgeMapInputSchema>;


// Define the output schema for the knowledge map
const KnowledgeMapOutputSchema = z.object({
  mapDescription: z.string().describe(
    'A textual description of the knowledge map, outlining key entities (people, actions, topics from context), their relationships (assignments, dependencies, timelines), and any identified clusters or themes of related information. Use Markdown for basic formatting (like lists and bold text).'
  ),
  // Potential future enhancement: Add structured nodes/edges
  // keyEntities: z.array(z.object({ id: z.string(), label: z.string(), type: z.enum(['person', 'action', 'topic', 'timeline']) })).optional(),
  // relationships: z.array(z.object({ source: z.string(), target: z.string(), label: z.string() })).optional(),
});
export type GenerateKnowledgeMapOutput = z.infer<typeof KnowledgeMapOutputSchema>;


// Exported async wrapper function
export async function generateKnowledgeMap(input: GenerateKnowledgeMapInput): Promise<GenerateKnowledgeMapOutput> {
    // Basic check for empty action items list
    if (!input.actionItems || input.actionItems.length === 0) {
        return { mapDescription: "No action items provided to generate a knowledge map." };
    }
    return generateKnowledgeMapFlow(input);
}


// Define the prompt for knowledge map generation
const prompt = ai.definePrompt({
  name: 'generateKnowledgeMapPrompt',
  input: {
    schema: GenerateKnowledgeMapInputSchema,
  },
  output: {
    schema: KnowledgeMapOutputSchema,
  },
  prompt: `Analyze the following list of extracted action items from a meeting transcript. Create a knowledge map that synthesizes this information.

The knowledge map should:
1.  Identify key entities: People (Assignees, Assigners), specific Actions, important Topics or Concepts mentioned in the context, and Timelines/Deadlines.
2.  Describe the relationships between these entities: Who assigned what to whom? What are the deadlines? Are there actions that seem related based on their context or topic? Are there recurring topics or themes?
3.  Present this synthesis as a clear, concise textual description ("mapDescription"). Use Markdown for basic formatting (e.g., bullet points for lists, bold text for emphasis). Focus on revealing connections and structure within the action items.

Action Items:
{{#each actionItems}}
- Action: {{this.action}}
  Assignee: {{this.assignee}}
  Assigner: {{this.assigner}}
  Timeline: {{this.timeline}}
  Context: {{this.context}}
{{/each}}

Generate the knowledge map description based *only* on the provided action items.
`,
});


// Define the Genkit flow
const generateKnowledgeMapFlow = ai.defineFlow<
  typeof GenerateKnowledgeMapInputSchema,
  typeof KnowledgeMapOutputSchema
>({
  name: 'generateKnowledgeMapFlow',
  inputSchema: GenerateKnowledgeMapInputSchema,
  outputSchema: KnowledgeMapOutputSchema,
}, async input => {
  try {
    const { output } = await prompt(input);
    // Ensure output is not null
    return output ?? { mapDescription: "Failed to generate knowledge map description." };
  } catch (error) {
    console.error("Error in generateKnowledgeMapFlow:", error);
    // Return an error description or re-throw depending on desired handling
    return { mapDescription: `Error generating knowledge map: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
});
