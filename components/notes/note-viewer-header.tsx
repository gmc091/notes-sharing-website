// components/notes/note-viewer-header.tsx
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Coins, Loader2 } from "lucide-react";
import type { Note } from "@/types/notes";
import { RatingStats } from "./rating-stats";
import { RatingControl } from "./rating-control";

interface NoteViewerHeaderProps {
  note: Note;
  isAuthor: boolean;
  hasViewed: boolean;
  userPoints: number | null;
  userRating: number | null;
  isRating: boolean;
  onRating: (rating: number) => void;
}

export const NoteViewerHeader: React.FC<NoteViewerHeaderProps> = ({
  note,
  isAuthor,
  hasViewed,
  userPoints,
  userRating,
  isRating,
  onRating,
}) => (
  <CardHeader className="space-y-4">
    {/* Header content from original file */}
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <CardTitle className="text-2xl font-bold">{note.title}</CardTitle>
          {isAuthor && <Badge variant="secondary">Il tuo appunto</Badge>}
        </div>
        <CardDescription className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          Caricato il{" "}
          {new Date(note.createdAt).toLocaleDateString("it-IT", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </CardDescription>
      </div>
      {/* Points and file count badges */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Coins className="h-3.5 w-3.5" />
          <span>{userPoints} punti</span>
        </Badge>
        <Badge variant="secondary" className="text-sm">
          {note.files.length} {note.files.length === 1 ? "file" : "files"}
        </Badge>
      </div>
    </div>

    {/* Rating section */}
    {!isAuthor && hasViewed && (
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4">
        <RatingStats rating={note.rating} count={note.ratingCount} />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">
            {userRating ? "Il tuo voto:" : "Vota questo appunto:"}
          </span>
          <RatingControl
            value={userRating || 0}
            onChange={onRating}
            disabled={isRating}
            className="scale-90"
          />
          {isRating && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </div>
    )}

    {/* Categories */}
    <div className="flex flex-col gap-2 border-t pt-4">
      {/* Schools */}
      {note.schools.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Scuole:</span>
          {note.schools.map((school) => (
            <Badge key={school} variant="school">
              {school}
            </Badge>
          ))}
        </div>
      )}

      {/* Subjects */}
      {note.subjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Materie:</span>
          {note.subjects.map((subject) => (
            <Badge key={subject} variant="subject">
              {subject}
            </Badge>
          ))}
        </div>
      )}

      {/* Years */}
      {note.years.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Anni:</span>
          {note.years.map((year) => (
            <Badge key={year} variant="year">
              Anno {year}
            </Badge>
          ))}
        </div>
      )}
    </div>
  </CardHeader>
);
