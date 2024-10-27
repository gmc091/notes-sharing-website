import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ScrollText,
  Calendar,
  ChevronRight,
  FileText,
  Clock,
  Star,
  Eye,
  Coins,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDisplayFilename } from "@/lib/file-utils";
import type { Note } from "@/types/notes";

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  // Get file extensions for badge display
  const fileTypes = Array.from(
    new Set(
      note.files.map((file) => {
        const extension = file.name.split(".").pop()?.toLowerCase() || "";
        return extension;
      })
    )
  );

  // Format date in a locale-friendly way
  const formattedDate = new Date(note.createdAt).toLocaleDateString("it-IT", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Format time
  const formattedTime = new Date(note.createdAt).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Format rating
  const rating = note.rating || 0;
  const formattedRating = rating.toFixed(1);
  const ratingColor = rating >= 4 ? "text-yellow-500" : "text-muted-foreground";

  return (
    <Card className="group flex flex-col h-full transition-all duration-300 bg-card hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border">
      <CardHeader className="space-y-3 pb-3">
        <div className="space-y-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 text-primary">
            {note.title}
          </CardTitle>
          <CardDescription className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <time dateTime={note.createdAt} className="text-muted-foreground">
                {formattedTime}
              </time>
            </div>
            <Separator orientation="vertical" className="h-3" />
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={note.createdAt} className="text-muted-foreground">
                {formattedDate}
              </time>
            </div>
          </CardDescription>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Views */}
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{note.viewCount}</span>
              </TooltipTrigger>
              <TooltipContent>
                {note.viewCount}{" "}
                {note.viewCount === 1 ? "visualizzazione" : "visualizzazioni"}
              </TooltipContent>
            </Tooltip>

            {/* Rating */}
            {note.ratingCount > 0 && (
              <Tooltip>
                <TooltipTrigger className="flex items-center gap-1 text-sm">
                  <Star
                    className={`h-4 w-4 ${ratingColor}`}
                    fill="currentColor"
                  />
                  <span className={ratingColor}>{formattedRating}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({note.ratingCount})
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {formattedRating} su 5 stelle
                  <br />
                  {note.ratingCount}{" "}
                  {note.ratingCount === 1 ? "recensione" : "recensioni"}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Access Status Indicator */}
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant={note.hasViewed ? "secondary" : "outline"}
                className="gap-1"
              >
                {note.hasViewed ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Disponibile</span>
                  </>
                ) : (
                  <>
                    <Coins className="h-3 w-3" />
                    <span>1 punto</span>
                  </>
                )}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {note.hasViewed
                ? "Hai già accesso a questo appunto"
                : "Costa 1 punto visualizzare questo appunto"}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-3">
        {/* File Count and Types */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ScrollText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {note.files.length} {note.files.length === 1 ? "file" : "files"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {fileTypes.map((type) => (
              <Badge
                key={type}
                variant="secondary"
                className="uppercase text-[10px] font-semibold px-2 py-0 bg-secondary/50"
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* File Preview List */}
        <div className="space-y-3">
          {note.files.slice(0, 2).map((file, index) => (
            <div key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm group/file">
                    <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover/file:text-primary transition-colors" />
                    <span className="truncate text-muted-foreground group-hover/file:text-primary transition-colors">
                      {getDisplayFilename(file.name, 30)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-[300px] bg-popover/95 px-3 py-1.5"
                >
                  <p className="text-xs">{file.name}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
          {note.files.length > 2 && (
            <p className="text-sm text-muted-foreground/80 italic pl-6">
              +{note.files.length - 2} more files...
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          asChild
          variant="default"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
        >
          <Link
            href={`/note/${note.id}`}
            className="flex items-center justify-center gap-2"
          >
            {note.hasViewed ? (
              <>
                <span className="font-medium">Apri appunto</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            ) : (
              <>
                <span className="font-medium">Visualizza</span>
                <Coins className="h-4 w-4" />
              </>
            )}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NoteCard;
