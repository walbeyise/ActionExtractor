
"use client";

import type { GenerateKnowledgeMapOutput } from "@/ai/flows/generate-knowledge-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BrainCircuit } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReactMarkdown from 'react-markdown'; // Assuming react-markdown is installed or needs to be

interface KnowledgeMapDisplayProps {
  map: GenerateKnowledgeMapOutput | null;
  isLoading: boolean;
  error: string | null;
}

// Basic styles for markdown elements (can be customized further)
const markdownComponents = {
    h1: ({node, ...props}: any) => <h1 className="text-2xl font-bold my-4" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-xl font-semibold my-3" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-lg font-semibold my-2" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-2 leading-relaxed" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
    li: ({node, ...props}: any) => <li className="mb-1" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-semibold text-foreground" {...props} />,
    a: ({node, ...props}: any) => <a className="text-primary underline hover:text-primary/80" {...props} />,
    code: ({node, ...props}: any) => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props} />,
    pre: ({node, ...props}: any) => <pre className="bg-muted p-3 rounded overflow-x-auto text-sm font-mono" {...props} />,
};


export function KnowledgeMapDisplay({ map, isLoading, error }: KnowledgeMapDisplayProps) {
  if (isLoading) {
    return (
      <Card className="mt-6 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary" />
            <span>Knowledge Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Skeletons for map loading state */}
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Generating Knowledge Map</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // This case should ideally be handled by the parent component's logic
  // (i.e., don't render this component if there's no map and no loading/error state)
  // But as a fallback:
  if (!map) {
     return null; // Or a message like "Click 'Generate Knowledge Map' above."
  }

  return (
    <Card className="mt-6 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="text-primary" />
          <span>Knowledge Map</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none dark:prose-invert">
         {/* Render the markdown description */}
         <ReactMarkdown components={markdownComponents}>
            {map.mapDescription}
         </ReactMarkdown>
      </CardContent>
    </Card>
  );
}
