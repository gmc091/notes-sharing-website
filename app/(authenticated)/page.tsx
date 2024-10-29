"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NoteCard from "@/components/note-card";
import {
  Plus,
  BookOpen,
  Users,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { NotesFilter } from "@/components/notes-filter";
import type { NotesApiResponse } from "@/types/notes";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useFilters } from "@/hooks/use-filters";
import { Leaderboard } from "@/components/leaderboard";
import LoadingSpinner from "@/components/loader";

export default function Home() {
  const {
    selectedSchools,
    selectedSubjects,
    selectedYears,
    searchQuery,
    currentPage,
    setSchools,
    setSubjects,
    setYears,
    setSearch,
    setPage,
    clearFilters,
  } = useFilters();

  const [notesData, setNotesData] = useState<NotesApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [totalViews, setTotalViews] = useState(0);

  // Calculate active filters
  const activeFiltersCount =
    selectedSchools.length +
    selectedSubjects.length +
    selectedYears.length +
    (searchQuery ? 1 : 0);

  // Fetch notes and total views when filters change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [notesResponse, statsResponse] = await Promise.all([
          fetch(
            `api/v1/notes?${new URLSearchParams({
              page: currentPage.toString(),
              limit: "6",
              ...(searchQuery && { search: searchQuery }),
              ...(selectedSchools.length && {
                schools: selectedSchools.join(","),
              }),
              ...(selectedSubjects.length && {
                subjects: selectedSubjects.join(","),
              }),
              ...(selectedYears.length && { years: selectedYears.join(",") }),
            })}`
          ),
          fetch("api/v1/stats"),
        ]);

        if (!notesResponse.ok) throw new Error("Failed to fetch notes");
        if (!statsResponse.ok) throw new Error("Failed to fetch stats");

        const [notesData, statsData]: [
          NotesApiResponse,
          { totalViews: number }
        ] = await Promise.all([notesResponse.json(), statsResponse.json()]);

        setNotesData(notesData);
        setTotalViews(statsData.totalViews);
        setError(null);
      } catch (err) {
        setError("Failed to load data. Please try again later.");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    startTransition(() => {
      fetchData();
    });
  }, [
    currentPage,
    searchQuery,
    selectedSchools,
    selectedSubjects,
    selectedYears,
  ]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Hero Section */}
        <Card className="mb-6 sm:mb-12 border bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-white to-white overflow-hidden hover:shadow-md transition-all duration-300">
          <CardContent className="p-6 sm:p-12">
            <div className="max-w-3xl space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                  Appunti Liceo Aprosio
                </h1>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  Una piattaforma dove gli studenti del Liceo Aprosio possono
                  condividere e accedere agli appunti delle lezioni.
                  <span className="hidden sm:inline">
                    {" "}
                    Trova gli appunti di cui hai bisogno o aiuta i tuoi compagni
                    condividendo i tuoi.
                  </span>
                </p>
              </div>
              <Button
                asChild
                size="default"
                className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto transition-colors group"
              >
                <Link href="/upload" className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Condividi appunti
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats and Leaderboard Section */}
        <div className="hidden md:flex flex-col gap-4 mb-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Total Notes Card */}
            <Card className="border bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-full">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-primary">
                      {notesData?.totalCount || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Appunti disponibili
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Users Card */}
            <Card className="border bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-primary">689</p>
                    <p className="text-xs text-muted-foreground">
                      Alunni attivi
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Views Card */}
            <Card className="border bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-full">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-primary">
                      {totalViews.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Visualizzazioni totali
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard Card */}
          <div className="">
            <Leaderboard />
          </div>
        </div>

        {/* Mobile Leaderboard */}
        <div className="md:hidden mb-6">
          <Leaderboard />
        </div>

        {/* Notes Section */}
        <div className="space-y-4 sm:space-y-6">
          {/* Header with Search and Filters */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Appunti recenti
              </h2>
              <div className="flex items-center gap-2">
                {/* Desktop Search */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca appunti..."
                    value={searchQuery}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {/* Mobile Filters Button */}
                <Sheet
                  open={isMobileFiltersOpen}
                  onOpenChange={setIsMobileFiltersOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="sm:hidden relative"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      {activeFiltersCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filtri</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <NotesFilter
                        selectedSchools={selectedSchools}
                        selectedSubjects={selectedSubjects}
                        selectedYears={selectedYears}
                        onSchoolsChange={setSchools}
                        onSubjectsChange={setSubjects}
                        onYearsChange={setYears}
                        onClearFilters={clearFilters}
                        orientation="vertical"
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Desktop Filters */}
            <div className="hidden sm:block">
              <NotesFilter
                selectedSchools={selectedSchools}
                selectedSubjects={selectedSubjects}
                selectedYears={selectedYears}
                onSchoolsChange={setSchools}
                onSubjectsChange={setSubjects}
                onYearsChange={setYears}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Notes Grid */}
          <div
            className={cn(
              "min-h-[400px]",
              (isLoading || isPending) && "animate-pulse"
            )}
          >
            {isLoading || isPending ? (
              <LoadingSpinner />
            ) : error ? (
              <Card className="p-6 text-center border-red-100 bg-red-50">
                <p className="text-red-600">{error}</p>
              </Card>
            ) : notesData?.notes.length ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {notesData.notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>

                {notesData.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <PaginationContent className="flex-wrap justify-center">
                        {currentPage > 1 && (
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setPage(currentPage - 1)}
                              className="hover:bg-gray-100"
                            />
                          </PaginationItem>
                        )}
                        {[...Array(notesData.totalPages)].map((_, index) => {
                          const pageNum = index + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === notesData.totalPages ||
                            (pageNum >= currentPage - 1 &&
                              pageNum <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() => setPage(pageNum)}
                                  isActive={currentPage === pageNum}
                                  className="hover:bg-gray-100"
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            pageNum === currentPage - 2 ||
                            pageNum === currentPage + 2
                          ) {
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}
                        {currentPage < notesData.totalPages && (
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setPage(currentPage + 1)}
                              className="hover:bg-gray-100"
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <Card className="p-8 text-center border">
                <CardTitle className="mb-2">Nessun appunto trovato</CardTitle>
                <CardDescription className="mb-4">
                  {activeFiltersCount > 0
                    ? "Prova a modificare i filtri di ricerca."
                    : "Sii il primo a condividere i tuoi appunti con la community!"}
                </CardDescription>
                {activeFiltersCount > 0 ? (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="transition-colors"
                  >
                    Rimuovi tutti i filtri
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="bg-primary hover:bg-primary/90 text-white transition-colors group"
                  >
                    <Link href="/upload" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Condividi appunti
                      <ArrowUpRight className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </Button>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
