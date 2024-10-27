// components/user-button.tsx

import { useClerk, useUser } from "@clerk/nextjs";
import * as React from "react";
import {
  LogOut,
  User as UserIcon,
  ChevronDown,
  Shield,
  Trophy,
  History,
  Coins,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export function CustomUserButton() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [open, setOpen] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [showInLeaderboard, setShowInLeaderboard] = React.useState(true);
  const [points, setPoints] = React.useState<number | null>(null);
  const [isLoadingPoints, setIsLoadingPoints] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [prefsResponse, pointsResponse] = await Promise.all([
          fetch("/api/user/preferences"),
          fetch("/api/points"),
        ]);
        const [prefsData, pointsData] = await Promise.all([
          prefsResponse.json(),
          pointsResponse.json(),
        ]);

        setShowInLeaderboard(prefsData.showInLeaderboard);
        setPoints(pointsData.points);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoadingPoints(false);
      }
    };
    fetchData();
  }, []);

  const handleVisibilityChange = async (checked: boolean) => {
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showInLeaderboard: checked }),
      });

      if (response.ok) {
        setShowInLeaderboard(checked);
      }
    } catch (error) {
      console.error("Error updating preference:", error);
    }
  };

  if (!user) return null;

  const UserAvatar = ({ size }: { size: "sm" | "lg" }) => {
    if (imageError) {
      return (
        <div
          className={cn(
            "flex items-center justify-center bg-primary/10 rounded-full",
            size === "sm" ? "h-6 w-6" : "h-12 w-12"
          )}
        >
          <UserIcon
            className={cn(
              "text-primary",
              size === "sm" ? "h-4 w-4" : "h-6 w-6"
            )}
          />
        </div>
      );
    }

    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden",
          size === "sm" ? "h-6 w-6" : "h-12 w-12"
        )}
      >
        <Image
          src={user.imageUrl}
          alt={user.fullName || "User avatar"}
          fill
          className="object-cover"
          sizes={size === "sm" ? "24px" : "48px"}
          priority
          onError={() => setImageError(true)}
        />
      </div>
    );
  };

  return (
    <div className="flex items-center gap-3">
      {/* Points Display */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full">
        <Coins className="h-4 w-4 text-primary" />
        {isLoadingPoints ? (
          <Skeleton className="h-4 w-12" />
        ) : (
          <span className="text-sm font-medium">{points} punti</span>
        )}
      </div>

      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50">
            <UserAvatar size="sm" />
            <span className="ml-2 line-clamp-1">
              {user.fullName || user.username}
            </span>
            <ChevronDown
              className={cn(
                "relative top-[1px] ml-1 h-3 w-3 transition-transform duration-200",
                open && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 min-w-[280px] overflow-hidden rounded-md border bg-background shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          >
            <div className="flex items-center gap-4 p-4 border-b bg-muted/10">
              <div className="ring-2 ring-background rounded-full">
                <UserAvatar size="lg" />
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.fullName || user.username}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
                {/* Mobile Points Display */}
                <div className="flex items-center gap-1 sm:hidden">
                  <Coins className="h-3.5 w-3.5 text-primary" />
                  {isLoadingPoints ? (
                    <Skeleton className="h-4 w-12" />
                  ) : (
                    <span className="text-xs font-medium">{points} punti</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-2">
              <DropdownMenu.Item
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onSelect={() => {
                  setOpen(false);
                  router.push("/points");
                }}
              >
                <History className="mr-2 h-4 w-4" />
                <span>Storico punti</span>
              </DropdownMenu.Item>

              <div className="flex items-center justify-between px-3 py-2 rounded-sm hover:bg-accent hover:text-accent-foreground">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Mostra nella classifica</span>
                </div>
                <Switch
                  checked={showInLeaderboard}
                  onCheckedChange={handleVisibilityChange}
                />
              </div>

              <DropdownMenu.Item
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                onSelect={() => {
                  setOpen(false);
                  openUserProfile();
                }}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Il mio profilo</span>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="mx-1 my-1 h-px bg-muted" />

              <DropdownMenu.Item
                className="relative flex w-full cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors text-red-600 hover:bg-red-100 hover:text-red-900 focus:bg-red-100 focus:text-red-900 dark:hover:bg-red-900 dark:hover:text-red-100"
                onSelect={() => {
                  setOpen(false);
                  signOut();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Esci</span>
              </DropdownMenu.Item>
            </div>

            <div className="px-3 py-2 mt-1 border-t bg-muted/5">
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Secured by Clerk</span>
              </div>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
