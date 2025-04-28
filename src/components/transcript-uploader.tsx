
"use client";

import React, { useState, useRef, type ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

// Set workerSrc for pdfjs
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface TranscriptUploaderProps {
  onExtract: (transcript: string) => void;
  isLoading: boolean; // Use the global loading state passed from parent
}

export function TranscriptUploader({ onExtract, isLoading }: TranscriptUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false); // Local processing state
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const allowedFileTypes = [
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
    ];

    if (file) {
      if (allowedFileTypes.includes(file.type)) {
        setSelectedFile(file);
        setFileError(null); // Clear error if file type is valid
      } else {
        setSelectedFile(null);
        setFileError('Invalid file type. Please upload a .txt, .docx, or .pdf file.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } else {
      setSelectedFile(null);
      setFileError(null);
    }
  };

 const handleExtractClick = async () => {
    if (!selectedFile) {
      setFileError('Please select a transcript file first.');
      return;
    }
    setFileError(null);
    setIsProcessingFile(true); // Start local processing

    try {
      let transcriptText = '';
      const fileReader = new FileReader();

      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        fileReader.onload = async (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (arrayBuffer) {
            try {
              const result = await mammoth.extractRawText({ arrayBuffer });
              transcriptText = result.value;
              onExtract(transcriptText); // Call parent extract function
            } catch (mammothError) {
              console.error("Error parsing DOCX with mammoth:", mammothError);
              setFileError(`Could not parse the .docx file. Error: ${mammothError instanceof Error ? mammothError.message : 'Unknown parsing error'}`);
            } finally {
                 setIsProcessingFile(false); // End local processing
            }
          } else {
            setFileError('Could not read the .docx file buffer.');
             setIsProcessingFile(false); // End local processing
          }
        };
        fileReader.onerror = () => {
            setFileError('Error reading the .docx file.');
            setIsProcessingFile(false); // End local processing
        };
        fileReader.readAsArrayBuffer(selectedFile);
      } else if (selectedFile.type === 'text/plain') {
        fileReader.onload = (e) => {
          const text = e.target?.result as string;
           if (typeof text === 'string') {
             transcriptText = text;
             onExtract(transcriptText); // Call parent extract function
           } else {
              setFileError('Could not read the .txt file.');
           }
           setIsProcessingFile(false); // End local processing
        };
        fileReader.onerror = () => {
            setFileError('Error reading the .txt file.');
             setIsProcessingFile(false); // End local processing
        };
        fileReader.readAsText(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {
        fileReader.onload = async (e) => {
            const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
            if (typedArray) {
                 try {
                    const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        // Make sure item.str is treated as string and handle potential undefined/null
                        const pageText = textContent.items.map((item: any) => String(item?.str || '')).join(' ');
                        fullText += pageText + '\n'; // Add newline between pages
                    }
                    transcriptText = fullText.trim();
                    onExtract(transcriptText); // Call parent extract function
                 } catch (pdfError) {
                    console.error("Error parsing PDF:", pdfError);
                    setFileError(`Could not parse the .pdf file. Error: ${pdfError instanceof Error ? pdfError.message : 'Unknown PDF parsing error'}`);
                 } finally {
                     setIsProcessingFile(false); // End local processing
                 }
            } else {
                setFileError('Could not read the .pdf file buffer.');
                 setIsProcessingFile(false); // End local processing
            }
        };
        fileReader.onerror = () => {
            setFileError('Error reading the .pdf file.');
             setIsProcessingFile(false); // End local processing
        };
        fileReader.readAsArrayBuffer(selectedFile);
      } else {
         // Fallback, though validation should prevent this
         setFileError('Unsupported file type selected.');
         setIsProcessingFile(false); // End local processing
      }
    } catch (error) {
        console.error("Error during file processing:", error);
        setFileError(`An error occurred processing the file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsProcessingFile(false); // End local processing in case of unexpected top-level error
    }
  };


  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="text-primary" />
          Upload Transcript File
        </CardTitle>
        <CardDescription>Upload a plain text (.txt), Word (.docx), or PDF (.pdf) file.</CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="transcript-file">Transcript File</Label>
          <Input
            id="transcript-file"
            type="file"
            accept=".txt,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,application/pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="file:text-primary file:font-medium hover:file:bg-primary/10"
            aria-invalid={!!fileError}
            aria-describedby="file-error-message"
            disabled={isLoading || isProcessingFile} // Disable input while loading or processing
          />
          {selectedFile && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <FileText className="w-4 h-4" /> Selected: {selectedFile.name}
            </p>
          )}
          {fileError && <p id="file-error-message" className="text-sm text-destructive mt-1">{fileError}</p>}
        </div>
        <Button
            onClick={handleExtractClick}
            // Disable button if no file is selected, or if global loading OR local processing is active
            disabled={!selectedFile || isLoading || isProcessingFile}
            className="w-full"
        >
          {isLoading || isProcessingFile ? ( // Show spinner if either global loading or local processing is active
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isProcessingFile ? 'Processing...' : 'Extracting...'}
            </>
          ) : (
            'Extract from File'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
