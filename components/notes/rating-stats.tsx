// components/notes/rating-stats.tsx
import React from "react";
import { Star } from "lucide-react";

interface RatingStatsProps {
  rating: number | null | undefined;
  count: number;
}

export const RatingStats: React.FC<RatingStatsProps> = ({ rating, count }) => {
  if (!rating || count === 0) {
    return <p className="text-sm text-muted-foreground">Nessuna valutazione</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
      <span className="text-sm text-muted-foreground">
        ({count} {count === 1 ? "voto" : "voti"})
      </span>
    </div>
  );
};
