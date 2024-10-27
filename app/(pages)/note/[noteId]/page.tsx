import React from "react";
import { NoteViewer } from "./note-content";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";

async function getNoteData(noteId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch note");
  }

  return res.json();
}

export default async function NotePage({
  params,
}: {
  params: { noteId: string };
}) {
  try {
    const note = await getNoteData(params.noteId);
    return <NoteViewer note={note} />;
  } catch (error) {
    console.log(error);
    return (
      <div className="bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Si è verificato un errore durante il caricamento degli appunti.
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
}

// Create loading.tsx in the same directory
export function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
