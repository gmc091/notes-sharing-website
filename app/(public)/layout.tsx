// app/(public)/layout.tsx
import { TooltipProvider } from "@/components/ui/tooltip";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
