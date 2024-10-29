import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import type { Note } from "@/types/notes";
import PointsDisplay from "@/components/points-display";

interface NoteViewerHeaderProps {
  note: Note;
  isAuthor: boolean;
  isPurchased: boolean;
}

export const NoteViewerHeader: React.FC<NoteViewerHeaderProps> = ({
  note,
  isAuthor,
  isPurchased,
}) => (
  <CardHeader className="space-y-4">
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <CardTitle className="text-2xl font-bold">{note.title}</CardTitle>
          {isAuthor && <Badge variant="secondary">Il tuo appunto</Badge>}
          {isPurchased && !isAuthor && (
            <Badge variant="secondary">Acquistato</Badge>
          )}
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
      <div className="flex items-center gap-2">
        <PointsDisplay
          variant="badge"
          showTooltip={true}
          className="bg-primary/5"
        />
        <Badge variant="secondary" className="text-sm">
          {note.files.length} {note.files.length === 1 ? "file" : "files"}
        </Badge>
      </div>
    </div>

    <div className="flex flex-col gap-2 border-t pt-4">
      {note.schools.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Scuole:</span>
          {note.schools.map((school) => (
            <Badge key={school} variant="outline">
              {school}
            </Badge>
          ))}
        </div>
      )}

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

      {note.years.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Anni:</span>
          {note.years.map((year) => (
            <Badge key={year} variant="secondary">
              Anno {year}
            </Badge>
          ))}
        </div>
      )}
    </div>
  </CardHeader>
);
