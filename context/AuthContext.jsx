"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUser = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error(error);
      setUser(null);
      return false;
    }

    const nextUser = data.session?.user ?? null;
    setUser(nextUser);
    return Boolean(nextUser);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await syncUser();
      setLoading(false);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          throw error;
        }

        const hasSession = await syncUser();

        if (!hasSession) {
          throw new Error("Login succeeded but the session was not created. Please try again.");
        }

        return data;
      },
      signup: async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          throw error;
        }

        if (!data.user || !data.session) {
          throw new Error("Check your email to confirm your account before signing in.");
        }

        setUser(data.user);
        return data;
      },
      logout: async () => {
        const { error } = await supabase.auth.signOut();

        if (!error) {
          setUser(null);
        }

        return { error };
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
