import { useState, useEffect, useCallback } from "react";

/* ── Tipo ──────────────────────────────────────────────────── */

export interface Reminder {
  id: number;
  time: string;
  label: string;
  days: string[];
  on: boolean;
}

/* ── Constantes ────────────────────────────────────────────── */

const STORAGE_KEY = "dynatech_reminders";
const NEXT_ID_KEY = "dynatech_reminders_nextId";

export const WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const DEFAULT_REMINDERS: Reminder[] = [
  { id: 1, time: "08:00", label: "Medição matinal", days: ["Seg", "Qua", "Sex"], on: true },
  { id: 2, time: "19:30", label: "Treino noturno", days: WEEK.slice(), on: false },
];

/* ── Helpers de persistência ───────────────────────────────── */

function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_REMINDERS;
}

function saveReminders(reminders: Reminder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

function loadNextId(): number {
  try {
    const raw = localStorage.getItem(NEXT_ID_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return 3; // após os 2 padrão
}

function saveNextId(id: number) {
  localStorage.setItem(NEXT_ID_KEY, JSON.stringify(id));
}

/* ── Hook ──────────────────────────────────────────────────── */

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>(loadReminders);
  const [nextId, setNextId] = useState(loadNextId);

  // Persistir ao mudar
  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  useEffect(() => {
    saveNextId(nextId);
  }, [nextId]);

  const addReminder = useCallback(
    (time: string, label: string, days: string[]) => {
      const reminder: Reminder = {
        id: nextId,
        time,
        label: label.trim(),
        days: [...days],
        on: true,
      };
      setNextId((n) => n + 1);
      setReminders((prev) => [reminder, ...prev]);
      return reminder;
    },
    [nextId]
  );

  const deleteReminder = useCallback((id: number) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleReminder = useCallback((id: number) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, on: !r.on } : r))
    );
  }, []);

  const updateReminder = useCallback(
    (id: number, time: string, label: string, days: string[]) => {
      let updated: Reminder | null = null;
      setReminders((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            updated = { ...r, time, label: label.trim(), days: [...days] };
            return updated;
          }
          return r;
        })
      );
      return updated as Reminder | null;
    },
    []
  );

  return {
    reminders,
    addReminder,
    deleteReminder,
    toggleReminder,
    updateReminder,
  };
}
