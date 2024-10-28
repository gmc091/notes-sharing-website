// components/notes/purchase-dialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

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
}) => (
  <Dialog open={isOpen} onOpenChange={() => onCancel()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Conferma acquisto</DialogTitle>
        <DialogDescription className="space-y-2">
          <p>Vuoi spendere 1 punto per acquistare questa nota?</p>
          <p className="text-sm text-muted-foreground">
            Punti disponibili: {currentPoints ?? 0}
          </p>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button
          onClick={onConfirm}
          disabled={!currentPoints || currentPoints < 1}
        >
          <Coins className="mr-2 h-4 w-4" /> Acquista
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
