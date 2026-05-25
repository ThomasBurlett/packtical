import { useState } from "react";
import { Button } from "@heroui/react";
import { Cloud, CloudOff, LogOut } from "lucide-react";
import { useAuth } from "@/auth/auth-context";

export function AuthStatus() {
  const { isConfigured, isLoading, user, signInWithGoogle, signOut } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = () => {
    setIsSubmitting(true);
    setError("");

    void signInWithGoogle()
      .catch((signInError: unknown) => {
        setError(signInError instanceof Error ? signInError.message : "Could not start Google sign-in.");
        setIsSubmitting(false);
      });
  };

  if (!isConfigured) {
    return (
      <div className="auth-status auth-status-local">
        <CloudOff aria-hidden="true" size={15} strokeWidth={2.1} />
        <span>Local saves</span>
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
    <div className="auth-google-wrap">
      <Button
        className="auth-google-button"
        isDisabled={isSubmitting}
        onPress={handleGoogleSignIn}
        size="sm"
        variant="secondary"
      >
        <span className="google-mark" aria-hidden="true">G</span>
        {isSubmitting ? "Opening Google" : "Sign in with Google"}
      </Button>
      {error ? <span className="auth-message error">{error}</span> : null}
    </div>
  );
}
