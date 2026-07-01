import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, BookOpen, Lock, ChevronRight, Zap } from "lucide-react";

export default function Learn() {
  const { isAuthenticated } = useAuth();
  const { data: learningPaths, isLoading } = trpc.learning.getPaths.useQuery(undefined, { enabled: isAuthenticated });
  const { data: subscription } = trpc.subscription.getStatus.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavBar />
        <div className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <BookOpen className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold mb-4">Structured Learning Paths</h1>
            <p className="text-muted-foreground mb-8">
              Progress from beginner to advanced guitarist with our carefully designed learning paths, interactive lessons, and real-time feedback.
            </p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-primary text-primary-foreground">
                Sign In to Learn
                <ChevronRight className="ml-2 h-4 w-4" />
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
            Learning <span className="text-gold-gradient">Paths</span>
          </h1>
          <p className="text-muted-foreground">Choose your path and start learning. Each lesson builds on the previous one.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : learningPaths && learningPaths.length > 0 ? (
          <div className="space-y-8">
            {learningPaths.map((path: any) => {
              const isLocked = path.isPremium && !subscription?.isPremium;
              const completionPercent = path.lessons.length > 0
                ? (path.lessons.filter((l: any) => l.progress?.status === "completed").length / path.lessons.length) * 100
                : 0;

              return (
                <Card key={path.id} className="p-8 border-border overflow-hidden">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="font-display text-2xl font-bold text-foreground">{path.name}</h2>
                        {path.isPremium && (
                          <Badge className="bg-primary/20 text-primary border-primary/30">Premium</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-4">{path.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          <strong>{path.lessons.length}</strong> lessons
                        </span>
                        <span className="text-muted-foreground capitalize">
                          Difficulty: <strong>{path.difficulty}</strong>
                        </span>
                      </div>
                    </div>
                    {isLocked && (
                      <Lock className="h-6 w-6 text-muted-foreground ml-4" />
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs font-semibold text-foreground">{Math.round(completionPercent)}%</span>
                    </div>
                    <Progress value={completionPercent} className="h-2" />
                  </div>

                  {/* Lessons grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {path.lessons.map((lesson: any, idx: number) => {
                      const isCompleted = lesson.progress?.status === "completed";
                      const isInProgress = lesson.progress?.status === "in_progress";

                      return (
                        <Link key={lesson.id} href={isLocked ? "#" : `/lesson/${lesson.id}`}>
                          <Card
                            className={`p-4 border-border cursor-pointer transition-all ${
                              isLocked
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:border-primary hover:bg-secondary/30"
                            } ${isCompleted ? "border-primary/50 bg-primary/5" : ""}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-foreground mb-1">{lesson.title}</p>
                                <p className="text-xs text-muted-foreground">{lesson.description}</p>
                              </div>
                              <div className="ml-2">
                                {isCompleted && (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">✓</Badge>
                                )}
                                {isInProgress && (
                                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">In Progress</Badge>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-xs">
                              <Zap className="h-3 w-3 text-amber-400" />
                              <span className="text-muted-foreground">+{lesson.xpReward} XP</span>
                            </div>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  {isLocked ? (
                    <Link href="/pricing">
                      <Button variant="outline" className="w-full border-border hover:bg-secondary">
                        Unlock with Premium
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/lesson/${path.lessons[0]?.id || "#"}`}>
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        {completionPercent > 0 ? "Continue" : "Start"} Learning
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 border-border text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No learning paths available yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
