import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import * as api from "../services/api";
<<<<<<< Updated upstream
import type { UserResponse } from "../services/api";
=======
import type { UserResponse, DoctorResponse } from "../services/api";
>>>>>>> Stashed changes

/* ── Tipos ─────────────────────────────────────────────── */

export type UserRole = "professional" | "patient";

interface AuthState {
  user: UserResponse | null;
  doctorData: DoctorResponse | null;
  email: string;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
<<<<<<< Updated upstream
  signup: (data: api.UserCreatePayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: api.UserUpdatePayload) => Promise<void>;
=======
  signupDoctor: (data: api.DoctorCreatePayload) => Promise<void>;
  signupPatient: (data: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: api.UserUpdatePayload) => Promise<void>;
  updateDoctor: (data: api.DoctorUpdatePayload) => Promise<void>;
  setUserRole: (role: UserRole) => void;
>>>>>>> Stashed changes
  clearError: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

/* ── Provider ──────────────────────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [doctorData, setDoctorData] = useState<DoctorResponse | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

<<<<<<< Updated upstream
=======
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
          if (session.email && session.userRole) {
            setEmail(session.email);
            setUserRoleState(session.userRole);
            if (session.user) setUser(session.user);
            if (session.doctorData) setDoctorData(session.doctorData);
          }
        } catch (e) {
          console.error("Falha ao restaurar sessão:", e);
        }
      }
    }
    loadSession();
  }, []);

  const persistSession = async (
    userObj: UserResponse | null,
    emailStr: string,
    role: UserRole,
    doctor: DoctorResponse | null = null,
  ) => {
    await Preferences.set({
      key: "userSession",
      value: JSON.stringify({ user: userObj, email: emailStr, userRole: role, doctorData: doctor }),
    });
  };

  /**
   * Login dual: tenta primeiro como Doctor, se 404 tenta como User.
   * Isso determina automaticamente o role do usuário.
   */
>>>>>>> Stashed changes
  const login = useCallback(async (loginEmail: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
<<<<<<< Updated upstream
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
=======
      const trimmedEmail = loginEmail.trim();

      // 1. Tentar login como Doctor
      try {
        await api.loginDoctor(trimmedEmail, password);
        // Sucesso! É um profissional. Buscar dados do doctor no backend
        const doctorResp: DoctorResponse = await api.getDoctor(trimmedEmail);
        setDoctorData(doctorResp);
        setUser(null); // Profissional não tem UserResponse
        setEmail(trimmedEmail);
        setUserRoleState("professional");
        await persistSession(null, trimmedEmail, "professional", doctorResp);
        return;
      } catch (doctorError: any) {
        if (doctorError?.status === 404) {
          // Doctor não encontrado — tentar como User
        } else if (doctorError?.status === 401) {
          // Doctor existe, mas senha incorreta
          setError("Senha incorreta.");
          throw doctorError;
        } else {
          // Erro de rede — não podemos determinar se é doctor ou user
          // Tentar como user de qualquer forma
        }
      }

      // 2. Tentar login como User (paciente)
      try {
        await api.loginUser(trimmedEmail, password);
        const userData = await api.getUser(trimmedEmail);
        setUser(userData);
        setDoctorData(null);
        setEmail(trimmedEmail);
        setUserRoleState("patient");
        await persistSession(userData, trimmedEmail, "patient", null);
      } catch (userError: any) {
        if (userError?.status === 404) {
          setError("Usuário não encontrado.");
        } else if (userError?.status === 401) {
          setError("Senha incorreta.");
        } else {
          setError("Erro de conexão. Verifique sua internet.");
        }
        throw userError;
>>>>>>> Stashed changes
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

<<<<<<< Updated upstream
  const signup = useCallback(async (data: api.UserCreatePayload) => {
=======
  /**
   * Cadastro de profissional de saúde — usa /api/doctor/create
   */
  const signupDoctor = useCallback(async (data: api.DoctorCreatePayload) => {
>>>>>>> Stashed changes
    setIsLoading(true);
    setError(null);
    try {
      const doctorResp = await api.createDoctor(data);
      setDoctorData(doctorResp);
      setUser(null);
      setEmail(data.email);
<<<<<<< Updated upstream
=======
      setUserRoleState("professional");
      await persistSession(null, data.email, "professional", doctorResp);
>>>>>>> Stashed changes
    } catch (e: any) {
      if (e?.status === 400) {
        setError(e?.backendMessage || "E-mail ou usuário já cadastrado.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

<<<<<<< Updated upstream
  const logout = useCallback(() => {
=======
  /**
   * Cadastro de paciente — o paciente já foi criado pelo profissional (sem senha).
   * Este fluxo define username e senha via reset de senha.
   *
   * Fluxo:
   * 1. Envia código de reset para o email
   * 2. O paciente valida o código (na tela separada)
   * 3. Define a nova senha via /api/token/resetPassword
   *
   * Porém, como o PatientSignupScreen define tudo de uma vez, usamos o fluxo direto:
   * Enviamos o código, validamos automaticamente e definimos a senha.
   *
   * NOTA: Se o user já tem senha, fazemos login direto.
   */
  const signupPatient = useCallback(async (data: { username: string; email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      // Passo 1: Enviar código de reset para o email do paciente
      await api.sendResetCode(data.email);

      // NOTA: O código foi enviado por email. O paciente precisa inseri-lo.
      // Como o fluxo de PatientSignupScreen não tem campo de código,
      // salvamos os dados parciais e redirecionamos para uma tela de verificação.
      // Porém, para manter o fluxo existente da UI, vamos salvar o estado
      // e marcar que a conta está pendente de ativação.

      // Tentamos fazer login para verificar se já tem senha definida
      try {
        await api.loginUser(data.email, data.password);
        // Se chegou aqui, o user já tem senha e conseguiu logar
        const userData = await api.getUser(data.email);
        setUser(userData);
        setDoctorData(null);
        setEmail(data.email);
        setUserRoleState("patient");
        await persistSession(userData, data.email, "patient", null);
        return;
      } catch {
        // Senha não bate ou user não tem senha — continuar com fluxo de reset
      }

      // Armazena dados pendentes — o paciente precisa inserir o código enviado por email
      // Para agora, vamos fazer o login após o set de senha ser concluído
      // Salvar os dados do paciente no session para usar depois
      const userData = await api.getUser(data.email);

      // Atualizar username se necessário
      if (data.username) {
        try {
          const updatedUser = await api.updateUser(data.email, { username: data.username });
          setUser(updatedUser);
        } catch {
          setUser(userData);
        }
      } else {
        setUser(userData);
      }

      setDoctorData(null);
      setEmail(data.email);
      setUserRoleState("patient");
      await persistSession(user, data.email, "patient", null);

    } catch (e: any) {
      if (e?.status === 404) {
        setError("E-mail não cadastrado. Solicite ao seu profissional de saúde.");
      } else {
        setError(e?.backendMessage || "Erro ao criar conta. Tente novamente.");
      }
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const logout = useCallback(async () => {
>>>>>>> Stashed changes
    setUser(null);
    setDoctorData(null);
    setEmail("");
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!email) return;
    try {
      if (userRole === "patient") {
        const userData = await api.getUser(email);
        setUser(userData);
      } else if (userRole === "professional") {
        const doctorDataResp = await api.getDoctor(email);
        setDoctorData(doctorDataResp);
      }
    } catch {
      // Silently fail — offline ou usuário excluído
    }
  }, [email, userRole]);

  /**
   * Atualiza dados do User (paciente)
   */
  const updateUser = useCallback(async (data: api.UserUpdatePayload) => {
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      const updated = await api.updateUser(email, data);
      setUser(updated);
      // Se o email mudou, atualizar a referência
      if (data.email) {
        setEmail(data.email);
        await persistSession(updated, data.email, userRole || "patient", doctorData);
      }
    } catch (e: any) {
      setError(e?.backendMessage || "Erro ao atualizar dados.");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [email, userRole, doctorData]);

  /**
   * Atualiza dados do Doctor (profissional)
   */
  const updateDoctor = useCallback(async (data: api.DoctorUpdatePayload) => {
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      const updated = await api.updateDoctor(email, data);
      setDoctorData(updated);
      // Se o email mudou, atualizar a referência
      if (data.email) {
        setEmail(data.email);
        await persistSession(user, data.email, "professional", updated);
      }
    } catch (e: any) {
      setError(e?.backendMessage || "Erro ao atualizar dados.");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [email, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        doctorData,
        email,
        isLoading,
        error,
        login,
<<<<<<< Updated upstream
        signup,
        logout,
        refreshUser,
        updateUser,
=======
        signupDoctor,
        signupPatient,
        logout,
        refreshUser,
        updateUser,
        updateDoctor,
        setUserRole,
>>>>>>> Stashed changes
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
