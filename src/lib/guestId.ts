const GUEST_ID_KEY = "memorium-guest-id";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Returns a stable guest UUID for this browser.
 * Created once and persisted in localStorage forever (or until cleared).
 * Used as owner_id for objectives owned by unauthenticated visitors.
 * Always returns a valid UUID (no prefixes) compatible with PostgreSQL/Supabase.
 */
export function getGuestId(): string {
  if (typeof window === "undefined") return crypto.randomUUID();

  const stored = window.localStorage.getItem(GUEST_ID_KEY);

  if (stored && isValidUuid(stored)) {
    return stored;
  }

  const id = crypto.randomUUID();
  window.localStorage.setItem(GUEST_ID_KEY, id);
  return id;
}
