import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useRoute, useLocation } from "wouter";
import { Loader2, CheckCircle2, Lock, ArrowLeft, Play } from "lucide-react";
import { Link } from "wouter";

export default function LessonDetail() {
  const { isAuthenticated, user } = useAuth();
  const [, params] = useRoute("/lesson/:id");
  const [, setLocation] = useLocation();
  const lessonId = params?.id ? parseInt(params.id) : null;

  const { data: lesson, isLoading } = trpc.learning.getLesson.useQuery(
    { slug: lessonId?.toString() || "" },
    { enabled: !!lessonId && isAuthenticated }
  );

  const { data: progressList } = trpc.learning.getMyProgress.useQuery(undefined, { enabled: isAuthenticated });
  const progress = progressList?.find((p) => p.lessonId === lessonId);

  const completeLesson = trpc.learning.updateProgress.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavBar />
        <div className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <Lock className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-8">Please sign in to view lesson details.</p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-primary text-primary-foreground">
                Sign In
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavBar />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavBar />
        <div className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-3xl font-bold mb-4">Lesson Not Found</h1>
            <Link href="/learn">
              <Button className="bg-primary text-primary-foreground">
                Back to Learning Paths
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPremium = user?.role === "admin";
  const isLocked = lesson?.isPremium && !isPremium;
  const isCompleted = progress?.status === "completed";

  const handleComplete = async () => {
    try {
      if (lesson) {
        await completeLesson.mutateAsync({ lessonId: lesson.id, status: "completed" });
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="container py-12">
        {/* Back button */}
        <Link href="/learn">
          <Button variant="ghost" className="mb-8 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning Paths
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="font-display text-4xl font-bold">{lesson.title}</h1>
                  {isLocked && <Badge className="bg-amber-600">Premium</Badge>}
                  {isCompleted && <Badge className="bg-green-600">✓ Completed</Badge>}
                </div>
                <p className="text-muted-foreground text-lg">{lesson.description}</p>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Duration: {lesson.durationMinutes || 0} mins</span>
              <span>Type: {lesson.lessonType}</span>
              <span>XP Reward: +{lesson.xpReward}</span>
            </div>
          </div>

          {isLocked ? (
            <Card className="p-12 border-border text-center mb-8">
              <Lock className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold mb-3">Premium Content</h2>
              <p className="text-muted-foreground mb-6">
                This lesson is only available for premium members. Upgrade your account to unlock advanced content.
              </p>
              <Link href="/pricing">
                <Button className="bg-primary text-primary-foreground">
                  Upgrade to Premium
                </Button>
              </Link>
            </Card>
          ) : (
            <>
              {/* Content sections */}
              <div className="space-y-8 mb-8">
                {/* Overview */}
                <Card className="p-8 border-border">
                  <h2 className="font-display text-2xl font-bold mb-4">Overview</h2>
                  <p className="text-muted-foreground leading-relaxed">{lesson.description}</p>
                </Card>

                {/* Learning objectives */}
                <Card className="p-8 border-border">
                  <h2 className="font-display text-2xl font-bold mb-4">Learning Objectives</h2>
                  <ul className="space-y-3">
                    {[
                      "Understand the core concepts",
                      "Practice with interactive exercises",
                      "Apply knowledge to real scenarios",
                      "Test your understanding",
                    ].map((objective, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-foreground">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Content */}
                <Card className="p-8 border-border">
                  <h2 className="font-display text-2xl font-bold mb-4">Content</h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      This lesson covers the fundamental concepts you need to master this skill. Follow along with the interactive
                      exercises and practice sections to reinforce your learning.
                    </p>
                  </div>
                </Card>

                {/* Exercises */}
                <Card className="p-8 border-border">
                  <h2 className="font-display text-2xl font-bold mb-4">Practice Exercises</h2>
                  <div className="space-y-4">
                    {[1, 2, 3].map((ex) => (
                      <div key={ex} className="p-4 bg-secondary rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">Exercise {ex}</p>
                          <p className="text-sm text-muted-foreground">Practice what you've learned</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Resources */}
                <Card className="p-8 border-border">
                  <h2 className="font-display text-2xl font-bold mb-4">Additional Resources</h2>
                  <ul className="space-y-2">
                    {["Reference guide", "Practice sheet", "Video tutorial"].map((resource, idx) => (
                      <li key={idx} className="text-muted-foreground hover:text-foreground cursor-pointer">
                        → {resource}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                {!isCompleted && (
                  <Button
                    onClick={handleComplete}
                    disabled={completeLesson.isPending}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {completeLesson.isPending ? "Completing..." : "Mark as Complete"}
                  </Button>
                )}
                <Link href="/fretboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Practice on Fretboard
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
