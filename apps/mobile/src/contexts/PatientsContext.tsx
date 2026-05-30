import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  MOCK_PATIENTS,
  REGISTERED_PATIENT_EMAILS,
  generateId,
  type Patient,
} from "../services/mockData";

/* ── Tipos ─────────────────────────────────────────────── */

interface PatientsState {
  patients: Patient[];
  addPatient: (data: Omit<Patient, "id" | "createdAt">) => void;
  updatePatient: (id: string, data: Partial<Omit<Patient, "id" | "createdAt">>) => void;
  removePatient: (id: string) => void;
  getPatientByEmail: (email: string) => Patient | undefined;
  getPatientById: (id: string) => Patient | undefined;
  activePatientId: string | null;
  setActivePatientId: (id: string | null) => void;
}

const PatientsContext = createContext<PatientsState | null>(null);

/* ── Provider ──────────────────────────────────────────── */

export function PatientsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([...MOCK_PATIENTS]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);

  const addPatient = useCallback((data: Omit<Patient, "id" | "createdAt">) => {
    const newPatient: Patient = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setPatients((prev) => [newPatient, ...prev]);

    // Se o paciente tem e-mail, adiciona à lista de e-mails registrados
    // para que ele possa criar conta
    if (data.email && data.email.trim()) {
      const normalizedEmail = data.email.trim().toLowerCase();
      if (!REGISTERED_PATIENT_EMAILS.some((e) => e.toLowerCase() === normalizedEmail)) {
        REGISTERED_PATIENT_EMAILS.push(data.email.trim());
      }
    }
  }, []);

  const updatePatient = useCallback(
    (id: string, data: Partial<Omit<Patient, "id" | "createdAt">>) => {
      setPatients((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
      );

      // Se atualizou o e-mail, garante que está na lista de registrados
      if (data.email && data.email.trim()) {
        const normalizedEmail = data.email.trim().toLowerCase();
        if (!REGISTERED_PATIENT_EMAILS.some((e) => e.toLowerCase() === normalizedEmail)) {
          REGISTERED_PATIENT_EMAILS.push(data.email.trim());
        }
      }
    },
    [],
  );

  const removePatient = useCallback((id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getPatientByEmail = useCallback(
    (email: string) => {
      const normalized = email.trim().toLowerCase();
      return patients.find((p) => p.email?.toLowerCase() === normalized);
    },
    [patients],
  );

  const getPatientById = useCallback(
    (id: string) => patients.find((p) => p.id === id),
    [patients],
  );

  return (
    <PatientsContext.Provider
      value={{
        patients,
        addPatient,
        updatePatient,
        removePatient,
        getPatientByEmail,
        getPatientById,
        activePatientId,
        setActivePatientId,
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
