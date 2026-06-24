-- Buddy RLS Policies
-- Run after schema migration

-- Profiles: users can read/update their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_own_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_own_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);

-- Buddies: users can only access their own buddies
ALTER TABLE public.buddies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "buddies_own_select" ON public.buddies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "buddies_own_insert" ON public.buddies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "buddies_own_update" ON public.buddies
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "buddies_own_delete" ON public.buddies
  FOR DELETE USING (auth.uid() = user_id);

-- Inventory: users can access their buddies' inventory
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_own_select" ON public.inventory_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.buddies WHERE id = buddy_id AND user_id = auth.uid())
  );

CREATE POLICY "inventory_own_insert" ON public.inventory_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.buddies WHERE id = buddy_id AND user_id = auth.uid())
  );

CREATE POLICY "inventory_own_update" ON public.inventory_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.buddies WHERE id = buddy_id AND user_id = auth.uid())
  );

CREATE POLICY "inventory_own_delete" ON public.inventory_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.buddies WHERE id = buddy_id AND user_id = auth.uid())
  );

-- Coins: similar pattern
ALTER TABLE public.buddy_coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coins_own_select" ON public.buddy_coins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.buddies WHERE id = buddy_id AND user_id = auth.uid())
  );

CREATE POLICY "coins_own_insert" ON public.buddy_coins
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.buddies WHERE id = buddy_id AND user_id = auth.uid())
  );

CREATE POLICY "coins_own_update" ON public.buddy_coins
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.buddies WHERE id = buddy_id AND user_id = auth.uid())
  );

-- Home decor
ALTER TABLE public.home_decor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "decor_own_select" ON public.home_decor
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.buddies WHERE id = buddy_id AND user_id = auth.uid())
  );

CREATE POLICY "decor_own_insert" ON public.home_decor
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.buddies WHERE id = buddy_id AND user_id = auth.uid())
  );

CREATE POLICY "decor_own_update" ON public.home_decor
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.buddies WHERE id = buddy_id AND user_id = auth.uid())
  );

-- Service role policies for Edge Functions
CREATE POLICY "service_role_all" ON public.buddies
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_inventory" ON public.inventory_items
  FOR ALL USING (auth.role() = 'service_role');