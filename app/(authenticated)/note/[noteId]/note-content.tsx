"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  FileIcon,
  Info,
  ArrowLeft,
  FileDown,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  FileCode,
  FileVideo,
  FileAudio,
  File,
  type LucideIcon,
  Loader2,
  Coins,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { BadgeProps } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Types
interface File {
  key: string;
  url: string;
  size?: number;
}

interface Note {
  id: number;
  title: string;
  schools: string[];
  subjects: string[];
  years: number[];
  files: File[];
  createdAt: string;
}

interface PointSpendingDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

interface RatingDialogProps {
  isOpen: boolean;
  onRate: (rating: number) => void;
  onCancel: () => void;
}

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

type FileTypeInfo = {
  icon: LucideIcon;
  color: string;
  variant: BadgeVariant;
};

// Utility functions
const getCleanFileName = (filePath: string): string => {
  const nameWithExt = filePath.split("/").pop() || filePath;
  return decodeURIComponent(nameWithExt);
};

const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

const fileTypeChecks = {
  isOfficeFile: (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext);
  },

  isPreviewableImage: (filename: string): boolean => {
    const ext = getFileExtension(filename);
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  },

  isPDF: (filename: string): boolean => {
    return getFileExtension(filename) === "pdf";
  },
};

// File type configuration map
const fileTypeConfig = new Map<string, FileTypeInfo>([
  ["pdf", { icon: FileText, color: "text-red-500", variant: "pdf" }],
  ["doc", { icon: FileText, color: "text-blue-500", variant: "document" }],
  ["docx", { icon: FileText, color: "text-blue-500", variant: "document" }],
  ["txt", { icon: FileText, color: "text-gray-500", variant: "document" }],
  [
    "xls",
    { icon: FileSpreadsheet, color: "text-green-500", variant: "spreadsheet" },
  ],
  [
    "xlsx",
    { icon: FileSpreadsheet, color: "text-green-500", variant: "spreadsheet" },
  ],
  ["jpg", { icon: ImageIcon, color: "text-purple-500", variant: "image" }],
  ["jpeg", { icon: ImageIcon, color: "text-purple-500", variant: "image" }],
  ["png", { icon: ImageIcon, color: "text-purple-500", variant: "image" }],
  ["gif", { icon: ImageIcon, color: "text-purple-500", variant: "image" }],
  ["webp", { icon: ImageIcon, color: "text-purple-500", variant: "image" }],
  ["json", { icon: FileCode, color: "text-yellow-500", variant: "code" }],
  ["js", { icon: FileCode, color: "text-yellow-500", variant: "code" }],
  ["css", { icon: FileCode, color: "text-yellow-500", variant: "code" }],
  ["html", { icon: FileCode, color: "text-yellow-500", variant: "code" }],
  ["mp4", { icon: FileVideo, color: "text-pink-500", variant: "media" }],
  ["mp3", { icon: FileAudio, color: "text-pink-500", variant: "media" }],
]);

const getFileTypeInfo = (filename: string): FileTypeInfo => {
  const ext = getFileExtension(filename);
  return (
    fileTypeConfig.get(ext) || {
      icon: File,
      color: "text-gray-500",
      variant: "secondary",
    }
  );
};

// Components

