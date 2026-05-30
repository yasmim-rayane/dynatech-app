/**
 * mockData.ts — Dados mockados para simular operações de back-end.
 *
 * RESTRIÇÃO: Nenhuma rota de back-end é criada. Todos os dados são
 * hardcoded e manipulados no estado da aplicação front-end.
 */

import type { ResultResponse } from "./api";

// ────────────────────────── Tipos ───────────────────────────────────

export type UserRole = "professional" | "patient";

export interface MockUser {
  email: string;
  username: string;
  name: string;
  role: UserRole;
  password: string;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  dataNascimento: string; // "YYYY-MM-DD"
  genero: string;         // "m" | "f" | "ou" | "pn"
  maoDominante: string;   // "d" | "e" | "a"
  peso: number;
  altura: number;
  createdAt: string;
}

// ────────────────── E-mails pré-cadastrados por profissionais ──────────

/**
 * Simula e-mails de pacientes já registrados no sistema por um profissional.
 * Esses e-mails permitem que o paciente crie sua conta.
 */
export const REGISTERED_PATIENT_EMAILS: string[] = [
  "maria.silva@email.com",
  "joao.santos@email.com",
  "ana.oliveira@email.com",
  "carlos.pereira@email.com",
  "lucia.ferreira@email.com",
];

// ────────────────── Mock de usuários cadastrados (para login) ──────────

export const MOCK_USERS: MockUser[] = [
  {
    email: "dr.joao@clinica.com",
    username: "drjoao",
    name: "Dr. João Mendes",
    role: "professional",
    password: "Teste@123",
  },
  {
    email: "dra.ana@hospital.com",
    username: "draana",
    name: "Dra. Ana Costa",
    role: "professional",
    password: "Teste@123",
  },
  {
    email: "maria.silva@email.com",
    username: "mariasilva",
    name: "Maria Silva",
    role: "patient",
    password: "Teste@123",
  },
  {
    email: "joao.santos@email.com",
    username: "joaosantos",
    name: "João Santos",
    role: "patient",
    password: "Teste@123",
  },
];

// ────────────────── Pacientes vinculados a profissionais ───────────────

export const MOCK_PATIENTS: Patient[] = [
  {
    id: "p1",
    name: "Maria Silva",
    email: "maria.silva@email.com",
    dataNascimento: "1958-03-15",
    genero: "f",
    maoDominante: "d",
    peso: 68.5,
    altura: 162,
    createdAt: "2026-04-10",
  },
  {
    id: "p2",
    name: "João Santos",
    email: "joao.santos@email.com",
    dataNascimento: "1950-07-22",
    genero: "m",
    maoDominante: "d",
    peso: 82.0,
    altura: 175,
    createdAt: "2026-04-15",
  },
  {
    id: "p3",
    name: "Ana Oliveira",
    email: "ana.oliveira@email.com",
    dataNascimento: "1965-11-08",
    genero: "f",
    maoDominante: "e",
    peso: 72.3,
    altura: 158,
    createdAt: "2026-05-01",
  },
  {
    id: "p4",
    name: "Carlos Pereira",
    email: "",
    dataNascimento: "1948-01-30",
    genero: "m",
    maoDominante: "d",
    peso: 78.0,
    altura: 170,
    createdAt: "2026-05-10",
  },
  {
    id: "p5",
    name: "Lúcia Ferreira",
    email: "lucia.ferreira@email.com",
    dataNascimento: "1972-09-12",
    genero: "f",
    maoDominante: "d",
    peso: 65.0,
    altura: 155,
    createdAt: "2026-05-20",
  },
];

// ────────────────── Resultados mockados do paciente ────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const MOCK_PATIENT_RESULTS: ResultResponse[] = [
  {
    id: 1,
    palmMaxD: 22.4,
    palmMaxE: 19.8,
    pinchMaxD1: 5.2,
    pinchMaxD2: 4.8,
    pinchMaxD3: 3.9,
    pinchMaxD4: 3.1,
    pinchMaxE1: 4.9,
    pinchMaxE2: 4.5,
    pinchMaxE3: 3.6,
    pinchMaxE4: 2.8,
    examDate: daysAgo(2),
  },
  {
    id: 2,
    palmMaxD: 21.1,
    palmMaxE: 18.5,
    pinchMaxD1: 5.0,
    pinchMaxD2: 4.6,
    pinchMaxD3: 3.7,
    pinchMaxD4: 2.9,
    pinchMaxE1: 4.7,
    pinchMaxE2: 4.3,
    pinchMaxE3: 3.4,
    pinchMaxE4: 2.6,
    examDate: daysAgo(7),
  },
  {
    id: 3,
    palmMaxD: 20.3,
    palmMaxE: 17.9,
    pinchMaxD1: 4.8,
    pinchMaxD2: 4.4,
    pinchMaxD3: 3.5,
    pinchMaxD4: 2.7,
    pinchMaxE1: 4.5,
    pinchMaxE2: 4.1,
    pinchMaxE3: 3.2,
    pinchMaxE4: 2.4,
    examDate: daysAgo(14),
  },
  {
    id: 4,
    palmMaxD: 19.0,
    palmMaxE: 16.8,
    pinchMaxD1: 4.5,
    pinchMaxD2: 4.1,
    pinchMaxD3: 3.2,
    pinchMaxD4: 2.5,
    pinchMaxE1: 4.2,
    pinchMaxE2: 3.8,
    pinchMaxE3: 2.9,
    pinchMaxE4: 2.2,
    examDate: daysAgo(21),
  },
  {
    id: 5,
    palmMaxD: 18.2,
    palmMaxE: 15.5,
    pinchMaxD1: 4.2,
    pinchMaxD2: 3.8,
    pinchMaxD3: 3.0,
    pinchMaxD4: 2.3,
    pinchMaxE1: 3.9,
    pinchMaxE2: 3.5,
    pinchMaxE3: 2.7,
    pinchMaxE4: 2.0,
    examDate: daysAgo(30),
  },
];

// ────────────────── Funções assíncronas mockadas ──────────────────────

/**
 * Simula verificação no "banco de dados" se o e-mail do paciente
 * foi pré-cadastrado por um profissional.
 * Retorna após delay simulado de 800ms.
 */
export async function checkPatientEmail(
  email: string,
): Promise<{ exists: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const normalizedEmail = email.trim().toLowerCase();
  const exists = REGISTERED_PATIENT_EMAILS.some(
    (e) => e.toLowerCase() === normalizedEmail,
  );
  return { exists };
}

/**
 * Simula login e retorna o role do usuário.
 * Retorna null se o usuário não for encontrado ou a senha estiver errada.
 */
export async function mockLogin(
  email: string,
  password: string,
): Promise<{ user: MockUser } | null> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const normalizedEmail = email.trim().toLowerCase();
  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === normalizedEmail,
  );
  if (!user) return null;
  if (user.password !== password) return null;
  return { user };
}

/**
 * Simula obtenção de resultados do paciente.
 */
export async function getPatientResults(): Promise<ResultResponse[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return [...MOCK_PATIENT_RESULTS];
}

/**
 * Gera um ID único simples para novos pacientes.
 */
export function generateId(): string {
  return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
