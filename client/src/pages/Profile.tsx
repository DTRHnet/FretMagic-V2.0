import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, User, Mail, Music, Trophy, Zap, Flame } from "lucide-react";
import { useState } from "react";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: profile, isLoading } = trpc.profile.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: gamification } = trpc.gamification.getMyStats.useQuery(undefined, { enabled: isAuthenticated });
  const updateProfile = trpc.profile.update.useMutation();

  const [skillLevel, setSkillLevel] = useState<"beginner" | "intermediate" | "advanced" | undefined>((profile?.skillLevel as any) || "beginner");

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ skillLevel });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <NavBar />
        <div className="container py-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold mb-4">Sign in to view your profile</h1>
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-display text-4xl font-bold mb-2">
              Your <span className="text-gold-gradient">Profile</span>
            </h1>
            <p className="text-muted-foreground">Manage your account settings and view your progress</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* User Info */}
              <Card className="p-8 border-border">
                <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Account Information
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label className="text-muted-foreground mb-2 block">Name</Label>
                    <Input value={user?.name || ""} disabled className="bg-secondary/30 border-border" />
                  </div>

                  <div>
                    <Label className="text-muted-foreground mb-2 block">Email</Label>
                    <Input value={user?.email || ""} disabled className="bg-secondary/30 border-border" />
                  </div>

                  <div>
                    <Label htmlFor="skill" className="text-muted-foreground mb-2 block">
                      Skill Level
                    </Label>
                    <Select value={skillLevel || "beginner"} onValueChange={(value: any) => setSkillLevel(value)}>
                      <SelectTrigger id="skill" className="border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={updateProfile.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {updateProfile.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Card>

              {/* Stats */}
              {gamification && (
                <Card className="p-8 border-border">
                  <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Your Stats
                  </h2>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-amber-400" />
                        <span className="text-xs text-muted-foreground">Level</span>
                      </div>
                      <p className="font-display text-3xl font-bold text-foreground">{gamification.level}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="h-4 w-4 text-orange-400" />
                        <span className="text-xs text-muted-foreground">Streak</span>
                      </div>
                      <p className="font-display text-3xl font-bold text-foreground">{gamification.currentStreak} days</p>
                    </div>

                    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Music className="h-4 w-4 text-sky-400" />
                        <span className="text-xs text-muted-foreground">Total XP</span>
                      </div>
                      <p className="font-display text-3xl font-bold text-foreground">{gamification.xp.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Danger Zone */}
              <Card className="p-8 border-destructive/30 bg-destructive/5">
                <h2 className="font-display text-xl font-bold mb-4">Danger Zone</h2>
                <p className="text-muted-foreground mb-6">
                  Once you log out, you'll need to sign in again to access your account.
                </p>
                <Button
                  onClick={logout}
                  variant="destructive"
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sign Out
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
