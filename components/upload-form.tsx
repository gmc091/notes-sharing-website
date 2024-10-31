"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
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
  Info,
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
import { Textarea } from "./ui/textarea";

// Constants and types
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const UPLOAD_TIMEOUT = 30000; // 30 seconds
const MAX_DESCRIPTION_LENGTH = 500;

const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
} as const;

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
] as const;

const years = [
  { label: "Primo anno", value: "1" },
  { label: "Secondo anno", value: "2" },
  { label: "Terzo anno", value: "3" },
  { label: "Quarto anno", value: "4" },
  { label: "Quinto anno", value: "5" },
];

interface FileWithPreview extends File {
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

interface ComboboxSelectProps {
  items: Array<{ label: string; value: string } | string>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  label: string;
  disabled?: boolean;
  multiple?: boolean;
  error?: string;
  allowDeselect?: boolean; // Add this prop
}

interface UploadError extends Error {
  details?: Array<{ message: string }>;
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getFileIcon = (file: FileWithPreview) => {
  const type = file.type || "";
  if (type.includes("image")) return ImageIcon;
  if (type.includes("pdf")) return FilePdf;
  if (type.includes("document") || type.includes("msword")) return FileText;
  return FileIcon;
};

// Component implementation
const UploadForm = () => {
  // State management
  const [title, setTitle] = useState("");
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllersRef = useRef<AbortController[]>([]);
  const router = useRouter();

  // Cleanup function for aborted uploads
  const cleanupUploads = useCallback(() => {
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
    }
    abortControllersRef.current.forEach((controller) => controller.abort());
    abortControllersRef.current = [];
  }, []);

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newDescription = e.target.value;
    setDescription(newDescription);

    if (newDescription.length > MAX_DESCRIPTION_LENGTH) {
      setDescriptionError(
        `La descrizione non può superare ${MAX_DESCRIPTION_LENGTH} caratteri`
      );
    } else {
      setDescriptionError(null);
    }
  };

