
"use client";

import { useState } from 'react';
import { extractActionItems, type ExtractActionItemsOutput } from '@/ai/flows/extract-action-items';
import { generateKnowledgeMap, type GenerateKnowledgeMapOutput } from '@/ai/flows/generate-knowledge-map'; // Import new flow
import { TranscriptUploader } from '@/components/transcript-uploader';
import { ActionItemsDisplay } from '@/components/action-items-display';
import { TextInputArea } from '@/components/text-input-area';
import { KnowledgeMapDisplay } from '@/components/knowledge-map-display'; // Import new component
import { Button } from '@/components/ui/button'; // Import Button
import { useToast } from "@/hooks/use-toast";
import { Loader2, BrainCircuit } from 'lucide-react'; // Import icons


export default function Home() {
  const [extractedActions, setExtractedActions] = useState<ExtractActionItemsOutput | null>(null);
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  const [actionsError, setActionsError] = useState<string | null>(null);

  const [knowledgeMap, setKnowledgeMap] = useState<GenerateKnowledgeMapOutput | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleExtract = async (transcript: string, source: 'file' | 'text') => {
    if (!transcript.trim()) {
       toast({
        variant: "destructive",
        title: "Input Error",
        description: `Please provide a transcript via ${source === 'file' ? 'file upload' : 'text input'}.`,
      });
      return;
    }

    setIsLoadingActions(true);
    setActionsError(null);
    setExtractedActions(null);
    // Reset map state when extracting new actions
    setKnowledgeMap(null);
    setMapError(null);
    setIsLoadingMap(false);


    try {
      const result = await extractActionItems({ transcript });
      if (result.actionItems.length > 0) {
        setExtractedActions(result);
        toast({
          title: "Extraction Successful",
          description: `Action items extracted from ${source === 'file' ? 'uploaded file' : 'text input'}.`,
        });
      } else {
        setExtractedActions({ actionItems: [] }); // Ensure state is updated even if empty
         toast({
          title: "Extraction Complete",
          description: `No action items were found in the ${source === 'file' ? 'uploaded file' : 'text input'}.`,
        });
      }
    } catch (err) {
      console.error(`Extraction from ${source} failed:`, err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during extraction.";
      setActionsError(errorMessage);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoadingActions(false);
    }
  };

  const handleGenerateMap = async () => {
      if (!extractedActions || extractedActions.actionItems.length === 0) {
          toast({
              variant: "destructive",
              title: "Cannot Generate Map",
              description: "No action items available to generate a knowledge map.",
          });
          return;
      }

      setIsLoadingMap(true);
      setMapError(null);
      setKnowledgeMap(null);

      try {
          // Simulate API call delay if needed for testing loading state
          // await new Promise(resolve => setTimeout(resolve, 1500));
          const result = await generateKnowledgeMap({ actionItems: extractedActions.actionItems });
          setKnowledgeMap(result);
           toast({
              title: "Knowledge Map Generated",
              description: "Successfully generated the knowledge map.",
          });
      } catch (err) {
          console.error("Knowledge map generation failed:", err);
          const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during map generation.";
          setMapError(errorMessage);
          toast({
              variant: "destructive",
              title: "Map Generation Failed",
              description: errorMessage,
          });
      } finally {
          setIsLoadingMap(false);
      }
  };


  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 lg:p-12 bg-background">
      {/* Wider max-width container */}
      <div className="w-full max-w-6xl space-y-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Action Extractor</h1>
          <p className="text-muted-foreground mt-2">
            Upload or paste a meeting transcript to extract action items and generate a knowledge map.
          </p>
        </header>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TranscriptUploader onExtract={(transcript) => handleExtract(transcript, 'file')} isLoading={isLoadingActions} />
          <TextInputArea onExtract={(transcript) => handleExtract(transcript, 'text')} isLoading={isLoadingActions} />
        </div>


        {/* Action Items Section */}
        {(extractedActions || isLoadingActions || actionsError) && (
           <section aria-labelledby="action-items-heading" className="mt-8">
            <ActionItemsDisplay actions={extractedActions} isLoading={isLoadingActions} error={actionsError} />
           </section>
        )}

        {/* Generate Map Button Section */}
        {extractedActions && extractedActions.actionItems.length > 0 && !actionsError && (
            <div className="mt-8 text-center border-t pt-6">
                 <Button
                    onClick={handleGenerateMap}
                    disabled={isLoadingMap || isLoadingActions}
                    size="lg"
                 >
                    {isLoadingMap ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Generating Map...
                        </>
                    ) : (
                         <>
                            <BrainCircuit className="mr-2 h-5 w-5" />
                            Generate Knowledge Map
                         </>
                    )}
                </Button>
            </div>
        )}

        {/* Knowledge Map Section */}
        {(knowledgeMap || isLoadingMap || mapError) && (
             <section aria-labelledby="knowledge-map-heading" className="mt-8">
                <KnowledgeMapDisplay map={knowledgeMap} isLoading={isLoadingMap} error={mapError} />
             </section>
        )}
      </div>
    </main>
  );
}
