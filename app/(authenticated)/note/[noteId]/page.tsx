// app/(authenticated)/note/[noteId]/page.tsx
import React from "react";
import { NoteViewer } from "./note-viewer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { headers } from "next/headers";

async function getNoteData(noteId: string) {
  const headersList = headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host");
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/notes/${noteId}`, {
    cache: "no-store",
    // Forward the cookies for auth
    headers: {
      Cookie: headersList.get("cookie") || "",
    },
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error("Unauthorized");
    }
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
    console.error(error);
    return (
      <div className="bg-gray-50 p-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {error instanceof Error && error.message === "Unauthorized"
                  ? "Non hai abbastanza punti per visualizzare questo contenuto."
                  : "Si è verificato un errore durante il caricamento degli appunti."}
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
