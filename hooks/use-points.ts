// hooks/use-points.ts

import { useState, useEffect, useCallback } from "react";
import { pointsToast } from "@/lib/toast-utils";

export function usePoints() {
  const [points, setPoints] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPoints = useCallback(async () => {
    try {
      const res = await fetch("/api/points");
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
      const res = await fetch("/api/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "view",
          noteId,
        }),
      });

      if (!res.ok) throw new Error("Failed to spend points");

      setPoints((prev) => (prev !== null ? prev - amount : null));
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
