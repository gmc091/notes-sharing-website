"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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
  BookOpen,
  Image as ImageIcon,
  File,
  Filter,
} from "lucide-react";
import type { LibraryNote } from "@/types/notes";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import LoadingSpinner from "@/components/loader";

const fileTypeIcons: { [key: string]: React.ElementType } = {
  pdf: FileText,
  jpg: ImageIcon,
  jpeg: ImageIcon,
  png: ImageIcon,
  default: File,
};

const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

const getFileIcon = (filename: string): React.ElementType => {
  const ext = getFileExtension(filename);
  return fileTypeIcons[ext] || fileTypeIcons.default;
};

function getSubjectVariant(subject: string): BadgeVariant {
  const subjectMap: Record<string, BadgeVariant> = {
    matematica: "math",
    fisica: "physics",
    chimica: "chemistry",
    italiano: "literature",
    storia: "history",
    biologia: "biology",
    arte: "art",
    economia: "economics",
    filosofia: "philosophy",
  };

  return subjectMap[subject.toLowerCase()] || "subject";
}

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

  const filteredAndSortedNotes = React.useMemo(() => {
    let filtered = notes;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.subjects.some((subject) => subject.toLowerCase().includes(query))
      );
    }

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
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <Card className="border-red-100 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-red-600">{error}</p>
                <Button asChild variant="default">
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                La mia libreria
              </h1>
              <p className="text-sm text-muted-foreground">
                {notes.length} appunti acquistati
              </p>
            </div>
            <div className="flex gap-4">
              <Input
                placeholder="Cerca per titolo o materia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Ordina
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
          <div className="ring-1 ring-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold">Titolo</TableHead>
                  <TableHead className="font-semibold">Materie</TableHead>
                  <TableHead className="font-semibold">Data acquisto</TableHead>
                  <TableHead className="font-semibold">Files</TableHead>
                  <TableHead className="text-right font-semibold">
                    Azioni
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-muted-foreground">
                            {searchQuery
                              ? "Nessun risultato trovato"
                              : "Non hai ancora acquistato nessun appunto"}
                          </p>
                          {!searchQuery && (
                            <Button asChild className="mt-4">
                              <Link href="/">Sfoglia gli appunti</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedNotes.map((note) => (
                    <TableRow
                      key={note.id}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="py-4">
                        <div className="font-medium text-gray-900">
                          {note.title}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {note.subjects.map((subject) => (
                            <Badge
                              key={subject}
                              variant={getSubjectVariant(subject)}
                            >
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(note.purchasedAt).toLocaleDateString(
                            "it-IT",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1">
                          {note.files.map((file) => {
                            const FileIcon = getFileIcon(file.name);
                            return (
                              <div
                                key={file.key}
                                className="p-1.5 rounded-md bg-gray-50 border border-gray-200"
                                title={file.name}
                              >
                                <FileIcon className="h-4 w-4 text-gray-600" />
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="text-gray-700 hover:text-gray-900"
                        >
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
          </div>
        </div>
      </div>
    </div>
  );
}
