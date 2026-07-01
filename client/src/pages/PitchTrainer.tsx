import { useState, useRef, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, Mic, MicOff, Volume2, Target, Zap } from "lucide-react";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export default function PitchTrainer() {
  const [isListening, setIsListening] = useState(false);
  const [targetNote, setTargetNote] = useState("A");
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, avgAccuracy: 0 });
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recordingRef = useRef(false);

  const recordActivity = trpc.gamification.recordActivity.useMutation();

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Start pitch detection
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = audioContextRef.current!;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);

      analyserRef.current = analyser;
      recordingRef.current = true;
      setIsListening(true);

      detectPitch(analyser);
    } catch (error) {
      console.error("Microphone access denied:", error);
    }
  };

  // Detect pitch using autocorrelation
  const detectPitch = (analyser: AnalyserNode) => {
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const detect = () => {
      if (!recordingRef.current) return;

      analyser.getByteFrequencyData(dataArray);
      const frequency = autoCorrelate(dataArray, audioContextRef.current!.sampleRate);

      if (frequency > 0) {
        const note = frequencyToNote(frequency);
        setDetectedNote(note);

        // Calculate accuracy
        const targetIndex = NOTES.indexOf(targetNote);
        const detectedIndex = NOTES.indexOf(note);
        const diff = Math.abs(targetIndex - detectedIndex);
        const normalizedDiff = Math.min(diff, 12 - diff);
        const acc = Math.max(0, 100 - normalizedDiff * 10);
        setAccuracy(acc);

        // Update stats
        if (acc > 80) {
          setSessionStats((prev) => ({
            correct: prev.correct + 1,
            total: prev.total + 1,
            avgAccuracy: ((prev.avgAccuracy * prev.total + acc) / (prev.total + 1)) | 0,
          }));
        }
      }

      requestAnimationFrame(detect);
    };

    detect();
  };

  // Autocorrelation algorithm for pitch detection
  const autoCorrelate = (buffer: Uint8Array, sampleRate: number): number => {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      const normalized = (buffer[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / buffer.length);
    if (rms < 0.01) return -1;

    let d = 0;
    while (d < buffer.length - 100) {
      let sum = 0;
      for (let i = 0; i < 100; i++) {
        sum += Math.abs((buffer[i] - 128) / 128 - (buffer[i + d] - 128) / 128);
      }
      if (sum < 10) return sampleRate / d;
      d++;
    }
    return -1;
  };

  // Convert frequency to note
  const frequencyToNote = (frequency: number): string => {
    const A4 = 440;
    const semitone = 12 * Math.log2(frequency / A4);
    const noteIndex = Math.round(semitone + 9) % 12;
    return NOTES[(noteIndex + 12) % 12];
  };

  const stopListening = () => {
    recordingRef.current = false;
    setIsListening(false);

    // Record activity
    if (sessionStats.total > 0) {
      recordActivity.mutate({
        sessionType: "pitch_training",
        durationSeconds: 60,
        accuracyScore: sessionStats.avgAccuracy,
        notesAttempted: sessionStats.total,
        notesCorrect: sessionStats.correct,
        xpAmount: Math.min(50, sessionStats.correct * 5),
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />

      <div className="container py-12">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold mb-3">
            Pitch <span className="text-gold-gradient">Trainer</span>
          </h1>
          <p className="text-muted-foreground">Develop your ear by matching the target note with your guitar or voice.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main trainer */}
          <div className="md:col-span-2">
            <Card className="p-8 border-border">
              <div className="text-center mb-8">
                <p className="text-muted-foreground mb-4">Target Note</p>
                <p className="font-display text-7xl font-bold text-primary mb-4">{targetNote}</p>
                <Volume2 className="h-8 w-8 text-primary mx-auto" />
              </div>

              {/* Detected note */}
              {isListening && (
                <div className="mb-8 p-6 rounded-lg bg-secondary/30 border border-border text-center">
                  <p className="text-muted-foreground mb-2">Detected Note</p>
                  <p className="font-display text-5xl font-bold text-gold-gradient">{detectedNote || "..."}</p>
                  {accuracy !== null && (
                    <div className="mt-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-amber-400" />
                        <span className="font-semibold">{accuracy.toFixed(0)}% Accuracy</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${accuracy}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-4 justify-center mb-8">
                {!isListening ? (
                  <Button
                    size="lg"
                    onClick={startListening}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    Start Listening
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={stopListening}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <MicOff className="mr-2 h-5 w-5" />
                    Stop
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setTargetNote(NOTES[Math.floor(Math.random() * NOTES.length)])}
                >
                  New Note
                </Button>
              </div>

              {/* Tips */}
              <div className="bg-secondary/30 border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Tip:</strong> Play the target note on your guitar or sing it. The trainer will detect the pitch and show your accuracy.
                </p>
              </div>
            </Card>
          </div>

          {/* Stats sidebar */}
          <div className="space-y-6">
            <Card className="p-6 border-border">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Session Stats
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Correct Notes</p>
                  <p className="font-display text-3xl font-bold text-primary">{sessionStats.correct}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Attempts</p>
                  <p className="font-display text-3xl font-bold text-foreground">{sessionStats.total}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Average Accuracy</p>
                  <p className="font-display text-3xl font-bold text-amber-400">{sessionStats.avgAccuracy}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border">
              <h3 className="font-display font-semibold mb-4">How It Works</h3>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-bold text-primary">1.</span>
                  <span>Click "Start Listening" to enable your microphone</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary">2.</span>
                  <span>Play or sing the target note</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary">3.</span>
                  <span>See your accuracy and get instant feedback</span>
                </li>
              </ol>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
