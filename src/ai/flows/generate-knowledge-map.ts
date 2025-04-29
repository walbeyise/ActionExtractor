
'use server';
/**
 * @fileOverview Generates a knowledge map from extracted action items,
 * providing both a textual description and structured node/edge data for graphing.
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

// Define Node schema for the graph
const NodeSchema = z.object({
    id: z.string().describe("A unique identifier for the node (e.g., 'person-john', 'action-1', 'topic-budget')."),
    type: z.enum(['person', 'action', 'topic', 'timeline', 'context']).describe("The category of the entity (person, action, topic, timeline, context)."),
    label: z.string().describe("The display text for the node (e.g., 'John Doe', 'Update report', 'Budget Discussion', 'By Friday')."),
    // position: z.object({ x: z.number(), y: z.number() }).describe("Initial position for the node (optional, can be calculated later).").optional(),
});
export type NodeType = z.infer<typeof NodeSchema>;


// Define Edge schema for the graph
const EdgeSchema = z.object({
    id: z.string().describe("A unique identifier for the edge (e.g., 'edge-1-assigns-2')."),
    source: z.string().describe("The ID of the source node."),
    target: z.string().describe("The ID of the target node."),
    label: z.string().optional().describe("A label describing the relationship (e.g., 'assigned to', 'mentioned in', 'due by', 'assigned by')."),
    // type: z.string().optional().describe("Optional edge type for styling (e.g., 'step', 'smoothstep', 'straight').").optional(),
    animated: z.boolean().optional().describe("Whether the edge should be animated (e.g., for assignments).").optional(),
});
export type EdgeType = z.infer<typeof EdgeSchema>;


// Define the output schema for the knowledge map
const KnowledgeMapOutputSchema = z.object({
  mapDescription: z.string().describe(
    'A textual description of the knowledge map, outlining key entities (people, actions, topics from context), their relationships (assignments, dependencies, timelines), and any identified clusters or themes of related information. Use Markdown for basic formatting (like lists and bold text).'
  ),
  nodes: z.array(NodeSchema).describe("An array of nodes representing entities in the knowledge map."),
  edges: z.array(EdgeSchema).describe("An array of edges representing relationships between entities."),
});
export type GenerateKnowledgeMapOutput = z.infer<typeof KnowledgeMapOutputSchema>;


// Exported async wrapper function
export async function generateKnowledgeMap(input: GenerateKnowledgeMapInput): Promise<GenerateKnowledgeMapOutput> {
    // Basic check for empty action items list
    if (!input.actionItems || input.actionItems.length === 0) {
        return {
            mapDescription: "No action items provided to generate a knowledge map.",
            nodes: [],
            edges: []
        };
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
  prompt: `Analyze the following list of extracted action items from a meeting transcript. Create a knowledge map that synthesizes this information, providing both a textual summary and structured data for visualization.

Action Items:
{{#each actionItems}}
- Action: {{this.action}} (Action ID: action-{{@index}})
  Assignee: {{this.assignee}}
  Assigner: {{this.assigner}}
  Timeline: {{this.timeline}}
  Context: {{this.context}}
{{/each}}

Instructions:
1.  **Identify Key Entities:** People (Assignees, Assigners), specific Actions, important Topics/Concepts derived from the Context, and Timelines/Deadlines. Create unique IDs for each distinct entity (e.g., 'person-john_doe', 'action-0', 'timeline-friday', 'topic-budget'). Use the provided Action IDs (action-0, action-1, etc.) for action nodes. Normalize person names for IDs (e.g., lowercase, replace space with underscore).
2.  **Describe Relationships:** Determine the connections between these entities. Examples: Who assigned what to whom? What is the deadline for an action? Which context is an action related to? Are actions linked by topic?
3.  **Generate Textual Description ("mapDescription"):** Write a clear, concise summary of the analysis. Use Markdown for formatting (lists, bold). Highlight key relationships, assignments, deadlines, and potential themes.
4.  **Generate Structured Data ("nodes" and "edges"):**
    -   **Nodes:** Create a list of nodes. Each node object must have:
        -   `id`: The unique entity ID (e.g., 'person-jane_smith', 'action-1', 'timeline-next_week', 'topic-report_updates').
        -   `type`: The category ('person', 'action', 'topic', 'timeline', 'context'). Create 'context' nodes if the context itself is a significant point of reference.
        -   `label`: The display text (e.g., 'Jane Smith', 'Update Report', 'Next Week', 'Discuss Budget Allocation').
    -   **Edges:** Create a list of edges connecting the nodes. Each edge object must have:
        -   `id`: A unique edge ID (e.g., 'edge-assigner-action-0', 'edge-action-0-assignee', 'edge-action-0-timeline', 'edge-action-0-context').
        -   `source`: The ID of the starting node.
        -   `target`: The ID of the ending node.
        -   `label`: (Optional) A short description of the relationship (e.g., 'assigns', 'assigned to', 'due', 'context', 'related topic').
        -   `animated`: (Optional) Set to true for assignment edges (assigner -> action, action -> assignee).

Ensure the output is a valid JSON object strictly adhering to the KnowledgeMapOutputSchema structure, containing "mapDescription", "nodes", and "edges". If no relevant entities or relationships can be extracted, return empty lists for nodes/edges and an appropriate mapDescription. Base the map *only* on the provided action items.
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
    // Ensure output is not null and has the expected arrays
    return output ?? { mapDescription: "Failed to generate knowledge map.", nodes: [], edges: [] };
  } catch (error) {
    console.error("Error in generateKnowledgeMapFlow:", error);
    // Return an error description or re-throw depending on desired handling
    return {
        mapDescription: `Error generating knowledge map: ${error instanceof Error ? error.message : 'Unknown error'}`,
        nodes: [],
        edges: []
    };
  }
});

