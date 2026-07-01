import { useState, useRef, useEffect } from "react";
import { Volume2, Music, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TUNINGS = {
  standard: { name: "Standard", notes: ["E", "A", "D", "G", "B", "E"] },
  drop_d: { name: "Drop D", notes: ["D", "A", "D", "G", "B", "E"] },
  open_g: { name: "Open G", notes: ["D", "G", "D", "G", "B", "D"] },
  open_e: { name: "Open E", notes: ["E", "B", "E", "G#", "B", "E"] },
  dadgad: { name: "DADGAD", notes: ["D", "A", "D", "G", "A", "D"] },
};

const NOTE_SEQUENCE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const SCALES = {
  major: { name: "Major", intervals: [0, 2, 4, 5, 7, 9, 11] },
  minor: { name: "Natural Minor", intervals: [0, 2, 3, 5, 7, 8, 10] },
  pentatonic_minor: { name: "Pentatonic Minor", intervals: [0, 3, 5, 7, 10] },
  pentatonic_major: { name: "Pentatonic Major", intervals: [0, 2, 4, 7, 9] },
  blues: { name: "Blues", intervals: [0, 3, 5, 6, 7, 10] },
  harmonic_minor: { name: "Harmonic Minor", intervals: [0, 2, 3, 5, 7, 8, 11] },
  dorian: { name: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10] },
  phrygian: { name: "Phrygian", intervals: [0, 1, 3, 5, 7, 8, 10] },
};

interface FretboardProps {
  onNoteClick?: (note: string, frequency: number) => void;
  highlightMode?: "scale" | "chord" | "arpeggio" | "none";
  selectedScale?: string;
  rootNote?: string;
}

