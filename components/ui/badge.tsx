// badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline:
          "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
        math: "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100",
        physics:
          "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100",
        chemistry:
          "bg-green-50 text-green-700 hover:bg-green-100 border border-green-100",
        literature:
          "bg-red-50 text-red-700 hover:bg-red-100 border border-red-100",
        history:
          "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100",
        biology:
          "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100",
        art: "bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-100",
        economics:
          "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-100",
        philosophy:
          "bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-100",
        subject:
          "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
