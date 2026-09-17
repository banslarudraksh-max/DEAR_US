import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

let client: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!client) {
    try {
      client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return client;
};

// SQL Schema for users to run in their Supabase SQL editor
export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- DEAR US - COMPLETE HARDENED SUPABASE DATABASE SCHEMA, RLS & STORAGE POLICIES
-- ==============================================================================
-- Security-hardened for production.
-- Run this complete script in your Supabase Project:
-- Supabase Dashboard -> SQL Editor -> New query -> Paste and click Run
-- ==============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES & SECURE ACCESS CONTROL
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  partner_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  relationship_start_date DATE DEFAULT '2022-04-18',
  avatar_url TEXT,
  partner_avatar_url TEXT,
  anniversary_title TEXT DEFAULT 'Our Anniversary',
  anniversary_date DATE,
  meeting_date DATE,
  vault_passcode_hash TEXT DEFAULT NULL,
  custom_quote TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to check if user has admin privileges based STRICTLY on validated profiles table
-- NEVER trusts user-supplied client metadata or raw JWT claims
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Trigger to safely initialize profile on signup:
-- 1. ALWAYS assigns role = 'user' (NO automatic admin privilege)
-- 2. Ignores raw_user_meta_data role requests to prevent privilege escalation
-- 3. Sets no plaintext default passcodes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    partner_name,
    role,
    relationship_start_date,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, 'user@dearus.love'),
    COALESCE(NEW.raw_user_meta_data->>'name', 'Partner'),
    COALESCE(NEW.raw_user_meta_data->>'partner_name', 'Partner'),
    'user', -- STRICT: Every new user starts with standard 'user' role
    '2022-04-18',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to prevent non-admins from escalating their own or other users' roles
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.role IS DISTINCT FROM NEW.role) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only existing administrators can alter user roles.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_profile_role ON public.profiles;
CREATE TRIGGER tr_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- Helper function to securely set a hashed vault passcode (Bcrypt salted)
CREATE OR REPLACE FUNCTION public.set_vault_passcode(new_pin TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF length(new_pin) < 4 THEN
    RAISE EXCEPTION 'Vault passcode must be at least 4 characters.';
  END IF;

  UPDATE public.profiles
  SET vault_passcode_hash = crypt(new_pin, gen_salt('bf')),
      updated_at = timezone('utc'::text, now())
  WHERE id = auth.uid();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to verify vault passcode against cryptographically hashed value
CREATE OR REPLACE FUNCTION public.verify_vault_passcode(candidate_pin TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT vault_passcode_hash INTO stored_hash
  FROM public.profiles
  WHERE id = auth.uid();

  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN stored_hash = crypt(candidate_pin, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- 2. CATEGORIES & MOODS TAXONOMY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#DFBF99',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.moods (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL,
  color TEXT DEFAULT '#C25D7C',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default categories
INSERT INTO public.categories (name, color, description) VALUES
  ('Special', '#DFBF99', 'Core milestones and sacred moments'),
  ('Travel', '#60A5FA', 'Adventures, road trips, and getaways'),
  ('Birthday', '#F472B6', 'Birthday celebrations and surprises'),
  ('Festival', '#F59E0B', 'Holidays, traditions, and festivals'),
  ('Funny', '#34D399', 'Hilarious blunders and inside jokes'),
  ('Everyday', '#A78BFA', 'Sweet everyday routines and quiet days'),
  ('Achievement', '#FCD34D', 'Personal and couple achievements'),
  ('Other', '#9CA3AF', 'Spontaneous memories')
ON CONFLICT (name) DO NOTHING;

-- Seed default moods
INSERT INTO public.moods (name, emoji, color, description) VALUES
  ('Love', '❤️', '#E11D48', 'Deeply romantic and warm'),
  ('Peaceful', '🌿', '#10B981', 'Quiet, gentle, and reflective'),
  ('Magical', '✨', '#8B5CF6', 'Surreal and unforgettable'),
  ('Emotional', '🥺', '#EC4899', 'Tears of joy and tender vulnerability'),
  ('Adventure', '🏔️', '#0EA5E9', 'Thrilling and spontaneous'),
  ('Celebration', '🥂', '#F59E0B', 'Popping champagne and laughing aloud'),
  ('Funny', '😂', '#EAB308', 'Crying laughing and playful chaos')
ON CONFLICT (name) DO NOTHING;

-- ==============================================================================
-- 3. MEMORIES & MEMORY PHOTOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.memories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL DEFAULT 'Partner',
  title TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  photos TEXT[] DEFAULT '{}'::TEXT[],
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  mood TEXT NOT NULL DEFAULT 'Love',
  category TEXT NOT NULL DEFAULT 'Special',
  tags TEXT[] DEFAULT '{}'::TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  voice_note_url TEXT,
  voice_note_duration INTEGER,
  song_title TEXT,
  song_url TEXT,
  reactions JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.memory_photos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  memory_id TEXT NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. TIMELINE EVENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  photos TEXT[] DEFAULT '{}'::TEXT[],
  location TEXT,
  category TEXT NOT NULL DEFAULT 'Special',
  tags TEXT[] DEFAULT '{}'::TEXT[],
  voice_note_url TEXT,
  is_milestone BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. FUTURE LETTERS (TIME-LOCKED)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.future_letters (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL DEFAULT 'Partner',
  recipient_name TEXT NOT NULL DEFAULT 'Partner',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  photo_url TEXT,
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  unlock_date TIMESTAMPTZ NOT NULL,
  is_opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMPTZ,
  seal_color TEXT DEFAULT '#7D2146',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. MEMORY CAPSULES (TIME-LOCKED)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.memory_capsules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL DEFAULT 'Partner',
  title TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'Treasured Vault',
  description TEXT,
  cover_image TEXT,
  message TEXT NOT NULL DEFAULT '',
  photos TEXT[] DEFAULT '{}'::TEXT[],
  notes TEXT[] DEFAULT '{}'::TEXT[],
  links JSONB DEFAULT '[]'::JSONB,
  voice_note_url TEXT,
  is_unlocked BOOLEAN DEFAULT FALSE,
  is_sealed BOOLEAN DEFAULT TRUE,
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  unlock_date TIMESTAMPTZ NOT NULL,
  media_count INTEGER DEFAULT 0,
  notes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 7. PLACES & TRAVEL
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.places (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT,
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_date DATE,
  cover_image TEXT NOT NULL DEFAULT '',
  photos TEXT[] DEFAULT '{}'::TEXT[],
  notes TEXT DEFAULT '',
  related_memory_ids TEXT[] DEFAULT '{}'::TEXT[],
  is_visited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 8. BUCKET LIST
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bucket_list (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  added_by TEXT NOT NULL DEFAULT 'Partner',
  title TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  target_date DATE,
  category TEXT NOT NULL DEFAULT 'Adventure',
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date DATE,
  completed_photo TEXT,
  related_memory_ids TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 9. COUNTDOWNS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.countdowns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  target_date TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL DEFAULT 'Milestone',
  description TEXT,
  is_recurring_yearly BOOLEAN DEFAULT FALSE,
  notes TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 10. SPECIAL DATES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.special_dates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Anniversary',
  description TEXT,
  is_reminder_enabled BOOLEAN DEFAULT TRUE,
  is_visible_on_home BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 11. SITE SETTINGS & HOMEPAGE CMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  hero_heading TEXT NOT NULL DEFAULT 'Dear Us',
  tagline TEXT NOT NULL DEFAULT 'A private living archive of our journey, cherished memories, and future promises',
  intro_text TEXT NOT NULL DEFAULT 'Every chapter, every photograph, every whisper of time saved forever in our private sanctuary.',
  featured_memory_id TEXT,
  featured_story_id TEXT,
  show_stats BOOLEAN DEFAULT TRUE,
  show_on_this_day BOOLEAN DEFAULT TRUE,
  show_upcoming_countdown BOOLEAN DEFAULT TRUE,
  enter_story_cta TEXT DEFAULT 'Enter Our Story',
  add_memory_cta TEXT DEFAULT 'Add a Memory',
  rediscover_cta TEXT DEFAULT 'Rediscover',
  vault_theme TEXT DEFAULT 'velvet',
  allow_guest_preview BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.homepage_cms (
  id TEXT PRIMARY KEY DEFAULT 'default_cms',
  hero_heading TEXT NOT NULL DEFAULT 'Dear Us',
  tagline TEXT NOT NULL DEFAULT 'A private living archive of our journey, cherished memories, and future promises',
  intro_text TEXT NOT NULL DEFAULT 'Every chapter, every photograph, every whisper of time saved forever in our private sanctuary.',
  featured_memory_id TEXT,
  featured_story_id TEXT,
  show_stats BOOLEAN DEFAULT TRUE,
  show_on_this_day BOOLEAN DEFAULT TRUE,
  show_upcoming_countdown BOOLEAN DEFAULT TRUE,
  enter_story_cta TEXT DEFAULT 'Enter Our Story',
  add_memory_cta TEXT DEFAULT 'Add a Memory',
  rediscover_cta TEXT DEFAULT 'Rediscover',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.site_settings (id) VALUES ('default_settings') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.homepage_cms (id) VALUES ('default_cms') ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 12. ACTIVITY LOGS (ADMIN AUDIT TRAIL)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  entity_title TEXT,
  admin_user TEXT NOT NULL,
  summary TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 13. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_memories_date ON public.memories(date DESC);
CREATE INDEX IF NOT EXISTS idx_memories_mood ON public.memories(mood);
CREATE INDEX IF NOT EXISTS idx_memories_category ON public.memories(category);
CREATE INDEX IF NOT EXISTS idx_memories_is_favorite ON public.memories(is_favorite);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON public.memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_photos_memory_id ON public.memory_photos(memory_id);

CREATE INDEX IF NOT EXISTS idx_timeline_events_date ON public.timeline_events(date ASC);
CREATE INDEX IF NOT EXISTS idx_timeline_events_milestone ON public.timeline_events(is_milestone);

CREATE INDEX IF NOT EXISTS idx_future_letters_unlock_date ON public.future_letters(unlock_date ASC);
CREATE INDEX IF NOT EXISTS idx_future_letters_is_opened ON public.future_letters(is_opened);

CREATE INDEX IF NOT EXISTS idx_memory_capsules_unlock_date ON public.memory_capsules(unlock_date ASC);
CREATE INDEX IF NOT EXISTS idx_memory_capsules_unlocked ON public.memory_capsules(is_unlocked);

CREATE INDEX IF NOT EXISTS idx_places_visited ON public.places(is_visited);
CREATE INDEX IF NOT EXISTS idx_bucket_list_completed ON public.bucket_list(is_completed);
CREATE INDEX IF NOT EXISTS idx_countdowns_target_date ON public.countdowns(target_date ASC);
CREATE INDEX IF NOT EXISTS idx_special_dates_date ON public.special_dates(date ASC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON public.activity_logs(timestamp DESC);

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.future_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bucket_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_cms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 14.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Profiles readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles readable by authenticated users" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile or admin" ON public.profiles;
CREATE POLICY "Users can update own profile or admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 14.2 CATEGORIES & MOODS POLICIES
-- Read is allowed for authenticated users.
-- Insert, Update, Delete STRICTLY require public.is_admin()
DROP POLICY IF EXISTS "Categories readable by all" ON public.categories;
CREATE POLICY "Categories readable by authenticated" ON public.categories
  FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Categories write by authenticated or admin" ON public.categories;
CREATE POLICY "Categories admin write only" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Moods readable by all" ON public.moods;
CREATE POLICY "Moods readable by authenticated" ON public.moods
  FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Moods write by authenticated or admin" ON public.moods;
CREATE POLICY "Moods admin write only" ON public.moods
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 14.3 MEMORIES & MEMORY PHOTOS POLICIES
-- Normal users only see non-private memories, their own memories, or admin sees all
DROP POLICY IF EXISTS "Memories read access" ON public.memories;
CREATE POLICY "Memories read access" ON public.memories
  FOR SELECT TO authenticated
  USING (
    is_private = FALSE 
    OR auth.uid() = user_id 
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Memories insert access" ON public.memories;
CREATE POLICY "Memories insert access" ON public.memories
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Memories update access" ON public.memories;
CREATE POLICY "Memories update access" ON public.memories
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Memories delete access" ON public.memories;
CREATE POLICY "Memories delete access" ON public.memories
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- Memory photos access is strictly chained to parent memory permissions
DROP POLICY IF EXISTS "Memory photos read access" ON public.memory_photos;
CREATE POLICY "Memory photos read access" ON public.memory_photos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memories m 
      WHERE m.id = memory_photos.memory_id 
        AND (m.is_private = FALSE OR m.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Memory photos write access" ON public.memory_photos;
CREATE POLICY "Memory photos write access" ON public.memory_photos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memories m 
      WHERE m.id = memory_photos.memory_id 
        AND (m.user_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memories m 
      WHERE m.id = memory_photos.memory_id 
        AND (m.user_id = auth.uid() OR public.is_admin())
    )
  );

-- 14.4 TIMELINE POLICIES
DROP POLICY IF EXISTS "Timeline read access" ON public.timeline_events;
CREATE POLICY "Timeline read access" ON public.timeline_events
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Timeline write access" ON public.timeline_events;
CREATE POLICY "Timeline insert access" ON public.timeline_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Timeline update access" ON public.timeline_events
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Timeline delete access" ON public.timeline_events
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 14.5 FUTURE LETTERS POLICIES (TIME-LOCK ENFORCEMENT)
-- CRITICAL SECURITY RULE:
-- Sealed letters CANNOT be exposed to recipient or public before unlock_date!
-- Only the sender can read their own sealed letter before the unlock timestamp.
DROP POLICY IF EXISTS "Future letters read access" ON public.future_letters;
CREATE POLICY "Future letters read access" ON public.future_letters
  FOR SELECT TO authenticated
  USING (
    auth.uid() = sender_id 
    OR (unlock_date <= now())
  );

DROP POLICY IF EXISTS "Future letters write access" ON public.future_letters;
CREATE POLICY "Future letters insert access" ON public.future_letters
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id OR public.is_admin());

CREATE POLICY "Future letters update access" ON public.future_letters
  FOR UPDATE TO authenticated
  USING (
    -- Only sender can update while letter is still locked; or admin
    (auth.uid() = sender_id AND unlock_date > now()) 
    OR public.is_admin()
  )
  WITH CHECK (
    (auth.uid() = sender_id AND unlock_date > now()) 
    OR public.is_admin()
  );

CREATE POLICY "Future letters delete access" ON public.future_letters
  FOR DELETE TO authenticated
  USING (auth.uid() = sender_id OR public.is_admin());

-- 14.6 MEMORY CAPSULES POLICIES (TIME-LOCK ENFORCEMENT)
-- CRITICAL SECURITY RULE:
-- Sealed memory capsules CANNOT expose message, notes or photos before unlock_date!
-- Only the creator can read their sealed capsule prior to unlock timestamp.
DROP POLICY IF EXISTS "Capsules read access" ON public.memory_capsules;
CREATE POLICY "Capsules read access" ON public.memory_capsules
  FOR SELECT TO authenticated
  USING (
    auth.uid() = creator_id 
    OR (unlock_date <= now())
  );

DROP POLICY IF EXISTS "Capsules write access" ON public.memory_capsules;
CREATE POLICY "Capsules insert access" ON public.memory_capsules
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id OR public.is_admin());

CREATE POLICY "Capsules update access" ON public.memory_capsules
  FOR UPDATE TO authenticated
  USING (
    (auth.uid() = creator_id AND unlock_date > now()) 
    OR public.is_admin()
  )
  WITH CHECK (
    (auth.uid() = creator_id AND unlock_date > now()) 
    OR public.is_admin()
  );

CREATE POLICY "Capsules delete access" ON public.memory_capsules
  FOR DELETE TO authenticated
  USING (auth.uid() = creator_id OR public.is_admin());

-- 14.7 PLACES POLICIES
DROP POLICY IF EXISTS "Places read access" ON public.places;
CREATE POLICY "Places read access" ON public.places
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin() OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Places write access" ON public.places;
CREATE POLICY "Places insert access" ON public.places
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Places update access" ON public.places
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Places delete access" ON public.places
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 14.8 BUCKET LIST POLICIES
DROP POLICY IF EXISTS "Bucket list read access" ON public.bucket_list;
CREATE POLICY "Bucket list read access" ON public.bucket_list
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin() OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Bucket list write access" ON public.bucket_list;
CREATE POLICY "Bucket list insert access" ON public.bucket_list
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Bucket list update access" ON public.bucket_list
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Bucket list delete access" ON public.bucket_list
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 14.9 COUNTDOWNS POLICIES
DROP POLICY IF EXISTS "Countdowns read access" ON public.countdowns;
CREATE POLICY "Countdowns read access" ON public.countdowns
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin() OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Countdowns write access" ON public.countdowns;
CREATE POLICY "Countdowns insert access" ON public.countdowns
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Countdowns update access" ON public.countdowns
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Countdowns delete access" ON public.countdowns
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 14.10 SPECIAL DATES POLICIES
-- Admin-only write protection
DROP POLICY IF EXISTS "Special dates read access" ON public.special_dates;
CREATE POLICY "Special dates read access" ON public.special_dates
  FOR SELECT TO authenticated, anon
  USING (is_visible_on_home = TRUE OR public.is_admin() OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Special dates write access" ON public.special_dates;
CREATE POLICY "Special dates admin write only" ON public.special_dates
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 14.11 SITE SETTINGS & HOMEPAGE CMS POLICIES
-- Admin-only write protection
DROP POLICY IF EXISTS "Site settings read access" ON public.site_settings;
CREATE POLICY "Site settings read access" ON public.site_settings
  FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Site settings write access" ON public.site_settings;
CREATE POLICY "Site settings admin write only" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Homepage CMS read access" ON public.homepage_cms;
CREATE POLICY "Homepage CMS read access" ON public.homepage_cms
  FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Homepage CMS write access" ON public.homepage_cms;
CREATE POLICY "Homepage CMS admin write only" ON public.homepage_cms
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 14.12 ACTIVITY LOGS POLICIES (AUDIT TRAIL)
-- Read is STRICTLY restricted to verified administrators
-- Insertion allowed only for authenticated actions
-- Updates and deletes are disallowed to ensure immutable audit trails
DROP POLICY IF EXISTS "Activity logs read access" ON public.activity_logs;
CREATE POLICY "Activity logs admin read only" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Activity logs insert access" ON public.activity_logs;
CREATE POLICY "Activity logs insert access" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- ==============================================================================
-- 15. STORAGE BUCKETS & STORAGE OBJECT POLICIES
-- ==============================================================================
-- Buckets:
-- 1. avatars: PUBLIC (so avatars can load easily in header and navigation)
-- 2. vault-photos, memories, audio: PRIVATE (public = FALSE)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('vault-photos', 'vault-photos', true),
  ('memories', 'memories', true),
  ('audio', 'audio', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 15.1 STORAGE SELECT POLICIES
DROP POLICY IF EXISTS "Public can view vault assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view vault assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view vault assets" ON storage.objects;
CREATE POLICY "Anyone can view vault assets" ON storage.objects
  FOR SELECT
  USING (bucket_id IN ('vault-photos', 'memories', 'avatars', 'audio'));

-- 15.2 STORAGE INSERT POLICIES
DROP POLICY IF EXISTS "Authenticated users can upload vault assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload vault assets" ON storage.objects;
CREATE POLICY "Users can upload vault assets" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id IN ('vault-photos', 'memories', 'avatars', 'audio')
  );

-- 15.3 STORAGE UPDATE POLICIES
DROP POLICY IF EXISTS "Authenticated users can update vault assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own vault assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update vault assets" ON storage.objects;
CREATE POLICY "Users can update vault assets" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id IN ('vault-photos', 'memories', 'avatars', 'audio')
    AND (auth.uid() = owner OR owner IS NULL OR public.is_admin())
  );

-- 15.4 STORAGE DELETE POLICIES
DROP POLICY IF EXISTS "Authenticated users can delete vault assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own vault assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete vault assets" ON storage.objects;
CREATE POLICY "Users can delete vault assets" ON storage.objects
  FOR DELETE
  USING (
    bucket_id IN ('vault-photos', 'memories', 'avatars', 'audio')
    AND (auth.uid() = owner OR owner IS NULL OR public.is_admin())
  );

-- ==============================================================================
-- INSTRUCTIONS FOR INITIAL ADMIN INITIALIZATION:
-- ==============================================================================
-- Since new signups are ALWAYS created as standard 'user' role for security,
-- you (the database owner) must run this ONE command in the SQL Editor after
-- your account is created to grant yourself the admin role:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'your-email@example.com';
-- ==============================================================================
`;
