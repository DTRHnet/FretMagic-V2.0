import { drizzle } from "drizzle-orm/mysql2";
import { badges, learningPaths, lessons } from "../drizzle/schema";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL!);

const BADGES_DATA = [
  { slug: "first-lesson", name: "First Steps", description: "Complete your first lesson", icon: "BookOpen", xpReward: 50, rarity: "common" as const },
  { slug: "streak-3", name: "On Fire", description: "Maintain a 3-day streak", icon: "Flame", xpReward: 75, rarity: "common" as const },
  { slug: "streak-7", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "Flame", xpReward: 150, rarity: "rare" as const },
  { slug: "streak-30", name: "Monthly Master", description: "Maintain a 30-day streak", icon: "Flame", xpReward: 500, rarity: "epic" as const },
  { slug: "level-5", name: "Rising Star", description: "Reach Level 5", icon: "Star", xpReward: 100, rarity: "common" as const },
  { slug: "level-10", name: "Skilled Player", description: "Reach Level 10", icon: "Star", xpReward: 200, rarity: "rare" as const },
  { slug: "level-25", name: "Guitar Hero", description: "Reach Level 25", icon: "Guitar", xpReward: 1000, rarity: "epic" as const },
  { slug: "perfect-score", name: "Perfect Pitch", description: "Score 100% on a pitch training session", icon: "Target", xpReward: 200, rarity: "rare" as const },
  { slug: "path-complete", name: "Path Finder", description: "Complete an entire learning path", icon: "Trophy", xpReward: 500, rarity: "epic" as const },
  { slug: "all-paths", name: "Grand Master", description: "Complete all learning paths", icon: "Crown", xpReward: 2000, rarity: "legendary" as const },
  { slug: "theory-buff", name: "Theory Buff", description: "Ask 10 questions to the AI assistant", icon: "Brain", xpReward: 100, rarity: "common" as const },
  { slug: "top-10", name: "Top 10", description: "Reach the top 10 on the leaderboard", icon: "Trophy", xpReward: 300, rarity: "rare" as const },
];

const PATHS_DATA = [
  {
    slug: "absolute-beginner",
    title: "Absolute Beginner",
    description: "Start from zero — learn to hold a guitar, read tabs, and play your first chords.",
    difficulty: "beginner" as const,
    isPremium: false,
    estimatedHours: 8,
    sortOrder: 1,
  },
  {
    slug: "chord-foundations",
    title: "Chord Foundations",
    description: "Master open chords, barre chords, and chord transitions for rhythm guitar.",
    difficulty: "beginner" as const,
    isPremium: false,
    estimatedHours: 12,
    sortOrder: 2,
  },
  {
    slug: "music-theory-essentials",
    title: "Music Theory Essentials",
    description: "Understand scales, intervals, keys, and how music theory applies to the guitar.",
    difficulty: "intermediate" as const,
    isPremium: true,
    estimatedHours: 15,
    sortOrder: 3,
  },
  {
    slug: "lead-guitar",
    title: "Lead Guitar Techniques",
    description: "Develop your lead playing with bends, vibrato, hammer-ons, pull-offs, and scales.",
    difficulty: "intermediate" as const,
    isPremium: true,
    estimatedHours: 20,
    sortOrder: 4,
  },
  {
    slug: "advanced-harmony",
    title: "Advanced Harmony & Improvisation",
    description: "Explore modes, jazz chords, advanced scales, and improvisation over backing tracks.",
    difficulty: "advanced" as const,
    isPremium: true,
    estimatedHours: 30,
    sortOrder: 5,
  },
];

