const SESSION_KEY = "vora_auth_session";

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

export function saveAuthSession({ token, user }) {
  if (!token || !user) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }));
}

export function loadAuthSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.token || !data?.user) {
      clearAuthSession();
      return null;
    }
    if (isTokenExpired(data.token)) {
      clearAuthSession();
      return null;
    }
    return data;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(SESSION_KEY);
}
