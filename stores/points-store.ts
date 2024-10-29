// stores/points-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

export type TransactionType =
  | "VIEW_SPENT"
  | "PURCHASE_SPENT"
  | "PURCHASE_EARNED"
  | "UPLOAD_REWARD"
  | "MONTHLY_BONUS";

interface Transaction {
  type: TransactionType;
  amount: number;
  description: string;
  noteId?: number; // Added for purchase transactions
}

interface PointsState {
  points: number | null;
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;
}

interface PointsActions {
  setPoints: (points: number) => void;
  fetchPoints: () => Promise<void>;
  executeTransaction: (transaction: Transaction) => Promise<boolean>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const TRANSACTION_CONFIGS = {
  UPLOAD_REWARD: {
    message: (amount: number) =>
      `Hai guadagnato ${amount} ${
        amount === 1 ? "punto" : "punti"
      } per il caricamento`,
    type: "success" as const,
  },
  PURCHASE_EARNED: {
    message: (amount: number) =>
      `Hai guadagnato ${amount} ${
        amount === 1 ? "punto" : "punti"
      } dalla vendita`,
    type: "success" as const,
  },
  PURCHASE_SPENT: {
    message: (amount: number) =>
      `Hai speso ${Math.abs(amount)} ${
        Math.abs(amount) === 1 ? "punto" : "punti"
      }`,
    type: "info" as const,
  },
  VIEW_SPENT: {
    message: (amount: number) =>
      `Hai speso ${Math.abs(amount)} ${
        Math.abs(amount) === 1 ? "punto" : "punti"
      } per la visualizzazione`,
    type: "info" as const,
  },
  MONTHLY_BONUS: {
    message: (amount: number) =>
      `Hai ricevuto ${amount} ${
        amount === 1 ? "punto" : "punti"
      } di bonus mensile`,
    type: "success" as const,
  },
} as const;

export const usePointsStore = create<PointsState & PointsActions>()(
  persist(
    (set, get) => ({
      points: null,
      lastFetched: null,
      isLoading: false,
      error: null,

      setPoints: (points) => {
        set({ points, lastFetched: Date.now(), isLoading: false });
      },

      fetchPoints: async () => {
        const state = get();
        const now = Date.now();

        // Return early if we have fresh cached data
        if (
          state.points !== null &&
          state.lastFetched &&
          now - state.lastFetched < CACHE_DURATION
        ) {
          return;
        }

        // Return if already loading
        if (state.isLoading) return;

        set({ isLoading: true });

        try {
          const response = await fetch("/api/v1/users/me/points");
          if (!response.ok) throw new Error("Failed to fetch points");

          const data = await response.json();
          // Single state update
          set({
            points: data.points,
            lastFetched: now,
            error: null,
            isLoading: false,
          });
        } catch (err) {
          // Single state update for error
          set({
            error: "Unable to load points",
            isLoading: false,
            lastFetched: now,
          });
          console.error("Error fetching points:", err);
        }
      },

      executeTransaction: async (transaction) => {
        const { points: currentPoints } = get();

        if (
          transaction.amount < 0 &&
          (currentPoints === null ||
            currentPoints < Math.abs(transaction.amount))
        ) {
          toast.error("Punti insufficienti");
          return false;
        }

        try {
          const requestBody =
            transaction.type === "PURCHASE_SPENT"
              ? {
                  action: "PURCHASE",
                  noteId: transaction.noteId,
                }
              : {
                  type: transaction.type,
                  amount: transaction.amount,
                  description: transaction.description,
                };

          const response = await fetch("/api/v1/users/me/points", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) throw new Error("Transaction failed");

          const data = await response.json();

          // Force a fresh fetch to ensure we have the latest data
          set({
            points: data.points,
            lastFetched: null, // This will force a refresh on next fetch
          });

          // Fetch fresh data
          await get().fetchPoints();

          const config = TRANSACTION_CONFIGS[transaction.type];
          toast[config.type](config.message(Math.abs(transaction.amount)));

          return true;
        } catch (error) {
          console.error("Transaction error:", error);
          toast.error("Errore durante la transazione");
          // Force a fresh fetch on error to ensure consistency
          set({ lastFetched: null });
          await get().fetchPoints();
          return false;
        }
      },
    }),
    {
      name: "points-storage",
      partialize: (state) => ({
        points: state.points,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

// Hook for common point operations
export function usePoints() {
  const store = usePointsStore();

  const earnPoints = async (
    amount: number,
    type: Extract<
      TransactionType,
      "UPLOAD_REWARD" | "PURCHASE_EARNED" | "MONTHLY_BONUS"
    >,
    description: string
  ) => {
    return store.executeTransaction({
      type,
      amount: Math.abs(amount),
      description,
    });
  };

  const spendPoints = async (
    amount: number,
    type: Extract<TransactionType, "VIEW_SPENT" | "PURCHASE_SPENT">,
    description: string,
    noteId?: number
  ) => {
    return store.executeTransaction({
      type,
      amount: -Math.abs(amount),
      description,
      noteId,
    });
  };

  return {
    points: store.points,
    isLoading: store.isLoading,
    error: store.error,
    earnPoints,
    spendPoints,
    fetchPoints: store.fetchPoints,
  };
}
