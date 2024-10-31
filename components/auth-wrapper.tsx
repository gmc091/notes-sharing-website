// components/auth-wrapper.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { SignInButton, SignUpButton, SignOutButton } from "@clerk/nextjs";
import {
  LogIn,
  UserPlus,
  LogOut,
  Mail,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "./loader";

const AUTHORIZED_EMAILS = [
  "@liceoaprosio.it",
  "appunti.liceo.aprosio@gmail.com",
  "giovanni.croese.max@gmail.com",
  "reggia.dev@gmail.com",
  "emanuelevogrl07@gmail.com",
];

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAuthorized = userEmail
    ? AUTHORIZED_EMAILS.some(
        (email) => userEmail.endsWith(email) || userEmail === email
      )
    : false;

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full min-h-screen flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10">
          <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-7 gap-6 items-stretch">
            {/* Features Card - Left */}
            <Card className="hidden lg:flex lg:col-span-2 border bg-white hover:shadow-md transition-all duration-300">
              <CardContent className="flex flex-col justify-between p-4 sm:p-6">
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">
                        Condivisione semplice
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Carica e condividi i tuoi appunti con tutta la scuola
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">Guadagna punti</h3>
                      <p className="text-sm text-muted-foreground">
                        Ottieni punti per ogni contributo che fai alla community
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">Accesso istantaneo</h3>
                      <p className="text-sm text-muted-foreground">
                        Trova e accedi agli appunti di cui hai bisogno in pochi
                        click
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Auth Card - Center */}
            <Card className="lg:col-span-3 border bg-white hover:shadow-md transition-all duration-300">
              <CardHeader className="space-y-2 text-center p-4 sm:p-6">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Appunti Liceo Aprosio
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  La piattaforma degli studenti
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 px-4 sm:px-6">
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full text-base hover:bg-gray-50 transition-colors"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Accedi
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    className="w-full text-base bg-primary hover:bg-primary/90 transition-colors"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Crea account
                  </Button>
                </SignUpButton>
              </CardContent>

              <CardFooter className="p-4 sm:p-6 flex flex-col gap-4">
                <div className="rounded-lg border p-4 w-full">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">
                      Utilizza{" "}
                      <span className="font-medium text-foreground">
                        nome.cognome@liceoaprosio.it
                      </span>{" "}
                      per accedere
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <a
                    href="/terms"
                    className="hover:text-primary hover:underline"
                  >
                    Termini di Servizio
                  </a>
                  <span>·</span>
                  <a
                    href="/privacy"
                    className="hover:text-primary hover:underline"
                  >
                    Privacy Policy
                  </a>
                </div>
              </CardFooter>
            </Card>

            {/* Features Card - Right */}
            <Card className="hidden lg:flex lg:col-span-2 border bg-white hover:shadow-md transition-all duration-300">
              <CardContent className="flex flex-col justify-between p-4 sm:p-6">
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">
                        Organizzazione facile
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Trova rapidamente gli appunti per materia e anno
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">Community attiva</h3>
                      <p className="text-sm text-muted-foreground">
                        Unisciti a una community di studenti che collaborano
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">Sempre aggiornato</h3>
                      <p className="text-sm text-muted-foreground">
                        Nuovi appunti vengono aggiunti ogni giorno
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full min-h-screen flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
          <Card className="w-full max-w-md border bg-white hover:shadow-md transition-all duration-300">
            <CardHeader className="space-y-4 text-center p-4 sm:p-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Accesso non autorizzato
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Questa piattaforma è riservata agli studenti del Liceo Aprosio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6">
              <div className="rounded-lg bg-red-50 p-4 text-sm border border-red-100">
                <p className="text-red-600">
                  Account attuale:{" "}
                  <span className="font-medium">{userEmail}</span>
                </p>
              </div>

              <div className="space-y-4">
                <SignOutButton>
                  <Button
                    variant="destructive"
                    size="lg"
                    className="w-full transition-colors"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Cambia account
                  </Button>
                </SignOutButton>
                <p className="text-sm text-center text-muted-foreground">
                  Per assistenza, contatta{" "}
                  <span className="font-medium">
                    appunti.liceo.aprosio@gmail.com
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <div className="flex flex-col min-h-screen">{children}</div>;
}
