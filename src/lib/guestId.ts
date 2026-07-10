const GUEST_ID_KEY = "memorium-guest-id";

/**
 * Returns a stable guest UUID for this browser.
 * Created once and persisted in localStorage forever (or until cleared).
 * Used as owner_id for objectives owned by unauthenticated visitors.
 */
export function getGuestId(): string {
  if (typeof window === "undefined") return "ssr-placeholder";
  let id = window.localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = "guest_" + crypto.randomUUID();
    window.localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}
