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
import { usePoints } from "@/stores/points-store";
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
  const [activeFile, setActiveFile] = useState<ViewerFile | null>(null);

  const { spendPoints, earnPoints } = usePoints();

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

  // Show purchase dialog if needed
  useEffect(() => {
    if (!isPurchased && !isAuthor) {
      setShowPurchaseDialog(true);
    }
  }, [isPurchased, isAuthor]);

  const handlePurchase = async () => {
    try {
      const spendSuccess = await spendPoints(
        1,
        "PURCHASE_SPENT",
        `Acquisto nota #${note.id}`
      );

      if (!spendSuccess) {
        throw new Error("Failed to spend points");
      }

      // If note has an author (not anonymous), award them a point
      if (note.userId) {
        await earnPoints(
          1,
          "PURCHASE_EARNED",
          `La nota #${note.id} è stata acquistata`
        );
      }
      // Update purchase status in database
      const purchaseRes = await fetch(`/api/v1/notes/${note.id}/purchase`, {
        method: "POST",
      });

      if (!purchaseRes.ok) {
        throw new Error("Failed to record purchase");
      }

      setShowPurchaseDialog(false);
      setIsPurchased(true);
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
        />
      </div>
    </div>
  );
}
