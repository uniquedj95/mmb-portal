export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Get the value of a cookie by its name.
 * @param name - The name of the cookie.
 * @returns The value of the cookie, or `null` if not found.
 */
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

/**
 * Set a cookie with the given name and value.
 * @param name - The name of the cookie.
 * @param value - The value to set.
 * @param options - Optional cookie options.
 */
export function setCookie(name: string, value: string, options?: CookieOptions): void {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options) {
    if (options.expires) {
      if (typeof options.expires === 'number') {
        const expires = new Date();
        expires.setTime(expires.getTime() + options.expires * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${expires.toUTCString()}`;
      } else if (options.expires instanceof Date) {
        cookieString += `; expires=${options.expires.toUTCString()}`;
      }
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += '; secure';
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }
  }

  document.cookie = cookieString;
}

/**
 * Remove a cookie by its name.
 * @param name - The name of the cookie to remove.
 */
export function removeCookie(name: string): void {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Clear all cookies by setting their expiration to the past.
 */
export function clearAllCookies(): void {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [cookieName] = cookie.split('=');
    removeCookie(cookieName);
  }
}
