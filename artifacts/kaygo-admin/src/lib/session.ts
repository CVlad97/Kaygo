export const AUTH_TOKEN_KEY = "kaygo_auth_token";
export const AUTH_USER_KEY = "kaygo_auth_user";

export type StoredAuthUser = {
  id: number;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
};

export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthSession(token: string, user: StoredAuthUser) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredAuthUser(): StoredAuthUser | null {
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    return null;
  }
}
