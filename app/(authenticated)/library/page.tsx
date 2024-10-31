"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Calendar,
  Eye,
  BookOpen,
  ImageIcon,
  File,
  ArrowLeft,
  Book,
  Clock,
  ListFilter,
} from "lucide-react";
import type { LibraryNote } from "@/types/notes";
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

type SubjectVariant =
  | "math"
  | "physics"
  | "chemistry"
  | "literature"
  | "history"
  | "biology"
  | "art"
  | "economics"
  | "philosophy"
  | "subject";

const subjectVariantMap: Record<string, SubjectVariant> = {
  matematica: "math",
  fisica: "physics",
  chimica: "chemistry",
  italiano: "literature",
  storia: "history",
  biologia: "biology",
  arte: "art",
  economia: "economics",
  filosofia: "philosophy",
} as const;

function getSubjectVariant(subject: string): SubjectVariant {
  return subjectVariantMap[subject.toLowerCase()] || "subject";
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

  const stats = React.useMemo(() => {
    if (!notes.length) return null;

    const subjects = notes.flatMap((note) => note.subjects);
    const uniqueSubjects = new Set(subjects);

    return {
      totalNotes: notes.length,
      uniqueSubjects: uniqueSubjects.size,
      recentNotes: notes.filter(
        (note) =>
          new Date(note.purchasedAt).getTime() >
          new Date().getTime() - 7 * 24 * 60 * 60 * 1000
      ).length,
      totalFiles: notes.reduce((sum, note) => sum + note.files.length, 0),
    };
  }, [notes]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button asChild>
                <Link href="/">Torna alla home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla home
        </Link>

        <div className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Appunti Totali
                  </CardTitle>
                  <Book className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalNotes}</div>
                  <p className="text-xs text-muted-foreground">
                    Nella tua libreria
                  </p>
                </CardContent>
              </Card>

              <Card className="border bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Materie Diverse
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.uniqueSubjects}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Materie coperte
                  </p>
                </CardContent>
              </Card>

              <Card className="border bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Acquisti Recenti
                  </CardTitle>
                  <Clock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.recentNotes}</div>
                  <p className="text-xs text-muted-foreground">
                    Negli ultimi 7 giorni
                  </p>
                </CardContent>
              </Card>

              <Card className="border bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    File Totali
                  </CardTitle>
                  <File className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFiles}</div>
                  <p className="text-xs text-muted-foreground">
                    Documenti disponibili
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <Card className="border bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>I tuoi appunti</CardTitle>
              <CardDescription>
                Gestisci e accedi ai tuoi appunti acquistati
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca per titolo o materia..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <ListFilter className="mr-2 h-4 w-4" />
                      Ordina per{" "}
                      {sortBy === "date"
                        ? "data"
                        : sortBy === "title"
                        ? "titolo"
                        : "materia"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[150px]">
                    <DropdownMenuItem onClick={() => setSortBy("date")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Data
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("title")}>
                      <Book className="mr-2 h-4 w-4" />
                      Titolo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("subject")}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Materia
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-6">
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
                          <TableCell>
                            <div className="font-medium text-gray-900">
                              {note.title}
                            </div>
                          </TableCell>
                          <TableCell>
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
                          <TableCell>
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
                          <TableCell>
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
                          <TableCell className="text-right">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
