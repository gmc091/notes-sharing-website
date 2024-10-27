// app/(authenticated)/note/[noteId]/note-viewer.tsx
"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { NoteViewerHeader } from "@/components/notes/note-viewer-header";
import { NoteTabs } from "@/components/notes/note-tabs";
import { PointSpendingDialog } from "@/components/notes/point-spending-dialog";
import type { Note, NoteFile, ViewerFile } from "@/types/notes";

const toViewerFile = (file: NoteFile): ViewerFile | null => {
  if (!file.url) return null;
  return {
    key: file.key,
    url: file.url,
    size: file.size,
  };
};

export interface NoteViewerProps {
  note: Note;
}

export const NoteViewer: React.FC<NoteViewerProps> = ({ note }) => {
  const router = useRouter();
  const [showPointDialog, setShowPointDialog] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [activeFile, setActiveFile] = useState<ViewerFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isRating, setIsRating] = useState(false);
  const initialDataFetched = useRef(false);

  // Set initial active file when note data is available
  useEffect(() => {
    if (note?.files?.length > 0) {
      const firstFile = note.files[0];
      const viewerFile = toViewerFile(firstFile);
      if (viewerFile) {
        setActiveFile(viewerFile);
      }
    }
  }, [note?.files]);

  // Fetch initial data
  useEffect(() => {
    async function fetchInitialData() {
      if (initialDataFetched.current) return;

      try {
        setIsLoading(true);
        const [pointsRes, accessRes, ratingRes] = await Promise.all([
          fetch("/api/points"),
          fetch(`/api/notes/${note.id}/access`),
          fetch(`/api/notes/${note.id}/rate`),
        ]);

        if (!pointsRes.ok || !accessRes.ok || !ratingRes.ok) {
          throw new Error("Failed to fetch initial data");
        }

        const [pointsData, accessData, ratingData] = await Promise.all([
          pointsRes.json(),
          accessRes.json(),
          ratingRes.json(),
        ]);

        setUserPoints(pointsData.points);
        setHasViewed(accessData.hasAccess);
        setIsAuthor(accessData.isAuthor);
        setUserRating(ratingData.rating);

        if (!accessData.hasAccess && !accessData.isAuthor) {
          setShowPointDialog(true);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Errore nel caricamento dei dati");
      } finally {
        setIsLoading(false);
        initialDataFetched.current = true;
      }
    }

    if (note?.id) {
      fetchInitialData();
    }
  }, [note?.id]);

  const handlePointSpending = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "view",
          noteId: note.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to spend point");
      }

      const pointsRes = await fetch("/api/points");
      const pointsData = await pointsRes.json();

      setShowPointDialog(false);
      setHasViewed(true);
      setUserPoints(pointsData.points);
      toast.success("Appunto sbloccato con successo!");
    } catch (error) {
      console.error("Error spending point:", error);
      toast.error("Errore nell'acquisto dell'appunto");
      setTimeout(() => router.push("/"), 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (isRating) return;

    try {
      setIsRating(true);
      const res = await fetch(`/api/notes/${note.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit rating");
      }

      setUserRating(rating);
      toast.success("Valutazione salvata con successo!");
      router.refresh();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Errore nel salvataggio della valutazione");
    } finally {
      setIsRating(false);
    }
  };

  const handleFileChange = useCallback((file: NoteFile) => {
    const viewerFile = toViewerFile(file);
    if (viewerFile) {
      setActiveFile(viewerFile);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla home
        </Link>

        <Card className="border-0 shadow-sm">
          <NoteViewerHeader
            note={note}
            isAuthor={isAuthor}
            hasViewed={hasViewed}
            userPoints={userPoints}
            userRating={userRating}
            isRating={isRating}
            onRating={handleRating}
          />

          <NoteTabs
            note={note}
            hasViewed={hasViewed}
            isAuthor={isAuthor}
            onRequestAccess={() => setShowPointDialog(true)}
            activeFile={activeFile}
            onFileChange={handleFileChange}
          />
        </Card>

        <PointSpendingDialog
          isOpen={showPointDialog}
          onConfirm={handlePointSpending}
          onCancel={() => router.push("/")}
          currentPoints={userPoints}
        />
      </div>
    </div>
  );
};
