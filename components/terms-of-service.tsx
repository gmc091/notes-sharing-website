"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const TermsDialog = () => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const hasAcceptedTerms = localStorage.getItem(`terms-accepted-${user?.id}`);
    if (!hasAcceptedTerms && user) {
      setOpen(true);
    }
  }, [user]);

  const handleAccept = () => {
    if (accepted && user) {
      localStorage.setItem(`terms-accepted-${user.id}`, "true");
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Accetta i Termini di Servizio</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Prima di utilizzare Appunti - Liceo Aprosio, è necessario
              accettare i nostri Termini di Servizio. Ti invitiamo a leggerli
              attentamente.
            </p>
            <p>
              L&apos;autenticazione è gestita da Clerk.com - leggi anche i loro{" "}
              <a
                href="https://clerk.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Termini di Servizio
              </a>{" "}
              e{" "}
              <a
                href="https://clerk.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </a>
              .
            </p>
            <p>
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Leggi i Termini di Servizio completi
              </a>
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="terms" className="text-sm">
              Ho letto e accetto i Termini di Servizio
            </Label>
          </div>
          <div className="flex justify-end space-x-2">
            <AlertDialogAction
              onClick={handleAccept}
              disabled={!accepted}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Accetta
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TermsDialog;
