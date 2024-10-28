// components/leaderboard.tsx
import React, { useState, useEffect, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LeaderboardUser {
  id: string;
  username: string;
  noteCount: number;
  isCurrentUser: boolean;
}

interface LeaderboardItemProps {
  rank: number;
  username: string;
  noteCount: number;
  isCurrentUser: boolean;
}

const formatNumber = (num: number): string =>
  num >= 1000 ? `${(num / 1000).toFixed(1)}k` : num.toString();

const LeaderboardItem = memo(
  ({ rank, username, noteCount, isCurrentUser }: LeaderboardItemProps) => {
    const badges = {
      1: { icon: Medal, color: "text-yellow-500" },
      2: { icon: Medal, color: "text-gray-400" },
      3: { icon: Medal, color: "text-amber-600" },
    } as const;

    const BadgeIcon = badges[rank as keyof typeof badges]?.icon;

    return (
      <div
        className={cn(
          "flex items-center justify-between py-1.5 px-2 rounded-md",
          isCurrentUser ? "bg-primary/5" : "bg-white"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 text-center flex justify-center">
            {BadgeIcon ? (
              <BadgeIcon
                className={cn(
                  "h-4 w-4",
                  badges[rank as keyof typeof badges].color
                )}
              />
            ) : (
              <span className="text-xs text-muted-foreground">{rank}</span>
            )}
          </div>
          <span className="text-sm font-medium truncate">
            {username}
            {isCurrentUser && (
              <Badge variant="secondary" className="ml-2 text-[10px]">
                Tu
              </Badge>
            )}
          </span>
        </div>
        <span className="text-sm font-medium">{formatNumber(noteCount)}</span>
      </div>
    );
  }
);

LeaderboardItem.displayName = "LeaderboardItem";

export function Leaderboard() {
  const [leaderboardState, setLeaderboardState] = useState<{
    users: LeaderboardUser[];
    currentUser: (LeaderboardUser & { rank: number }) | null;
    loading: boolean;
    error: string | null;
  }>({
    users: [],
    currentUser: null,
    loading: true,
    error: null,
  });

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/users/leaderboard/route.ts");
      if (!response.ok) throw new Error("Failed to fetch leaderboard");

      const data = await response.json();

      const topThree = data.users.slice(0, 3);
      const userPosition = data.users.findIndex(
        (user: LeaderboardUser) => user.isCurrentUser
      );

      setLeaderboardState({
        users: topThree,
        currentUser:
          userPosition >= 3
            ? { ...data.users[userPosition], rank: userPosition + 1 }
            : null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboardState((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load leaderboard",
      }));
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();

    // Refresh leaderboard every 5 minutes
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const { users, currentUser, loading, error } = leaderboardState;

  if (loading) {
    return (
      <Card className="h-full border">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Classifica Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-1.5">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 px-2"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          Classifica Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-1.5">
        {error ? (
          <div className="text-sm text-muted-foreground text-center py-2">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-2">
            Nessun dato disponibile
          </div>
        ) : (
          <div className="space-y-1.5">
            {users.map((user, index) => (
              <LeaderboardItem
                key={user.id}
                rank={index + 1}
                username={user.username}
                noteCount={user.noteCount}
                isCurrentUser={user.isCurrentUser}
              />
            ))}
            {currentUser && (
              <>
                {users.length > 0 && (
                  <div className="my-2 border-t border-dashed opacity-50" />
                )}
                <LeaderboardItem
                  rank={currentUser.rank}
                  username={currentUser.username}
                  noteCount={currentUser.noteCount}
                  isCurrentUser={true}
                />
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default Leaderboard;
