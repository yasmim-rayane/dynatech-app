/**
 * mockData.ts — Tipos e utilidades compartilhadas.
 *
 * Os dados mock foram removidos. Toda a comunicação agora passa pelo backend real.
 * Este arquivo mantém apenas tipos e helpers reutilizados pelas telas.
 */

import type { ResultResponse } from "./api";

// ────────────────────────── Tipos ───────────────────────────────────

export type UserRole = "professional" | "patient";

/**
 * @deprecated Use Patient do PatientsContext.
 * Mantido por compatibilidade com imports existentes.
 */
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

// ────────────────── Funções utilitárias ────────────────────────────

/**
 * Gera um ID único simples para uso local temporário.
 */
export function generateId(): string {
  return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ────────────────── Re-exports de tipos (compatibilidade) ─────────

export type { ResultResponse };
