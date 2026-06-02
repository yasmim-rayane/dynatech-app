/**
 * api.ts — Camada de serviço HTTP para comunicação com o back-end Spring Boot.
 *
 * Em dev o Vite faz proxy de "/api" → "http://localhost:8080".
 * Em produção / Capacitor (Android) deve-se trocar API_BASE_URL pelo endereço real.
 */

// ────────────────────────────── Constantes ──────────────────────────────

import { Capacitor } from "@capacitor/core";

/**
 * Em dev (Vite), o proxy /api redireciona para localhost:8080.
 * Em produção (Capacitor/Android), não há proxy — usa a URL absoluta.
 * Defina VITE_API_URL no .env para apontar para o backend real.
 */
const API_BASE_URL = Capacitor.isNativePlatform()
  ? (import.meta.env.VITE_API_URL ?? "https://powdering-discharge-washhouse.ngrok-free.dev/api") // URL configurada para ngrok
  : "/api";

// ────────────────────────────── Tipos — User ────────────────────────────

/** Resposta do GET /api/user e retornos de criação/atualização */
export interface UserResponse {
  id: number;
  name: string;
  username: string;
  dataNascimento: string;   // "YYYY-MM-DD"
  email: string;
  peso: number;
  genero: string;           // "m" | "f" | "ou" | "pn"
  altura: number;
  maoDominante: string;     // "d" | "e" | "a"
  inativo: string | null;
  statusVinculo?: string;
  dataExclusao: string | null;
}

/** Dados enviados para POST /api/user/create */
export interface UserCreatePayload {
  name: string;
  userName: string;         // campo do DTO é "userName" (camelCase com N maiúsculo)
  dataNascimento: string;   // "YYYY-MM-DD"
  email: string;
  password?: string | null;
  peso: number;
  genero: string;           // "m" | "f" | "ou" | "pn"
  altura: number;
  maoDominante: string;     // "d" | "e" | "a"
}

/** Dados enviados para PATCH /api/user/updateUserInfo */
export interface UserUpdatePayload {
  name?: string;
  username?: string;
  dataNascimento?: string;
  email?: string;
  peso?: number;
  genero?: string;
  altura?: number;
  maoDominante?: string;
}

// ────────────────────────────── Tipos — Doctor ──────────────────────────

/** Resposta do GET/POST/PATCH para Doctor */
export interface DoctorResponse {
  id: number;
  name: string;
  userName: string;
  email: string;
}

/** Dados enviados para POST /api/doctor/create */
export interface DoctorCreatePayload {
  name: string;
  userName: string;
  email: string;
  password: string;
}

/** Dados enviados para PATCH /api/doctor */
export interface DoctorUpdatePayload {
  name?: string;
  userName?: string;
  email?: string;
}

/** Resposta do GET /api/doctor/doctors (médicos de um paciente) */
export interface DoctorHasUserResponse {
  doctorName: string;
  doctorEmail: string;
}

// ────────────────────────────── Tipos — Result ──────────────────────────

/** Resposta do GET /api/result/* */
export interface ResultResponse {
  id: number;
  palmMaxD: number | null;
  palmMaxE: number | null;
  pinchMaxD1: number | null;
  pinchMaxD2: number | null;
  pinchMaxD3: number | null;
  pinchMaxD4: number | null;
  pinchMaxE1: number | null;
  pinchMaxE2: number | null;
  pinchMaxE3: number | null;
  pinchMaxE4: number | null;
  examDate: string;         // ISO datetime
}

/** Dados enviados para POST /api/result/create */
export interface ResultCreatePayload {
  email: string;
  palmMaxD?: number | null;
  palmMaxE?: number | null;
  pinchMaxD1?: number | null;
  pinchMaxD2?: number | null;
  pinchMaxD3?: number | null;
  pinchMaxD4?: number | null;
  pinchMaxE1?: number | null;
  pinchMaxE2?: number | null;
  pinchMaxE3?: number | null;
  pinchMaxE4?: number | null;
}

/** Resposta do GET /api/result/weeklyStats */
export interface WeeklyStatsResponse {
  weekStart: string;
  weekEnd: string;
  count: number;
  avgPalmD: number | null;
  avgPalmE: number | null;
  avgPinchD1: number | null;
  avgPinchD2: number | null;
  avgPinchD3: number | null;
  avgPinchD4: number | null;
  avgPinchE1: number | null;
  avgPinchE2: number | null;
  avgPinchE3: number | null;
  avgPinchE4: number | null;
  maxPalmD: number | null;
  maxPalmE: number | null;
  maxPinchD1: number | null;
  maxPinchD2: number | null;
  maxPinchD3: number | null;
  maxPinchD4: number | null;
  maxPinchE1: number | null;
  maxPinchE2: number | null;
  maxPinchE3: number | null;
  maxPinchE4: number | null;
}

