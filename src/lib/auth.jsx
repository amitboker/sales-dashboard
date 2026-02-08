import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);

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
  const newProfile = {
    id: crypto.randomUUID(),
    authId: authUser.id,
    email: authUser.email,
    firstName: authUser.user_metadata?.first_name || null,
    lastName: authUser.user_metadata?.last_name || null,
    isAdmin: count === 0,
    isActive: true,
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

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Safety timeout — never stay stuck on the loading screen
    const safetyTimer = setTimeout(() => {
      setLoading((v) => {
        if (v) console.warn('[auth] loading safety timeout — forcing ready');
        return false;
      });
    }, 6000);

    supabase.auth.getSession()
      .then(async ({ data: { session: s } }) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          try {
            const p = await syncProfile(s.user);
            setProfile(p);
          } catch (err) {
            console.warn('[auth] syncProfile failed', err?.message || err);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('[auth] getSession failed', err?.message || err);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          try {
            const p = await syncProfile(s.user);
            setProfile(p);
          } catch (err) {
            console.warn('[auth] syncProfile failed (state change)', err?.message || err);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
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
    const needsConfirmation = data.user && !data.session;
    return { ...data, needsConfirmation };
  }

  async function signIn(email, password) {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  }

  const value = {
    user,
    session,
    profile,
    isAdmin: profile?.isAdmin || false,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
