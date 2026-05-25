import type { ReactNode } from "react";
import { Card, Chip } from "@heroui/react";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { useAuth } from "@/auth/auth-context";

export function AuthGate({ children }: { children: ReactNode }) {
  const { authError, isConfigured, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <main className="page-frame auth-gate-page">
        <section className="page-shell auth-gate-shell">
          <Card className="auth-gate-card" variant="secondary">
            <Card.Content className="auth-gate-content">
              <Chip className="hero-chip" variant="soft">
                Packtical
              </Chip>
              <h1 className="auth-gate-title">Starting your packing space.</h1>
              <p className="auth-gate-copy">Creating a synced guest session.</p>
            </Card.Content>
          </Card>
        </section>
      </main>
    );
  }

  if (!isConfigured) {
    return (
      <main className="page-frame auth-gate-page">
        <section className="page-shell auth-gate-shell">
          <Card className="auth-gate-card" variant="secondary">
            <Card.Content className="auth-gate-content">
              <Chip className="hero-chip" variant="soft">
                Packtical
              </Chip>
              <h1 className="auth-gate-title">Sync setup is required.</h1>
              <p className="auth-gate-copy">
                Add the Supabase URL and anon key before opening checklists.
              </p>
            </Card.Content>
          </Card>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="page-frame auth-gate-page">
        <section className="page-shell auth-gate-shell">
          <Card className="auth-gate-card" variant="secondary">
            <Card.Content className="auth-gate-content">
              <Chip className="hero-chip" variant="soft">
                Packtical
              </Chip>
              <h1 className="auth-gate-title">Guest session unavailable.</h1>
              <p className="auth-gate-copy">
                {authError || "Refresh the page to try starting a guest session again."}
              </p>
              <AuthStatus />
            </Card.Content>
          </Card>
        </section>
      </main>
    );
  }

  return children;
}
