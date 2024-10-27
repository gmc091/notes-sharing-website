// components/notes/file-viewer/pdf-viewer.tsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { ViewerFile } from "@/types/notes";

interface PDFViewerProps {
  file: ViewerFile;
  fileName: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ file, fileName }) => {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    file.url
  )}&embedded=true`;

  useEffect(() => {
    setIsLoading(true);

    const checkIframeLoaded = () => {
      if (iframeRef.current) {
        try {
          const iframeDoc =
            iframeRef.current.contentDocument ||
            iframeRef.current.contentWindow?.document;

          if (
            iframeDoc &&
            iframeDoc.body &&
            iframeDoc.body.innerHTML &&
            iframeDoc.body.innerHTML.length > 0
          ) {
            setIsLoading(false);
          }
        } catch (e) {
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
