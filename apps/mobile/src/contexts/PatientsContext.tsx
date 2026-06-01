import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import * as api from "../services/api";
import type { UserResponse } from "../services/api";
import { useAuth } from "./AuthContext";

/* ── Tipos ─────────────────────────────────────────────── */

/**
 * Patient é um alias para UserResponse do backend.
 * Mantemos o tipo para compatibilidade com as telas existentes.
 */
export interface Patient {
  id: string;         // Convertido de number (backend) para string (frontend)
  name: string;
  email?: string;
  dataNascimento: string; // "YYYY-MM-DD"
  genero: string;         // "m" | "f" | "ou" | "pn"
  maoDominante: string;   // "d" | "e" | "a"
  peso: number;
  altura: number;
  createdAt: string;
  inativo?: boolean;
}

interface PatientsState {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  addPatient: (data: Omit<Patient, "id" | "createdAt">) => Promise<void>;
  updatePatient: (id: string, data: Partial<Omit<Patient, "id" | "createdAt">>) => Promise<void>;
  removePatient: (id: string) => Promise<void>;
  getPatientByEmail: (email: string) => Patient | undefined;
  getPatientById: (id: string) => Patient | undefined;
  activePatientId: string | null;
  setActivePatientId: (id: string | null) => void;
  loadPatients: () => Promise<void>;
  togglePatientStatus: (email: string) => Promise<void>;
}

const PatientsContext = createContext<PatientsState | null>(null);

/* ── Helpers ───────────────────────────────────────────── */

/** Converte UserResponse do backend para o tipo Patient do frontend */
function userResponseToPatient(u: UserResponse): Patient {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    dataNascimento: u.dataNascimento,
    genero: u.genero,
    maoDominante: u.maoDominante,
    peso: u.peso,
    altura: u.altura,
    createdAt: new Date().toISOString().slice(0, 10),
    inativo: u.statusVinculo === "n",
  };
}

/* ── Provider ──────────────────────────────────────────── */

export function PatientsProvider({ children }: { children: ReactNode }) {
  const { email: doctorEmail, isProfessional } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega pacientes vinculados ao médico logado via GET /api/doctor/users
   */
  const loadPatients = useCallback(async () => {
    if (!doctorEmail || !isProfessional) return;
    setIsLoading(true);
    setError(null);
    try {
      const users = await api.getUsersByDoctor(doctorEmail);
      setPatients(users.map(userResponseToPatient));
    } catch (e: any) {
      console.error("Erro ao carregar pacientes:", e);
      setError(e?.backendMessage || "Erro ao carregar pacientes.");
    } finally {
      setIsLoading(false);
    }
  }, [doctorEmail, isProfessional]);

  // Carregar pacientes automaticamente quando o médico loga
  useEffect(() => {
    if (doctorEmail && isProfessional) {
      loadPatients();
    } else {
      setPatients([]);
    }
  }, [doctorEmail, isProfessional, loadPatients]);

  /**
   * Adiciona paciente:
   * 1. Cria user no backend via POST /api/user/create
   * 2. Vincula ao médico via POST /api/doctor/addUser
   */
  const addPatient = useCallback(async (data: Omit<Patient, "id" | "createdAt">) => {
    if (!doctorEmail) return;
    setIsLoading(true);
    setError(null);
    try {
      // Gera username a partir do email ou nome
      const userName = data.email
        ? data.email.split("@")[0].slice(0, 15)
        : data.name.replace(/\s+/g, "").toLowerCase().slice(0, 15);

      // 1. Criar user no backend
      const newUser = await api.createUser({
        name: data.name,
        userName: userName,
        dataNascimento: data.dataNascimento,
        email: data.email || `${userName}@dynatech.temp`,
        password: undefined, // Paciente define senha depois
        peso: data.peso,
        genero: data.genero,
        altura: data.altura,
        maoDominante: data.maoDominante,
      });

      // 2. Vincular ao médico
      await api.addUserToDoctor(doctorEmail, newUser.email);

      // 3. Atualizar lista local
      setPatients((prev) => [userResponseToPatient(newUser), ...prev]);
    } catch (e: any) {
      console.error("Erro ao adicionar paciente:", e);
      setError(e?.backendMessage || "Erro ao adicionar paciente.");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [doctorEmail]);

  /**
   * Atualiza dados do paciente via PATCH /api/user/updateUserInfo
   */
  const updatePatient = useCallback(
    async (id: string, data: Partial<Omit<Patient, "id" | "createdAt">>) => {
      const patient = patients.find((p) => p.id === id);
      if (!patient?.email) return;

      setIsLoading(true);
      setError(null);
      try {
        const updatePayload: api.UserUpdatePayload = {};
        if (data.name !== undefined) updatePayload.name = data.name;
        if (data.email !== undefined) updatePayload.email = data.email;
        if (data.dataNascimento !== undefined) updatePayload.dataNascimento = data.dataNascimento;
        if (data.peso !== undefined) updatePayload.peso = data.peso;
        if (data.genero !== undefined) updatePayload.genero = data.genero;
        if (data.altura !== undefined) updatePayload.altura = data.altura;
        if (data.maoDominante !== undefined) updatePayload.maoDominante = data.maoDominante;

        const updated = await api.updateUser(patient.email, updatePayload);

        setPatients((prev) =>
          prev.map((p) => (p.id === id ? userResponseToPatient(updated) : p)),
        );
      } catch (e: any) {
        console.error("Erro ao atualizar paciente:", e);
        setError(e?.backendMessage || "Erro ao atualizar paciente.");
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [patients],
  );

  /**
   * Desativa o vínculo médico-paciente via PATCH /api/doctor/toggleStatus
   */
  const removePatient = useCallback(async (id: string) => {
    if (!doctorEmail) return;
    const patient = patients.find((p) => p.id === id);
    if (!patient?.email) return;

    setIsLoading(true);
    setError(null);
    try {
      await api.toggleDoctorUserStatus(doctorEmail, patient.email);
      // Remove da lista local
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      console.error("Erro ao remover paciente:", e);
      setError(e?.backendMessage || "Erro ao remover paciente.");
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [doctorEmail, patients]);

  const getPatientByEmail = useCallback(
    (email: string) => {
      const normalized = email.trim().toLowerCase();
      return patients.find((p) => p.email?.toLowerCase() === normalized);
    },
    [patients]
  );

  const getPatientById = useCallback(
    (id: string) => patients.find((p) => p.id === id),
    [patients],
  );

  const togglePatientStatus = useCallback(
    async (email: string) => {
      if (!doctorEmail) return;
      try {
        setIsLoading(true);
        await api.toggleDoctorUserStatus(doctorEmail, email);
        // Atualizar no estado local inativo = !inativo
        setPatients((prev) =>
          prev.map((p) => {
            if (p.email === email) {
              return { ...p, inativo: !p.inativo };
            }
            return p;
          })
        );
      } catch (err: any) {
        setError(err.message || "Erro ao alterar status.");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [doctorEmail]
  );

  return (
    <PatientsContext.Provider
      value={{
        patients,
        isLoading,
        error,
        addPatient,
        updatePatient,
        removePatient,
        getPatientById,
        getPatientByEmail,
        activePatientId,
        setActivePatientId,
        loadPatients,
        togglePatientStatus,
      }}
    >
      {children}
    </PatientsContext.Provider>
  );
}

/* ── Hook ──────────────────────────────────────────────── */

export function usePatients(): PatientsState {
  const ctx = useContext(PatientsContext);
  if (!ctx) throw new Error("usePatients must be used within a PatientsProvider");
  return ctx;
}
