import { useState, type FormEvent } from "react";
import { Button, Input, Link } from "@heroui/react";
import { Cloud, CloudOff, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useAuth, type EmailAuthMode } from "@/auth/auth-context";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";

type AuthStatusProps = {
  variant?: "compact" | "full";
};

export function AuthStatus({ variant = "compact" }: AuthStatusProps) {
  const {
    authError,
    isAnonymous,
    isConfigured,
    isLoading,
    user,
    signInWithEmail,
    signOut,
    startAnonymousSession,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<EmailAuthMode>("sign-in");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailMode = getEmailMode(mode, isAnonymous);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) return;

    setIsSubmitting(true);
    setMessage("");
    setError("");

    void signInWithEmail(trimmedEmail, emailMode)
      .then(() => {
        setMessage(getSuccessMessage(emailMode));
        setEmail("");
      })
      .catch((signInError: unknown) => {
        setError(getSupabaseErrorMessage(signInError));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleAnonymousStart = () => {
    setIsSubmitting(true);
    setMessage("");
    setError("");

    void startAnonymousSession()
      .catch((anonymousError: unknown) => {
        setError(getSupabaseErrorMessage(anonymousError));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (!isConfigured) {
    return (
      <div className="auth-status auth-status-local">
        <CloudOff aria-hidden="true" size={15} strokeWidth={2.1} />
        <span>Sync unavailable</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="auth-status">
        <Cloud aria-hidden="true" size={15} strokeWidth={2.1} />
        <span>Checking sync</span>
      </div>
    );
  }

  if (user && !isAnonymous) {
    return (
      <div className={`auth-status auth-status-signed-in${variant === "full" ? " auth-status-full" : ""}`}>
        <div className="auth-status-identity">
          <Cloud aria-hidden="true" size={15} strokeWidth={2.1} />
          <span title={user.email ?? undefined}>{user.email ?? "Signed in"}</span>
        </div>
        {variant === "full" ? (
          <Button
            className="auth-sign-out-button"
            onPress={() => {
              void signOut();
            }}
            size="sm"
            variant="ghost"
          >
            <LogOut aria-hidden="true" size={14} strokeWidth={2.1} />
            <span>Sign out</span>
          </Button>
        ) : (
          <Button
            aria-label="Sign out"
            className="auth-icon-button"
            isIconOnly
            onPress={() => {
              void signOut();
            }}
            size="sm"
            variant="ghost"
          >
            <LogOut aria-hidden="true" size={14} strokeWidth={2.1} />
          </Button>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Link className="auth-save-link" href="#/account">
        <ShieldCheck aria-hidden="true" size={15} strokeWidth={2.1} />
        <span>{user && isAnonymous ? "Save progress" : "Account"}</span>
      </Link>
    );
  }

  if (!user && authError) {
    return (
      <div className="auth-status auth-status-local">
        <CloudOff aria-hidden="true" size={15} strokeWidth={2.1} />
        <span title={authError}>Guest session unavailable</span>
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <div className="auth-mode-tabs" aria-label={isAnonymous ? "Connect account options" : "Account options"}>
        {isAnonymous ? (
          <>
            <button
              aria-pressed={emailMode === "connect-new"}
              className={`auth-mode-tab${emailMode === "connect-new" ? " active" : ""}`}
              onClick={() => setMode("connect-new")}
              type="button"
            >
              Create account
            </button>
            <button
              aria-pressed={emailMode === "connect-existing"}
              className={`auth-mode-tab${emailMode === "connect-existing" ? " active" : ""}`}
              onClick={() => setMode("connect-existing")}
              type="button"
            >
              Existing account
            </button>
          </>
        ) : (
          <>
            <button
              aria-pressed={emailMode === "sign-in"}
              className={`auth-mode-tab${emailMode === "sign-in" ? " active" : ""}`}
              onClick={() => setMode("sign-in")}
              type="button"
            >
              Sign in
            </button>
            <button
              aria-pressed={emailMode === "create"}
              className={`auth-mode-tab${emailMode === "create" ? " active" : ""}`}
              onClick={() => setMode("create")}
              type="button"
            >
              Create account
            </button>
          </>
        )}
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-email-field">
          <span>Email address</span>
          <div className="auth-email-control">
            <Mail aria-hidden="true" size={15} strokeWidth={2.1} />
            <Input
              aria-label="Email address"
              className="auth-email-input"
              onChange={(event) => setEmail(event.target.value)}
              placeholder={getEmailPlaceholder(emailMode)}
              type="email"
              value={email}
              variant="secondary"
            />
          </div>
        </label>
        <Button
          className="auth-submit-button"
          isDisabled={isSubmitting}
          size="sm"
          type="submit"
          variant="secondary"
        >
          {isSubmitting ? "Sending" : getSubmitLabel(emailMode)}
        </Button>
      </form>

      {!user ? (
        <Button
          className="auth-guest-button"
          isDisabled={isSubmitting}
          onPress={handleAnonymousStart}
          size="sm"
          variant="ghost"
        >
          <UserRound aria-hidden="true" size={14} strokeWidth={2.1} />
          Continue as guest
        </Button>
      ) : null}

      {message || error ? (
        <span className={`auth-message${error ? " error" : ""}`}>
          {error || message}
        </span>
      ) : null}
    </div>
  );
}

function getEmailMode(mode: EmailAuthMode, isAnonymous: boolean): EmailAuthMode {
  if (isAnonymous) {
    return mode === "connect-existing" ? "connect-existing" : "connect-new";
  }

  return mode === "create" ? "create" : "sign-in";
}

function getEmailPlaceholder(mode: EmailAuthMode) {
  switch (mode) {
    case "create":
    case "connect-new":
      return "Email for new account";
    case "connect-existing":
      return "Existing account email";
    default:
      return "Email for sign in";
  }
}

function getSubmitLabel(mode: EmailAuthMode) {
  switch (mode) {
    case "create":
      return "Create";
    case "connect-new":
      return "Save";
    case "connect-existing":
      return "Sign in";
    default:
      return "Sign in";
  }
}

function getSuccessMessage(mode: EmailAuthMode) {
  switch (mode) {
    case "connect-new":
      return "Check your email to finish saving this account.";
    case "connect-existing":
      return "Check your email to sign in and sync guest progress.";
    case "create":
      return "Check your email to finish creating your account.";
    default:
      return "Check your email for the sign-in link.";
  }
}
