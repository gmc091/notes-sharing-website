// components/notes/file-list.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, FileDown } from "lucide-react";
import {
  getFileTypeInfo,
  getCleanFileName,
  getFileExtension,
} from "@/lib/file-utils";
import type { NoteFile } from "@/types/notes";
import { cn } from "@/lib/utils";

interface FileListProps {
  files: NoteFile[];
  onViewFile: (file: NoteFile) => void;
  onDownload: (file: NoteFile) => Promise<void>;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onViewFile,
  onDownload,
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
            const fileName = file.name || getCleanFileName(file.key);
            const fileType = getFileExtension(file.key);
            const {
              icon: FileTypeIcon,
              color,
              variant,
            } = getFileTypeInfo(fileName);

            return (
              <TableRow key={file.key}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 bg-gray-50 rounded-lg", color)}>
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
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizza
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(file)}
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
