import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import * as api from "../services/api";
import type { UserResponse } from "../services/api";

/* ── Tipos ─────────────────────────────────────────────── */

interface AuthState {
  user: UserResponse | null;
  email: string;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: api.UserCreatePayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: api.UserUpdatePayload) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

/* ── Provider ──────────────────────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (loginEmail: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.login(loginEmail, password);
      // Login bem-sucedido — buscar dados completos do usuário
      const userData = await api.getUser(loginEmail);
      setUser(userData);
      setEmail(loginEmail);
    } catch (e: any) {
      if (e?.status === 404) {
        setError("Usuário não encontrado.");
      } else if (e?.status === 401) {
        setError("Senha incorreta.");
      } else {
        setError("Erro de conexão. Verifique sua internet.");
      }
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: api.UserCreatePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await api.createUser(data);
      setUser(userData);
      setEmail(data.email);
    } catch (e: any) {
      if (e?.status === 409 || e?.status === 400) {
        setError("E-mail ou usuário já cadastrado.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setEmail("");
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!email) return;
    try {
      const userData = await api.getUser(email);
      setUser(userData);
    } catch {
      // Silently fail — offline ou usuário excluído
    }
  }, [email]);

  const updateUser = useCallback(async (data: api.UserUpdatePayload) => {
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      const updated = await api.updateUser(email, data);
      setUser(updated);
      // Se o email mudou, atualizar a referência
      if (data.email) setEmail(data.email);
    } catch (e: any) {
      setError("Erro ao atualizar dados.");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  return (
    <AuthContext.Provider
      value={{
        user,
        email,
        isLoading,
        error,
        login,
        signup,
        logout,
        refreshUser,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ── Hook ──────────────────────────────────────────────── */

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
