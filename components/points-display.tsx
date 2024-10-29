import React, { useEffect } from "react";
import { Coins, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { usePointsStore } from "@/stores/points-store";
import { useMediaQuery } from "@/hooks/use-media-query";

interface PointsDisplayProps {
  className?: string;
  variant?: "default" | "badge";
  showIcon?: boolean;
  showTooltip?: boolean;
}

function PointsDisplayComponent({
  className = "",
  variant = "default",
  showIcon = true,
  showTooltip = true,
}: PointsDisplayProps) {
  const { points, isLoading, error, fetchPoints } = usePointsStore();
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Fetch points on mount and set up refresh interval
  useEffect(() => {
    // Initial fetch
    fetchPoints();

    // Refresh every 5 minutes
    const intervalId = setInterval(fetchPoints, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchPoints]);

  const content = (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300",
        variant === "badge" &&
          "bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10",
        className
      )}
    >
      {showIcon && (
        <Coins
          className={cn(
            "transition-colors",
            variant === "badge"
              ? "h-3.5 w-3.5 text-primary/70"
              : "h-4 w-4 text-primary"
          )}
        />
      )}
      {isLoading && !points ? (
        <Skeleton className="h-4 w-12" />
      ) : error ? (
        <div className="flex items-center gap-1 text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          <span className="text-sm">Error</span>
        </div>
      ) : (
        <span
          className={cn(
            "font-medium transition-colors whitespace-nowrap",
            variant === "badge"
              ? "text-sm text-primary/70"
              : "text-base text-foreground"
          )}
        >
          {points ?? 0}
        </span>
      )}
    </div>
  );

  if (variant === "badge") {
    return (
      <div className="relative group">
        {content}
        {showTooltip && !isMobile && (
          <div className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full bg-popover text-popover-foreground text-xs rounded-md px-2 py-1 whitespace-nowrap shadow-lg z-50">
            I tuoi punti
          </div>
        )}
      </div>
    );
  }

  return showTooltip && !isMobile ? (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent>
        <p>I tuoi punti</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    content
  );
}

// Named export for backward compatibility
export const PointsDisplay = PointsDisplayComponent;

// Default export for new usage
export default PointsDisplayComponent;
