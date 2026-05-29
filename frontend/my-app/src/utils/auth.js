export const AUTH_TOKEN_KEY = "token";
export const AUTH_USER_KEY = "user";
export const GOOGLE_USER_KEY = "googleUser";
export const AUTH_EVENT = "taxpal-auth-change";

const emitAuthChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
};

export const getStoredJson = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

export const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const getNormalUser = () => {
  const stored = getStoredJson(AUTH_USER_KEY);
  return stored?.user || stored;
};

export const getGoogleUser = () => getStoredJson(GOOGLE_USER_KEY);

export const getCurrentUser = () => getGoogleUser() || getNormalUser();

export const isAuthenticated = () => Boolean(getToken());

export const getAuthHeaders = () => {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export const savePasswordSession = ({ token, user }) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.removeItem(GOOGLE_USER_KEY);
  localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify({
      token,
      user,
      provider: "password",
    })
  );
  emitAuthChange();
};

export const saveGoogleSession = async (firebaseUser, backendSession = {}) => {
  const appToken = backendSession.token;

  if (!appToken) {
    throw new Error("Application token not received from server");
  }

  const backendUser = backendSession.user || {};
  const user = {
    ...backendUser,
    id: backendUser.id,
    uid: firebaseUser.uid,
    name: backendUser.name || firebaseUser.displayName || "Google User",
    displayName: backendUser.displayName || backendUser.name || firebaseUser.displayName || "Google User",
    email: backendUser.email || firebaseUser.email,
    photoURL: backendUser.photoURL || backendUser.profileImage || firebaseUser.photoURL,
    profileImage: backendUser.profileImage || backendUser.photoURL || firebaseUser.photoURL,
    provider: "google",
  };

  localStorage.setItem(AUTH_TOKEN_KEY, appToken);
  localStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(user));
  localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify({
      token: appToken,
      user,
      provider: "google",
    })
  );
  emitAuthChange();

  return user;
};

export const updateStoredUser = (updates = {}) => {
  const stored = getStoredJson(AUTH_USER_KEY) || {};
  const currentUser = stored.user || stored || {};
  const nextUser = {
    ...currentUser,
    ...updates,
  };

  localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify({
      ...stored,
      user: nextUser,
    })
  );

  if (getGoogleUser()) {
    localStorage.setItem(
      GOOGLE_USER_KEY,
      JSON.stringify({
        ...getGoogleUser(),
        ...updates,
      })
    );
  }

  emitAuthChange();
  return nextUser;
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(GOOGLE_USER_KEY);
  emitAuthChange();
};