const PointSpendingDialog: React.FC<PointSpendingDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => (
  <Dialog open={isOpen} onOpenChange={() => onCancel()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Conferma visualizzazione</DialogTitle>
        <DialogDescription>
          Vuoi spendere 1 punto per visualizzare questo appunto?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button onClick={onConfirm}>
          <Coins className="mr-2 h-4 w-4" /> Spendi 1 punto
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const RatingDialog: React.FC<RatingDialogProps> = ({
  isOpen,
  onRate,
  onCancel,
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(0);

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent>
        <AlertDialogHeader>
          <DialogTitle>Valuta questo appunto</DialogTitle>
          <DialogDescription>
            La tua valutazione aiuta gli altri studenti a trovare contenuti di
            qualità
          </DialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center py-4">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              className="p-1"
              onClick={() => setSelectedRating(rating)}
            >
              <Star
                className={`h-8 w-8 ${
                  rating <= selectedRating
                    ? "text-yellow-500 fill-current"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        <AlertDialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button
            onClick={() => onRate(selectedRating)}
            disabled={selectedRating === 0}
          >
            Conferma valutazione
          </Button>
        </AlertDialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ImageViewer = ({ file, fileName }: { file: File; fileName: string }) => {
  const [scale, setScale] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoom = useCallback((delta: number) => {
    setScale((prev) => Math.max(0.5, Math.min(2.0, prev + delta)));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b bg-white">
        <span className="font-medium">{fileName}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleZoom(-0.1)}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleZoom(0.1)}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        className="flex-1 bg-gray-100 p-4 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div
            className="cursor-move"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? "none" : "transform 0.2s ease-out",
            }}
            onMouseDown={handleMouseDown}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file.url}
              alt={fileName}
              className="max-w-full max-h-[70vh] object-contain select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const PDFViewer = ({ file, fileName }: { file: File; fileName: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const googleViewerUrl = useMemo(
    () =>
      `https://docs.google.com/viewer?url=${encodeURIComponent(
        file.url
      )}&embedded=true`,
    [file.url]
  );

  useEffect(() => {
    setIsLoading(true);

    const checkIframeLoaded = () => {
      if (iframeRef.current) {
        try {
          const iframeDoc =
            iframeRef.current.contentDocument ||
            iframeRef.current.contentWindow?.document;

          // Add proper type checking
          if (
            iframeDoc &&
            iframeDoc.body &&
            iframeDoc.body.innerHTML &&
            iframeDoc.body.innerHTML.length > 0
          ) {
            setIsLoading(false);
          }
        } catch (e) {
          // Cross-origin errors will be caught here
          console.error(e);
          setTimeout(() => setIsLoading(false), 2000);
        }
      }
    };

    const interval = setInterval(checkIframeLoaded, 500);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsLoading(false);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [file.url]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b bg-white">
        <span className="font-medium">{fileName}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(file.url, "_blank")}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>
      <div className="flex-1 bg-gray-100 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="space-y-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Caricamento del documento...
              </p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={googleViewerUrl}
          className="w-full h-full border-0"
          title={fileName}
          onLoad={() => {
            setTimeout(() => setIsLoading(false), 1000);
          }}
        />
      </div>
    </div>
  );
};
const FileViewer = ({ file }: { file: File }) => {
  const fileName = useMemo(() => getCleanFileName(file.key), [file.key]);

  if (fileTypeChecks.isPDF(file.key)) {
    return <PDFViewer file={file} fileName={fileName} />;
  }

  if (fileTypeChecks.isPreviewableImage(file.key)) {
    return <ImageViewer file={file} fileName={fileName} />;
  }

  if (fileTypeChecks.isOfficeFile(file.key)) {
    const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      file.url
    )}`;
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b bg-white">
          <span className="font-medium">{fileName}</span>
        </div>
        <div className="flex-1 bg-gray-100">
          <iframe
            src={viewerUrl}
            className="w-full h-full border-0"
            title={fileName}
          />
        </div>
      </div>
    );
  }

  // Fallback for non-previewable files
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-100">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
          <FileIcon className="h-8 w-8 text-primary/40" />
        </div>
        <h3 className="text-lg font-medium mb-2">{fileName}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Questo tipo di file non può essere visualizzato nel browser
        </p>
        <Button onClick={() => window.open(file.url, "_blank")}>
          Apri in una nuova scheda
        </Button>
      </div>
    </div>
  );
};

