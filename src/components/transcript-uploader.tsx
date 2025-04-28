
"use client";

import React, { useState, useRef, type ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
// Note: docx processing requires additional libraries and setup (e.g., mammoth.js)
// The current docx handling logic is basic and might not fully work without them.

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
    const allowedFileTypes = ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (file) {
      if (allowedFileTypes.includes(file.type)) {
        setSelectedFile(file);
        setFileError(null); // Clear error if file type is valid
      } else {
        // Invalid file type
        setSelectedFile(null); // Reset selected file
        setFileError('Invalid file type. Please upload a .txt or .docx file.');
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset file input visually
        }
      }
    } else {
      // No file selected (e.g., user cancelled)
      setSelectedFile(null);
      setFileError(null); // Clear any previous error
    }
  };

  const handleExtractClick = async () => {
    if (!selectedFile) {
      setFileError('Please select a transcript file first.');
      return;
    }
    setFileError(null); // Clear error before processing

    try {
      if (selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // Basic .docx handling (requires a library like mammoth.js for proper extraction)
        // This is a placeholder and might not extract text correctly.
        console.warn("Note: .docx extraction is basic and may require additional libraries.");
        const reader = new FileReader();
        reader.onload = async (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (arrayBuffer) {
            // You would typically use a library here to parse the ArrayBuffer
            // For example, with mammoth.js:
            // import mammoth from 'mammoth';
            // const { value } = await mammoth.extractRawText({ arrayBuffer });
            // onExtract(value);

            // Placeholder: Trying to read as text might yield unreadable content
            const textDecoder = new TextDecoder('utf-8');
            const text = textDecoder.decode(arrayBuffer);
            console.log("Attempted DOCX text extraction:", text.substring(0, 100)); // Log first 100 chars
            // For now, pass a message indicating it was a docx
            onExtract(`(Content from DOCX file: ${selectedFile.name} - requires proper parsing)`);
          } else {
             setFileError('Could not read the .docx file.');
          }
        };
        reader.onerror = () => {
            setFileError('Error reading the .docx file.');
        };
        reader.readAsArrayBuffer(selectedFile);

      } else if (selectedFile.type === "text/plain") {
        // Handle .txt file
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (typeof text === 'string') {
            onExtract(text);
          } else {
             setFileError('Could not read the .txt file.');
          }
        };
         reader.onerror = () => {
            setFileError('Error reading the .txt file.');
        };
        reader.readAsText(selectedFile);
      } else {
         // Should not happen due to handleFileChange validation, but as a fallback
         setFileError('Unsupported file type selected.');
      }
    } catch (error) {
        console.error("Error during file processing:", error);
        setFileError(`An error occurred processing the file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  return (
    <Card className="w-full max-w-lg mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="text-primary" />
          Upload Transcript
        </CardTitle>
        <CardDescription>Upload a plain text (.txt) or Word (.docx) file containing the meeting transcript.</CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="transcript-file">Transcript File</Label>
          <Input
            id="transcript-file"
            type="file"
            accept=".txt, .docx, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
