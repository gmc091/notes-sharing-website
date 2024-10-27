// app/(authenticated)/note/[noteId]/page.tsx

import React from "react";
import { NoteViewer } from "./note-content";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getNoteData(noteId: string, preview: boolean = false) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/notes/${noteId}?preview=${preview}`,
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
  searchParams,
}: {
  params: { noteId: string };
  searchParams: { preview?: string };
}) {
  try {
    const isPreview = searchParams.preview === "true";
    const note = await getNoteData(params.noteId, isPreview);
    return <NoteViewer note={note} isPreview={isPreview} />;
  } catch (error) {
    console.error(error);
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
