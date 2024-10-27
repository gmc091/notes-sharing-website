// components/notes/rating-control.tsx
import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingControlProps {
  value: number;
  onChange: (rating: number) => void;
  readOnly?: boolean;
  className?: string;
  disabled?: boolean;
}

export const RatingControl: React.FC<RatingControlProps> = ({
  value,
  onChange,
  readOnly = false,
  className,
  disabled = false,
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={() => setHoverValue(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && !disabled && onChange(star)}
          onMouseEnter={() => !readOnly && !disabled && setHoverValue(star)}
          disabled={readOnly || disabled}
          className={cn(
            "transition-all",
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Star
            className={cn(
              "w-6 h-6 transition-colors",
              star <= (hoverValue || value)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
};
