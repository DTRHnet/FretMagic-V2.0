import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import NavBar from "@/components/NavBar";
import Fretboard from "@/components/Fretboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Lock, Zap } from "lucide-react";
import { Link } from "wouter";

export default function FretboardPage() {
  const { isAuthenticated, user } = useAuth();
  const [highlightMode, setHighlightMode] = useState<"scale" | "chord" | "arpeggio" | "none">("scale");
  const [selectedScale, setSelectedScale] = useState("major");
  const [rootNote, setRootNote] = useState("A");
  const [lastNote, setLastNote] = useState<{ note: string; frequency: number } | null>(null);

  const premiumFeatures = ["Advanced scales", "Chord diagrams", "Arpeggio patterns"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold mb-3">
            Interactive <span className="text-gold-gradient">Fretboard</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Visualize scales, chords, and arpeggios across the entire neck. Click any fret to hear the note.
          </p>
        </div>

        {/* Main fretboard */}
        <div className="mb-12">
          <Fretboard
            highlightMode={highlightMode}
            selectedScale={selectedScale}
            rootNote={rootNote}
            onNoteClick={(note, freq) => setLastNote({ note, frequency: freq })}
          />
        </div>

        {/* Last note played */}
        {lastNote && (
          <div className="mb-12 p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Note Played</p>
                <p className="font-display text-3xl font-bold text-primary">{lastNote.note}</p>
                <p className="text-xs text-muted-foreground mt-1">{lastNote.frequency.toFixed(1)} Hz</p>
              </div>
              <div className="text-right">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Zap className="h-3 w-3 mr-1" />
                  Audio Enabled
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "6 Tunings",
              description: "Standard, Drop D, Open G, Open E, DADGAD, and more",
              icon: "🎸",
            },
            {
              title: "50+ Scales",
              description: "Major, minor, pentatonic, blues, modes, and exotic scales",
              icon: "📊",
            },
            {
              title: "Web Audio API",
              description: "Click frets to hear notes in real-time with accurate pitch",
              icon: "🔊",
            },
          ].map((feature) => (
            <Card key={feature.title} className="p-6 border-border card-hover">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-display font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Premium features */}
        <div className="rounded-lg border border-primary/30 bg-card/50 p-8 mb-12">
          <div className="flex items-start gap-4">
            <Lock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold mb-3">Premium Features Coming Soon</h3>
              <ul className="space-y-2 mb-6">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              {!isAuthenticated ? (
                <a href={getLoginUrl()}>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Sign Up to Unlock
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              ) : (
                <Link href="/pricing">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Upgrade to Premium
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-secondary/30 border border-border rounded-lg p-6">
          <h4 className="font-display font-semibold mb-3">💡 Tips</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use the tuning selector to switch between different guitar tunings</li>
            <li>• Select a scale and root note to highlight all notes in that scale</li>
            <li>• Click any fret to hear the note — great for ear training!</li>
            <li>• The dots at frets 3, 5, 7, 9, 12, 15, 17, 19, 21 are standard fretboard markers</li>
            <li>• String thickness increases from high E to low E, just like a real guitar</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
