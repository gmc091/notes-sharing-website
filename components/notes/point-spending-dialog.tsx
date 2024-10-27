// components/notes/point-spending-dialog.tsx
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

interface PointSpendingDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  currentPoints: number | null;
}

export const PointSpendingDialog: React.FC<PointSpendingDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  currentPoints,
}) => (
  <Dialog open={isOpen} onOpenChange={() => onCancel()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Conferma visualizzazione</DialogTitle>
        <DialogDescription className="space-y-2">
          <p>Vuoi spendere 1 punto per visualizzare questo appunto?</p>
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
          <Coins className="mr-2 h-4 w-4" /> Spendi 1 punto
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
