// components/upload-form.tsx
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
  Trash2,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Note } from "@/types/notes";

// Constants
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_TOTAL_FILES = 10;
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB
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
];

const years = [
  { label: "Primo anno", value: "1" },
  { label: "Secondo anno", value: "2" },
  { label: "Terzo anno", value: "3" },
  { label: "Quarto anno", value: "4" },
  { label: "Quinto anno", value: "5" },
];

// Types
interface ExistingFile {
  key: string;
  name: string;
  size?: number;
  lastModified?: Date;
  url?: string;
  existingFile: true;
  uploadStatus: "completed";
  preview?: string;
  type: string;
}

type FileWithPreview =
  | (File & {
      preview?: string;
      uploadProgress?: number;
      uploadStatus?: "pending" | "uploading" | "completed" | "error";
      error?: string;
      existingFile?: false;
    })
  | ExistingFile;

interface ComboboxSelectProps {
  items: Array<{ label: string; value: string } | string>;
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  label: string;
  disabled?: boolean;
  multiple?: boolean;
  error?: string;
  allowDeselect?: boolean;
}

interface UploadFormProps {
  mode: "create" | "edit";
  initialData?: Note;
  submitButtonText?: string;
  loadingText?: string;
}

// Type guards
const isExistingFile = (file: FileWithPreview): file is ExistingFile => {
  return "existingFile" in file && file.existingFile === true;
};

const isNewFile = (
  file: FileWithPreview
): file is File & {
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: "pending" | "uploading" | "completed" | "error";
  error?: string;
  existingFile?: false;
} => {
  return !("existingFile" in file) || file.existingFile === false;
};

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getFileIcon = (file: FileWithPreview) => {
  const type = isExistingFile(file) ? file.type : file.type || "";
  if (type.includes("image")) return ImageIcon;
  if (type.includes("pdf")) return FilePdf;
  if (type.includes("document") || type.includes("msword")) return FileText;
  return FileIcon;
};

const getTotalSize = (files: FileWithPreview[]): number => {
  return files.reduce((total, file) => {
    if (isNewFile(file)) {
      return total + file.size;
    }
    return total + (file.size || 0);
  }, 0);
};

const handleApiError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
};

