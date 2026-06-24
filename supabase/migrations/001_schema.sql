-- Buddy v1.0 Database Schema
-- Supabase SQL Migration

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_guest BOOLEAN NOT NULL DEFAULT FALSE,
  guest_id TEXT UNIQUE
);

-- 2. Buddies
CREATE TABLE IF NOT EXISTS public.buddies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 3),
  species_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  is_shiny BOOLEAN NOT NULL DEFAULT FALSE,
  hat TEXT NOT NULL DEFAULT 'none',
  eyes TEXT NOT NULL DEFAULT '..',
  seed TEXT NOT NULL,
  stats JSONB NOT NULL DEFAULT '{}',
  needs JSONB NOT NULL DEFAULT '{}',
  mood TEXT NOT NULL DEFAULT 'content',
  bond INTEGER NOT NULL DEFAULT 0,
  health INTEGER NOT NULL DEFAULT 100,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  last_interaction TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  personality_id TEXT NOT NULL,
  lifecycle TEXT NOT NULL DEFAULT 'egg',
  age INTEGER NOT NULL DEFAULT 0,
  skills JSONB NOT NULL DEFAULT '{}',
  bond_level INTEGER NOT NULL DEFAULT 1,
  total_adventures INTEGER NOT NULL DEFAULT 0,
  achievements TEXT[] NOT NULL DEFAULT '{}',
  care_quality REAL NOT NULL DEFAULT 1.0,
  memories JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, slot)
);

-- 3. Inventory items
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buddy_id UUID NOT NULL REFERENCES public.buddies(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 99),
  UNIQUE(buddy_id, item_id)
);

-- 4. Buddy coins
CREATE TABLE IF NOT EXISTS public.buddy_coins (
  buddy_id UUID PRIMARY KEY REFERENCES public.buddies(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 0 CHECK (amount >= 0 AND amount <= 999999)
);

-- 5. Home customizations
CREATE TABLE IF NOT EXISTS public.home_decor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buddy_id UUID NOT NULL REFERENCES public.buddies(id) ON DELETE CASCADE,
  slot_id TEXT NOT NULL,
  item_id TEXT,
  UNIQUE(buddy_id, slot_id)
);

-- 6. Adventure logs
CREATE TABLE IF NOT EXISTS public.adventure_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buddy_id UUID NOT NULL REFERENCES public.buddies(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  stat_checks JSONB NOT NULL DEFAULT '{}',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  bond_reward INTEGER NOT NULL DEFAULT 0,
  coin_reward INTEGER NOT NULL DEFAULT 0,
  item_rewards JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Daily rewards
CREATE TABLE IF NOT EXISTS public.daily_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buddy_id UUID NOT NULL REFERENCES public.buddies(id) ON DELETE CASCADE,
  claim_date DATE NOT NULL,
  streak_day INTEGER NOT NULL DEFAULT 1,
  coins INTEGER NOT NULL DEFAULT 0,
  item_id TEXT,
  UNIQUE(buddy_id, claim_date)
);

-- 8. Save conflict records
CREATE TABLE IF NOT EXISTS public.save_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buddy_id UUID NOT NULL REFERENCES public.buddies(id) ON DELETE CASCADE,
  local_version INTEGER NOT NULL,
  cloud_version INTEGER NOT NULL,
  local_checksum TEXT NOT NULL,
  cloud_checksum TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolution TEXT CHECK (resolution IN ('local', 'cloud', 'merged')),
  resolved_at TIMESTAMPTZ
);

-- 9. Audit events
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  buddy_id UUID REFERENCES public.buddies(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Trading offers
CREATE TABLE IF NOT EXISTS public.trade_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_buddy_id UUID NOT NULL REFERENCES public.buddies(id) ON DELETE CASCADE,
  to_buddy_id UUID REFERENCES public.buddies(id) ON DELETE CASCADE,
  offered_items JSONB NOT NULL DEFAULT '[]',
  requested_items JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_buddies_user_id ON public.buddies(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_buddy_id ON public.inventory_items(buddy_id);
CREATE INDEX IF NOT EXISTS idx_home_decor_buddy_id ON public.home_decor(buddy_id);
CREATE INDEX IF NOT EXISTS idx_adventure_logs_buddy_id ON public.adventure_logs(buddy_id);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_buddy_id ON public.daily_rewards(buddy_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_user_id ON public.audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_severity ON public.audit_events(severity);
CREATE INDEX IF NOT EXISTS idx_trade_offers_from ON public.trade_offers(from_buddy_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_status ON public.trade_offers(status);
