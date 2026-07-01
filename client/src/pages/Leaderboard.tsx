import { useAuth } from "@/_core/hooks/useAuth";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, Trophy, Flame, Zap, Medal } from "lucide-react";

export default function Leaderboard() {
  const { user } = useAuth();
  const { data: leaderboard, isLoading } = trpc.gamification.getLeaderboard.useQuery();

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Medal className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="container py-12">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold mb-3">
            Global <span className="text-gold-gradient">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground">Compete with guitarists worldwide. Climb the ranks and earn your place at the top.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((entry, idx) => {
              const isCurrentUser = user && entry.userId === user.id;
              return (
                <Card
                  key={entry.userId}
                  className={`p-6 border-border flex items-center justify-between ${
                    isCurrentUser ? "ring-2 ring-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getMedalIcon(idx + 1) || (
                        <span className="font-display text-xl font-bold text-muted-foreground">#{idx + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground">
                        {entry.name || "Anonymous Guitarist"}
                        {isCurrentUser && <Badge className="ml-2 bg-primary/20 text-primary">You</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-400 mb-1">
                        <Zap className="h-4 w-4" />
                        <span className="font-display font-bold">{entry.xp.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-orange-400 mb-1">
                        <Flame className="h-4 w-4" />
                        <span className="font-display font-bold">{entry.currentStreak}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Streak</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 border-border text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No leaderboard data yet. Start practicing to climb the ranks!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
