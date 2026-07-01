import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

const FEATURES = [
  { name: "Interactive Fretboard", free: true, premium: true },
  { name: "Basic Scales & Tunings", free: true, premium: true },
  { name: "Pitch Trainer", free: true, premium: true },
  { name: "Beginner Learning Path", free: true, premium: true },
  { name: "Daily Streaks & XP", free: true, premium: true },
  { name: "Leaderboard", free: true, premium: true },
  { name: "Advanced Scales & Modes", free: false, premium: true },
  { name: "AI Theory Assistant", free: false, premium: true },
  { name: "Practice Plan Generation", free: false, premium: true },
  { name: "Intermediate + Advanced Paths", free: false, premium: true },
  { name: "Analytics Dashboard", free: false, premium: true },
  { name: "Priority Support", free: false, premium: true },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const { data: subscription } = trpc.subscription.getStatus.useQuery(undefined, { enabled: isAuthenticated });

  const handleSubscribe = async () => {
    alert("Stripe integration coming soon!");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="container py-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="font-display text-4xl font-bold mb-4">
            Simple, <span className="text-gold-gradient">Transparent</span> Pricing
          </h1>
          <p className="text-muted-foreground text-lg">
            Start free and upgrade anytime. No hidden fees, cancel whenever you want.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free tier */}
          <Card className="p-8 border-border relative">
            <h2 className="font-display text-2xl font-bold mb-2">Free</h2>
            <p className="text-muted-foreground mb-6">Perfect for getting started</p>

            <div className="mb-8">
              <span className="font-display text-4xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground ml-2">/month</span>
            </div>

            {!isAuthenticated ? (
              <a href={getLoginUrl()}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-8">
                  Get Started Free
                </Button>
              </a>
            ) : subscription?.isPremium ? (
              <Button disabled className="w-full mb-8 opacity-50">
                You're Premium
              </Button>
            ) : (
              <Button disabled className="w-full mb-8 opacity-50">
                Current Plan
              </Button>
            )}

            <div className="space-y-4">
              {FEATURES.map((feature) => (
                <div key={feature.name} className="flex items-center gap-3">
                  {feature.free ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={feature.free ? "text-foreground" : "text-muted-foreground"}>{feature.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Premium tier */}
          <Card className="p-8 border-primary/50 bg-primary/5 relative ring-2 ring-primary/30">
            <Badge className="absolute top-6 right-6 bg-primary text-primary-foreground">RECOMMENDED</Badge>

            <h2 className="font-display text-2xl font-bold mb-2">Premium</h2>
            <p className="text-muted-foreground mb-6">Unlock your full potential</p>

            <div className="mb-8">
              <span className="font-display text-4xl font-bold text-primary">$9.99</span>
              <span className="text-muted-foreground ml-2">/month</span>
            </div>

            {!isAuthenticated ? (
              <a href={getLoginUrl()}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-8">
                  Start Free Trial
                </Button>
              </a>
            ) : subscription?.isPremium ? (
              <Button disabled className="w-full mb-8">
                ✓ Active Subscription
              </Button>
            ) : (
              <Button
                onClick={handleSubscribe}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-8"
              >
                Coming Soon
              </Button>
            )}

            <div className="space-y-4">
              {FEATURES.map((feature) => (
                <div key={feature.name} className="flex items-center gap-3">
                  {feature.premium ? (
                    <Check className="h-5 w-5 text-gold-gradient" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={feature.premium ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes! You can cancel your subscription at any time. You'll have access until the end of your billing period.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes, new Premium subscribers get 7 days free before the first charge.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards via Stripe. Your payment information is secure and encrypted.",
              },
              {
                q: "Can I upgrade or downgrade anytime?",
                a: "Absolutely! You can change your plan at any time. Changes take effect immediately.",
              },
            ].map((item, idx) => (
              <Card key={idx} className="p-6 border-border">
                <h3 className="font-display font-semibold mb-2 text-foreground">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
