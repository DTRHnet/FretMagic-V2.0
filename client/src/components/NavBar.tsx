import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Guitar, Menu, X, Zap, Crown } from "lucide-react";
import { useState } from "react";


const navLinks = [
  { href: "/fretboard", label: "Fretboard" },
  { href: "/learn", label: "Learn" },
  { href: "/pitch-trainer", label: "Pitch Trainer" },
  { href: "/ai-assistant", label: "AI Assistant" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function NavBar() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPremium = false; // Will be wired to subscription status
  const gamification: { level: number; xp: number } | undefined = undefined; // Will be wired to gamification router

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Guitar className="h-7 w-7 text-primary transition-transform group-hover:rotate-12" />
              <div className="absolute inset-0 blur-sm bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display text-xl font-bold text-gold-gradient">FretMaster</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  location === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* XP Badge */}
                {gamification != null && (
                  <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full border border-border">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary">Lv.{(gamification as {level:number;xp:number}).level}</span>
                    <span className="text-xs text-muted-foreground">{(gamification as {level:number;xp:number}).xp.toLocaleString()} XP</span>
                  </div>
                )}

                {/* Premium badge */}
                {isPremium && (
                  <div className="flex items-center gap-1 premium-badge">
                    <Crown className="h-3 w-3" />
                    <span>Premium</span>
                  </div>
                )}

                <Link href="/dashboard">
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">
                        {user?.name?.charAt(0).toUpperCase() ?? "U"}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{user?.name?.split(" ")[0]}</span>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/pricing">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </Button>
                </Link>
                <a href={getLoginUrl()}>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-amber-sm">
                    Get Started
                  </Button>
                </a>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`block px-4 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    location === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <div className="pt-3 px-4 border-t border-border mt-3">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="w-full" onClick={() => setMobileOpen(false)}>
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()} className="block">
                  <Button className="w-full bg-primary text-primary-foreground">Get Started</Button>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
