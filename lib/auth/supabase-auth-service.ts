import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthUser, AuthStatus } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!client) client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}

export const SupabaseAuthService = {
  getStatus(): AuthStatus {
    return 'loading';
  },
  getUser(): AuthUser | null {
    return null;
  },
  async signUp(email: string, username: string): Promise<AuthUser> {
    const sb = getClient();
    if (!sb) throw new Error('Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    const { data, error } = await sb.auth.signUp({ email, password: email, options: { data: { username } } });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Sign up failed');
    return { id: data.user.id, email, username, createdAt: Date.now() };
  },
  async signIn(email: string): Promise<AuthUser> {
    const sb = getClient();
    if (!sb) throw new Error('Supabase not configured.');
    const { data, error } = await sb.auth.signInWithPassword({ email, password: email });
    if (error) throw new Error(error.message);
    const meta = data.user?.user_metadata;
    return {
      id: data.user!.id,
      email,
      username: (meta?.username as string) || email.split('@')[0],
      createdAt: new Date(data.user!.created_at || Date.now()).getTime(),
    };
  },
  async signOut(): Promise<void> {
    const sb = getClient();
    if (!sb) return;
    await sb.auth.signOut();
  },
  async migrateFromGuest(guestId: string, email: string, username: string): Promise<AuthUser> {
    return SupabaseAuthService.signUp(email, username);
  },
  isGuest(): boolean {
    return SupabaseAuthService.getStatus() !== 'authenticated';
  },
};
