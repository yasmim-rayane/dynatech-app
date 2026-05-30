import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { Preferences } from "@capacitor/preferences";
import * as api from "../services/api";
import type { UserResponse } from "../services/api";
import { MOCK_USERS, type UserRole } from "../services/mockData";

/* ── Tipos ─────────────────────────────────────────────── */

interface AuthState {
  user: UserResponse | null;
  email: string;
  userRole: UserRole | null;
  isProfessional: boolean;
  isPatient: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: api.UserCreatePayload, role: UserRole) => Promise<void>;
  signupPatient: (data: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: api.UserUpdatePayload) => Promise<void>;
  setUserRole: (role: UserRole) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

/* ── Provider ──────────────────────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [email, setEmail] = useState("");
  const [userRole, setUserRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const setUserRole = useCallback((role: UserRole) => {
    setUserRoleState(role);
  }, []);

  // Restaurar sessão ao abrir o app
  useEffect(() => {
    async function loadSession() {
      const { value } = await Preferences.get({ key: "userSession" });
      if (value) {
        try {
          const session = JSON.parse(value);
          if (session.user && session.email && session.userRole) {
            setUser(session.user);
            setEmail(session.email);
            setUserRoleState(session.userRole);
          }
        } catch (e) {
          console.error("Falha ao restaurar sessão:", e);
        }
      }
    }
    loadSession();
  }, []);

  const persistSession = async (userObj: UserResponse, emailStr: string, role: UserRole) => {
    await Preferences.set({
      key: "userSession",
      value: JSON.stringify({ user: userObj, email: emailStr, userRole: role }),
    });
  };

  const login = useCallback(async (loginEmail: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Primeiro tenta no mock local para detectar o role
      const normalizedEmail = loginEmail.trim().toLowerCase();
      const mockUser = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === normalizedEmail,
      );

      if (mockUser) {
        // Login mockado — simula delay
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (mockUser.password !== password) {
          setError("Senha incorreta.");
          throw { status: 401 };
        }
        // Cria um UserResponse mockado
        const mockUserResponse: UserResponse = {
          id: Math.floor(Math.random() * 1000),
          name: mockUser.name,
          username: mockUser.username,
          dataNascimento: "1985-06-15",
          email: mockUser.email,
          peso: 70,
          genero: "m",
          altura: 170,
          maoDominante: "d",
          inativo: null,
          dataExclusao: null,
        };
        setUser(mockUserResponse);
        setEmail(loginEmail);
        setUserRoleState(mockUser.role);
        await persistSession(mockUserResponse, loginEmail, mockUser.role);
      } else {
        // Tenta login real no backend
        try {
          await api.login(loginEmail, password);
          const userData = await api.getUser(loginEmail);
          setUser(userData);
          setEmail(loginEmail);
          // Sem mock, assume profissional (backend real)
          setUserRoleState("professional");
          await persistSession(userData, loginEmail, "professional");
        } catch (e: any) {
          if (e?.status === 404) {
            setError("Usuário não encontrado.");
          } else if (e?.status === 401) {
            setError("Senha incorreta.");
          } else {
            setError("Erro de conexão. Verifique sua internet.");
          }
          throw e;
        }
      }
    } catch (e: any) {
      if (!error) {
        // Error already set above for mock users
      }
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  const signup = useCallback(async (data: api.UserCreatePayload, role: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await api.createUser(data);
      setUser(userData);
      setEmail(data.email);
      setUserRoleState(role);
      await persistSession(userData, data.email, role);
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

  const signupPatient = useCallback(async (data: { username: string; email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simula criação de conta do paciente (mock)
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockUserResponse: UserResponse = {
        id: Math.floor(Math.random() * 1000),
        name: data.username,
        username: data.username,
        dataNascimento: "1960-01-01",
        email: data.email,
        peso: 70,
        genero: "m",
        altura: 170,
        maoDominante: "d",
        inativo: null,
        dataExclusao: null,
      };
      setUser(mockUserResponse);
      setEmail(data.email);
      setUserRoleState("patient");
      await persistSession(mockUserResponse, data.email, "patient");

      // Adiciona ao mock de usuários
      MOCK_USERS.push({
        email: data.email,
        username: data.username,
        name: data.username,
        role: "patient",
        password: data.password,
      });
    } catch (e: any) {
      setError("Erro ao criar conta. Tente novamente.");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setEmail("");
    setError(null);
    setUserRoleState(null);
    await Preferences.remove({ key: "userSession" });
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

  const isProfessional = userRole === "professional";
  const isPatient = userRole === "patient";

  return (
    <AuthContext.Provider
      value={{
        user,
        email,
        userRole,
        isProfessional,
        isPatient,
        isLoading,
        error,
        login,
        signup,
        signupPatient,
        logout,
        refreshUser,
        updateUser,
        setUserRole,
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
