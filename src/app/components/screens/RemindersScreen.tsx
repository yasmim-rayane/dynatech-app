import { useState, useRef, useEffect } from "react";
import { Plus, Clock, Trash2, X, Pencil } from "lucide-react";
import {
  scheduleReminder,
  cancelReminder,
  requestNotificationPermission,
} from "../../services/notifications";
import { WEEK, type Reminder } from "../../hooks/useReminders";

/* ── Props ─────────────────────────────────────────────────── */

interface RemindersStore {
  reminders: Reminder[];
  addReminder: (time: string, label: string, days: string[]) => Reminder;
  deleteReminder: (id: number) => void;
  toggleReminder: (id: number) => void;
  updateReminder: (id: number, time: string, label: string, days: string[]) => Reminder | null;
}

/* ── Componente principal ──────────────────────────────────── */

export function RemindersScreen({
  remindersStore,
}: {
  remindersStore: RemindersStore;
}) {
  const { reminders, addReminder, deleteReminder, toggleReminder, updateReminder } =
    remindersStore;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTime, setNewTime] = useState("08:00");
  const [newLabel, setNewLabel] = useState("");
  const [newDays, setNewDays] = useState<string[]>(["Seg", "Qua", "Sex"]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  /* Pedir permissão de notificação ao montar */
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  /* Abrir formulário para edição */
  function handleEdit(r: Reminder) {
    setEditingId(r.id);
    setNewTime(r.time);
    setNewLabel(r.label);
    setNewDays([...r.days]);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  /* Abrir formulário para novo */
  function handleOpenNew() {
    resetForm();
    setShowForm(true);
  }

  /* Salvar (adicionar ou editar) */
  async function handleSave() {
    if (!newLabel.trim() || newDays.length === 0) return;

    if (editingId !== null) {
      // Edição: cancelar notificações antigas e reagendar
      const oldRem = reminders.find((r) => r.id === editingId);
      if (oldRem) {
        await cancelReminder(oldRem.id, oldRem.days.length);
      }
      const updated = updateReminder(editingId, newTime, newLabel, newDays);
      if (updated && updated.on) {
        await scheduleReminder(updated);
      }
    } else {
      // Novo
      const reminder = addReminder(newTime, newLabel, newDays);
      await scheduleReminder(reminder);
    }

    resetForm();
    setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  /* Reset do formulário */
  function resetForm() {
    setEditingId(null);
    setNewTime("08:00");
    setNewLabel("");
    setNewDays(["Seg", "Qua", "Sex"]);
    setShowForm(false);
  }

  /* Excluir lembrete */
  async function handleDelete(id: number) {
    const rem = reminders.find((r) => r.id === id);
    if (rem) {
      await cancelReminder(rem.id, rem.days.length);
    }
    deleteReminder(id);
    setDeleteConfirm(null);
    // Se estava editando este, fechar o form
    if (editingId === id) resetForm();
  }

  /* Toggle on/off */
  async function handleToggle(id: number) {
    const rem = reminders.find((r) => r.id === id);
    if (!rem) return;

    if (rem.on) {
      await cancelReminder(rem.id, rem.days.length);
    } else {
      await scheduleReminder({ ...rem, on: true });
    }

    toggleReminder(id);
  }

  /* Formatar dias para exibição */
  function formatDays(days: string[]) {
    if (days.length === 7) return "Diariamente";
    if (days.length === 0) return "Nunca";
    const sorted = WEEK.filter((d) => days.includes(d));
    return sorted.join(", ");
  }

  const canSave = newLabel.trim().length > 0 && newDays.length > 0;
  const isEditing = editingId !== null;

  return (
    <div
      className="min-h-full w-full px-6 pt-6"
      style={{ background: "var(--brand-card)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between animate-fadeSlideDown">
        <div>
          <h1
            style={{
              color: "var(--brand-text)",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Lembretes
          </h1>
          <p
            style={{ color: "var(--brand-text-muted)", fontSize: 13 }}
            className="mt-1"
          >
            Mantenha sua rotina em dia
          </p>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : handleOpenNew())}
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all duration-200"
          style={{
            background: showForm ? "var(--brand-danger)" : "var(--brand-emerald)",
            transform: showForm ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          {showForm ? <X size={20} color="white" /> : <Plus size={20} color="white" />}
        </button>
      </div>

      {/* ── Formulário (novo ou edição) ───────────────────── */}
      <div
        ref={formRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: showForm ? 450 : 0,
          opacity: showForm ? 1 : 0,
          marginTop: showForm ? 24 : 0,
        }}
      >
        <div
          className="rounded-2xl p-5 shadow-sm"
          style={{
            background: "var(--brand-card)",
            border: `1px solid ${isEditing ? "var(--brand-emerald)" : "var(--brand-border-soft)"}`,
          }}
        >
          <div className="flex items-center justify-between">
            <h3
              style={{ color: "var(--brand-text)", fontSize: 15, fontWeight: 600 }}
            >
              {isEditing ? "Editar lembrete" : "Novo lembrete"}
            </h3>
            {isEditing && (
              <span
                className="rounded-full px-2.5 py-0.5"
                style={{
                  background: "var(--brand-emerald-soft)",
                  color: "var(--brand-emerald)",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Editando
              </span>
            )}
          </div>

          {/* Label */}
          <div className="mt-4">
            <label
              style={{
                fontSize: 12,
                color: "var(--brand-text-muted)",
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            >
              DESCRIÇÃO
            </label>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Ex: Medição matinal"
              maxLength={40}
              className="w-full h-11 px-4 mt-1.5 rounded-xl outline-none transition-colors"
              style={{
                background: "var(--brand-input-bg)",
                border: "1px solid var(--brand-border)",
                color: "var(--brand-text)",
                fontSize: 14,
              }}
            />
          </div>

          {/* Hora */}
          <div className="mt-4">
            <label
              style={{
                fontSize: 12,
                color: "var(--brand-text-muted)",
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            >
              HORÁRIO
            </label>
            <div className="mt-1.5 flex items-center justify-center">
              <div
                className="rounded-2xl px-6 py-3 flex items-center gap-3"
                style={{ background: "var(--brand-chip-bg)" }}
              >
                <Clock size={20} style={{ color: "var(--brand-text)" }} />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="bg-transparent outline-none"
                  style={{
                    color: "var(--brand-text)",
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Dias da semana */}
          <div className="mt-4">
            <label
              style={{
                fontSize: 12,
                color: "var(--brand-text-muted)",
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            >
              REPETIR
            </label>
            <div className="flex justify-between mt-2 gap-1">
              {WEEK.map((d) => {
                const active = newDays.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() =>
                      setNewDays((prev) =>
                        prev.includes(d)
                          ? prev.filter((x) => x !== d)
                          : [...prev, d]
                      )
                    }
                    className="w-10 h-10 rounded-full transition-all duration-200 active:scale-90"
                    style={{
                      background: active ? "var(--brand-emerald)" : "var(--brand-chip-bg)",
                      color: active ? "#FFFFFF" : "var(--brand-text-muted)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {d[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botões de ação */}
          <div className={`mt-5 ${isEditing ? "grid grid-cols-2 gap-2" : ""}`}>
            {isEditing && (
              <button
                onClick={resetForm}
                className="w-full rounded-xl transition-all duration-200 active:scale-[0.97]"
                style={{
                  height: 46,
                  background: "transparent",
                  border: "1.5px solid var(--brand-border)",
                  color: "var(--brand-text)",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Cancelar
              </button>
            )}
            <button
              onClick={canSave ? handleSave : undefined}
              disabled={!canSave}
              className="w-full rounded-xl transition-all duration-200"
              style={{
                height: 46,
                background: canSave ? "var(--brand-button-grad)" : "var(--brand-border)",
                color: canSave ? "var(--brand-on-header)" : "var(--brand-text-faint)",
                fontSize: 14,
                fontWeight: 600,
                cursor: canSave ? "pointer" : "not-allowed",
                opacity: canSave ? 1 : 0.7,
              }}
            >
              {isEditing ? "Salvar" : "Salvar lembrete"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Lista de lembretes ─────────────────────────────── */}
      <div className="flex items-center justify-between mt-6 mb-3" ref={listRef}>
        <h3 style={{ color: "var(--brand-text)", fontSize: 15, fontWeight: 600 }}>
          Seus lembretes
        </h3>
        <span
          className="rounded-full px-2.5 py-0.5"
          style={{
            background: "var(--brand-chip-bg)",
            color: "var(--brand-text-muted)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {reminders.length}
        </span>
      </div>

      {reminders.length === 0 ? (
        <div
          className="rounded-2xl p-8 text-center animate-fadeIn"
          style={{
            background: "var(--brand-card)",
            border: "1px solid var(--brand-border-soft)",
          }}
        >
          <Clock
            size={40}
            className="mx-auto mb-3"
            style={{ color: "var(--brand-text-faint)" }}
          />
          <p style={{ color: "var(--brand-text-muted)", fontSize: 14, fontWeight: 500 }}>
            Nenhum lembrete cadastrado
          </p>
          <p style={{ color: "var(--brand-text-faint)", fontSize: 12 }} className="mt-1">
            Toque no botão + para criar um novo
          </p>
        </div>
      ) : (
        <div className="space-y-2 pb-6">
          {reminders.map((r, i) => {
            const isBeingEdited = editingId === r.id;
            return (
              <div
                key={r.id}
                className="rounded-xl px-4 py-3 flex items-center gap-3 animate-fadeSlideUp"
                style={{
                  background: "var(--brand-card)",
                  border: `1px solid ${
                    deleteConfirm === r.id
                      ? "var(--brand-danger)"
                      : isBeingEdited
                      ? "var(--brand-emerald)"
                      : "var(--brand-border-soft)"
                  }`,
                  animationDelay: `${0.05 * i}s`,
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: r.on ? "var(--brand-emerald-soft)" : "var(--brand-chip-bg)",
                  }}
                >
                  <Clock
                    size={20}
                    style={{
                      color: r.on ? "var(--brand-emerald)" : "var(--brand-text-faint)",
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ color: "var(--brand-text)", fontSize: 16, fontWeight: 600 }}>
                    {r.time}
                  </div>
                  <div
                    className="truncate"
                    style={{ color: "var(--brand-text-muted)", fontSize: 12 }}
                  >
                    {r.label} · {formatDays(r.days)}
                  </div>
                </div>

                <Toggle on={r.on} onChange={() => handleToggle(r.id)} />

                {/* Ações: Editar / Excluir */}
                {deleteConfirm === r.id ? (
                  <div className="flex items-center gap-1 animate-fadeIn">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="px-2 py-1 rounded-lg text-xs font-semibold active:scale-90 transition-transform"
                      style={{
                        background: "var(--brand-danger)",
                        color: "#FFFFFF",
                        fontSize: 11,
                      }}
                    >
                      Excluir
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-2 py-1 rounded-lg text-xs font-semibold active:scale-90 transition-transform"
                      style={{
                        background: "var(--brand-chip-bg)",
                        color: "var(--brand-text-muted)",
                        fontSize: 11,
                      }}
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(r)}
                      className="active:scale-90 transition-transform p-1.5 rounded-lg"
                      style={{ color: "var(--brand-text-faint)" }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(r.id)}
                      className="active:scale-90 transition-transform p-1.5 rounded-lg"
                      style={{ color: "var(--brand-text-faint)" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Toggle controlado ────────────────────────────────────── */

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="rounded-full transition-colors duration-200 flex-shrink-0"
      style={{
        width: 40,
        height: 22,
        background: on ? "var(--brand-emerald)" : "var(--brand-border)",
        position: "relative",
      }}
    >
      <span
        className="absolute top-0.5 rounded-full bg-white shadow"
        style={{
          width: 18,
          height: 18,
          left: on ? 20 : 2,
          transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </button>
  );
}
