// components/RatingControl.tsx
import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingControlProps {
  value: number;
  onChange: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingControl({
  value,
  onChange,
  readOnly = false,
  size = "md",
  className,
}: RatingControlProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={() => setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          className={cn(
            "transition-colors",
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
          onClick={() => !readOnly && onChange(rating)}
          onMouseEnter={() => !readOnly && setHoverRating(rating)}
          disabled={readOnly}
        >
          <Star
            className={cn(
              sizes[size],
              "transition-colors",
              rating <= (hoverRating || value)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}

// components/RatingStats.tsx
interface RatingStatsProps {
  rating: number | null;
  ratingCount: number;
}

export function RatingStats({ rating, ratingCount }: RatingStatsProps) {
  if (!rating || ratingCount === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Star className="h-4 w-4" />
        <span className="text-sm">Nessuna valutazione</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
      <span className="text-sm text-muted-foreground">
        ({ratingCount} {ratingCount === 1 ? "voto" : "voti"})
      </span>
    </div>
  );
}
