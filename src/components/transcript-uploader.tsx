"use client";

import React, { useState, useRef, type ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

interface TranscriptUploaderProps {
  onExtract: (transcript: string) => void;
  isLoading: boolean;
}

export function TranscriptUploader({ onExtract, isLoading }: TranscriptUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain') {
        setSelectedFile(file);
        setFileError(null);
      } else {
        setSelectedFile(null);
        setFileError('Invalid file type. Please upload a .txt file.');
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input
        }
      }
    } else {
      setSelectedFile(null);
      setFileError(null);
    }
  };

  const handleExtractClick = async () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const transcript = e.target?.result as string;
        onExtract(transcript);
      };
      reader.readAsText(selectedFile);
    } else {
      setFileError('Please select a transcript file first.');
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="text-primary" />
          Upload Transcript
        </CardTitle>
        <CardDescription>Upload a plain text (.txt) file containing the meeting transcript.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="transcript-file">Transcript File</Label>
          <Input
            id="transcript-file"
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="file:text-primary file:font-medium hover:file:bg-primary/10"
            aria-invalid={!!fileError}
            aria-describedby="file-error-message"
          />
          {selectedFile && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <FileText className="w-4 h-4" /> Selected: {selectedFile.name}
            </p>
          )}
          {fileError && <p id="file-error-message" className="text-sm text-destructive mt-1">{fileError}</p>}
        </div>
        <Button onClick={handleExtractClick} disabled={!selectedFile || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            'Extract Action Items'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
