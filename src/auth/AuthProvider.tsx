import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AuthContext, type AuthContextValue } from "@/auth/auth-context";
import { isSupabaseConfigured, supabase, type SupabaseUser } from "@/lib/supabase";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => isSupabaseConfigured);
  const [authError, setAuthError] = useState("");
  const anonymousSignInPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    const startAnonymousSession = async () => {
      if (anonymousSignInPromiseRef.current) {
        return anonymousSignInPromiseRef.current;
      }

      const signInPromise = (async () => {
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) throw error;
        if (!isMounted) return;

        setUser(data.user ?? data.session?.user ?? null);
        setAuthError("");
      })().finally(() => {
        anonymousSignInPromiseRef.current = null;
      });

      anonymousSignInPromiseRef.current = signInPromise;
      return signInPromise;
    };

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;

        if (data.session?.user) {
          setUser(data.session.user);
          setAuthError("");
          setIsLoading(false);
          return;
        }

        void startAnonymousSession()
          .catch((error: unknown) => {
            if (!isMounted) return;
            setAuthError(error instanceof Error ? error.message : "Could not start a guest session.");
          })
          .finally(() => {
            if (!isMounted) return;
            setIsLoading(false);
          });
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
        setUser(session.user);
        setAuthError("");
        setIsLoading(false);
        return;
      }

      setUser(null);
      setIsLoading(true);
      void startAnonymousSession()
        .catch((error: unknown) => {
          if (!isMounted) return;
          setAuthError(error instanceof Error ? error.message : "Could not start a guest session.");
        })
        .finally(() => {
          if (!isMounted) return;
          setIsLoading(false);
        });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      authError,
      isConfigured: isSupabaseConfigured,
      isAnonymous: Boolean(user?.is_anonymous),
      isLoading,
      user,
      signInWithEmail: async (email: string) => {
        if (!supabase) {
          throw new Error("Supabase is not configured.");
        }

        if (user?.is_anonymous) {
          const { error } = await supabase.auth.updateUser(
            { email },
            {
              emailRedirectTo: window.location.origin + window.location.pathname,
            },
          );

          if (error) throw error;
          return;
        }

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin + window.location.pathname,
          },
        });

        if (error) throw error;
      },
      signOut: async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [authError, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
