"use client";

import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, LogIn, UserPlus, LogOut, Mail } from "lucide-react";
import { SignInButton, SignUpButton, SignOutButton } from "@clerk/nextjs";

const AUTHORIZED_EMAILS = [
  "@liceoaprosio.it",
  "appunti.liceo.aprosio@gmail.com",
  "giovanni.croese.max@gmail.com",
  "reggia.dev@gmail.com",
];

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAuthorized = userEmail
    ? AUTHORIZED_EMAILS.some(
        (email) => userEmail.endsWith(email) || userEmail === email
      )
    : false;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl relative">
          {/* Decorative gradient elements */}
          <div
            className="absolute inset-0 -z-10 transform-gpu overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#87CEEB] to-[#4682B4] opacity-20"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>

          <Card className="w-full bg-white border shadow-lg">
            <CardHeader className="space-y-1 text-center pb-0">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
                Appunti Liceo Aprosio
              </CardTitle>
              <CardDescription className="text-gray-500">
                Accedi alla piattaforma con il tuo account scolastico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="space-y-4">
                <SignInButton mode="modal" fallbackRedirectUrl="/">
                  <Button
                    variant="outline"
                    className="w-full justify-center h-11 text-base hover:bg-gray-50"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Accedi
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal" fallbackRedirectUrl="/">
                  <Button className="w-full justify-center h-11 text-base bg-primary hover:bg-primary/90">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Crea account
                  </Button>
                </SignUpButton>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Informazioni importanti
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Mail
                        className="h-5 w-5 text-blue-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        È necessario utilizzare l&apos;email istituzionale{" "}
                        <span className="font-medium">@liceoaprosio.it</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Second gradient effect */}
          <div
            className="absolute inset-0 -z-10 transform-gpu overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%+11rem)] aspect-[1155/678] w-[36.125rem] translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#87CEEB] to-[#4682B4] opacity-20"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="w-full border bg-white shadow-lg">
            <CardHeader className="space-y-1 flex flex-col items-center text-center pb-2">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
                Accesso non autorizzato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4 text-center">
                <p className="text-gray-600 text-lg">
                  Ci dispiace, ma questa piattaforma è riservata agli studenti
                  del Liceo Aprosio.
                </p>
                <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                  <p className="text-base text-red-600">
                    Account attuale:{" "}
                    <span className="font-semibold">{userEmail}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <SignOutButton>
                  <Button
                    variant="destructive"
                    className="w-full h-11 text-base justify-center"
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Esci e accedi con un altro account
                  </Button>
                </SignOutButton>
                <p className="text-sm text-center text-muted-foreground">
                  Se pensi che questo sia un errore, contatta{" "}
                  <b> appunti.liceo.aprosio@gmail.com</b>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <body className="flex flex-col min-h-full">{children}</body>;
}
