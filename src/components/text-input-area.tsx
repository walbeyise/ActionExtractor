"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardPaste, Loader2 } from 'lucide-react';

interface TextInputAreaProps {
  onExtract: (transcript: string) => void;
  isLoading: boolean;
}

export function TextInputArea({ onExtract, isLoading }: TextInputAreaProps) {
  const [transcriptText, setTranscriptText] = useState('');
  const [textError, setTextError] = useState<string | null>(null);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscriptText(event.target.value);
    if (event.target.value.trim()) {
      setTextError(null); // Clear error if text is entered
    }
  };

  const handleExtractClick = () => {
    if (!transcriptText.trim()) {
      setTextError('Please paste or type the transcript text first.');
      return;
    }
    setTextError(null); // Clear error before processing
    onExtract(transcriptText);
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardPaste className="text-primary" />
          Paste Transcript Text
        </CardTitle>
        <CardDescription>Paste the meeting transcript directly into the text area below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="transcript-text">Transcript Text</Label>
          <Textarea
            id="transcript-text"
            placeholder="Paste your meeting transcript here..."
            value={transcriptText}
            onChange={handleTextChange}
            rows={10} // Adjust rows as needed
            className="min-h-[150px]" // Ensure a minimum height
            aria-invalid={!!textError}
            aria-describedby="text-error-message"
          />
           {textError && <p id="text-error-message" className="text-sm text-destructive mt-1">{textError}</p>}
        </div>
        <Button onClick={handleExtractClick} disabled={!transcriptText.trim() || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            'Extract from Text'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