  // Cleanup function for file previews
  const cleanupFilePreview = useCallback((file: FileWithPreview) => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview);
    }
  }, []);

  // Get available subjects based on selected schools
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

  // Update subjects when schools change
  useEffect(() => {
    if (selectedSchools.length === 0) {
      setSelectedSubjects([]);
      return;
    }

    setSelectedSubjects((prev) =>
      prev.filter((subject) => availableSubjects.includes(subject))
    );
  }, [selectedSchools, availableSubjects]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupUploads();
      files.forEach(cleanupFilePreview);
    };
  }, [files, cleanupUploads, cleanupFilePreview]);

  // File drop handler
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (isUploading || formSubmitted) return;

      const processedFiles = acceptedFiles
        .map((file) => {
          try {
            if (file.size > MAX_FILE_SIZE) {
              setError(`Il file ${file.name} supera il limite di 100MB`);
              return null;
            }

            const isDuplicate = files.some(
              (existingFile) => existingFile.name === file.name
            );
            if (isDuplicate) {
              setError(`Il file ${file.name} è già stato aggiunto`);
              return null;
            }

            const preview = file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : undefined;

            return Object.assign(file, {
              preview,
              uploadProgress: 0,
              uploadStatus: "pending" as const,
            });
          } catch (error) {
            console.error("Error processing file:", error);
            setError(`Errore nel processare il file ${file.name}`);
            return null;
          }
        })
        .filter(Boolean) as FileWithPreview[];

      if (processedFiles.length > 0) {
        setFiles((prev) => [...prev, ...processedFiles]);
        setError(null);
      }
    },
    [files, isUploading, formSubmitted]
  );

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: isUploading || formSubmitted,
    onError: (err) => {
      setError(err.message);
    },
    onDropRejected: (rejections) => {
      const errors = rejections.map(
        (rejection) => `${rejection.file.name}: ${rejection.errors[0]?.message}`
      );
      setError(errors.join(", "));
    },
  });

  // Upload function
  const uploadToR2 = async (
    file: File,
    presignedUrl: string,
    index: number,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    const abortController = new AbortController();
    abortControllersRef.current.push(abortController);

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Caricamento fallito (${xhr.status})`));
        }
      });

      xhr.addEventListener("error", () => {
        console.error("XHR Error:", xhr.statusText);
        reject(new Error("Errore durante il caricamento"));
      });

      xhr.addEventListener("timeout", () => {
        reject(new Error("Timeout durante il caricamento"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Caricamento annullato"));
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
      }, UPLOAD_TIMEOUT);
    }).finally(() => {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
      const index = abortControllersRef.current.indexOf(abortController);
      if (index > -1) {
        abortControllersRef.current.splice(index, 1);
      }
    });
  };

  // Combobox Select Component
  const ComboboxSelect: React.FC<ComboboxSelectProps> = ({
    items,
    selectedValues,
    onChange,
    placeholder,
    label,
    disabled = false,
    multiple = false,
    error,
    allowDeselect = true, // Default to true to maintain backward compatibility
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
                !selectedValues.length && "text-muted-foreground",
                error && "border-red-500"
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
                          if (isSelected && !allowDeselect) {
                            // Don't allow deselection if allowDeselect is false
                            return;
                          }
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
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setError(null);
    setFieldErrors({});

    // Validate form
    const newFieldErrors: Record<string, string> = {};
    if (!title.trim()) {
      newFieldErrors.title = "Il titolo è obbligatorio";
    }
    if (selectedSchools.length === 0) {
      newFieldErrors.schools = "Seleziona almeno una scuola";
    }
    if (selectedSubjects.length === 0) {
      newFieldErrors.subjects = "Seleziona almeno una materia";
    }
    if (selectedYears.length === 0) {
      newFieldErrors.years = "Seleziona almeno un anno";
    }
    if (files.length === 0) {
      newFieldErrors.files = "Carica almeno un file";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setError("Per favore compila tutti i campi richiesti");
      return;
    }

    setIsUploading(true);
    setFormSubmitted(true);

    try {
      const filesData = files.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      }));

      const response = await fetch("/api/v1/notes/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          schools: selectedSchools,
          subjects: selectedSubjects,
          years: selectedYears,
          files: filesData,
          isAnonymous,
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
                i === index
                  ? {
                      ...f,
                      uploadStatus: "error",
                      error:
                        error instanceof Error
                          ? error.message
                          : "Errore sconosciuto",
                    }
                  : f
              )
            );
            throw error;
          }
        })
      );

      // Clean up file previews before navigation
      files.forEach(cleanupFilePreview);
      router.push(`/note/${noteId}`);
    } catch (error) {
      const uploadError = error as UploadError;
      setError(uploadError.message);
      setFormSubmitted(false); // Allow retrying if upload fails
      setFiles((prev) =>
        prev.map((f) =>
          f.uploadStatus === "uploading" ? { ...f, uploadStatus: "error" } : f
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  // JSX Return
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
          className={cn(
            "text-base transition-colors focus-visible:ring-2 focus-visible:ring-primary",
            fieldErrors.title && "border-red-500"
          )}
          aria-invalid={Boolean(fieldErrors.title)}
          aria-errormessage={fieldErrors.title ? "title-error" : undefined}
        />
        {fieldErrors.title && (
          <p id="title-error" className="text-sm text-red-500">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-gray-900"
        >
          Descrizione
        </label>
        <Textarea
          id="description"
          placeholder="Aggiungi una breve descrizione dei tuoi appunti..."
          value={description}
          onChange={handleDescriptionChange}
          className={cn(
            "resize-none min-h-[100px]",
            descriptionError && "border-red-500"
          )}
        />
        <div className="flex justify-between items-center text-xs">
          <span
            className={cn(
              "text-muted-foreground",
              description.length > MAX_DESCRIPTION_LENGTH && "text-red-500"
            )}
          >
            {description.length}/{MAX_DESCRIPTION_LENGTH} caratteri
          </span>
          {descriptionError && (
            <span className="text-red-500">{descriptionError}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          Descrivi brevemente il contenuto dei tuoi appunti
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ComboboxSelect
          items={schoolTypes.map((school) => school.name)}
          selectedValues={selectedSchools}
          onChange={setSelectedSchools}
          placeholder="Seleziona scuola"
          label="Scuola"
          multiple={true}
          error={fieldErrors.schools}
          allowDeselect={false}
        />

        <ComboboxSelect
          items={availableSubjects}
          selectedValues={selectedSubjects}
          onChange={setSelectedSubjects}
          placeholder="Seleziona materia"
          label="Materia"
          disabled={selectedSchools.length === 0}
          multiple={true}
          error={fieldErrors.subjects}
          allowDeselect={false}
        />

        <ComboboxSelect
          items={years}
          selectedValues={selectedYears}
          onChange={setSelectedYears}
          placeholder="Seleziona anno"
          label="Anno"
          multiple={true}
          error={fieldErrors.years}
          allowDeselect={false}
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
            className={cn(
              "relative border-2 border-dashed rounded-lg transition-all duration-200",
              isDragActive
                ? "border-primary/70 bg-primary/5 scale-[0.99]"
                : "border-gray-200 hover:border-primary/40 hover:bg-gray-50/50",
              (isUploading || formSubmitted) &&
                "opacity-50 pointer-events-none cursor-not-allowed",
              fieldErrors.files && "border-red-500"
            )}
          >
            <div className="p-8">
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-3">
                <div
                  className={cn(
                    "p-3 rounded-full transition-colors duration-200",
                    isDragActive ? "bg-primary/10" : "bg-primary/5"
                  )}
                >
                  <Upload
                    className={cn(
                      "h-6 w-6 transition-colors duration-200",
                      isDragActive ? "text-primary" : "text-primary/80"
                    )}
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    {isUploading || formSubmitted
                      ? "Caricamento in corso..."
                      : isDragActive
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
                  className={cn(
                    "overflow-hidden border transition-all duration-200 group",
                    !isUploading && !formSubmitted && "hover:bg-gray-50/50",
                    file.uploadStatus === "error" &&
                      "border-red-200 bg-red-50/50"
                  )}
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
                          {!isUploading && !formSubmitted && (
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          )}
                        </div>

                        {file.uploadStatus === "uploading" && (
                          <Progress
                            value={file.uploadProgress}
                            className="h-1 mt-2"
                          />
                        )}

                        {file.error && (
                          <p className="text-xs text-red-500 mt-1">
                            {file.error}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {file.uploadStatus === "completed" && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        {file.uploadStatus === "error" && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        {file.uploadStatus === "uploading" && (
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground mr-2">
                              {file.uploadProgress}%
                            </span>
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        )}
                        {!isUploading && !formSubmitted && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              cleanupFilePreview(file);
                              setFiles(files.filter((_, i) => i !== index));
                              if (files.length === 1) {
                                setError(null);
                              }
                            }}
                            className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                            aria-label={`Rimuovi ${file.name}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {fieldErrors.files && (
          <p className="text-sm text-red-500">{fieldErrors.files}</p>
        )}

        <Button
          type="submit"
          className={cn(
            "w-full transition-all duration-200",
            isUploading && "cursor-not-allowed"
          )}
          disabled={
            !files.length ||
            !title.trim() ||
            !selectedSchools.length ||
            !selectedSubjects.length ||
            !selectedYears.length ||
            isUploading ||
            formSubmitted
          }
        >
          {isUploading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Caricamento in corso...</span>
            </div>
          ) : formSubmitted ? (
            <div className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <span>Caricamento completato</span>
            </div>
          ) : (
            "Carica appunti"
          )}
        </Button>

        {isUploading && (
          <p className="text-sm text-center text-muted-foreground">
            Non chiudere questa pagina durante il caricamento
          </p>
        )}
      </div>
    </form>
  );
};

export default UploadForm;
