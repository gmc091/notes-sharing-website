"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  ChevronRight,
  ScrollText,
  ShieldCheck,
  User2,
} from "lucide-react";

const TermsDialog = () => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [accepted, setAccepted] = useState({
    privacy: false,
    terms: false,
    student: false,
  });

  useEffect(() => {
    const hasAcceptedTerms = localStorage.getItem(`terms-accepted-${user?.id}`);
    if (!hasAcceptedTerms && user) {
      setOpen(true);
    }
  }, [user]);

  const allAccepted = Object.values(accepted).every(Boolean);

  const handleAccept = () => {
    if (allAccepted && user) {
      localStorage.setItem(`terms-accepted-${user.id}`, "true");
      setOpen(false);
    }
  };

  const steps = [
    {
      title: "Benvenuto su Appunti Aprosio",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Benvenuto nella nostra piattaforma di condivisione appunti per il
            Liceo Aprosio. Prima di iniziare, abbiamo bisogno che tu legga e
            accetti alcuni importanti termini e condizioni.
          </p>
          <div className="grid grid-cols-1 gap-4 mt-6">
            <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
              <ScrollText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">
                  Condivisione Responsabile
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Condividi e accedi agli appunti nel rispetto del lavoro degli
                  altri studenti
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Privacy Garantita</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  I tuoi dati sono protetti e gestiti in modo sicuro
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
              <User2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Collaborazione Attiva</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Unisciti a una community di studenti che cresce attraverso lo
                  scambio di conoscenze e il supporto reciproco
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Termini e Condizioni",
      icon: ScrollText,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={accepted.terms}
                  onCheckedChange={(checked) =>
                    setAccepted((prev) => ({
                      ...prev,
                      terms: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="terms" className="text-sm leading-none">
                  Accetto i Termini di Servizio
                </Label>
              </div>
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary block pl-6"
              >
                Leggi i Termini di Servizio completi →
              </a>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="privacy"
                  checked={accepted.privacy}
                  onCheckedChange={(checked) =>
                    setAccepted((prev) => ({
                      ...prev,
                      privacy: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="privacy" className="text-sm leading-none">
                  Accetto la Privacy Policy
                </Label>
              </div>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary block pl-6"
              >
                Leggi la Privacy Policy completa →
              </a>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="student"
                checked={accepted.student}
                onCheckedChange={(checked) =>
                  setAccepted((prev) => ({
                    ...prev,
                    student: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="student" className="text-sm leading-none">
                Confermo di essere uno studente del Liceo Aprosio
              </Label>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h4 className="text-sm font-medium mb-2">
              Autenticazione con Clerk.com
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              L&apos;autenticazione è gestita in modo sicuro da Clerk.com.
              Accettando, confermi di aver letto anche:
            </p>
            <div className="space-y-2">
              <a
                href="https://clerk.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline block"
              >
                • Termini di Servizio di Clerk.com
              </a>
              <a
                href="https://clerk.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline block"
              >
                • Privacy Policy di Clerk.com
              </a>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {React.createElement(steps[step - 1].icon, {
              className: "h-5 w-5 text-primary",
            })}
            <AlertDialogTitle>{steps[step - 1].title}</AlertDialogTitle>
          </div>
          <div className="flex items-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index + 1 <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </AlertDialogHeader>

        {steps[step - 1].content}

        <Separator className="my-6" />

        <AlertDialogFooter>
          <div className="flex justify-end w-full gap-3">
            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continua
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setStep(1)}>
                  Indietro
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={!allAccepted}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Accetta e Inizia
                </Button>
              </>
            )}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TermsDialog;
