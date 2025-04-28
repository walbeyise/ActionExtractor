"use client";

import type { ExtractActionItemsOutput } from "@/ai/flows/extract-action-items";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ListChecks } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ActionItemsDisplayProps {
  actions: ExtractActionItemsOutput | null;
  isLoading: boolean;
  error: string | null;
}

export function ActionItemsDisplay({ actions, isLoading, error }: ActionItemsDisplayProps) {
  if (isLoading) {
    return (
      <Card className="mt-6 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="text-primary" />
            <span>Extracted Action Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!actions || actions.actionItems.length === 0) {
    return (
       <Card className="mt-6 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="text-primary" />
            <span>Extracted Action Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">No action items found in the transcript.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="text-primary" />
          <span>Extracted Action Items</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {actions.actionItems.map((item, index) => (
            <li key={index} className="p-4 border rounded-lg bg-secondary/30">
              <p className="font-semibold text-primary">{item.action}</p>
              {item.assignee && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Assignee:</span> {item.assignee}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium text-foreground">Context:</span> {item.context}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
