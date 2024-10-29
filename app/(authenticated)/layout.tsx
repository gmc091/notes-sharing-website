// app/(authenticated)/layout.tsx
import { TooltipProvider } from "@/components/ui/tooltip";
import UserWrapper from "@/components/auth-wrapper";
import TermsDialog from "@/components/terms-of-service";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <UserWrapper>
        <TermsDialog />
        <Navbar />
        <main className="flex-grow bg-gray-50">{children}</main>
        <Footer />
        <Toaster />
      </UserWrapper>
    </TooltipProvider>
  );
}
