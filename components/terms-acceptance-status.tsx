// components/terms-acceptance-status.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollText, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export const TermsAcceptanceStatus = () => {
  const { user, isLoaded } = useUser();
  const [acceptanceData, setAcceptanceData] = useState<{
    acceptedAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTermsAcceptance = async () => {
      if (user) {
        try {
          const response = await axios.get("/api/v1/terms");
          setAcceptanceData(response.data);
        } catch (error) {
          console.error("Error checking terms acceptance:", error);
        }
        setLoading(false);
      }
    };

    checkTermsAcceptance();
  }, [user]);

  if (!isLoaded || loading || !user) {
    return null;
  }

  return (
    <Card
      className={`mb-8 border-2 ${
        acceptanceData ? "border-green-100" : "border-yellow-100"
      }`}
    >
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-3">
          <ScrollText className="h-5 w-5 text-primary" />
          <CardTitle>Termini di Servizio e Privacy Policy</CardTitle>
        </div>
        <CardDescription className="text-base">
          Stato di accettazione dei termini per {user.firstName} {user.lastName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Status Section */}
          <div
            className={`rounded-lg p-4 flex items-start gap-3 
            ${
              acceptanceData
                ? "bg-green-50 border border-green-100"
                : "bg-yellow-50 border border-yellow-100"
            }`}
          >
            {acceptanceData ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p
                className={`font-medium ${
                  acceptanceData ? "text-green-800" : "text-yellow-800"
                }`}
              >
                {acceptanceData ? "Termini Accettati" : "Termini Non Accettati"}
              </p>
              <p
                className={`text-sm ${
                  acceptanceData ? "text-green-700" : "text-yellow-700"
                }`}
              >
                {acceptanceData ? (
                  <>
                    Hai accettato i termini il{" "}
                    {new Date(acceptanceData.acceptedAt).toLocaleDateString(
                      "it-IT",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </>
                ) : (
                  "Non hai ancora accettato i termini di servizio e la privacy policy. Per accettarli crea un account."
                )}
              </p>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <a
                href="/terms"
                className="inline-flex items-center justify-between rounded-md p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground border"
              >
                Termini di Servizio
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/privacy"
                className="inline-flex items-center justify-between rounded-md p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground border"
              >
                Privacy Policy
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TermsAcceptanceStatus;
