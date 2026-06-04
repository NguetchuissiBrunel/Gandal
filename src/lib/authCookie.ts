export const AUTH_COOKIE_NAME = 'gandal_token';

const MAX_AGE_SEC = 60 * 60 * 24 * 7;

/** Sync JWT to cookie so Next.js middleware can read the session. */
export function syncAuthCookie(token: string | null) {
  if (typeof document === 'undefined') return;
  if (token) {
    document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`;
  } else {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}
