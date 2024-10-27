// components/notes/file-viewer/office-viewer.tsx
import React from "react";
import { ViewerFile } from "@/types/notes";

interface OfficeViewerProps {
  file: ViewerFile;
  fileName: string;
}

export const OfficeViewer: React.FC<OfficeViewerProps> = ({
  file,
  fileName,
}) => {
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
};
