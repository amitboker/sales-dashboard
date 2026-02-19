import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

export const AuthContext = createContext(null);

const ADMIN_EMAIL = 'amitbooker2@gmail.com';

async function syncProfile(authUser) {
  if (!supabase || !authUser) return null;

  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('authId', authUser.id)
    .single();

  if (existing) {
    const now = new Date().toISOString();
    await supabase
      .from('profiles')
      .update({ lastSeen: now, updatedAt: now })
      .eq('id', existing.id);
    return { ...existing, lastSeen: now };
  }

  // First user ever becomes admin
  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true });

  const now = new Date().toISOString();
  // Extract name — handle both email/password and Google OAuth metadata
  const meta = authUser.user_metadata || {};
  let firstName = meta.first_name || null;
  let lastName = meta.last_name || null;

  // Google OAuth provides full_name instead of first/last
  if (!firstName && meta.full_name) {
    const parts = meta.full_name.trim().split(/\s+/);
    firstName = parts[0] || null;
    lastName = parts.slice(1).join(' ') || null;
  }
  // Fallback to name field (some providers)
  if (!firstName && meta.name) {
    const parts = meta.name.trim().split(/\s+/);
    firstName = parts[0] || null;
    lastName = parts.slice(1).join(' ') || null;
  }

  const newProfile = {
    id: crypto.randomUUID(),
    authId: authUser.id,
    email: authUser.email,
    firstName,
    lastName,
    isAdmin: count === 0,
    isActive: true,
    onboardingCompleted: false,
    onboardingStep: 'name',
    lastSeen: now,
    createdAt: now,
    updatedAt: now,
  };

  const { data: created, error } = await supabase
    .from('profiles')
    .insert(newProfile)
    .select()
    .single();

  if (error) {
    // Unique constraint — profile was created in another tab/request
    const { data: retry } = await supabase
      .from('profiles')
      .select('*')
      .eq('authId', authUser.id)
      .single();
    return retry;
  }

  return created;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setProfileLoading(false);
      return;
    }

    // Safety timeout — never stay stuck on the loading screen
    const safetyTimer = setTimeout(() => {
      setLoading((v) => {
        if (v) console.warn('[auth] loading safety timeout — forcing ready');
        return false;
      });
      setProfileLoading(false);
    }, 6000);

    supabase.auth.getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
        if (s?.user) {
          syncProfile(s.user)
            .then((p) => { setProfile(p); setProfileLoading(false); })
            .catch((err) => {
              console.warn('[auth] syncProfile failed', err?.message || err);
              setProfileLoading(false);
            });
        } else {
          setProfileLoading(false);
        }
      })
      .catch((err) => {
        console.warn('[auth] getSession failed', err?.message || err);
        setLoading(false);
        setProfileLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        console.log('[auth] onAuthStateChange:', _event, {
          user: !!s?.user,
          meta: s?.user?.user_metadata,
        });
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
        if (s?.user) {
          setProfileLoading(true);
          syncProfile(s.user)
            .then((p) => { setProfile(p); setProfileLoading(false); })
            .catch((err) => {
              console.warn('[auth] syncProfile failed (state change)', err?.message || err);
              setProfileLoading(false);
            });
        } else {
          setProfile(null);
          setProfileLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(email, password) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    console.log('[auth] signUp response:', {
      user: !!data.user,
      session: !!data.session,
      userId: data.user?.id,
      emailConfirmed: data.user?.email_confirmed_at,
    });

    // If Supabase returned a session, update state immediately
    if (data.session) {
      console.log('[auth] Session received on signup — immediate access');
      setSession(data.session);
      setUser(data.user);
      setLoading(false);
      setProfileLoading(true);
      syncProfile(data.user)
        .then((p) => { setProfile(p); setProfileLoading(false); })
        .catch((err) => {
          console.warn('[auth] syncProfile failed after signUp', err?.message || err);
          setProfileLoading(false);
        });
      return { ok: true, session: data.session, requiresEmailConfirmation: false };
    }

    // No session — email confirmation is pending. Do NOT attempt signIn fallback
    // to avoid logging in an existing user with stale onboarding metadata.
    console.log('[auth] No session on signup — email confirmation required');
    return { ok: true, session: null, requiresEmailConfirmation: true };
  }

  async function signIn(email, password) {
    if (!supabase) {
      console.error('[auth] Supabase not configured - check VITE_SUPABASE_ANON_KEY');
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('[auth] Sign in error:', error);
      throw error;
    }

    // Immediately update state — don't block on profile sync
    if (data.user) {
      setSession(data.session);
      setUser(data.user);
      setLoading(false);
      // Sync profile — track loading
      setProfileLoading(true);
      syncProfile(data.user)
        .then((p) => { setProfile(p); setProfileLoading(false); })
        .catch((err) => {
          console.warn('[auth] syncProfile failed after signIn', err?.message || err);
          setProfileLoading(false);
        });
    }

    return data;
  }

  async function signInWithGoogle() {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  }

  async function updateUserMeta(data) {
    if (!supabase) throw new Error('Supabase not configured');
    console.log('[auth] updateUserMeta:', data);
    const { data: result, error } = await supabase.auth.updateUser({ data });
    if (error) throw error;
    // Update local user state immediately so route guards see the new metadata
    if (result.user) {
      setUser(result.user);
    }
    return result;
  }

  async function completeOnboarding(onboardingData) {
    // Update user_metadata (instant, used by route guards)
    await updateUserMeta({ onboarding_completed: true });

    // Also update profiles table (for admin/analytics)
    if (supabase && profile) {
      const now = new Date().toISOString();
      await supabase
        .from('profiles')
        .update({ onboardingCompleted: true, onboardingData, updatedAt: now })
        .eq('id', profile.id)
        .then(({ error }) => {
          if (error) console.warn('[auth] profile update failed:', error.message);
          else setProfile((prev) => ({ ...prev, onboardingCompleted: true, onboardingData }));
        });
    }
  }

  const value = {
    user,
    session,
    profile,
    profileLoading,
    isAdmin: !!user && user.email === ADMIN_EMAIL,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateUserMeta,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