const LESSONS_DATA = [
  // Absolute Beginner path (pathId = 1)
  {
    pathSlug: "absolute-beginner",
    slug: "parts-of-the-guitar",
    title: "Parts of the Guitar",
    description: "Learn the anatomy of the guitar — headstock, neck, body, strings, and more.",
    lessonType: "theory" as const,
    isPremium: false,
    xpReward: 20,
    sortOrder: 1,
    durationMinutes: 5,
    content: `# Parts of the Guitar

Welcome to your first lesson! Before you start playing, it's important to understand the anatomy of your instrument.

## The Main Parts

**Headstock** — The top of the guitar neck where the tuning pegs are located. Turning the pegs tightens or loosens the strings, changing their pitch.

**Nut** — A small piece of bone, plastic, or synthetic material that sits between the headstock and neck. It has grooves that guide the strings.

**Neck** — The long piece of wood that extends from the body. You press your fingers against the neck to form notes and chords.

**Fretboard (Fingerboard)** — The flat surface on the front of the neck. It contains metal strips called **frets**.

**Frets** — The metal strips embedded in the fretboard. When you press a string behind a fret, it shortens the vibrating length of the string, raising the pitch.

**Body** — The large, hollow (or solid) wooden section that amplifies the sound.

**Soundhole** — On acoustic guitars, this is the round hole in the body that projects sound outward.

**Bridge** — Anchors the strings to the body and transfers string vibration to the top of the guitar.

**Strings** — Six strings numbered 1–6 from thinnest (high E) to thickest (low E).

## String Names

| String | Note | Nickname |
|--------|------|----------|
| 1st (thinnest) | E | High E |
| 2nd | B | B string |
| 3rd | G | G string |
| 4th | D | D string |
| 5th | A | A string |
| 6th (thickest) | E | Low E |

A helpful mnemonic: **E**very **A**mazing **D**og **G**rows **B**ig **E**ars

## Practice Exercise

Look at your guitar (or the diagram above) and identify each part. Say the name out loud as you touch each component.`,
  },
  {
    pathSlug: "absolute-beginner",
    slug: "how-to-hold-the-guitar",
    title: "How to Hold the Guitar",
    description: "Proper posture and hand position for sitting and standing.",
    lessonType: "technique" as const,
    isPremium: false,
    xpReward: 25,
    sortOrder: 2,
    durationMinutes: 8,
    content: `# How to Hold the Guitar

Good posture from the start prevents bad habits and reduces the risk of injury.

## Sitting Position

**Classical Position:** Rest the guitar on your left leg (right-handed players). The neck points upward at about a 45° angle. This gives you excellent reach across the fretboard.

**Casual Position:** Rest the guitar on your right leg. The neck is more horizontal. This is the most common position for beginners.

**Key points:**
- Sit up straight — don't hunch over the guitar
- Keep the guitar body close to your torso
- The guitar should feel balanced without you gripping it tightly

## Fretting Hand (Left Hand)

- Curl your fingers so the fingertips press the strings
- Keep your thumb behind the neck, roughly opposite your middle finger
- Your palm should NOT touch the neck (except for thumb chords)
- Press strings close to the fret (but not on top of it) for clean notes

## Picking Hand (Right Hand)

- Hold the pick between your thumb and index finger
- Keep your wrist relaxed — tension is the enemy of speed
- Anchor your hand lightly on the bridge for stability
- Strum from the wrist, not the elbow

## Common Mistakes to Avoid

1. **Death grip** — squeezing the neck too hard causes fatigue and muted notes
2. **Collapsed wrist** — bending your fretting wrist too much limits reach
3. **Thumb over the top** — wrapping your thumb over the neck blocks your fingers

## Exercise

Practice holding the guitar for 5 minutes in each position. Notice which feels most natural to you.`,
  },
  {
    pathSlug: "absolute-beginner",
    slug: "reading-guitar-tabs",
    title: "Reading Guitar Tabs",
    description: "Understand tablature — the easiest way to read guitar music.",
    lessonType: "theory" as const,
    isPremium: false,
    xpReward: 30,
    sortOrder: 3,
    durationMinutes: 10,
    content: `# Reading Guitar Tabs

Guitar tablature (tab) is a simple notation system that shows you exactly where to put your fingers on the fretboard.

## How Tabs Work

A tab has **6 horizontal lines**, each representing a guitar string:

\`\`\`
e|--0--2--3--|  ← 1st string (thinnest, High E)
B|--1--3--3--|  ← 2nd string
G|--0--2--0--|  ← 3rd string
D|--2--0--0--|  ← 4th string
A|--3--x--2--|  ← 5th string
E|--x--x--3--|  ← 6th string (thickest, Low E)
\`\`\`

The **numbers** tell you which fret to press. **0** means open string (no fret pressed). **x** means don't play that string.

## Reading Left to Right

Notes are played from left to right. Numbers stacked vertically are played simultaneously (a chord).

## Common Symbols

| Symbol | Meaning |
|--------|---------|
| 0 | Open string |
| x | Mute / don't play |
| h | Hammer-on |
| p | Pull-off |
| b | Bend |
| / | Slide up |
| \\ | Slide down |
| ~ | Vibrato |

## Your First Tab: "Smoke on the Water" Riff

\`\`\`
e|--------------------------|
B|--------------------------|
G|--0--3--5--0--3-6-5-------|
D|--0--3--5--0--3-6-5-------|
A|--------------------------|
E|--------------------------|
\`\`\`

Try playing this slowly, one note at a time. Don't worry about speed yet!`,
  },
  {
    pathSlug: "absolute-beginner",
    slug: "your-first-chord-em",
    title: "Your First Chord: Em",
    description: "Learn the E minor chord — one of the easiest and most used chords in rock.",
    lessonType: "exercise" as const,
    isPremium: false,
    xpReward: 40,
    sortOrder: 4,
    durationMinutes: 12,
    content: `# Your First Chord: Em (E Minor)

E minor is the perfect first chord. It only requires two fingers and sounds great immediately!

## Finger Placement

\`\`\`
e|--0--|
B|--0--|
G|--0--|
D|--2--|  ← Middle finger, 2nd fret
A|--2--|  ← Ring finger, 2nd fret
E|--0--|
\`\`\`

**Step by step:**
1. Place your **middle finger** on the 5th string (A), 2nd fret
2. Place your **ring finger** on the 4th string (D), 2nd fret
3. Strum all 6 strings downward

## Tips for a Clean Sound

- Press your fingertips firmly just behind the 2nd fret
- Make sure your fingers aren't accidentally touching adjacent strings
- Strum slowly and listen — every string should ring clearly

## Practice Routine

1. Form the chord shape (30 seconds)
2. Strum once and listen for buzzing or muted strings
3. Adjust your fingers until every string rings clearly
4. Repeat 10 times

## Strumming Pattern

Try this simple pattern:
\`\`\`
Down - Down - Down - Down
  1  -  2  -  3  -  4
\`\`\`

Count out loud: "1, 2, 3, 4" as you strum. Keep it slow and steady — speed comes later!`,
  },
  // Chord Foundations path (pathId = 2)
  {
    pathSlug: "chord-foundations",
    slug: "open-chords-overview",
    title: "The 8 Essential Open Chords",
    description: "Master Am, Em, E, A, D, G, C, and F — the foundation of most songs.",
    lessonType: "technique" as const,
    isPremium: false,
    xpReward: 50,
    sortOrder: 1,
    durationMinutes: 20,
    content: `# The 8 Essential Open Chords

These 8 chords will unlock thousands of songs. Master them and you'll be able to play most popular music.

## The Chord Family

### Minor Chords (sad/dark sound)
- **Am** — A minor
- **Em** — E minor
- **Dm** — D minor

### Major Chords (happy/bright sound)
- **A** — A major
- **E** — E major
- **D** — D major
- **G** — G major
- **C** — C major

## Chord Diagrams

**Am (A minor)**
\`\`\`
e|--0--|
B|--1--|  ← Index finger
G|--2--|  ← Middle finger
D|--2--|  ← Ring finger
A|--0--|
E|--x--|  (don't play)
\`\`\`

**G Major**
\`\`\`
e|--3--|  ← Pinky
B|--3--|  ← Ring finger
G|--0--|
D|--0--|
A|--2--|  ← Middle finger
E|--3--|  ← Index finger
\`\`\`

**C Major**
\`\`\`
e|--0--|
B|--1--|  ← Index finger
G|--0--|
D|--2--|  ← Middle finger
A|--3--|  ← Ring finger
E|--x--|  (don't play)
\`\`\`

## Practice Strategy

Don't try to learn all 8 at once! Follow this order:
1. Em → Am (2 days)
2. Add E and A (2 days)
3. Add D (2 days)
4. Add G and C (3 days)

## Chord Transition Exercise

Practice switching between chord pairs:
- Em → Am → Em → Am (repeat for 2 minutes)
- G → C → G → C (repeat for 2 minutes)
- D → A → D → A (repeat for 2 minutes)`,
  },
  // Music Theory path (pathId = 3)
  {
    pathSlug: "music-theory-essentials",
    slug: "understanding-scales",
    title: "Understanding Scales",
    description: "What scales are, why they matter, and how to find them on the fretboard.",
    lessonType: "theory" as const,
    isPremium: true,
    xpReward: 60,
    sortOrder: 1,
    durationMinutes: 15,
    content: `# Understanding Scales

A scale is a set of notes arranged in a specific pattern of intervals. Scales are the building blocks of melody, harmony, and improvisation.

## What Is an Interval?

An interval is the distance between two notes. On the guitar, moving one fret = one **semitone** (half step). Moving two frets = one **tone** (whole step).

## The Major Scale Formula

The major scale uses this pattern of whole (W) and half (H) steps:

**W - W - H - W - W - W - H**

Starting from C: C - D - E - F - G - A - B - C

## The Minor Scale Formula

The natural minor scale:

**W - H - W - W - H - W - W**

Starting from A: A - B - C - D - E - F - G - A

## Why Scales Matter for Guitar

On the guitar, scales form **patterns** on the fretboard. Once you learn a pattern in one position, you can move it anywhere on the neck to play in any key.

## The Pentatonic Scale

The pentatonic (5-note) scale is the most important scale for rock, blues, and country:

**Minor Pentatonic:** Root - b3 - 4 - 5 - b7

\`\`\`
e|--5--8--|
B|--5--8--|
G|--5--7--|
D|--5--7--|
A|--5--7--|
E|--5--8--|
\`\`\`

This is the A minor pentatonic at the 5th fret. Move it to any fret to change the key!`,
  },
];

