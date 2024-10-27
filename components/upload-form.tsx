"use client";

import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  X,
  File as FileIcon,
  Upload,
  CheckCircle2,
  ImageIcon,
  BookText as FilePdf,
  AlertCircle,
  FileText,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

const schoolTypes = [
  {
    name: "Liceo scientifico",
    subjects: [
      "Latino",
      "Matematica",
      "Scienze",
      "Fisica",
      "Italiano",
      "Storia",
      "Filosofia",
      "Inglese",
    ],
  },
  {
    name: "Liceo classico",
    subjects: [
      "Latino",
      "Greco",
      "Italiano",
      "Storia",
      "Filosofia",
      "Matematica",
      "Scienze",
      "Inglese",
    ],
  },
  {
    name: "Liceo linguistico",
    subjects: [
      "Italiano",
      "Inglese",
      "Francese",
      "Tedesco",
      "Spagnolo",
      "Storia",
      "Filosofia",
      "Matematica",
    ],
  },
  {
    name: "Scienze umane",
    subjects: [
      "Italiano",
      "Storia",
      "Filosofia",
      "Scienze umane",
      "Diritto",
      "Economia",
      "Matematica",
      "Inglese",
    ],
  },
];

const years = [
  { label: "Primo anno", value: "1" },
  { label: "Secondo anno", value: "2" },
  { label: "Terzo anno", value: "3" },
  { label: "Quarto anno", value: "4" },
  { label: "Quinto anno", value: "5" },
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

interface FileWithPreview extends File {
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: "pending" | "uploading" | "completed" | "error";
}

interface ComboboxSelectProps {
  items: Array<{ label: string; value: string } | string>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  label: string;
  disabled?: boolean;
  multiple?: boolean;
}

const UploadForm = () => {
  const [title, setTitle] = useState("");
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Get unique subjects based on selected schools
  const availableSubjects = React.useMemo(() => {
    if (selectedSchools.length === 0) return [];
    const subjects = new Set<string>();
    schoolTypes
      .filter((school) => selectedSchools.includes(school.name))
      .forEach((school) => {
        school.subjects.forEach((subject) => subjects.add(subject));
      });
    return Array.from(subjects);
  }, [selectedSchools]);

  const cleanupFilePreview = (file: FileWithPreview) => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
  };

  const getFileIcon = (file: FileWithPreview) => {
    const type = file.type || "";
    if (type.includes("image")) return ImageIcon;
    if (type.includes("pdf")) return FilePdf;
    if (type.includes("document") || type.includes("msword")) return FileText;
    return FileIcon;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const processedFiles = acceptedFiles
      .map((file) => {
        try {
          if (file.size > MAX_FILE_SIZE) {
            setError(`Il file ${file.name} supera il limite di 100MB`);
            return null;
          }

          const preview = file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined;

          const processedFile: FileWithPreview = Object.assign(file, {
            preview,
            uploadProgress: 0,
            uploadStatus: "pending" as const,
          });

          return processedFile;
        } catch (error) {
          console.error("Error processing file:", error);
          setError(`Errore nel processare il file ${file.name}`);
          return null;
        }
      })
      .filter(Boolean) as FileWithPreview[];

    setFiles((prev) => [...prev, ...processedFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const uploadToR2 = async (
    file: File,
    presignedUrl: string,
    index: number,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        console.error("XHR Error:", xhr.statusText);
        reject(new Error("Caricamento fallito"));
      });

      xhr.addEventListener("timeout", () => {
        reject(new Error("Timeout durante il caricamento"));
      });

      xhr.withCredentials = false;
      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      try {
        xhr.send(file);
      } catch (error) {
        console.error("Send error:", error);
        reject(error);
      }

      uploadTimeoutRef.current = setTimeout(() => {
        xhr.abort();
        reject(new Error("Timeout durante il caricamento"));
      }, 30000);
    }).finally(() => {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
    });
  };

  const ComboboxSelect: React.FC<ComboboxSelectProps> = ({
    items,
    selectedValues,
    onChange,
    placeholder,
    label,
    disabled = false,
    multiple = false,
  }) => {
    return (
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              disabled={disabled}
              className={cn(
                "w-full justify-between",
                !selectedValues.length && "text-muted-foreground"
              )}
            >
              <div className="flex flex-wrap items-center gap-1 py-1">
                {selectedValues.length === 0 && placeholder}
                {selectedValues.map((value) => {
                  const displayValue = items.find((item) =>
                    typeof item === "string"
                      ? item === value
                      : item.value === value
                  );
                  return (
                    <Badge key={value} variant="secondary" className="mr-1">
                      {typeof displayValue === "string"
                        ? displayValue
                        : displayValue?.label || value}
                    </Badge>
                  );
                })}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder={`Cerca ${label.toLowerCase()}...`} />
              <CommandList>
                <CommandEmpty>Nessun risultato trovato.</CommandEmpty>
                <CommandGroup>
                  {items.map((item) => {
                    const itemValue =
                      typeof item === "string" ? item : item.value;
                    const itemLabel =
                      typeof item === "string" ? item : item.label;
                    const isSelected = selectedValues.includes(itemValue);

                    return (
                      <CommandItem
                        key={itemValue}
                        onSelect={() => {
                          if (multiple) {
                            onChange(
                              isSelected
                                ? selectedValues.filter((v) => v !== itemValue)
                                : [...selectedValues, itemValue]
                            );
                          } else {
                            onChange([itemValue]);
                          }
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {itemLabel}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !files.length ||
      !title.trim() ||
      !selectedSchools.length ||
      !selectedSubjects.length ||
      !selectedYears.length
    ) {
      setError("Per favore compila tutti i campi richiesti");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const filesData = files.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      }));

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          schools: selectedSchools,
          subjects: selectedSubjects,
          years: selectedYears,
          files: filesData,
          isAnonymous, // Add this field
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details?.[0]?.message ||
            errorData.error ||
            "Caricamento fallito"
        );
      }

      const { noteId, presignedUrls } = await response.json();

      await Promise.all(
        files.map(async (file, index) => {
          setFiles((prev) =>
            prev.map((f, i) =>
              i === index ? { ...f, uploadStatus: "uploading" } : f
            )
          );

          try {
            await uploadToR2(
              file,
              presignedUrls[index].url,
              index,
              (progress) => {
                setFiles((prev) =>
                  prev.map((f, i) =>
                    i === index ? { ...f, uploadProgress: progress } : f
                  )
                );
              }
            );

            setFiles((prev) =>
              prev.map((f, i) =>
                i === index
                  ? { ...f, uploadProgress: 100, uploadStatus: "completed" }
                  : f
              )
            );
          } catch (error) {
            setFiles((prev) =>
              prev.map((f, i) =>
                i === index ? { ...f, uploadStatus: "error" } : f
              )
            );
            throw error;
          }
        })
      );

      files.forEach(cleanupFilePreview);
      router.push(`/note/${noteId}`);
    } catch (error) {
      const uploadError = error as Error;
      setError(uploadError.message);
      setFiles((prev) =>
        prev.map((f) =>
          f.uploadStatus === "uploading" ? { ...f, uploadStatus: "error" } : f
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  React.useEffect(() => {
    return () => {
      files.forEach(cleanupFilePreview);
    };
  }, [files]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-gray-900">
          Titolo
        </label>
        <Input
          id="title"
          type="text"
          placeholder="Inserisci un titolo per i tuoi appunti"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={100}
          className="text-base transition-colors focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ComboboxSelect
          items={schoolTypes.map((school) => school.name)}
          selectedValues={selectedSchools}
          onChange={setSelectedSchools}
          placeholder="Seleziona scuola"
          label="Scuola"
          multiple={true}
        />

        <ComboboxSelect
          items={availableSubjects}
          selectedValues={selectedSubjects}
          onChange={setSelectedSubjects}
          placeholder="Seleziona materia"
          label="Materia"
          disabled={selectedSchools.length === 0}
          multiple={true}
        />

        <ComboboxSelect
          items={years}
          selectedValues={selectedYears}
          onChange={setSelectedYears}
          placeholder="Seleziona anno"
          label="Anno"
          multiple={true}
        />
      </div>

      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="anonymous" className="flex flex-col space-y-1">
          <span>Carica in modo anonimo</span>
          <span className="font-normal text-sm text-muted-foreground">
            Il tuo nome non sarà visibile agli altri utenti
          </span>
        </Label>
        <Switch
          id="anonymous"
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
        />
      </div>

      <Card className="border shadow-sm bg-gradient-to-b from-white to-gray-50/50">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-lg transition-all duration-200
              ${
                isDragActive
                  ? "border-primary/70 bg-primary/5 scale-[0.99]"
                  : "border-gray-200 hover:border-primary/40 hover:bg-gray-50/50"
              }`}
          >
            <div className="p-8">
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-3">
                <div
                  className={`
                  p-3 rounded-full transition-colors duration-200
                  ${isDragActive ? "bg-primary/10" : "bg-primary/5"}
                `}
                >
                  <Upload
                    className={`
                    h-6 w-6 transition-colors duration-200
                    ${isDragActive ? "text-primary" : "text-primary/80"}
                  `}
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {isDragActive
                      ? "Rilascia i file qui"
                      : "Trascina i tuoi file qui, o clicca per selezionarli"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOC, DOCX, JPG, PNG (Max 100MB per file)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4">
              <Alert
                variant="destructive"
                className="text-sm border-red-200 bg-red-50/50"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              {files.map((file, index) => (
                <Card
                  key={`${file.name}-${index}`}
                  className="overflow-hidden border transition-all duration-200 hover:bg-gray-50/50 group"
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-4">
                      {file.preview ? (
                        <div className="relative h-10 w-10 rounded-md overflow-hidden ring-1 ring-gray-200">
                          <Image
                            src={file.preview}
                            alt={file.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="p-2 bg-primary/5 rounded-md group-hover:bg-primary/10 transition-colors">
                          {React.createElement(getFileIcon(file), {
                            className:
                              "h-6 w-6 text-primary/80 group-hover:text-primary transition-colors",
                          })}
                        </div>
                      )}

                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-sm font-medium truncate">
                                {file.name}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-[300px]"
                            >
                              <p className="text-xs">{file.name}</p>
                            </TooltipContent>
                          </Tooltip>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>

                        {file.uploadStatus === "uploading" && (
                          <Progress
                            value={file.uploadProgress}
                            className="h-1 mt-2"
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {file.uploadStatus === "completed" && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        {file.uploadStatus === "uploading" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (uploadTimeoutRef.current) {
                                clearTimeout(uploadTimeoutRef.current);
                              }
                            }}
                            className="hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            Annulla
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            cleanupFilePreview(file);
                            setFiles(files.filter((_, i) => i !== index));
                          }}
                          className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full transition-all duration-200"
        disabled={
          !files.length ||
          !title.trim() ||
          !selectedSchools.length ||
          !selectedSubjects.length ||
          !selectedYears ||
          isUploading
        }
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Caricamento in corso...
          </>
        ) : (
          "Carica appunti"
        )}
      </Button>
    </form>
  );
};

export default UploadForm;
