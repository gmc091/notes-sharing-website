import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { Appearance } from "@clerk/types";
import { itIT } from "@clerk/localizations";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Appunti - Liceo aprosio",
  description:
    "Un sito su cui caricare i propri appunti per condividerli con gli altri studenti.",
};

const appearance: Appearance = {
  layout: {
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "blockButton",
    shimmer: true,
    privacyPageUrl: "https://clerk.com/privacy",
    helpPageUrl: "https://clerk.com/help",
  },
  variables: {
    colorPrimary: "hsl(0 0% 9%)",
    colorText: "hsl(0 0% 3.9%)",
    colorTextSecondary: "hsl(0 0% 45.1%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInputBackground: "hsl(0 0% 100%)",
    colorInputText: "hsl(0 0% 3.9%)",
    colorTextOnPrimaryBackground: "hsl(0 0% 98%)",
    colorSuccess: "hsl(142.1 76.2% 36.3%)",
    borderRadius: "0.5rem",
    spacingUnit: "1rem",
  },
  elements: {
    card: "shadow-md",
    formButtonPrimary:
      "inline-flex h-9 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    formButtonSecondary:
      "inline-flex h-9 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
    formFieldInput:
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground text-sm",
    footerActionLink: "text-primary hover:text-primary/90 font-medium text-sm",
    headerTitle: "text-foreground font-semibold text-xl",
    headerSubtitle: "text-muted-foreground text-sm",
    socialButtonsBlockButton:
      "inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
    socialButtonsProviderIcon: "text-foreground h-5 w-5",
    formFieldLabel:
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    identityPreviewText: "text-foreground text-sm",
    identityPreviewEditButton:
      "text-muted-foreground hover:text-primary text-sm",
    alertText: "text-foreground text-sm",
    alertTextDanger: "text-destructive text-sm",
    formFieldSuccessText: "text-green-500 text-sm",
    formFieldErrorText: "text-destructive text-sm",
    inputIcon: "text-foreground h-5 w-5",
    navbar: "hidden",
    footer: "hidden",
    card__background: "bg-background",
    // Updated modal styles for vertical centering
    card__content: "p-6",
    main: "flex flex-col gap-6",
    form: "flex flex-col gap-4",
    formFieldInput__signIn:
      "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    identityPreview: "flex items-center gap-2 rounded-md border p-2",
    userButtonBox: "relative",
    userButtonTrigger:
      "flex items-center justify-center rounded-full overflow-hidden ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    userButtonAvatarBox: "relative h-8 w-8 rounded-full",
    userButtonPopoverCard:
      "z-50 min-w-[240px] rounded-md border bg-background p-1 shadow-md",
    userButtonPopoverActions: "flex flex-col space-y-1",
    userButtonPopoverAction:
      "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
    userButtonPopoverActionDestructive:
      "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground text-destructive",
    userButtonPopoverFooter: "flex items-center justify-between p-2",
    userButtonPopoverCard__backgroundColor: "hsl(0 0% 100%)",
    userButtonPopoverCard__textColor: "hsl(0 0% 3.9%)",
    userPreview: "flex items-center gap-4 p-2",
    userPreviewAvatarContainer:
      "relative h-10 w-10 rounded-full overflow-hidden",
    userPreviewTextContainer: "flex flex-col space-y-1",
    userPreviewMainIdentifier: "font-medium text-foreground",
    userPreviewSecondaryIdentifier: "text-sm text-muted-foreground",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={itIT} appearance={appearance}>
      <html lang="it" className="h-full">
        <TooltipProvider>
          <body className="flex flex-col min-h-full">{children}</body>
        </TooltipProvider>
      </html>
    </ClerkProvider>
  );
}
