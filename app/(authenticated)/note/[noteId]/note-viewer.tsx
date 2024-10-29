// app/(authenticated)/note/[noteId]/note-viewer.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { NoteViewerHeader } from "@/components/notes/note-viewer-header";
import { NoteTabs } from "@/components/notes/note-tabs";
import { PurchaseDialog } from "@/components/notes/purchase-dialog";
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

export function NoteViewer({ note }: NoteViewerProps) {
  const router = useRouter();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [isPurchased, setIsPurchased] = useState(note.isPurchased || false);
  const [isAuthor] = useState(note.isAuthor || false);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [activeFile, setActiveFile] = useState<ViewerFile | null>(null);

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

  // Fetch user points
  useEffect(() => {
    async function fetchUserPoints() {
      try {
        const pointsRes = await fetch("/api/v1/users/me/points");
        if (!pointsRes.ok) {
          throw new Error("Failed to fetch user points");
        }
        const pointsData = await pointsRes.json();
        setUserPoints(pointsData.points);

        if (!isPurchased && !isAuthor) {
          setShowPurchaseDialog(true);
        }
      } catch (error) {
        console.error("Error fetching user points:", error);
        toast.error("Errore nel caricamento dei punti utente");
      }
    }

    fetchUserPoints();
  }, [isPurchased, isAuthor]);

  const handlePurchase = async () => {
    try {
      const res = await fetch("/api/v1/users/me/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PURCHASE",
          noteId: note.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to purchase note");
      }

      const pointsRes = await fetch("/api/v1/users/me/points");
      const pointsData = await pointsRes.json();

      setShowPurchaseDialog(false);
      setIsPurchased(true);
      setUserPoints(pointsData.points);
      toast.success("Nota acquistata con successo!");
    } catch (error) {
      console.error("Error purchasing note:", error);
      toast.error("Errore nell'acquisto della nota");
      setTimeout(() => router.push("/"), 0);
    }
  };

  const handleFileChange = useCallback((file: NoteFile) => {
    const viewerFile = toViewerFile(file);
    if (viewerFile) {
      setActiveFile(viewerFile);
    }
  }, []);

  const handleRequestAccess = useCallback(() => {
    if (!isPurchased && !isAuthor) {
      setShowPurchaseDialog(true);
    }
  }, [isPurchased, isAuthor]);

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
            isPurchased={isPurchased}
          />

          <NoteTabs
            note={note}
            isPurchased={isPurchased}
            isAuthor={isAuthor}
            onRequestAccess={handleRequestAccess}
            activeFile={activeFile}
            onFileChange={handleFileChange}
          />
        </Card>

        <PurchaseDialog
          isOpen={showPurchaseDialog}
          onConfirm={handlePurchase}
          onCancel={() => router.push("/")}
          currentPoints={userPoints}
        />
      </div>
    </div>
  );
}