export default function Fretboard({
  onNoteClick,
  highlightMode = "none",
  selectedScale = "major",
  rootNote = "A",
}: FretboardProps) {
  const [tuning, setTuning] = useState<keyof typeof TUNINGS>("standard");
  const [highlightedNotes, setHighlightedNotes] = useState<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);

  const FRETS = 24;
  const STRINGS = 6;
  const FRET_WIDTH = 60;
  const STRING_SPACING = 35;
  const MARGIN = 40;

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Calculate highlighted notes based on scale
  useEffect(() => {
    if (highlightMode === "none") {
      setHighlightedNotes(new Set());
      return;
    }

    const scale = SCALES[selectedScale as keyof typeof SCALES];
    if (!scale) return;

    const rootIndex = NOTE_SEQUENCE.indexOf(rootNote);
    const highlighted = new Set<string>();

    for (let stringIdx = 0; stringIdx < STRINGS; stringIdx++) {
      const openNote = TUNINGS[tuning].notes[stringIdx];
      const openNoteIndex = NOTE_SEQUENCE.indexOf(openNote);

      for (let fret = 0; fret <= FRETS; fret++) {
        const noteIndex = (openNoteIndex + fret) % 12;
        const relativeToRoot = (noteIndex - rootIndex + 12) % 12;

        if (scale.intervals.includes(relativeToRoot)) {
          highlighted.add(`${stringIdx}-${fret}`);
        }
      }
    }

    setHighlightedNotes(highlighted);
  }, [highlightMode, selectedScale, rootNote, tuning]);

  // Play note sound
  const playNote = (frequency: number) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = frequency;
    osc.type = "sine";

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.5);
  };

  // Get frequency for a note
  const getNoteFrequency = (note: string, octave: number = 4): number => {
    const noteIndex = NOTE_SEQUENCE.indexOf(note);
    const A4 = 440;
    const semitones = noteIndex - 9 + (octave - 4) * 12;
    return A4 * Math.pow(2, semitones / 12);
  };

  // Handle fret click
  const handleFretClick = (stringIdx: number, fret: number) => {
    const openNote = TUNINGS[tuning].notes[stringIdx];
    const openNoteIndex = NOTE_SEQUENCE.indexOf(openNote);
    const noteIndex = (openNoteIndex + fret) % 12;
    const note = NOTE_SEQUENCE[noteIndex];
    const octave = Math.floor((openNoteIndex + fret) / 12) + 4;
    const frequency = getNoteFrequency(note, octave);

    playNote(frequency);
    onNoteClick?.(note, frequency);
  };

  const tuningData = TUNINGS[tuning];
  const width = MARGIN * 2 + FRETS * FRET_WIDTH;
  const height = MARGIN * 2 + (STRINGS - 1) * STRING_SPACING + 40;

  return (
    <div className="w-full space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Tuning</label>
          <Select value={tuning} onValueChange={(v) => setTuning(v as keyof typeof TUNINGS)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TUNINGS).map(([key, { name }]) => (
                <SelectItem key={key} value={key}>
                  {name} ({TUNINGS[key as keyof typeof TUNINGS].notes.join("-")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Scale</label>
          <Select value={selectedScale} onValueChange={() => {}}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SCALES).map(([key, { name }]) => (
                <SelectItem key={key} value={key}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">Root Note</label>
          <Select value={rootNote} onValueChange={() => {}}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NOTE_SEQUENCE.map((note) => (
                <SelectItem key={note} value={note}>
                  {note}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fretboard SVG */}
      <div className="overflow-x-auto bg-card rounded-lg border border-border p-4">
        <svg
          width={width}
          height={height}
          className="mx-auto"
          style={{ minWidth: "100%" }}
        >
          {/* Fret lines */}
          {[...Array(FRETS + 1)].map((_, fretIdx) => (
            <line
              key={`fret-${fretIdx}`}
              x1={MARGIN + fretIdx * FRET_WIDTH}
              y1={MARGIN}
              x2={MARGIN + fretIdx * FRET_WIDTH}
              y2={MARGIN + (STRINGS - 1) * STRING_SPACING}
              stroke="oklch(0.25 0.008 260)"
              strokeWidth="2"
            />
          ))}

          {/* Fret markers (dots at 3, 5, 7, 9, 12, 15, 17, 19, 21) */}
          {[3, 5, 7, 9, 12, 15, 17, 19, 21].map((fret) => (
            <circle
              key={`marker-${fret}`}
              cx={MARGIN + fret * FRET_WIDTH - FRET_WIDTH / 2}
              cy={MARGIN + (STRINGS - 1) * STRING_SPACING + 20}
              r="4"
              fill="oklch(0.72 0.16 65)"
              opacity="0.5"
            />
          ))}

          {/* Strings and frets */}
          {[...Array(STRINGS)].map((_, stringIdx) => (
            <g key={`string-${stringIdx}`}>
              {/* String line */}
              <line
                x1={MARGIN}
                y1={MARGIN + stringIdx * STRING_SPACING}
                x2={MARGIN + FRETS * FRET_WIDTH}
                y2={MARGIN + stringIdx * STRING_SPACING}
                stroke="oklch(0.55 0.05 80)"
                strokeWidth={2 + stringIdx * 0.5}
                opacity="0.8"
              />

              {/* Open string note */}
              <text
                x={MARGIN - 30}
                y={MARGIN + stringIdx * STRING_SPACING + 5}
                fontSize="12"
                fill="oklch(0.72 0.16 65)"
                fontWeight="bold"
                textAnchor="end"
              >
                {tuningData.notes[stringIdx]}
              </text>

              {/* Fret dots */}
              {[...Array(FRETS)].map((_, fretIdx) => {
                const key = `${stringIdx}-${fretIdx + 1}`;
                const isHighlighted = highlightedNotes.has(key);
                const noteIndex = (NOTE_SEQUENCE.indexOf(tuningData.notes[stringIdx]) + fretIdx + 1) % 12;
                const note = NOTE_SEQUENCE[noteIndex];

                return (
                  <g
                    key={key}
                    onClick={() => handleFretClick(stringIdx, fretIdx + 1)}
                    className="cursor-pointer group"
                  >
                    {/* Fret dot background */}
                    <circle
                      cx={MARGIN + (fretIdx + 1) * FRET_WIDTH - FRET_WIDTH / 2}
                      cy={MARGIN + stringIdx * STRING_SPACING}
                      r="14"
                      fill={isHighlighted ? "oklch(0.72 0.16 65)" : "oklch(0.20 0.007 260)"}
                      opacity={isHighlighted ? 1 : 0.4}
                      className="transition-all group-hover:opacity-100"
                    />

                    {/* Fret dot border on hover */}
                    <circle
                      cx={MARGIN + (fretIdx + 1) * FRET_WIDTH - FRET_WIDTH / 2}
                      cy={MARGIN + stringIdx * STRING_SPACING}
                      r="14"
                      fill="none"
                      stroke="oklch(0.72 0.16 65)"
                      strokeWidth="1.5"
                      opacity="0"
                      className="group-hover:opacity-100 transition-opacity"
                    />

                    {/* Note label */}
                    <text
                      x={MARGIN + (fretIdx + 1) * FRET_WIDTH - FRET_WIDTH / 2}
                      y={MARGIN + stringIdx * STRING_SPACING + 5}
                      fontSize="11"
                      fill={isHighlighted ? "oklch(0.12 0.005 260)" : "oklch(0.55 0.05 80)"}
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {note}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Info */}
      <div className="text-sm text-muted-foreground">
        <p>
          <Volume2 className="inline h-4 w-4 mr-1" />
          Click any fret to play the note. Select a scale above to highlight scale tones.
        </p>
      </div>
    </div>
  );
}
