"use client";

import { useState } from 'react';
import { extractActionItems, type ExtractActionItemsOutput } from '@/ai/flows/extract-action-items';
import { TranscriptUploader } from '@/components/transcript-uploader';
import { ActionItemsDisplay } from '@/components/action-items-display';
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [extractedActions, setExtractedActions] = useState<ExtractActionItemsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExtract = async (transcript: string) => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    setExtractedActions(null); // Clear previous results
    try {
      const result = await extractActionItems({ transcript });
      setExtractedActions(result);
      toast({
        title: "Extraction Successful",
        description: "Action items have been extracted.",
      });
    } catch (err) {
      console.error("Extraction failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during extraction.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-12 lg:p-24 bg-background">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Action Extractor</h1>
          <p className="text-muted-foreground mt-2">
            Upload your meeting transcript to automatically extract action items.
          </p>
        </header>

        <TranscriptUploader onExtract={handleExtract} isLoading={isLoading} />

        {(extractedActions || isLoading || error) && (
          <ActionItemsDisplay actions={extractedActions} isLoading={isLoading} error={error} />
        )}
      </div>
    </main>
  );
}
