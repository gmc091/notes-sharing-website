import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Coins,
  Download,
  Lock,
  ScrollText,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { usePointsStore } from "@/stores/points-store";
import { cn } from "@/lib/utils";

interface PurchaseDialogProps {
  isOpen: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function PurchaseDialog({
  isOpen,
  onConfirm,
  onCancel,
}: PurchaseDialogProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { points, setPoints } = usePointsStore();

  const handleConfirm = async () => {
    if (!hasEnoughPoints) return;

    setIsPurchasing(true);
    try {
      // Optimistically update points
      setPoints((points ?? 0) - 1);

      await onConfirm();
    } catch (error) {
      // Rollback on error
      setPoints((points ?? 0) + 1);
      console.error("Purchase failed:", error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const hasEnoughPoints = points !== null && points >= 1;

  const PointsDisplay = () => (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full",
        "bg-gradient-to-r from-primary/10 to-primary/5",
        "transition-all duration-300"
      )}
    >
      <Coins className="h-4 w-4 text-primary/70" />
      <span className="font-medium text-primary/70">{points ?? 0}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => !isPurchasing && onCancel()}>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5 text-primary" />
            Sblocca Appunto
          </DialogTitle>
          <DialogDescription>
            Accedi a questo appunto utilizzando 1 punto del tuo credito
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2">
          <div className="flex flex-col space-y-4">
            {/* Points Status */}
            <div className="p-4 bg-muted/50 rounded-lg border shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">I tuoi punti</span>
                <PointsDisplay />
              </div>
              {!hasEnoughPoints && (
                <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Punti insufficienti per l&apos;acquisto</span>
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Acquistando ottieni:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { icon: Download, label: "Accesso illimitato" },
                  { icon: ScrollText, label: "Download in PDF" },
                  { icon: Share2, label: "Condivisione diretta" },
                  { icon: ShieldCheck, label: "Garanzia qualità" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 text-sm p-2 bg-primary/5 rounded transition-colors hover:bg-primary/10"
                  >
                    <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <DialogFooter className="p-4">
          <div className="flex flex-col-reverse sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isPurchasing}
              className="w-full sm:w-1/2"
            >
              Annulla
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!hasEnoughPoints || isPurchasing}
              className="w-full sm:w-1/2"
            >
              {isPurchasing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Acquisto...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Coins className="h-4 w-4" />
                  <span>Acquista</span>
                </div>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
