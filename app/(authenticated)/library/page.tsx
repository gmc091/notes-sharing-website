// app/(authenticated)/library/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  FileText,
  Calendar,
  ChevronDown,
  Eye,
  Clock,
  BookOpen,
  Image as ImageIcon,
  File,
  Loader2,
} from "lucide-react";
import type { LibraryNote } from "@/types/notes";

// File type icons mapping
const fileTypeIcons: { [key: string]: React.ElementType } = {
  pdf: FileText,
  jpg: ImageIcon,
  jpeg: ImageIcon,
  png: ImageIcon,
  default: File,
};

// Get file extension
const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

// Get icon for file type
const getFileIcon = (filename: string): React.ElementType => {
  const ext = getFileExtension(filename);
  return fileTypeIcons[ext] || fileTypeIcons.default;
};

export default function LibraryPage() {
  const [notes, setNotes] = useState<LibraryNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title" | "subject">("date");

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const response = await fetch("/api/v1/users/me/library");
        if (!response.ok) throw new Error("Failed to fetch library");

        const data = await response.json();
        setNotes(data.notes);
      } catch (err) {
        console.error("Error fetching library:", err);
        setError("Failed to load your library. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibrary();
  }, []);

  // Filter and sort notes
  const filteredAndSortedNotes = React.useMemo(() => {
    let filtered = notes;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.subjects.some((subject) => subject.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "subject":
          return a.subjects[0]?.localeCompare(b.subjects[0] || "");
        case "date":
        default:
          return (
            new Date(b.purchasedAt).getTime() -
            new Date(a.purchasedAt).getTime()
          );
      }
    });
  }, [notes, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-red-600">{error}</p>
                <Button asChild>
                  <Link href="/">Torna alla home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                La mia libreria
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gestisci e accedi ai tuoi appunti acquistati
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per titolo o materia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[150px]">
                  <Clock className="mr-2 h-4 w-4" />
                  Ordina per
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[150px]">
                <DropdownMenuItem onClick={() => setSortBy("date")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("title")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Titolo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("subject")}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Materia
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Notes Table */}
        <Card className="mt-6">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titolo</TableHead>
                  <TableHead>Materie</TableHead>
                  <TableHead>Data acquisto</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="space-y-3">
                        <p className="text-muted-foreground">
                          {searchQuery
                            ? "Nessun risultato trovato"
                            : "Non hai ancora acquistato nessun appunto"}
                        </p>
                        {!searchQuery && (
                          <Button asChild>
                            <Link href="/">Sfoglia gli appunti</Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedNotes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell>
                        <div className="font-medium">{note.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {note.subjects.map((subject) => (
                            <Badge key={subject} variant="secondary">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(note.purchasedAt).toLocaleDateString(
                            "it-IT",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {note.files.slice(0, 3).map((file) => {
                            const FileIcon = getFileIcon(file.name);
                            return (
                              <div
                                key={file.key}
                                className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center"
                                title={file.name}
                              >
                                <FileIcon className="h-4 w-4 text-gray-600" />
                              </div>
                            );
                          })}
                          {note.files.length > 3 && (
                            <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                              <span className="text-xs text-gray-600">
                                +{note.files.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/note/${note.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizza
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
