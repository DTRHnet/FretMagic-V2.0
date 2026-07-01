import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Flame, Zap, Trophy, BookOpen, Music, Target, BarChart3, ChevronRight, Crown } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <NavBar />
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Sign in to continue</h1>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-primary text-primary-foreground">
              Sign In
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const { data: dashboardData, isLoading } = trpc.dashboard.getSummary.useQuery();
  const { data: subscription } = trpc.subscription.getStatus.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavBar />
        <div className="container py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const quickAccessItems = [
    { icon: Music, label: "Fretboard", href: "/fretboard", color: "text-amber-400" },
    { icon: BookOpen, label: "Learn", href: "/learn", color: "text-sky-400" },
    { icon: Target, label: "Pitch Trainer", href: "/pitch-trainer", color: "text-emerald-400" },
    { icon: Zap, label: "AI Assistant", href: "/ai-assistant", color: "text-violet-400", premium: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="container py-12">
        {/* Welcome Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-4xl font-bold">
              Welcome back, <span className="text-gold-gradient">{user?.name?.split(" ")[0]}</span>
            </h1>
            {subscription?.isPremium && (
              <Badge className="premium-badge">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Keep up your streak and level up your guitar skills</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            {
              icon: Zap,
              label: "Level",
              value: dashboardData?.gamification?.level ?? 1,
              color: "text-amber-400",
            },
            {
              icon: Flame,
              label: "Streak",
              value: `${dashboardData?.gamification?.currentStreak ?? 0} days`,
              color: "text-orange-400",
            },
            {
              icon: Trophy,
              label: "XP",
              value: (dashboardData?.gamification?.xp ?? 0).toLocaleString(),
              color: "text-yellow-400",
            },
            {
              icon: BookOpen,
              label: "Lessons",
              value: dashboardData?.completedLessons ?? 0,
              color: "text-sky-400",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4 border-border">
                <div className="flex items-start justify-between mb-2">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Quick Access */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="p-6 rounded-lg border border-border bg-card card-hover relative overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <Icon className={`h-8 w-8 ${item.color} mb-3`} />
                    <p className="font-display font-semibold text-foreground">{item.label}</p>
                    {item.premium && (
                      <Badge className="mt-2 bg-primary/20 text-primary border-primary/30 text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
              );

              if (item.premium && !subscription?.isPremium) {
                return (
                  <Link key={item.label} href="/pricing">
                    {content}
                  </Link>
                );
              }

              return (
                <Link key={item.label} href={item.href}>
                  {content}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">Recent Practice Sessions</h2>
          {dashboardData?.recentSessions && dashboardData.recentSessions.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentSessions.slice(0, 5).map((session, idx) => (
                <Card key={idx} className="p-4 border-border flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground capitalize">{session.sessionType.replace("_", " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(session.durationSeconds / 60)} min
                      {session.accuracyScore && ` • ${session.accuracyScore.toFixed(0)}% accuracy`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-primary">+{session.xpEarned} XP</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 border-border text-center">
              <p className="text-muted-foreground mb-4">No practice sessions yet. Start your first session!</p>
              <Link href="/fretboard">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Start Practicing
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-border">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sky-400" />
              Practice Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Practice Time</span>
                <span className="font-semibold text-foreground">{dashboardData?.stats?.totalMinutes ?? 0} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Sessions Completed</span>
                <span className="font-semibold text-foreground">{dashboardData?.stats?.totalSessions ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Average Accuracy</span>
                <span className="font-semibold text-foreground">{dashboardData?.stats?.avgAccuracy ?? 0}%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              Next Milestone
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Level {(dashboardData?.gamification?.level ?? 1) + 1}</p>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${((dashboardData?.gamification?.xp ?? 0) % 100) / 100 * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(dashboardData?.gamification?.xp ?? 0) % 100} / 100 XP
                </p>
              </div>
              <Link href="/leaderboard">
                <Button variant="outline" className="w-full border-border hover:bg-secondary">
                  View Leaderboard
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
