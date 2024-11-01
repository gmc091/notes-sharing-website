import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ScrollText,
  Calendar,
  ChevronRight,
  FileText,
  Eye,
  Coins,
  User,
  ChevronDown,
  ChevronUp,
  BookOpen,
  GraduationCap,
  School,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Note } from "@/types/notes";

interface NoteCardProps {
  note: Note;
}

const MAX_DESCRIPTION_LENGTH = 150;
const MOBILE_TAG_LIMIT = 2;
const DESKTOP_TAG_LIMIT = 3;

export default function NoteCard({ note }: NoteCardProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const hasAccess = note.isPurchased || note.isAuthor;
  const description = note.description?.trim() || "";
  const hasDescription = description.length > 0;
  const shouldTruncate =
    hasDescription && description.length > MAX_DESCRIPTION_LENGTH;
  const truncatedDescription = shouldTruncate
    ? description.slice(0, MAX_DESCRIPTION_LENGTH) + "..."
    : description;

  const formattedDate = new Date(note.createdAt).toLocaleDateString("it-IT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fileTypes = Array.from(
    new Set(note.files.map((file) => file.name.split(".").pop()?.toLowerCase()))
  ).filter(Boolean);

  const renderTags = (
    items: string[],
    variant: "outline" | "secondary" = "outline",
    prefix?: string
  ) => {
    const limit = isMobile ? MOBILE_TAG_LIMIT : DESKTOP_TAG_LIMIT;
    const visibleTags = items.slice(0, limit);
    const remainingCount = items.length - limit;

    return (
      <div className="flex flex-wrap gap-1.5">
        {visibleTags.map((item) => (
          <Badge key={item} variant={variant} className="text-xs bg-white/50">
            {prefix ? `${prefix}${item}` : item}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={variant}
                className="text-xs bg-white/50 cursor-help"
              >
                +{remainingCount} altri
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="p-2">
              <div className="flex flex-col gap-1">
                {items.slice(limit).map((item) => (
                  <span key={item} className="text-xs">
                    {prefix ? `${prefix}${item}` : item}
                  </span>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  };

  const renderAccessBadge = () => {
    if (note.isAuthor) {
      return (
        <Badge variant="default" className="shrink-0">
          <Shield className="h-3.5 w-3.5 mr-1" />
          Proprietario
        </Badge>
      );
    }

    if (note.isPurchased) {
      return (
        <Badge variant="secondary" className="shrink-0">
          <Shield className="h-3.5 w-3.5 mr-1" />
          Accesso acquistato
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="shrink-0">
        <Coins className="h-3.5 w-3.5 mr-1" />1 punto
      </Badge>
    );
  };

  return (
    <Card className="group h-[32rem] flex flex-col transition-all duration-300 hover:shadow-lg border bg-white/50 backdrop-blur-sm">
      {/* Header Section */}
      <CardHeader className="p-5 space-y-4">
        {/* Title and Access Badge */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-lg text-primary leading-tight line-clamp-2">
            {note.title}
          </h3>
          {renderAccessBadge()}
        </div>

        <Separator />

        {/* Meta Information */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="truncate">
              {note.isAnonymous ? "Anonimo" : note.authorUsername || "Utente"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{note.purchaseCount} visualizzazioni</span>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ScrollText className="h-4 w-4" />
            <span>{note.files.length} files</span>
          </div>
        </div>
      </CardHeader>

      {/* Main Content */}
      <CardContent className="px-5 flex-grow space-y-4 overflow-hidden">
        {/* Description Section */}
        {hasDescription && (
          <div className="space-y-2">
            <p
              className={cn(
                "text-sm text-muted-foreground leading-relaxed",
                !isDescriptionExpanded && "line-clamp-3"
              )}
            >
              {isDescriptionExpanded ? description : truncatedDescription}
            </p>
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="h-6 px-2 text-xs hover:bg-transparent hover:underline"
              >
                {isDescriptionExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Mostra meno
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Continua a leggere
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        <Separator />

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-3">
          {/* Schools */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <School className="h-3.5 w-3.5" />
              <span>Scuola</span>
            </div>
            {renderTags(note.schools, "outline")}
          </div>

          {/* Subjects */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Materie</span>
            </div>
            {renderTags(note.subjects, "outline")}
          </div>

          {/* Years */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Anno</span>
            </div>
            {renderTags(note.years.map(String), "outline", "Anno ")}
          </div>
        </div>

        <Separator />

        {/* Files Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Formato file</span>
            <div className="flex gap-1.5">
              {fileTypes.map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="uppercase text-[10px] font-semibold px-1.5 py-0 bg-white/50"
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* File List */}
          <div className="space-y-1.5">
            {note.files.slice(0, 2).map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm group/file"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="truncate text-muted-foreground">
                  {file.name}
                </span>
              </div>
            ))}
            {note.files.length > 2 && (
              <p className="text-sm text-muted-foreground/80 italic pl-6">
                +{note.files.length - 2} altri files...
              </p>
            )}
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-5">
        <Button
          asChild
          variant="default"
          className="w-full transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
        >
          <Link
            href={`/note/${note.id}`}
            className="flex items-center justify-center gap-2"
          >
            {hasAccess ? (
              <>
                <span className="font-medium">Apri appunto</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            ) : (
              <>
                <span className="font-medium">Acquista</span>
                <Coins className="h-4 w-4" />
              </>
            )}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
