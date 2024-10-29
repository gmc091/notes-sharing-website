// hooks/use-points.ts
import { useState, useEffect, useCallback } from "react";
import { pointsToast } from "@/lib/toast-utils";

export function usePoints() {
  const [points, setPoints] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPoints = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/users/me/points");
      if (!res.ok) throw new Error("Failed to fetch points");
      const data = await res.json();
      setPoints(data.points);
    } catch (error) {
      console.error("Error fetching points:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  const spendPoints = useCallback(async (amount: number, noteId: number) => {
    try {
      // Optimistically update the UI
      setPoints((prev) => (prev !== null ? prev - amount : null));

      const res = await fetch("/api/v1/users/me/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PURCHASE",
          noteId,
        }),
      });

      if (!res.ok) {
        // If the request fails, rollback the optimistic update
        setPoints((prev) => (prev !== null ? prev + amount : null));
        throw new Error("Failed to spend points");
      }

      const data = await res.json();
      // Update with the actual server value
      setPoints(data.points);
      pointsToast.spent(amount);
      return true;
    } catch (error) {
      console.error("Error spending points:", error);
      pointsToast.error("Impossibile spendere i punti");
      return false;
    }
  }, []);

  return {
    points,
    isLoading,
    fetchPoints,
    spendPoints,
  };
}
