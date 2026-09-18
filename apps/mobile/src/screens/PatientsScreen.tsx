import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Mail,
  Calendar,
  X,
  UserCircle,
  AlertTriangle,
  Activity,
  FileText,
  Power,
} from "lucide-react";
import * as api from "../services/api";
import { usePatients } from "../contexts/PatientsContext";
import { useTheme } from "../contexts/ThemeContext";
import { generoToFront, maoToFront } from "../services/api";
import type { Patient } from "../contexts/PatientsContext";
import { PatientFormModal } from "./PatientFormModal";

export function PatientsScreen({ onStartMeasurement }: { onStartMeasurement?: () => void }) {
  const { theme } = useTheme();
  const { patients, removePatient, setActivePatientId, togglePatientStatus } = usePatients();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ativos" | "inativos">("ativos");
  const [reportLoading, setReportLoading] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const filteredByStatus = patients.filter(p => statusFilter === "ativos" ? !p.inativo : p.inativo);
    if (!search.trim()) return filteredByStatus;
    const q = search.toLowerCase();
    return filteredByStatus.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.email && p.email.toLowerCase().includes(q)),
    );
  }, [patients, search, statusFilter]);

  function handleEdit(patient: Patient) {
    setEditingPatient(patient);
    setShowForm(true);
  }

  function handleAdd() {
    setEditingPatient(null);
    setShowForm(true);
  }

  async function handleDeleteConfirm() {
    if (deletingPatient) {
      try {
        await removePatient(deletingPatient.id);
      } catch (e) {
        console.error("Erro ao remover paciente:", e);
      }
      setDeletingPatient(null);
    }
  }

  function formatDate(iso: string): string {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  async function handleGenerateReport(email: string | undefined) {
    if (!email) return;
    setReportLoading(email);
    setReportSuccess(null);
    try {
      await api.consolidateResults(email);
      setReportSuccess(email);
      setTimeout(() => setReportSuccess(null), 3000);
    } catch (e) {
      console.error("Erro ao gerar relatório:", e);
    } finally {
      setReportLoading(null);
    }
  }

  return (
    <div
      className="min-h-full w-full"
      style={{ background: "var(--brand-card)" }}
    >
      <div className="px-6 pt-6 animate-fadeSlideDown">
        <h1
          style={{
            color: "var(--brand-text)",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Pacientes
        </h1>
        <p
          style={{ color: "var(--brand-text-muted)", fontSize: 13 }}
          className="mt-1"
        >
          Gerencie os pacientes vinculados à sua conta
        </p>

        {/* Search bar */}
        <div className="relative mt-5 mb-4">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--brand-text-faint)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar paciente..."
            className="w-full h-12 pl-11 pr-4 rounded-xl outline-none transition"
            style={{
              background: "var(--brand-input-bg)",
              border: "1px solid var(--brand-border)",
              color: "var(--brand-text)",
              fontSize: 14,
            }}
          />
        </div>

        {/* Tabs: Ativos / Inativos */}
        <div className="flex p-1 rounded-xl mb-4 mt-2" style={{ background: "var(--brand-chip-bg)" }}>
          <button
            onClick={() => setStatusFilter("ativos")}
            className="flex-1 py-2 rounded-lg transition-all duration-200"
            style={{
              background: statusFilter === "ativos" ? "var(--brand-card)" : "transparent",
              color: statusFilter === "ativos" ? "var(--brand-text)" : "var(--brand-text-muted)",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: statusFilter === "ativos" ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
            }}
          >
            Ativos
          </button>
          <button
            onClick={() => setStatusFilter("inativos")}
            className="flex-1 py-2 rounded-lg transition-all duration-200"
            style={{
              background: statusFilter === "inativos" ? "var(--brand-card)" : "transparent",
              color: statusFilter === "inativos" ? "var(--brand-text)" : "var(--brand-text-muted)",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: statusFilter === "inativos" ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
            }}
          >
            Inativos
          </button>
        </div>
      </div>

      {/* Patient List */}
      <div className="px-5 space-y-3 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
            <UserCircle
              size={48}
              style={{ color: "var(--brand-border-soft)" }}
            />
            <p
              style={{
                color: "var(--brand-text-muted)",
                fontSize: 14,
                fontWeight: 500,
              }}
              className="mt-4 text-center"
            >
              {search
                ? "Nenhum paciente encontrado."
                : "Nenhum paciente cadastrado."}
            </p>
            {!search && (
              <p
                style={{
                  color: "var(--brand-text-faint)",
                  fontSize: 13,
                }}
                className="mt-1 text-center"
              >
                Toque no botão "+" para adicionar.
              </p>
            )}
          </div>
        ) : (
          filtered.map((patient, i) => (
            <div
              key={patient.id}
              className="rounded-2xl p-4 shadow-sm animate-fadeSlideUp"
              style={{
                background: "var(--brand-card)",
                border: "1px solid var(--brand-border-soft)",
                animationDelay: `${0.05 * i}s`,
              }}
            >
              <div className="p-4 flex flex-col">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "var(--brand-emerald-soft)",
                      color: "var(--brand-emerald)",
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    {patient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        color: "var(--brand-text)",
                        fontSize: 15,
                        fontWeight: 600,
                      }}
                    >
                      {patient.name}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {patient.email && (
                        <div className="flex items-center gap-1">
                          <Mail
                            size={11}
                            style={{ color: "var(--brand-text-faint)" }}
                          />
                          <span
                            style={{
                              color: "var(--brand-text-muted)",
                              fontSize: 12,
                            }}
                          >
                            {patient.email}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar
                          size={11}
                          style={{ color: "var(--brand-text-faint)" }}
                        />
                        <span
                          style={{
                            color: "var(--brand-text-muted)",
                            fontSize: 12,
                          }}
                        >
                          {formatDate(patient.dataNascimento)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className="rounded-full px-2 py-0.5"
                        style={{
                          background: "var(--brand-chip-bg)",
                          color: "var(--brand-text-muted)",
                          fontSize: 11,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {generoToFront(patient.genero)}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5"
                        style={{
                          background: "var(--brand-chip-bg)",
                          color: "var(--brand-text-muted)",
                          fontSize: 11,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Mão {maoToFront(patient.maoDominante)}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5"
                        style={{
                          background: "var(--brand-chip-bg)",
                          color: "var(--brand-text-muted)",
                          fontSize: 11,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {patient.peso.toFixed(1)} kg
                      </span>
                      {reportSuccess === patient.email && (
                        <span className="text-xs font-bold ml-1 animate-fadeIn" style={{ color: "var(--brand-emerald)" }}>
                          Relatório gerado!
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div 
                  className="mt-4 pt-3 flex items-center justify-end gap-2 border-t" 
                  style={{ borderColor: "var(--brand-border-soft)" }}
                >
                  <button
                    onClick={() => {
                      if (patient.inativo) return;
                      setActivePatientId(patient.id);
                      if (onStartMeasurement) onStartMeasurement();
                    }}
                    disabled={patient.inativo}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${patient.inativo ? '' : 'active:scale-90'}`}
                    style={{ 
                      background: patient.inativo ? "var(--brand-chip-bg)" : "var(--brand-emerald-soft)",
                      cursor: patient.inativo ? "not-allowed" : "pointer"
                    }}
                  >
                    <Activity
                      size={18}
                      style={{ color: patient.inativo ? "var(--brand-text-muted)" : "var(--brand-emerald)" }}
                    />
                  </button>
                  <button
                    onClick={() => handleEdit(patient)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: "var(--brand-blue-soft)" }}
                  >
                    <Edit3
                      size={18}
                      style={{ color: "var(--brand-blue)" }}
                    />
                  </button>
                  <button
                    onClick={() => handleGenerateReport(patient.email)}
                    disabled={reportLoading === patient.email}
                    className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: reportLoading === patient.email ? "var(--brand-chip-bg)" : "var(--brand-blue-soft)" }}
                  >
                    <FileText
                      size={18}
                      style={{ color: reportLoading === patient.email ? "var(--brand-text-muted)" : "var(--brand-blue)" }}
                    />
                  </button>
                  <button
                    onClick={() => {
                      if (patient.email) {
                        togglePatientStatus(patient.email);
                      }
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: patient.inativo ? "var(--brand-chip-bg)" : "var(--brand-emerald-soft)" }}
                  >
                    <Power
                      size={18}
                      style={{ color: patient.inativo ? "var(--brand-text-muted)" : "var(--brand-emerald)" }}
                    />
                  </button>
                  <button
                    onClick={() => setDeletingPatient(patient)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: "var(--brand-danger-soft)" }}
                  >
                    <Trash2
                      size={18}
                      style={{ color: "var(--brand-danger)" }}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB — Adicionar Paciente */}
      <button
        onClick={handleAdd}
        className="fixed right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        style={{
          bottom: "calc(96px + max(env(safe-area-inset-bottom), 0px))",
          background: "var(--brand-accent-grad)",
          zIndex: 40,
        }}
      >
        <Plus size={24} style={{ color: "#FFFFFF" }} />
      </button>

      {/* Modal — Formulário Paciente */}
      {showForm && (
        <PatientFormModal
          patient={editingPatient}
          onClose={() => {
            setShowForm(false);
            setEditingPatient(null);
          }}
        />
      )}

      {/* Modal — Confirmar Exclusão */}
      {deletingPatient &&
        typeof document !== "undefined" &&
        createPortal(
          <div className={theme === "dark" ? "dark" : ""}>
            <div
              className="fixed inset-0 flex items-end justify-center sm:items-center"
              style={{ zIndex: 9999 }}
            >
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setDeletingPatient(null)}
              />
              <div
                className="relative w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-slideUp sm:animate-scaleIn"
                style={{
                  background: "var(--brand-card)",
                  border: "1px solid var(--brand-border-soft)",
                }}
              >
                <button
                  onClick={() => setDeletingPatient(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                  style={{ background: "var(--brand-chip-bg)" }}
                >
                  <X size={18} style={{ color: "var(--brand-text)" }} />
                </button>

                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "var(--brand-danger-soft)" }}
                >
                  <AlertTriangle
                    size={28}
                    style={{ color: "var(--brand-danger)" }}
                  />
                </div>

                <h2
                  style={{
                    color: "var(--brand-text)",
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                  className="mb-2"
                >
                  Remover paciente?
                </h2>
                <p
                  style={{
                    color: "var(--brand-text-muted)",
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                  className="mb-6"
                >
                  <strong>{deletingPatient.name}</strong> será removido da sua
                  lista. Esta ação não pode ser desfeita.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletingPatient(null)}
                    className="flex-1 py-3 rounded-xl font-semibold text-[14px] active:scale-95 transition-transform"
                    style={{
                      border: "1.5px solid var(--brand-border)",
                      color: "var(--brand-text)",
                      background: "transparent",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 py-3 rounded-xl font-semibold text-[14px] active:scale-95 transition-transform shadow-md"
                    style={{
                      background: "var(--brand-danger)",
                      color: "#FFFFFF",
                    }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
