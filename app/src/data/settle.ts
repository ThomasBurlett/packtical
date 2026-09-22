export async function settleBeforeSignOut(
  pending: Promise<void>,
  logout: () => Promise<void>,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      pending,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(
                "Changes are still waiting to sync. Reconnect before signing out.",
              ),
            ),
          10000,
        );
      }),
    ]);
    await logout();
  } finally {
    clearTimeout(timer);
  }
}
