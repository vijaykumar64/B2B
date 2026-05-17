// Lightweight event bus to notify the app when a session expires,
// without creating a circular dependency between api.ts and authStore.ts.

type Handler = () => void;
let _onSessionExpired: Handler | null = null;

export const onSessionExpired = (handler: Handler) => {
  _onSessionExpired = handler;
};

export const triggerSessionExpired = () => {
  _onSessionExpired?.();
};
