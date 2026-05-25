import { Card, Chip, Link } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { useAuth } from "@/auth/auth-context";

export function AccountPage() {
  const { isAnonymous, user } = useAuth();

  return (
    <main className="page-frame account-page">
      <section className="page-shell account-shell">
        <Link className="page-back-link" href="#/">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.2} />
          Back to checklists
        </Link>

        <Card className="account-card" variant="secondary">
          <Card.Content className="account-card-content">
            <Chip className="hero-chip" variant="soft">
              Account
            </Chip>
            <div className="account-copy">
              <h1 className="account-title">
                {user && isAnonymous ? "Save this progress." : "Manage your account."}
              </h1>
              <p className="account-description">
                {user && isAnonymous
                  ? "Create a new account or sign in to an existing one. Your guest checklist progress will stay synced."
                  : "Your checklist progress and custom items are synced with Supabase."}
              </p>
            </div>
            <AuthStatus variant="full" />
          </Card.Content>
        </Card>
      </section>
    </main>
  );
}
