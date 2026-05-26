const FALLBACK_ERROR_MESSAGE =
  "Something went wrong while talking to sync. Please try again in a moment."

export function getSupabaseErrorMessage(error: unknown) {
  const rawMessage = getRawErrorMessage(error)
  if (!rawMessage) return FALLBACK_ERROR_MESSAGE

  const message = rawMessage.toLowerCase()

  if (message.includes("failed to fetch") || message.includes("networkerror")) {
    return "We couldn't reach the sync service. Check your internet connection, then try again."
  }

  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "Too many sign-in attempts were made recently. Wait a bit before trying again, or use local dev auth while testing."
  }

  if (message.includes("invalid login") || message.includes("invalid credentials")) {
    return "The sign-in details did not match an account. Check the email address and try again."
  }

  if (message.includes("email rate limit") || message.includes("for security purposes")) {
    return "Supabase is limiting sign-in emails for now. Please wait before requesting another link."
  }

  if (message.includes("jwt") || message.includes("token")) {
    return "Your saved session could not be refreshed. Sign in again to reconnect sync."
  }

  if (message.includes("permission denied") || message.includes("row-level security")) {
    return "Sync is connected, but this account does not have permission to update that checklist."
  }

  return rawMessage
}

function getRawErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim()
  }

  if (isErrorLike(error) && typeof error.message === "string" && error.message.trim()) {
    return error.message.trim()
  }

  return ""
}

function isErrorLike(error: unknown): error is { message: unknown } {
  return Boolean(error && typeof error === "object" && "message" in error)
}
