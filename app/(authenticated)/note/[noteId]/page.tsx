// app/(authenticated)/note/[noteId]/page.tsx
"use client";

import React from "react";
import { NoteViewer } from "./note-viewer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { type Note } from "@/types/notes";
import LoadingSpinner from "@/components/loader";

export default function NotePage({ params }: { params: { noteId: string } }) {
  const [note, setNote] = React.useState<Note | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchNote() {
      try {
        const res = await fetch(`/api/v1/notes/${params.noteId}`);
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error("Unauthorized");
          }
          throw new Error("Failed to fetch note");
        }
        const data = await res.json();
        setNote(data);
      } catch (error) {
        console.error(error);
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred while loading the note"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchNote();
  }, [params.noteId]);

  if (isLoading) {
    if (isLoading) {
      return <LoadingSpinner />;
    }
  }

  if (error || !note) {
    return (
      <div className="bg-gray-50 p-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {error === "Unauthorized"
                  ? "Non hai abbastanza punti per acquistare questa nota."
                  : "Si è verificato un errore durante il caricamento della nota."}
              </p>
              <Button asChild>
                <Link href="/">Torna alla home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <NoteViewer note={note} />;
}
