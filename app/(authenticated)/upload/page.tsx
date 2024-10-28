import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, BookOpen, HardDrive } from "lucide-react";
import Link from "next/link";
import UploadForm from "@/components/upload-form";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Back button */}
        <Link
          href="/"
          className="group mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Torna alla home
        </Link>

        {/* Hero Card */}
        <Card className="mb-6 sm:mb-12 border bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-white to-white overflow-hidden">
          <CardContent className="p-6 sm:p-12">
            <div className="max-w-3xl space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                  Condividi i tuoi appunti
                </h1>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  Carica i tuoi appunti in formato PDF, DOC, DOCX, o immagine.
                  Riceverai subito 5 punti per ogni file caricato, più 10 punti
                  extra ogni volta che qualcuno scarica i tuoi appunti. Usa i
                  punti per accedere agli appunti degli altri studenti.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="hidden md:grid md:grid-cols-3 gap-4 mb-8">
          <Card className="border bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/5 rounded-full">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">+1</p>
                  <p className="text-sm text-muted-foreground">
                    Punti per upload
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/5 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">+1</p>
                  <p className="text-sm text-muted-foreground">
                    Punto per download
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/5 rounded-full">
                  <HardDrive className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">24/7</p>
                  <p className="text-sm text-muted-foreground">
                    Backup automatici
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Form Section */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Carica i tuoi file
          </h2>

          <Card className="border bg-white/50">
            <CardContent className="p-6">
              <UploadForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
