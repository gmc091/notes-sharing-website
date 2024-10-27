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
  const { points, isLoading, fetchPoints, spendPoints } = usePoints();

  const contextValue = {
    points,
    isLoading,
    fetchPoints,
    spendPoints,
  };

  return (
    <PointsContext.Provider value={contextValue}>
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
