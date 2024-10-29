import * as React from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  LogOut,
  User as UserIcon,
  ChevronDown,
  Shield,
  Trophy,
  History,
  BookOpen,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import PointsDisplay from "@/components/points-display";

interface UserAvatarProps {
  size: "sm" | "lg";
  imageUrl: string;
  fallback: string;
}

const UserAvatar = ({ size, imageUrl, fallback }: UserAvatarProps) => {
  const [imageError, setImageError] = React.useState(false);

  if (imageError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-primary/10 rounded-full",
          size === "sm" ? "h-6 w-6" : "h-12 w-12"
        )}
      >
        <UserIcon
          className={cn("text-primary", size === "sm" ? "h-4 w-4" : "h-6 w-6")}
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
        src={imageUrl}
        alt={fallback}
        fill
        className="object-cover"
        sizes={size === "sm" ? "24px" : "48px"}
        priority
        onError={() => setImageError(true)}
      />
    </div>
  );
};

interface MenuItemProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}

const MenuItem = ({
  icon,
  children,
  onClick,
  variant = "default",
}: MenuItemProps) => (
  <DropdownMenu.Item
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors",
      variant === "default" &&
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      variant === "destructive" &&
        "text-red-600 hover:bg-red-100 hover:text-red-900 focus:bg-red-100 focus:text-red-900 dark:hover:bg-red-900 dark:hover:text-red-100"
    )}
    onSelect={(event) => {
      event.preventDefault();
      onClick();
    }}
  >
    {React.cloneElement(icon as React.ReactElement, {
      className: "mr-2 h-4 w-4",
    })}
    <span>{children}</span>
  </DropdownMenu.Item>
);

export function CustomUserButton() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [open, setOpen] = React.useState(false);
  const [showInLeaderboard, setShowInLeaderboard] = React.useState(true);
  const router = useRouter();

  // Fetch user preferences
  React.useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/v1/users/me/preferences");
        const data = await response.json();
        setShowInLeaderboard(data.showInLeaderboard);
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      }
    };
    fetchPreferences();
  }, []);

  const handleVisibilityChange = async (checked: boolean) => {
    try {
      const response = await fetch("/api/v1/users/me/preferences", {
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

  return (
    <div className="flex items-center gap-3">
      {/* Desktop Points Display */}
      <div className="hidden sm:block">
        <PointsDisplay
          variant="badge"
          showTooltip={true}
          className="bg-primary/5 px-3 py-1.5"
        />
      </div>

      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50">
            <UserAvatar
              size="sm"
              imageUrl={user.imageUrl}
              fallback={user.fullName || "User avatar"}
            />
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
            className="z-50 min-w-[280px] overflow-hidden rounded-md border bg-background shadow-md animate-in data-[side=bottom]:slide-in-from-top-2"
          >
            {/* User Info Header */}
            <div className="flex items-center gap-4 p-4 border-b bg-muted/10">
              <div className="ring-2 ring-background rounded-full">
                <UserAvatar
                  size="lg"
                  imageUrl={user.imageUrl}
                  fallback={user.fullName || "User avatar"}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.fullName || user.username}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
                {/* Mobile Points Display */}
                <div className="sm:hidden">
                  <PointsDisplay
                    showIcon={true}
                    showTooltip={false}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <MenuItem
                icon={<History />}
                onClick={() => {
                  setOpen(false);
                  router.push("/points");
                }}
              >
                Storico punti
              </MenuItem>

              <MenuItem
                icon={<BookOpen />}
                onClick={() => {
                  setOpen(false);
                  router.push("/library");
                }}
              >
                La mia libreria
              </MenuItem>

              {/* Leaderboard Toggle */}
              <div className="flex items-center justify-between px-3 py-2 rounded-sm hover:bg-accent hover:text-accent-foreground">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm">Appari nella classifica</span>
                </div>
                <Switch
                  checked={showInLeaderboard}
                  onCheckedChange={handleVisibilityChange}
                />
              </div>

              <MenuItem
                icon={<UserIcon />}
                onClick={() => {
                  setOpen(false);
                  openUserProfile();
                }}
              >
                Il mio profilo
              </MenuItem>

              <DropdownMenu.Separator className="mx-1 my-1 h-px bg-muted" />

              <MenuItem
                icon={<LogOut />}
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                variant="destructive"
              >
                Esci
              </MenuItem>
            </div>

            {/* Footer */}
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
