// context/points-context.tsx
"use client";

import React, { createContext, useContext } from "react";
import { usePoints } from "@/hooks/use-points";

interface PointsContextType {
  points: number | null;
  isLoading: boolean;
  fetchPoints: () => Promise<void>;
  spendPoints: (amount: number, noteId: number) => Promise<boolean>;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function PointsProvider({ children }: { children: React.ReactNode }) {
  // usePoints now uses Zustand under the hood
  const pointsData = usePoints();

  return (
    <PointsContext.Provider value={pointsData}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePointsContext() {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error("usePointsContext must be used within a PointsProvider");
  }
  return context;
}