/** Resposta do GET /api/result/monthlyStats */
export interface MonthlyStatsResponse extends Omit<WeeklyStatsResponse, "weekStart" | "weekEnd"> {
  month: number;
  year: number;
}

// ────────────────────────────── Helpers ──────────────────────────────────

export class ApiError extends Error {
  status: number;
  backendMessage: string | null;

  constructor(message: string, status: number, backendMessage?: string | null) {
    super(message);
    this.status = status;
    this.backendMessage = backendMessage ?? null;
    this.name = "ApiError";
  }
}

/**
 * Helper de requisição genérico.
 * Parseia o body JSON de erro do GlobalExceptionHandler para extrair a mensagem real.
 */
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true", // Evita a tela de aviso do ngrok free
      ...options.headers as Record<string, string>
    },
    ...options,
  });

  if (!res.ok) {
    // Tentar parsear corpo de erro JSON do GlobalExceptionHandler
    let backendMessage: string | null = null;
    try {
      const errorBody = await res.json();
      if (errorBody?.message) {
        backendMessage = errorBody.message;
      }
    } catch {
      // Body não é JSON — sem problema
    }

    throw new ApiError(
      backendMessage || `HTTP ${res.status}: ${res.statusText}`,
      res.status,
      backendMessage,
    );
  }

  // Alguns endpoints retornam void (204 / body vazio)
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

// ────────────────── Mapeamento de Enums (Front ↔ Back) ──────────────────

const GENERO_FRONT_TO_BACK: Record<string, string> = {
  "Masculino": "m",
  "Feminino": "f",
  "Outro": "ou",
  "Prefiro não dizer": "pn",
};

const GENERO_BACK_TO_FRONT: Record<string, string> = {
  "m": "Masculino",
  "f": "Feminino",
  "ou": "Outro",
  "pn": "Prefiro não dizer",
};

const MAO_FRONT_TO_BACK: Record<string, string> = {
  "Direita": "d",
  "Esquerda": "e",
  "Ambidestro": "a",
};

const MAO_BACK_TO_FRONT: Record<string, string> = {
  "d": "Direita",
  "e": "Esquerda",
  "a": "Ambidestro",
};

export function generoToFront(v: string): string { return GENERO_BACK_TO_FRONT[v] ?? v; }
export function generoToBack(v: string): string { return GENERO_FRONT_TO_BACK[v] ?? v; }
export function maoToFront(v: string): string { return MAO_BACK_TO_FRONT[v] ?? v; }
export function maoToBack(v: string): string { return MAO_FRONT_TO_BACK[v] ?? v; }