const FileList = ({
  files,
  onViewFile,
  onDownload,
}: {
  files: File[];
  onViewFile: (file: File) => void;
  onDownload: (file: File) => void;
}) => {
  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50%]">File</TableHead>
            <TableHead className="w-[20%]">Tipo</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => {
            const fileName = getCleanFileName(file.key);
            const fileType = getFileExtension(file.key);
            const {
              icon: FileTypeIcon,
              color,
              variant,
            } = getFileTypeInfo(fileName);

            return (
              <TableRow key={file.key} className="group">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors ${color}`}
                    >
                      <FileTypeIcon className="h-4 w-4" />
                    </div>
                    <span className="truncate">{fileName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={variant} className="uppercase">
                    {fileType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewFile(file)}
                      className="hover:text-primary hover:border-primary transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizza
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(file)}
                      className="hover:text-primary hover:border-primary transition-colors"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Scarica
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export const NoteViewer: React.FC<{ note: Note; isPreview: boolean }> = ({
  note,
  isPreview,
}) => {
  const router = useRouter();
  const [showPointDialog, setShowPointDialog] = useState(!isPreview);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [activeFile, setActiveFile] = useState(note.files[0]);
  const [activeTab, setActiveTab] = useState("viewer");

  // Fetch user points and view status on component mount
  React.useEffect(() => {
    async function fetchData() {
      try {
        const [pointsRes, viewStatusRes] = await Promise.all([
          fetch("/api/points"),
          fetch(`/api/points`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "checkView",
              noteId: note.id,
            }),
          }),
        ]);

        const [pointsData, viewStatusData] = await Promise.all([
          pointsRes.json(),
          viewStatusRes.json(),
        ]);

        setUserPoints(pointsData.points);
        setHasViewed(viewStatusData.hasViewed);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    if (!isPreview) {
      fetchData();
    }
  }, [isPreview, note.id]);

  const handlePointSpending = async () => {
    try {
      const res = await fetch("/api/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "view",
          noteId: note.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to spend point");

      setShowPointDialog(false);
      setHasViewed(true);
      // Refresh points
      const pointsRes = await fetch("/api/points");
      const pointsData = await pointsRes.json();
      setUserPoints(pointsData.points);
    } catch (error) {
      console.error("Error spending point:", error);
      // TODO: Add toast notification for error
      router.push("/");
    }
  };

  const handleRating = async (rating: number) => {
    try {
      const res = await fetch("/api/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rate",
          noteId: note.id,
          rating,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit rating");

      setShowRatingDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Error submitting rating:", error);
      // TODO: Add toast notification for error
    }
  };

  const downloadFile = useCallback(
    async (file: File) => {
      if (!hasViewed && !isPreview) {
        setShowPointDialog(true);
        return;
      }

      try {
        const response = await fetch(file.url);
        if (!response.ok) throw new Error("Download failed");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = getCleanFileName(file.key);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    },
    [hasViewed, isPreview]
  );

  const handleViewFile = useCallback(
    (file: File) => {
      if (!hasViewed && !isPreview) {
        setShowPointDialog(true);
        return;
      }
      setActiveFile(file);
      setActiveTab("viewer");
    },
    [hasViewed, isPreview]
  );

  // Show blurred content if not preview and point not spent
  const isBlurred = !isPreview && !hasViewed;

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla home
        </Link>

        <Card className="border-0 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold">
                  {note.title}
                </CardTitle>
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
                {!isPreview && (
                  <Badge variant="secondary" className="gap-1">
                    <Coins className="h-3.5 w-3.5" />
                    <span>{userPoints} punti</span>
                  </Badge>
                )}
                <Badge variant="secondary" className="text-sm">
                  {note.files.length}{" "}
                  {note.files.length === 1 ? "file" : "files"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
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

              {note.subjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">
                    Materie:
                  </span>
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
                    <Badge key={year} variant="year">
                      Anno {year}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="viewer">Visualizzatore</TabsTrigger>
                <TabsTrigger value="list">Lista file</TabsTrigger>
              </TabsList>

              <TabsContent
                value="viewer"
                className={cn(
                  "border rounded-lg h-[600px]",
                  isBlurred && "blur-sm"
                )}
              >
                <FileViewer file={activeFile} />
              </TabsContent>

              <TabsContent value="list" className={cn(isBlurred && "blur-sm")}>
                <FileList
                  files={note.files}
                  onViewFile={handleViewFile}
                  onDownload={downloadFile}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Point spending dialog */}
        <PointSpendingDialog
          isOpen={showPointDialog}
          onConfirm={handlePointSpending}
          onCancel={() => router.push("/")}
        />

        {/* Rating dialog */}
        <RatingDialog
          isOpen={showRatingDialog}
          onRate={handleRating}
          onCancel={() => setShowRatingDialog(false)}
        />

        {/* Rating button - only show if user has viewed the note */}
        {hasViewed && !isPreview && (
          <Button
            onClick={() => setShowRatingDialog(true)}
            className="fixed bottom-4 right-4"
            variant="secondary"
          >
            <Star className="mr-2 h-4 w-4" /> Valuta
          </Button>
        )}

        {/* Preview mode banner */}
        {isPreview && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Stai visualizzando l&apos;anteprima. Per accedere a tutti i file
                spendi 1 punto.
              </p>
              <Button
                onClick={() => router.push(`/note/${note.id}`)}
                className="ml-4"
              >
                <Coins className="mr-2 h-4 w-4" />
                Sblocca ({userPoints} punti disponibili)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
