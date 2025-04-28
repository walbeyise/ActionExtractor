
"use client";

import type { ExtractActionItemsOutput } from "@/ai/flows/extract-action-items";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ListChecks, User, CalendarClock, UserCheck } from "lucide-react"; // Added icons
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
          {/* Render multiple skeletons for a better loading state */}
          {[...Array(3)].map((_, i) => (
             <div key={i} className="p-4 border rounded-lg bg-secondary/30 space-y-2">
               <Skeleton className="h-5 w-3/4" />
               <Skeleton className="h-4 w-1/2" />
               <Skeleton className="h-4 w-1/2" />
               <Skeleton className="h-4 w-1/3" />
               <Skeleton className="h-4 w-full" />
             </div>
          ))}

        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Extracting Actions</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!actions || actions.actionItems.length === 0) {
    // Still show the card header even if no actions are found yet,
    // unless there was an error or it's loading.
    // The parent component only renders this if actions exist OR loading OR error.
    // So if we reach here without error/loading, it means extraction finished with 0 results.
    return (
       <Card className="mt-6 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="text-primary" />
            <span>Extracted Action Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground">No action items were found in the provided transcript.</p>
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
            <li key={index} className="p-4 border rounded-lg bg-secondary/30 space-y-1.5">
              {/* Action */}
              <p className="font-semibold text-primary">{item.action}</p>

              {/* Assignee */}
              {item.assignee && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-foreground/80" />
                  <span className="font-medium text-foreground">Assignee:</span> {item.assignee}
                </p>
              )}

              {/* Assigner */}
              {item.assigner && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <User className="w-4 h-4 text-foreground/80" />
                  <span className="font-medium text-foreground">Assigner:</span> {item.assigner}
                </p>
              )}

              {/* Timeline */}
              {item.timeline && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-foreground/80" />
                  <span className="font-medium text-foreground">Timeline:</span> {item.timeline}
                </p>
              )}

              {/* Context */}
              <p className="text-sm text-muted-foreground pt-1">
                <span className="font-medium text-foreground">Context:</span> {item.context}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
