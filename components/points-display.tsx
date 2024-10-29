// components/points-display.tsx
import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePointsContext } from "@/context/points-context";

interface PointsDisplayProps {
  className?: string;
  variant?: "default" | "badge";
  showIcon?: boolean;
}

export function PointsDisplay({
  className = "",
  variant = "default",
  showIcon = true,
}: PointsDisplayProps) {
  const { points, isLoading } = usePointsContext();

  if (isLoading) {
    return <Skeleton className="h-4 w-12" />;
  }

  const content = (
    <>
      {showIcon && <Coins className="h-3.5 w-3.5" />}
      <span>{points ?? 0} punti</span>
    </>
  );

  if (variant === "badge") {
    return (
      <Badge variant="secondary" className={`gap-1 ${className}`}>
        {content}
      </Badge>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>{content}</div>
  );
}