const validateFile = (
  file: File,
  existingFiles: FileWithPreview[]
): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Il file ${file.name} supera il limite di ${formatFileSize(
        MAX_FILE_SIZE
      )}`,
    };
  }

  const fileType = Object.entries(ACCEPTED_FILE_TYPES).find(([type]) =>
    file.type.includes(type)
  );
  if (!fileType) {
    return {
      valid: false,
      error: `Il formato del file ${file.name} non è supportato`,
    };
  }

  const isDuplicate = existingFiles.some(
    (existingFile) => existingFile.name === file.name
  );
  if (isDuplicate) {
    return {
      valid: false,
      error: `Il file ${file.name} è già stato aggiunto`,
    };
  }

  const newTotalSize = getTotalSize(existingFiles) + file.size;
  if (newTotalSize > MAX_TOTAL_SIZE) {
    return {
      valid: false,
      error: `La dimensione totale dei file non può superare ${formatFileSize(
        MAX_TOTAL_SIZE
      )}`,
    };
  }

  return { valid: true };
};

// ComboboxSelect Component
const ComboboxSelect: React.FC<ComboboxSelectProps> = ({
  items,
  selectedValues,
  onChange,
  placeholder,
  label,
  disabled = false,
  multiple = false,
  error,
  allowDeselect = true,
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
                const item = items.find((item) =>
                  typeof item === "string"
                    ? item === value
                    : item.value === value
                );
                return (
                  <Badge key={value} variant="secondary" className="mr-1">
                    {typeof item === "string" ? item : item?.label || value}
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

// Main Component
const UploadForm: React.FC<UploadFormProps> = ({
  mode = "create",
  initialData,
  submitButtonText = mode === "create" ? "Carica appunti" : "Salva modifiche",
  loadingText = mode === "create"
    ? "Caricamento in corso..."
    : "Salvataggio in corso...",
}) => {
  // State management
  const [title, setTitle] = useState(initialData?.title || "");
  const [selectedSchools, setSelectedSchools] = useState<string[]>(
    initialData?.schools || []
  );
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    initialData?.subjects || []
  );
  const [selectedYears, setSelectedYears] = useState<string[]>(
    initialData?.years.map(String) || []
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [isAnonymous, setIsAnonymous] = useState(
    initialData?.isAnonymous || false
  );
  const [files, setFiles] = useState<FileWithPreview[]>(
    initialData?.files.map((file) => ({
      ...file,
      existingFile: true as const,
      uploadStatus: "completed" as const,
      type:
        file.name.split(".").pop()?.toLowerCase() || "application/octet-stream",
    })) || []
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileWithPreview | null>(
    null
  );

  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllersRef = useRef<AbortController[]>([]);
  const router = useRouter();

  // Cleanup functions
  const cleanupUploads = useCallback(() => {
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
    }
    abortControllersRef.current.forEach((controller) => controller.abort());
    abortControllersRef.current = [];
  }, []);

  const cleanupFilePreview = useCallback((file: FileWithPreview) => {
    if (!isExistingFile(file) && file.preview) {
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

  // File upload function
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
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      });

      xhr.addEventListener("error", () => {
        console.error("XHR Error:", xhr.statusText);
        reject(new Error("Error during upload"));
      });

      xhr.addEventListener("timeout", () => {
        reject(new Error("Upload timeout"));
      });

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload cancelled"));
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
        reject(new Error("Upload timeout"));
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

  // File deletion handlers
  const handleDeleteFile = async (file: FileWithPreview) => {
    setFileToDelete(file);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    if (isExistingFile(fileToDelete) && mode === "edit") {
      try {
        const response = await fetch(`/api/v1/notes/${initialData?.id}/files`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath: fileToDelete.key }),
        });

        if (!response.ok) throw new Error("Failed to delete file");

        toast.success("File eliminato con successo");
      } catch (err) {
        const errorMessage = handleApiError(err);
        console.error("Delete error:", err);
        toast.error(errorMessage);
        setDeleteConfirmOpen(false);
        return;
      }
    }

    cleanupFilePreview(fileToDelete);
    setFiles((files) => files.filter((f) => f !== fileToDelete));
    setDeleteConfirmOpen(false);
    setFileToDelete(null);
  };

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback(
      (acceptedFiles: File[]) => {
        if (isUploading || formSubmitted) return;

        const totalFiles = files.length + acceptedFiles.length;
        if (totalFiles > MAX_TOTAL_FILES) {
          setError(`Non puoi caricare più di ${MAX_TOTAL_FILES} file`);
          return;
        }

        const processedFiles = acceptedFiles
          .map((file) => {
            const validation = validateFile(file, files);
            if (!validation.valid) {
              setError(validation.error || "Invalid file");
              return null;
            }

            const preview = file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : undefined;

            return Object.assign(file, {
              preview,
              uploadProgress: 0,
              uploadStatus: "pending" as const,
              existingFile: false as const,
            });
          })
          .filter(Boolean) as FileWithPreview[];

        if (processedFiles.length > 0) {
          setFiles((prev) => [...prev, ...processedFiles]);
          setError(null);
        }
      },
      [files, isUploading, formSubmitted]
    ),
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    disabled: isUploading || formSubmitted || files.length >= MAX_TOTAL_FILES,
    onError: (err: Error) => {
      console.error("Dropzone error:", err);
      setError(err.message);
    },
    onDropRejected: (rejections) => {
      const errors = rejections.map(
        (rejection) => `${rejection.file.name}: ${rejection.errors[0]?.message}`
      );
      setError(errors.join(", "));
    },
  });

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
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      newFieldErrors.description = `La descrizione non può superare ${MAX_DESCRIPTION_LENGTH} caratteri`;
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setError("Per favore compila tutti i campi richiesti");
      return;
    }

    setIsUploading(true);
    setFormSubmitted(true);

    try {
      // Separate existing and new files
      const existingFiles = files.filter(isExistingFile);
      const newFiles = files.filter(isNewFile);

      // Prepare files data for API
      const filesData = newFiles.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      }));

      // Determine API endpoint and method
      const endpoint =
        mode === "create"
          ? "/api/v1/notes/upload"
          : `/api/v1/notes/${initialData?.id}`;

      const method = mode === "create" ? "POST" : "PATCH";

      // Make initial API call
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          schools: selectedSchools,
          subjects: selectedSubjects,
          years: selectedYears,
          files: filesData,
          isAnonymous,
          existingFiles: existingFiles.map((f) => f.key),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details?.[0]?.message ||
            errorData.error ||
            "Operation failed"
        );
      }

      const { noteId, presignedUrls } = await response.json();

      // Upload new files if any
      if (newFiles.length > 0) {
        await Promise.all(
          newFiles.map(async (file, index) => {
            setFiles((prev) =>
              prev.map((f) =>
                f === file ? { ...f, uploadStatus: "uploading" } : f
              )
            );

            try {
              await uploadToR2(
                file,
                presignedUrls[index].url,
                index,
                (progress) => {
                  setFiles((prev) =>
                    prev.map((f) =>
                      f === file ? { ...f, uploadProgress: progress } : f
                    )
                  );
                }
              );

              setFiles((prev) =>
                prev.map((f) =>
                  f === file
                    ? { ...f, uploadProgress: 100, uploadStatus: "completed" }
                    : f
                )
              );
            } catch (error) {
              setFiles((prev) =>
                prev.map((f) =>
                  f === file
                    ? {
                        ...f,
                        uploadStatus: "error",
                        error: handleApiError(error),
                      }
                    : f
                )
              );
              throw error;
            }
          })
        );
      }

      // Clean up and redirect
      files.filter(isNewFile).forEach(cleanupFilePreview);

      toast.success(
        mode === "create"
          ? "Appunto caricato con successo"
          : "Appunto aggiornato con successo"
      );

      router.push(`/note/${noteId || initialData?.id}`);
    } catch (error) {
      console.error("Operation failed:", error);
      setError(handleApiError(error));
      setFormSubmitted(false);
      setFiles((prev) =>
        prev.map((f) =>
          f.uploadStatus === "uploading" ? { ...f, uploadStatus: "error" } : f
        )
      );

      toast.error(handleApiError(error));
    } finally {
      setIsUploading(false);
    }
  };

  // Component render
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium text-gray-900">
          Titolo
        </Label>
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
          disabled={isUploading || formSubmitted}
        />
        {fieldErrors.title && (
          <p id="title-error" className="text-sm text-red-500">
            {fieldErrors.title}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-medium text-gray-900"
        >
          Descrizione
        </Label>
        <Textarea
          id="description"
          placeholder="Aggiungi una breve descrizione dei tuoi appunti..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (e.target.value.length > MAX_DESCRIPTION_LENGTH) {
              setFieldErrors((prev) => ({
                ...prev,
                description: `La descrizione non può superare ${MAX_DESCRIPTION_LENGTH} caratteri`,
              }));
            } else {
              setFieldErrors((prev) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { description: _, ...rest } = prev;
                return rest;
              });
            }
          }}
          className={cn(
            "resize-none min-h-[100px]",
            fieldErrors.description && "border-red-500"
          )}
          disabled={isUploading || formSubmitted}
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
          {fieldErrors.description && (
            <span className="text-red-500">{fieldErrors.description}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          Descrivi brevemente il contenuto dei tuoi appunti
        </p>
      </div>

      {/* Selection Fields */}
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
          disabled={isUploading || formSubmitted}
        />

        <ComboboxSelect
          items={availableSubjects}
          selectedValues={selectedSubjects}
          onChange={setSelectedSubjects}
          placeholder="Seleziona materia"
          label="Materia"
          disabled={
            selectedSchools.length === 0 || isUploading || formSubmitted
          }
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
          disabled={isUploading || formSubmitted}
        />
      </div>

      {/* Anonymous Switch */}
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
          disabled={isUploading || formSubmitted}
        />
      </div>

      {/* File Upload Section */}
      <Card className="border shadow-sm bg-gradient-to-b from-white to-gray-50/50">
        <CardContent className="p-6">
          {/* Dropzone */}
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

          {/* Error Display */}
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

          {/* File List */}
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
                            unoptimized
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
                              {isExistingFile(file)
                                ? file.size
                                  ? formatFileSize(file.size)
                                  : "Unknown size"
                                : formatFileSize(file.size)}
                            </p>
                          )}
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
                            onClick={() => handleDeleteFile(file)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                            aria-label={`Rimuovi ${file.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo file?
              {mode === "edit" &&
                isExistingFile(fileToDelete!) &&
                " Il file verrà eliminato permanentemente dal server."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFile}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Actions */}
      <div className="space-y-4">
        {fieldErrors.files && (
          <p className="text-sm text-red-500">{fieldErrors.files}</p>
        )}

        <div className="flex gap-4 justify-end">
          {mode === "edit" && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isUploading || formSubmitted}
            >
              Annulla
            </Button>
          )}
          <Button
            type="submit"
            className={cn(
              "min-w-[200px] transition-all duration-200",
              isUploading && "cursor-not-allowed"
            )}
            disabled={
              !files.length ||
              !title.trim() ||
              !selectedSchools.length ||
              !selectedSubjects.length ||
              !selectedYears.length ||
              isUploading ||
              formSubmitted ||
              Object.keys(fieldErrors).length > 0
            }
          >
            {isUploading ? (
              <div className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>{loadingText}</span>
              </div>
            ) : formSubmitted ? (
              <div className="flex items-center">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span>Completato</span>
              </div>
            ) : (
              submitButtonText
            )}
          </Button>
        </div>

        {isUploading && (
          <p className="text-sm text-center text-muted-foreground">
            Non chiudere questa pagina durante l&apos;operazione
          </p>
        )}
      </div>
    </form>
  );
};

export default UploadForm;
