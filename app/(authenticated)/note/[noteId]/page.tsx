// app/(authenticated)/note/[noteId]/edit/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { EditNoteForm } from "@/app/(authenticated)/note/[noteId]/edit/edit-note-form";
import { toast } from "sonner";
import LoadingSpinner from "@/components/loader";
import type { Note } from "@/types/notes";

export default function EditNotePage({
  params,
}: {
  params: { noteId: string };
}) {
  const [note, setNote] = React.useState<Note | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    async function fetchNote() {
      try {
        const res = await fetch(`/api/v1/notes/${params.noteId}`);
        if (!res.ok) {
          if (res.status === 403) {
            router.push("/");
            toast.error("Non hai il permesso di modificare questo appunto");
            return;
          }
          throw new Error("Failed to fetch note");
        }
        const data = await res.json();

        if (!data.isAuthor) {
          router.push("/");
          toast.error("Non hai il permesso di modificare questo appunto");
          return;
        }

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
  }, [params.noteId, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-red-600">{error}</p>
              <Link
                href="/"
                className="block mt-4 text-center text-primary hover:underline"
              >
                Torna alla home
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <Link
          href={`/note/${note.id}`}
          className="group mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Torna all&apos;appunto
        </Link>

        <Card className="mb-6 border bg-white">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Modifica appunto
            </h1>
            <EditNoteForm note={note} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
