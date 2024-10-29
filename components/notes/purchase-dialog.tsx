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

interface PurchaseDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  currentPoints: number | null;
}

export const PurchaseDialog: React.FC<PurchaseDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  currentPoints,
}) => {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleConfirm = async () => {
    setIsPurchasing(true);
    try {
      await onConfirm();
    } finally {
      setIsPurchasing(false);
    }
  };

  const hasEnoughPoints = currentPoints && currentPoints >= 1;

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
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">I tuoi punti</span>
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{currentPoints ?? 0}</span>
                </div>
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
                <div className="flex items-center gap-2 text-sm p-2 bg-primary/5 rounded">
                  <Download className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Accesso illimitato</span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 bg-primary/5 rounded">
                  <ScrollText className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Download in PDF</span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 bg-primary/5 rounded">
                  <Share2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Condivisione diretta</span>
                </div>
                <div className="flex items-center gap-2 text-sm p-2 bg-primary/5 rounded">
                  <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Garanzia qualità</span>
                </div>
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
};
