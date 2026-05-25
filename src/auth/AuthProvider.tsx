import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  consumePendingAnonymousProgress,
  storePendingAnonymousProgress,
} from "@/auth/anonymous-migration";
import {
  AuthContext,
  type AuthContextValue,
  type EmailAuthMode,
} from "@/auth/auth-context";
import { isSupabaseConfigured, supabase, type SupabaseUser } from "@/lib/supabase";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => isSupabaseConfigured);
  const [authError, setAuthError] = useState("");
  const [syncVersion, setSyncVersion] = useState(0);
  const anonymousSignInPromiseRef = useRef<Promise<void> | null>(null);

  const finishUserSession = useCallback((nextUser: SupabaseUser) => {
    setUser(nextUser);
    setAuthError("");
    setIsLoading(false);

    if (nextUser.is_anonymous) return;

    void consumePendingAnonymousProgress(nextUser.id)
      .then((didMigrate) => {
        if (!didMigrate) return;
        setSyncVersion((current) => current + 1);
      })
      .catch((error: unknown) => {
        setAuthError(error instanceof Error ? error.message : "Could not sync guest progress.");
      });
  }, []);

  const startAnonymousSession = useCallback(async () => {
    if (!supabase) {
      return;
    }

    if (anonymousSignInPromiseRef.current) {
      return anonymousSignInPromiseRef.current;
    }

    const signInPromise = (async () => {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) throw error;

      const nextUser = data.user ?? data.session?.user;
      if (nextUser) {
        finishUserSession(nextUser);
      }
    })().finally(() => {
      anonymousSignInPromiseRef.current = null;
    });

    anonymousSignInPromiseRef.current = signInPromise;
    return signInPromise;
  }, [finishUserSession]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;

        if (data.session?.user) {
          finishUserSession(data.session.user);
          return;
        }

        setUser(null);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        setAuthError(error instanceof Error ? error.message : "Could not check your session.");
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        finishUserSession(session.user);
        return;
      }

      setUser(null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [finishUserSession, startAnonymousSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      authError,
      isConfigured: isSupabaseConfigured,
      isAnonymous: Boolean(user?.is_anonymous),
      isLoading,
      syncVersion,
      user,
      signInWithEmail: async (email: string, mode: EmailAuthMode) => {
        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        if (mode === "connect-new" && user?.is_anonymous) {
          const { error } = await supabase.auth.updateUser(
            { email },
            {
              emailRedirectTo: window.location.origin + window.location.pathname,
            },
          );

          if (error) throw error;
          return;
        }

        if (mode === "connect-existing" && user?.is_anonymous) {
          await storePendingAnonymousProgress();

          const { error: signOutError } = await supabase.auth.signOut();
          if (signOutError) throw signOutError;
        }

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin + window.location.pathname,
            shouldCreateUser: mode === "create",
          },
        });

        if (error) throw error;
      },
      startAnonymousSession: async () => {
        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        setIsLoading(true);
        try {
          await startAnonymousSession();
        } finally {
          setIsLoading(false);
        }
      },
      signOut: async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [authError, isLoading, startAnonymousSession, syncVersion, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
