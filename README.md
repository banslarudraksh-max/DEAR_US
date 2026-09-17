# Dear Us

> *A private, romantic digital memory vault for two people to preserve moments, stories, letters, places, milestones, and future dreams.*

---

## 🌹 Overview

**Dear Us** is an intimate, cinematic digital storybook and memory vault engineered exclusively for couples. Unlike public social networks or generic cloud albums, **Dear Us** is designed with high privacy, emotional warmth, and timeless editorial aesthetics — inspired by vintage love letters, gold-embossed leather journals, and classic film stills.

It blends tactile, real-time interactivity with durable data persistence:
- Preserve every photograph with heartfelt reflections and partner perspectives.
- Trace your journey through an editorial chronological storybook.
- Seal digital time capsules and future love letters protected by unlock dates.
- Pin memories across an interactive world atlas.
- Watch memories unfold in full-screen ambient slideshow projections with procedural acoustic tones.

---

## ✨ Features

### 📖 1. Our Story — Chaptered Cinematic Timeline
- Structured into evocative chapters (*A Beginning*, *The First Special Memory*, *Our Adventures*, *Today*).
- Rich chronological milestones featuring dates, locations, emotional highlights, and key tokens.
- Add, edit, or remove milestones with instant synchronization.

### 📸 2. Memory Vault & Editorial Story Mode
- Full search across titles, reflections, locations, categories, and tags.
- Filter by category (*Special*, *Travel*, *Birthday*, *Festival*, *Funny*, *Everyday*, *Achievement*) or mood (*Peaceful*, *Romantic*, *Euphoric*, *Nostalgic*, *Adventurous*).
- **Two Perspectives ("How I Remember It")**: Both partners can record their unique impressions and reflections side-by-side.
- **Secret Reflections & Reactions**: Add private thoughts, cherished marks, and emoji reactions with audio haptic feedback.
- Full-screen editorial memory viewer with keyboard navigation (`←` / `→`) and favorite toggles.

### 🎞️ 3. Replay Our Story — Ambient Projection
- Full-screen autoplaying retrospective with customizable pacing (Slow, Medium, Fast).
- Procedural soothing A3 harmonic synthesizer soundscape that pairs with background ambience.
- Filter by year, category, cherished favorites, or milestones.
- Touch swipe navigation on mobile devices and keyboard shortcuts (`Space` to toggle, `Esc` to exit).

### 💌 4. Future Letters & Sealed Wax Envelopes
- Write letters to your partner sealed until a future date (anniversary, birthday, or surprise morning).
- Visual wax seals and customized envelope paper tones.
- Real-time countdowns indicating days remaining until unsealing.
- Unseal animations with celebratory confetti and parchment paper reading modal.

### ⏳ 5. Memory Time Capsules
- Lock away themed capsules (*1st Anniversary*, *Trip to Kyoto*, *Winter Hopes*) with photos, voice tokens, and messages.
- Sealed vault dials with countdown timers.
- Automatic unlocking once the appointed date arrives.

### 🗺️ 6. Places & Atlas of Us
- Interactive coordinate map pinning places you have explored or dream of visiting.
- Filter between *Visited Together* and *Dream Destinations*.
- Deep links between geographic coordinates and photo memories.

### 🎯 7. Bucket List & Milestone Countdowns
- Shared goals and dream adventures categorized into Travel, Romance, Home, Creative, and Life.
- Live ticking countdowns with high-precision day/hour/minute/second timers.
- Mark completed wishes with fulfillment dates.

### 📅 8. Calendar & On This Day
- Interactive calendar highlighting memory-dense dates.
- "On This Day" emotional surface highlighting memories from exact past calendar days.

### 🎨 9. Curated Theme System & Ambiance
- 4 refined romantic themes:
  - **Velvet Rose** (Deep wine, velvet rose, warm champagne gold)
  - **Midnight Celestial** (Night sky indigo, twilight violet, star gold)
  - **Earthy Sage** (Muted eucalyptus, warm moss, soft linen)
  - **Ivory Linen** (Cream parchment, espresso, warm taupe)
- Optional floating procedural audio soundscape player with soft acoustic resonance.
- Floating star and ember particle background.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Visuals & Animation**: Canvas-Confetti, Custom Web Audio API Synthesizers
- **Persistence Layer**: `vaultStorage` abstraction engine with automatic dual-engine capability:
  - **Supabase Cloud Database** (when configured with Row-Level Security)
  - **Local Vault Storage** (zero-setup offline-first fallback)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/dear-us.git

# Navigate into project directory
cd dear-us

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be running at `http://localhost:3000`.

---

## 🔐 Environment Variables

To connect a persistent Supabase database, create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

If these keys are left empty, **Dear Us** automatically runs in **Local Vault Mode**, persisting data directly in local browser storage so you can use and test the application immediately without cloud configuration.

---

## 🛡️ Supabase Database & Security (RLS)

If using Supabase, run the following SQL schema in your Supabase SQL Editor to provision tables and configure Row Level Security (RLS):

```sql
-- 1. Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  avatar_url TEXT,
  partner_avatar_url TEXT,
  anniversary_date TEXT,
  start_date TEXT,
  theme TEXT DEFAULT 'velvet',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Memories
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  category TEXT NOT NULL,
  mood TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  notes TEXT,
  how_i_remember TEXT,
  reactions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Timeline Events
CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  category TEXT NOT NULL,
  photo_url TEXT,
  is_milestone BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Future Letters
CREATE TABLE IF NOT EXISTS future_letters (
  id TEXT PRIMARY KEY,
  sender_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  unlock_date TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  seal_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Memory Capsules
CREATE TABLE IF NOT EXISTS memory_capsules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  unlock_date TEXT NOT NULL,
  theme TEXT NOT NULL,
  message TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  notes TEXT[] DEFAULT '{}',
  audio_note TEXT,
  is_opened BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bucket List & Countdowns
CREATE TABLE IF NOT EXISTS bucket_list_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  target_date TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milestone_countdowns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  target_date TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE future_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_countdowns ENABLE ROW LEVEL SECURITY;

-- Allow authenticated couple partners read/write access
CREATE POLICY "Couple read access" ON memories FOR SELECT USING (true);
CREATE POLICY "Couple insert access" ON memories FOR INSERT WITH CHECK (true);
CREATE POLICY "Couple update access" ON memories FOR UPDATE USING (true);
CREATE POLICY "Couple delete access" ON memories FOR DELETE USING (true);
```

---

## 🔒 Privacy & Security Notes

- **Zero Third-Party Ad Trackers**: No analytics, behavioral tracking, or advertising scripts.
- **Client & Server Isolation**: API keys and secrets are never committed into git.
- **Protected Time Capsules**: Future letters and time capsules stay sealed until their target unlock date has passed.
- **Data Export & Portability**: You can export your entire memory vault as a portable JSON file or restore from a backup anytime via **Settings → Export Vault / Import Vault**.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
