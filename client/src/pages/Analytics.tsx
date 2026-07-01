import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, BarChart3, TrendingUp, Target, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "wouter";

export default function Analytics() {
  const { isAuthenticated } = useAuth();
  const { data: analyticsData, isLoading } = trpc.analytics.getStats.useQuery(undefined, { enabled: isAuthenticated });

  const analytics = analyticsData?.stats || { totalMinutes: 0, totalSessions: 0, avgAccuracy: 0 };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavBar />
        <div className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <BarChart3 className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold mb-4">Analytics Dashboard</h1>
            <p className="text-muted-foreground mb-8">Track your progress and see detailed insights about your practice sessions.</p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-primary text-primary-foreground">
                Sign In to View Analytics
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="container py-12">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold mb-3">
            Analytics <span className="text-gold-gradient">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">Track your progress and identify areas for improvement</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : analytics ? (
          <div className="space-y-8">
            {/* Key metrics */}
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: Clock, label: "Total Practice", value: `${analytics.totalMinutes}m`, color: "text-sky-400" },
                { icon: Target, label: "Avg Accuracy", value: `${analytics.avgAccuracy}%`, color: "text-emerald-400" },
                { icon: TrendingUp, label: "Sessions", value: analytics.totalSessions, color: "text-amber-400" },
                { icon: BarChart3, label: "Lessons Done", value: "0", color: "text-violet-400" },
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <Card key={metric.label} className="p-6 border-border">
                    <div className="flex items-start justify-between mb-3">
                      <Icon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                    <p className="font-display text-2xl font-bold text-foreground">{metric.value}</p>
                  </Card>
                );
              })}
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Practice time trend */}
              <Card className="p-6 border-border">
                <h3 className="font-display font-semibold mb-6">Practice Time (Last 7 Days)</h3>
                <p className="text-muted-foreground text-center py-8">Chart data coming soon</p>
              </Card>

              {/* Accuracy trend */}
              <Card className="p-6 border-border">
                <h3 className="font-display font-semibold mb-6">Accuracy Trend (Last 7 Days)</h3>
                <p className="text-muted-foreground text-center py-8">Chart data coming soon</p>
              </Card>

              {/* Session types */}
              <Card className="p-6 border-border">
                <h3 className="font-display font-semibold mb-6">Sessions by Type</h3>
                <p className="text-muted-foreground text-center py-8">Chart data coming soon</p>
              </Card>

              {/* Skill progression */}
              <Card className="p-6 border-border">
                <h3 className="font-display font-semibold mb-6">Skill Progression</h3>
                <div className="space-y-4">
                  {[
                    { skill: "Pitch Detection", level: 0 },
                    { skill: "Scale Knowledge", level: 0 },
                    { skill: "Rhythm", level: 0 },
                    { skill: "Theory", level: 0 },
                  ].map((item) => (
                    <div key={item.skill}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">{item.skill}</span>
                        <span className="text-sm font-semibold text-foreground">{item.level}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${item.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link href="/fretboard">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Continue Practicing
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Card className="p-12 border-border text-center">
            <p className="text-muted-foreground">No analytics data yet. Start practicing to see your progress!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
