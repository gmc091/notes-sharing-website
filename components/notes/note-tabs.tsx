// components/notes/note-tabs.tsx
import React from "react";
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FileViewer } from "./file-viewer";
import { FileList } from "./file-list";
import { ViewerFile, NoteFile, Note, toViewerFile } from "@/types/notes";
import { getCleanFileName } from "@/lib/file-utils";

interface NoteTabsProps {
  note: Note;
  hasViewed: boolean;
  isAuthor: boolean;
  onRequestAccess: () => void;
  activeFile: ViewerFile | null;
  onFileChange: (file: ViewerFile) => void;
}

export const NoteTabs: React.FC<NoteTabsProps> = ({
  note,
  hasViewed,
  isAuthor,
  onRequestAccess,
  activeFile,
  onFileChange,
}) => {
  const [activeTab, setActiveTab] = React.useState("viewer");
  const isBlurred = !hasViewed && !isAuthor;

  const handleViewFile = (file: NoteFile) => {
    if (!hasViewed && !isAuthor) {
      onRequestAccess();
      return;
    }
    if (file.url) {
      onFileChange(toViewerFile(file));
    }
    setActiveTab("viewer");
  };

  const handleDownload = async (file: NoteFile) => {
    if (!hasViewed && !isAuthor) {
      onRequestAccess();
      return;
    }

    if (!file.url) {
      toast.error("URL del file non disponibile");
      return;
    }

    try {
      const response = await fetch(file.url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name || getCleanFileName(file.key);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Download completato");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Errore nel download del file");
    }
  };

  return (
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
            "border rounded-lg h-[600px] overflow-hidden",
            isBlurred && "blur-sm"
          )}
        >
          <FileViewer file={activeFile} />
        </TabsContent>

        <TabsContent value="list" className={cn(isBlurred && "blur-sm")}>
          <FileList
            files={note.files}
            onViewFile={handleViewFile}
            onDownload={handleDownload}
          />
        </TabsContent>
      </Tabs>
    </CardContent>
  );
};
