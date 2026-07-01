import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavBar from "@/components/NavBar";
import { Link } from "wouter";
import {
  Guitar,
  Zap,
  Mic,
  Brain,
  Trophy,
  BookOpen,
  ChevronRight,
  Star,
  Check,
  Flame,
  Music,
  Target,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Guitar,
    title: "Interactive Fretboard",
    description: "Visualize scales, chords, and arpeggios on a fully interactive SVG fretboard with multiple tuning support.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Mic,
    title: "Pitch Detection",
    description: "Real-time microphone pitch detection with note-matching feedback and accuracy scoring for play-along exercises.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Brain,
    title: "AI Theory Assistant",
    description: "Get instant answers to music theory questions and receive personalized daily practice plans from our AI assistant.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description: "Earn XP, level up, maintain daily streaks, collect achievement badges, and compete on the global leaderboard.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: BookOpen,
    title: "Structured Learning",
    description: "Follow progressive learning paths from beginner to advanced with interactive exercises and completion tracking.",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Track practice time, accuracy trends, and skill progression with detailed charts and weekly summaries.",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
  },
];

const stats = [
  { value: "24+", label: "Frets Visualized" },
  { value: "50+", label: "Scales & Modes" },
  { value: "100+", label: "Chord Shapes" },
  { value: "∞", label: "Practice Sessions" },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Start your guitar journey",
    features: [
      "Interactive fretboard (basic scales)",
      "5 beginner lessons",
      "Pitch trainer (10 min/day)",
      "Basic progress tracking",
      "Community leaderboard",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "per month",
    description: "Unlock your full potential",
    features: [
      "Full fretboard with all scales & arpeggios",
      "Unlimited lessons across all paths",
      "Unlimited pitch training",
      "AI Theory Assistant (unlimited)",
      "Personalized practice plans",
      "Advanced analytics & insights",
      "Priority support",
    ],
    cta: "Go Premium",
    highlighted: true,
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
          {/* Fret lines decoration */}
          <div className="absolute inset-y-0 right-0 w-1/2 opacity-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-foreground"
                style={{ left: `${i * 14}%` }}
              />
            ))}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t string-shimmer h-px"
                style={{ top: `${15 + i * 14}%` }}
              />
            ))}
          </div>
        </div>

        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">
              <Flame className="h-3 w-3 mr-1" />
              Learn Guitar the Smart Way
            </Badge>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Master Guitar with{" "}
              <span className="text-gold-gradient">Interactive</span>{" "}
              Learning
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Combine real-time pitch detection, AI-powered theory assistance, gamified lessons, and an
              interactive fretboard visualizer — all in one platform built for serious guitarists.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-amber text-base px-8">
                    Go to Dashboard
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-amber text-base px-8">
                    Start Learning Free
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              )}
              <Link href="/fretboard">
                <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary text-base px-8">
                  <Guitar className="mr-2 h-4 w-4" />
                  Try Fretboard
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="text-gold-gradient">Shred</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete guitar learning ecosystem combining technology, pedagogy, and gamification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-6 rounded-xl border border-border bg-card card-hover"
                >
                  <div className={`inline-flex p-3 rounded-lg ${feature.bg} mb-4`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fretboard Preview Section */}
      <section className="py-24 border-t border-border bg-card/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-amber-400/10 text-amber-400 border-amber-400/30">
                <Music className="h-3 w-3 mr-1" />
                Interactive Fretboard
              </Badge>
              <h2 className="font-display text-4xl font-bold mb-6">
                See Every Note,{" "}
                <span className="text-gold-gradient">Everywhere</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Our interactive fretboard visualizer lets you explore scales, chords, and arpeggios
                across the entire neck. Click any note to hear it, switch tunings instantly, and
                understand the fretboard like never before.
              </p>
              <ul className="space-y-3 mb-8">
                {["6 standard tunings + custom", "50+ scales and modes", "100+ chord voicings", "Arpeggio patterns"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/fretboard">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Open Fretboard
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Fretboard preview mockup */}
            <div className="relative">
              <div className="rounded-xl border border-border bg-card p-6 overflow-hidden">
                <div className="fretboard-bg rounded-lg p-4 relative">
                  {/* String lines */}
                  {[...Array(6)].map((_, stringIdx) => (
                    <div key={stringIdx} className="relative flex items-center mb-3 last:mb-0">
                      <div
                        className="h-px flex-1 string-shimmer"
                        style={{ height: `${1 + stringIdx * 0.3}px` }}
                      />
                    </div>
                  ))}
                  {/* Note dots overlay */}
                  <div className="absolute inset-0 p-4">
                    {[
                      { top: "8%", left: "15%" },
                      { top: "22%", left: "28%" },
                      { top: "36%", left: "15%" },
                      { top: "50%", left: "42%" },
                      { top: "64%", left: "28%" },
                      { top: "78%", left: "55%" },
                    ].map((pos, i) => (
                      <div
                        key={i}
                        className="absolute h-5 w-5 rounded-full bg-primary border-2 border-primary-foreground flex items-center justify-center text-xs font-bold text-primary-foreground"
                        style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -50%)" }}
                      >
                        {["A", "C", "E", "G", "B", "D"][i]}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex gap-2 flex-wrap">
                  {["A Minor", "Pentatonic", "Standard"].map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground border border-border">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pitch Trainer Preview */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Pitch trainer mockup */}
            <div className="order-2 lg:order-1">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-center mb-6">
                  <div className="font-display text-6xl font-bold text-primary mb-2">A4</div>
                  <div className="text-muted-foreground text-sm">440.0 Hz</div>
                </div>
                <div className="relative h-4 bg-secondary rounded-full overflow-hidden mb-4">
                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-border -translate-x-1/2 z-10" />
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-100"
                    style={{ width: "52%", marginLeft: "0%" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mb-6">
                  <span>-50¢</span>
                  <span className="text-primary font-medium">In Tune</span>
                  <span>+50¢</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { note: "E2", status: "correct" },
                    { note: "A2", status: "correct" },
                    { note: "D3", status: "close" },
                    { note: "G3", status: "pending" },
                    { note: "B3", status: "pending" },
                    { note: "E4", status: "pending" },
                  ].map(({ note, status }) => (
                    <div
                      key={note}
                      className={`p-2 rounded-lg text-center text-sm font-medium border ${
                        status === "correct"
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : status === "close"
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                          : "bg-secondary border-border text-muted-foreground"
                      }`}
                    >
                      {note}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Accuracy</span>
                  <span className="font-display text-2xl font-bold text-primary">87%</span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-emerald-400/10 text-emerald-400 border-emerald-400/30">
                <Mic className="h-3 w-3 mr-1" />
                Real-Time Pitch Detection
              </Badge>
              <h2 className="font-display text-4xl font-bold mb-6">
                Play Along,{" "}
                <span className="text-gold-gradient">Get Feedback</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Our Web Audio API pitch detector listens to your guitar in real time, identifies the
                note you're playing, and gives you instant visual feedback on accuracy — down to the cent.
              </p>
              <ul className="space-y-3 mb-8">
                {["Microphone-based pitch detection", "Cents deviation display", "Note-matching accuracy score", "Play-along exercise mode"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Target className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/pitch-trainer">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  Try Pitch Trainer
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section className="py-24 border-t border-border bg-card/30">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-400/10 text-amber-400 border-amber-400/30">
              <Zap className="h-3 w-3 mr-1" />
              Gamification
            </Badge>
            <h2 className="font-display text-4xl font-bold mb-4">
              Stay Motivated,{" "}
              <span className="text-gold-gradient">Level Up</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Every practice session earns XP. Every streak builds momentum. Every badge tells your story.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Zap, label: "XP & Levels", value: "Earn XP every session", color: "text-amber-400", bg: "bg-amber-400/10" },
              { icon: Flame, label: "Daily Streaks", value: "Keep the fire burning", color: "text-orange-400", bg: "bg-orange-400/10" },
              { icon: Star, label: "Badges", value: "10+ achievements", color: "text-violet-400", bg: "bg-violet-400/10" },
              { icon: Trophy, label: "Leaderboard", value: "Compete globally", color: "text-sky-400", bg: "bg-sky-400/10" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-6 rounded-xl border border-border bg-card text-center card-hover">
                  <div className={`inline-flex p-3 rounded-xl ${item.bg} mb-4`}>
                    <Icon className={`h-7 w-7 ${item.color}`} />
                  </div>
                  <div className="font-display text-base font-semibold text-foreground mb-1">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">
              Simple, Transparent{" "}
              <span className="text-gold-gradient">Pricing</span>
            </h2>
            <p className="text-muted-foreground text-lg">Start free. Upgrade when you're ready to go deeper.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border ${
                  plan.highlighted
                    ? "border-primary bg-card glow-amber"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="premium-badge">Most Popular</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isAuthenticated ? (
                  plan.highlighted ? (
                    <Link href="/pricing">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        {plan.cta}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full border-border hover:bg-secondary">
                        {plan.cta}
                      </Button>
                    </Link>
                  )
                ) : (
                  <a href={getLoginUrl()}>
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-border bg-transparent hover:bg-secondary text-foreground border"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="container">
          <div className="relative rounded-2xl border border-primary/30 bg-card overflow-hidden p-12 text-center">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/10 blur-3xl pointer-events-none" />
            <div className="relative">
              <Guitar className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="font-display text-4xl font-bold mb-4">
                Ready to Start Your{" "}
                <span className="text-gold-gradient">Guitar Journey?</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                Join thousands of guitarists learning smarter with FretMaster. It's free to start.
              </p>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-amber text-base px-10">
                    Open Dashboard
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-amber text-base px-10">
                    Start Learning Free
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Guitar className="h-5 w-5 text-primary" />
              <span className="font-display font-bold text-gold-gradient">FretMaster</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/learn"><span className="hover:text-foreground cursor-pointer transition-colors">Learn</span></Link>
              <Link href="/fretboard"><span className="hover:text-foreground cursor-pointer transition-colors">Fretboard</span></Link>
              <Link href="/pricing"><span className="hover:text-foreground cursor-pointer transition-colors">Pricing</span></Link>
              <Link href="/leaderboard"><span className="hover:text-foreground cursor-pointer transition-colors">Leaderboard</span></Link>
            </div>
            <p className="text-xs text-muted-foreground">© 2025 FretMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
