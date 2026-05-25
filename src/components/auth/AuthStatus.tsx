import { useState, type FormEvent } from "react";
import { Button, Input } from "@heroui/react";
import { Cloud, CloudOff, LogOut, Mail } from "lucide-react";
import { useAuth } from "@/auth/auth-context";

export function AuthStatus() {
  const { isConfigured, isLoading, user, signInWithEmail, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) return;

    setIsSubmitting(true);
    setMessage("");
    setError("");

    void signInWithEmail(trimmedEmail)
      .then(() => {
        setMessage("Check your email for the sign-in link.");
        setEmail("");
      })
      .catch((signInError: unknown) => {
        setError(signInError instanceof Error ? signInError.message : "Could not send sign-in link.");
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

  if (user) {
    return (
      <div className="auth-status auth-status-signed-in">
        <Cloud aria-hidden="true" size={15} strokeWidth={2.1} />
        <span title={user.email ?? undefined}>{user.email ?? "Signed in"}</span>
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
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <Mail aria-hidden="true" size={15} strokeWidth={2.1} />
      <Input
        aria-label="Email address"
        className="auth-email-input"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email for sync"
        type="email"
        value={email}
        variant="secondary"
      />
      <Button
        className="auth-submit-button"
        isDisabled={isSubmitting}
        size="sm"
        type="submit"
        variant="secondary"
      >
        {isSubmitting ? "Sending" : "Send link"}
      </Button>
      {message || error ? (
        <span className={`auth-message${error ? " error" : ""}`}>
          {error || message}
        </span>
      ) : null}
    </form>
  );
}
