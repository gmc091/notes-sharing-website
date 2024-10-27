// lib/toast-utils.ts

import { toast } from "sonner";

export const pointsToast = {
  spent: (amount: number) =>
    toast.error(`Hai speso ${amount} ${amount === 1 ? "punto" : "punti"}`, {
      // Using shadcn's default duration
    }),

  earned: (amount: number, reason: string) =>
    toast.success(
      `Hai guadagnato ${amount} ${amount === 1 ? "punto" : "punti"}`,
      {
        description: reason,
      }
    ),

  error: (message: string) =>
    toast.error("Errore punti", {
      description: message,
    }),

  info: (message: string, description?: string) =>
    toast.info(message, {
      description,
    }),
};