/** "DD/MM/AAAA" → "YYYY-MM-DD" */
export function dateBrToIso(dob: string): string {
  const [d, m, y] = dob.split("/");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" → "DD/MM/AAAA" */
export function dateIsoToBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ────────────────────────── User Endpoints ──────────────────────────────

/** POST /api/user/login — retorna void; lança ApiError(401) se senha errada, ApiError(404) se não encontrado */
export async function loginUser(email: string, password: string): Promise<void> {
  await request<void>(`/user/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
    method: "POST",
  });
}

/** GET /api/user?email= */
export async function getUser(email: string): Promise<UserResponse> {
  return request<UserResponse>(`/user?email=${encodeURIComponent(email)}`);
}

/** POST /api/user/create */
export async function createUser(data: UserCreatePayload): Promise<UserResponse> {
  return request<UserResponse>("/user/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** PATCH /api/user/updateUserInfo?email= */
export async function updateUser(email: string, data: UserUpdatePayload): Promise<UserResponse> {
  return request<UserResponse>(`/user/updateUserInfo?email=${encodeURIComponent(email)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/** PATCH /api/user/deactivateAcc?email= */
export async function deactivateAccount(email: string): Promise<UserResponse> {
  return request<UserResponse>(`/user/deactivateAcc?email=${encodeURIComponent(email)}`, {
    method: "PATCH",
  });
}

// ────────────────────────── Doctor Endpoints ────────────────────────────

/** GET /api/doctor?email= */
export async function getDoctor(email: string): Promise<DoctorResponse> {
  return request<DoctorResponse>(`/doctor?email=${encodeURIComponent(email)}`);
}

/** POST /api/doctor/login — retorna void; lança ApiError(401) se senha errada, ApiError(404) se não encontrado */
export async function loginDoctor(email: string, password: string): Promise<void> {
  await request<void>(`/doctor/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
    method: "POST",
  });
}

/** POST /api/doctor/create */
export async function createDoctor(data: DoctorCreatePayload): Promise<DoctorResponse> {
  return request<DoctorResponse>("/doctor/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** PATCH /api/doctor?email= */
export async function updateDoctor(email: string, data: DoctorUpdatePayload): Promise<DoctorResponse> {
  return request<DoctorResponse>(`/doctor?email=${encodeURIComponent(email)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/** GET /api/doctor/users?email= — retorna os pacientes vinculados ao médico */
export async function getUsersByDoctor(email: string): Promise<UserResponse[]> {
  return request<UserResponse[]>(`/doctor/users?email=${encodeURIComponent(email)}`);
}

/** GET /api/doctor/doctors?email= — retorna os médicos vinculados ao paciente */
export async function getDoctorsByUser(email: string): Promise<DoctorHasUserResponse[]> {
  return request<DoctorHasUserResponse[]>(`/doctor/doctors?email=${encodeURIComponent(email)}`);
}

/** POST /api/doctor/addUser — cria vínculo entre médico e paciente */
export async function addUserToDoctor(doctorEmail: string, userEmail: string): Promise<void> {
  await request<void>(
    `/doctor/addUser?doctorEmail=${encodeURIComponent(doctorEmail)}&userEmail=${encodeURIComponent(userEmail)}`,
    { method: "POST" },
  );
}

/** PATCH /api/doctor/toggleStatus — inverte status do vínculo (s ↔ n) */
export async function toggleDoctorUserStatus(doctorEmail: string, userEmail: string): Promise<void> {
  await request<void>(
    `/doctor/toggleStatus?doctorEmail=${encodeURIComponent(doctorEmail)}&userEmail=${encodeURIComponent(userEmail)}`,
    { method: "PATCH" },
  );
}

// ──────────────────────── Token / Reset Senha ───────────────────────────

/** POST /api/token/sendCode?email= */
export async function sendResetCode(email: string): Promise<void> {
  await request<void>(`/token/sendCode?email=${encodeURIComponent(email)}`, {
    method: "POST",
  });
}

/** POST /api/token/validateCode?email=&code= */
export async function validateResetCode(email: string, code: string): Promise<void> {
  await request<void>(`/token/validateCode?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`, {
    method: "POST",
  });
}

/** POST /api/token/resetPassword?email=&code=&newPassword= */
export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  await request<void>(
    `/token/resetPassword?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&newPassword=${encodeURIComponent(newPassword)}`,
    { method: "POST" },
  );
}

// ──────────────────────── Result Endpoints ──────────────────────────────

/** GET /api/result/all?email= */
export async function getAllResults(email: string): Promise<ResultResponse[]> {
  return request<ResultResponse[]>(`/result/all?email=${encodeURIComponent(email)}`);
}

/** GET /api/result/getLastX?email=&quantidade= */
export async function getLastResults(email: string, quantidade: number): Promise<ResultResponse[]> {
  return request<ResultResponse[]>(`/result/getLastX?email=${encodeURIComponent(email)}&quantidade=${quantidade}`);
}

/** GET /api/result/getDateRange?email=&d1=&d2= */
export async function getDateRangeResults(
  email: string,
  d1: string,  // ISO datetime e.g. "2026-01-01T00:00:00"
  d2: string,
): Promise<ResultResponse[]> {
  return request<ResultResponse[]>(
    `/result/getDateRange?email=${encodeURIComponent(email)}&d1=${encodeURIComponent(d1)}&d2=${encodeURIComponent(d2)}`,
  );
}

/** GET /api/result/weeklyStats?email=&semanas= */
export async function getWeeklyStats(email: string, semanas: number): Promise<WeeklyStatsResponse[]> {
  return request<WeeklyStatsResponse[]>(`/result/weeklyStats?email=${encodeURIComponent(email)}&semanas=${semanas}`);
}

/** GET /api/result/monthlyStats?email=&meses= */
export async function getMonthlyStats(email: string, meses: number): Promise<MonthlyStatsResponse[]> {
  return request<MonthlyStatsResponse[]>(`/result/monthlyStats?email=${encodeURIComponent(email)}&meses=${meses}`);
}

/** POST /api/result/create */
export async function createResult(data: ResultCreatePayload): Promise<ResultResponse> {
  return request<ResultResponse>("/result/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** POST /api/result/consolidate?email= — consolida resultados do dia em um único registro */
export async function consolidateResults(email: string): Promise<ResultResponse> {
  return request<ResultResponse>(`/result/consolidate?email=${encodeURIComponent(email)}`, {
    method: "POST",
  });
}

/** DELETE /api/result/delete?id= */
export async function deleteResult(id: number): Promise<void> {
  await request<void>(`/result/delete?id=${id}`, { method: "DELETE" });
}

// ──────────────── Compatibilidade — alias "login" legado ────────────────

/**
 * @deprecated Use loginUser() ou loginDoctor() diretamente.
 * Mantido para compatibilidade com código legado.
 */
export const login = loginUser;
