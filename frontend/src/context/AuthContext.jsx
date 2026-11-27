// Logged-in user ko poore app mein yaad rakhta hai. Koi bhi page useAuth() se user, login, logout le sakta hai.

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { TOKEN_KEY } from "../api/axiosInstance.js";
import { getMeRequest, loginRequest, registerRequest } from "../api/authApi.js";

const AuthContext = createContext(null);

// Token ko browser ki localStorage mein rakhna, padhna aur hatana
function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage na mile to login sirf is page tak chalega
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // koi baat nahi
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // page khulte hi token check ho raha hai

  // Page khulte hi: agar token saved hai, to server se pooch lo ki ye kaun hai
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!readToken()) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await getMeRequest();
        if (!cancelled) setUser(data.user);
      } catch (error) {
        // Token galat ya expire: hata do. Server band ho to token rehne do.
        if (error.response && error.response.status === 401) clearToken();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await loginRequest({ email, password });
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  // Register: pehle account banao, phir usi password se login kar do
  const register = useCallback(
    async (name, email, password) => {
      await registerRequest({ name, email, password });
      return login(email, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}