async function seed() {
  console.log("Seeding badges...");
  for (const badge of BADGES_DATA) {
    await db.insert(badges).values(badge).onDuplicateKeyUpdate({ set: { name: badge.name } });
  }
  console.log(`✓ ${BADGES_DATA.length} badges seeded`);

  console.log("Seeding learning paths...");
  for (const path of PATHS_DATA) {
    await db.insert(learningPaths).values(path).onDuplicateKeyUpdate({ set: { title: path.title } });
  }
  console.log(`✓ ${PATHS_DATA.length} learning paths seeded`);

  console.log("Seeding lessons...");
  // Get path IDs
  const allPaths = await db.select().from(learningPaths);
  const pathMap = new Map(allPaths.map((p) => [p.slug, p.id]));

  for (const lesson of LESSONS_DATA) {
    const pathId = pathMap.get(lesson.pathSlug);
    if (!pathId) {
      console.warn(`Path not found: ${lesson.pathSlug}`);
      continue;
    }
    const { pathSlug: _, ...lessonData } = lesson;
    await db
      .insert(lessons)
      .values({ ...lessonData, pathId })
      .onDuplicateKeyUpdate({ set: { title: lessonData.title } });
  }
  console.log(`✓ ${LESSONS_DATA.length} lessons seeded`);

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
