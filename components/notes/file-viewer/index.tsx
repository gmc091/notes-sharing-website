// components/notes/file-viewer/index.tsx
import React from "react";
import { FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFViewer } from "./pdf-viewer";
import { ImageViewer } from "./image-viewer";
import { OfficeViewer } from "./office-viewer";
import { fileTypeChecks, getCleanFileName } from "@/lib/file-utils";
import type { ViewerFile } from "@/types/notes";

interface FileViewerProps {
  file: ViewerFile | null;
}

export const FileViewer: React.FC<FileViewerProps> = ({ file }) => {
  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <FileIcon className="h-8 w-8 text-primary/40" />
          </div>
          <h3 className="text-lg font-medium mb-2">Seleziona un file</h3>
          <p className="text-sm text-muted-foreground">
            Scegli un file dalla lista per visualizzarlo qui
          </p>
        </div>
      </div>
    );
  }

  const fileName = getCleanFileName(file.key);

  if (fileTypeChecks.isPDF(file.key)) {
    return <PDFViewer file={file} fileName={fileName} />;
  }

  if (fileTypeChecks.isPreviewableImage(file.key)) {
    return <ImageViewer file={file} fileName={fileName} />;
  }

  if (fileTypeChecks.isOfficeFile(file.key)) {
    return <OfficeViewer file={file} fileName={fileName} />;
  }

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
