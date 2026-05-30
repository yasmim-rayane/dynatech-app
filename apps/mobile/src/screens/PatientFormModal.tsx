import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Info,
  Loader2,
} from "lucide-react";
import { usePatients } from "../contexts/PatientsContext";
import { useTheme } from "../contexts/ThemeContext";
import { generoToBack, maoToBack, dateBrToIso } from "../services/api";
import type { Patient } from "../services/mockData";

/* ── Helpers ─────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateDate(raw: string) {
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const [, dd, mm, yyyy] = m.map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return (
    d.getFullYear() === yyyy &&
    d.getMonth() === mm - 1 &&
    d.getDate() === dd &&
    d <= new Date()
  );
}

function dateIsoToBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/* ── Componente ──────────────────────────────────────────── */

export function PatientFormModal({
  patient,
  onClose,
}: {
  patient: Patient | null; // null = adding, defined = editing
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const { addPatient, updatePatient } = usePatients();
  const isEditing = patient !== null;

  const [name, setName] = useState(patient?.name ?? "");
  const [email, setEmail] = useState(patient?.email ?? "");
  const [dob, setDob] = useState(
    patient ? dateIsoToBr(patient.dataNascimento) : "",
  );
  const [peso, setPeso] = useState(
    patient ? patient.peso.toFixed(2) : "",
  );
  const [altura, setAltura] = useState(
    patient ? String(patient.altura) : "",
  );
  const [genero, setGenero] = useState(
    patient
      ? (
          { m: "Masculino", f: "Feminino", ou: "Outro", pn: "Prefiro não dizer" }[
            patient.genero
          ] ?? "Selecione"
        )
      : "Selecione",
  );
  const [maoDominante, setMaoDominante] = useState(
    patient
      ? ({ d: "Direita", e: "Esquerda", a: "Ambidestro" }[patient.maoDominante] ?? "Selecione")
      : "Selecione",
  );
  const [saving, setSaving] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  /* Validações */
  const nameOk = name.trim().length >= 2;
  const emailOk = email.trim() === "" || EMAIL_RE.test(email);
  const dobOk = validateDate(dob);
  const pesoOk = peso.length > 0 && Number(peso) > 0;
  const alturaOk = altura.length > 0 && Number(altura) > 0;
  const generoOk = genero !== "Selecione";
  const maoOk = maoDominante !== "Selecione";

  const formValid = useMemo(
    () => nameOk && emailOk && dobOk && pesoOk && alturaOk && generoOk && maoOk,
    [nameOk, emailOk, dobOk, pesoOk, alturaOk, generoOk, maoOk],
  );

  /* Máscara de data */
  function handleDobChange(raw: string) {
    let digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 4)
      digits =
        digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    else if (digits.length > 2)
      digits = digits.slice(0, 2) + "/" + digits.slice(2);
    setDob(digits);
  }

  async function handleSave() {
    if (!formValid || saving) return;
    setSaving(true);

    // Simula delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const data = {
      name: name.trim(),
      email: email.trim() || undefined,
      dataNascimento: dateBrToIso(dob),
      genero: generoToBack(genero),
      maoDominante: maoToBack(maoDominante),
      peso: Number(peso),
      altura: Number(altura),
    };

    if (isEditing && patient) {
      updatePatient(patient.id, data);
    } else {
      addPatient(data as any);
    }

    setSaving(false);
    onClose();
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--brand-input-bg)",
    border: "1px solid var(--brand-border)",
    color: "var(--brand-text)",
    fontSize: 14,
  };

  const errorInputStyle: React.CSSProperties = {
    ...inputStyle,
    border: "1px solid var(--brand-danger)",
  };

  const errorTextStyle: React.CSSProperties = {
    color: "var(--brand-danger)",
    fontSize: 11,
    marginTop: 4,
    display: "flex",
    alignItems: "center",
    gap: 4,
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={theme === "dark" ? "dark" : ""}>
      <div
        className="fixed inset-0 flex items-end justify-center sm:items-center"
        style={{ zIndex: 9999 }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Sheet */}
        <div
          className="relative w-full sm:w-[440px] max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-slideUp sm:animate-scaleIn scroll-y no-scrollbar"
          style={{
            background: "var(--brand-card)",
            border: "1px solid var(--brand-border-soft)",
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ background: "var(--brand-chip-bg)" }}
          >
            <X size={18} style={{ color: "var(--brand-text)" }} />
          </button>

          <h2
            style={{
              color: "var(--brand-text)",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
            className="mb-5"
          >
            {isEditing ? "Editar paciente" : "Adicionar paciente"}
          </h2>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "var(--brand-text)",
                  fontWeight: 500,
                }}
              >
                Nome completo *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => touch("name")}
                placeholder="Nome do paciente"
                maxLength={90}
                className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
                style={touched.name && !nameOk ? errorInputStyle : inputStyle}
              />
              {touched.name && !nameOk && (
                <div style={errorTextStyle}>
                  <AlertCircle size={12} /> Insira o nome completo
                </div>
              )}
            </div>

            {/* Data de nascimento */}
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "var(--brand-text)",
                  fontWeight: 500,
                }}
              >
                Data de nascimento *
              </label>
              <div className="relative mt-1.5">
                <input
                  inputMode="numeric"
                  value={dob}
                  onChange={(e) => handleDobChange(e.target.value)}
                  onBlur={() => touch("dob")}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                  className="w-full h-12 pl-4 pr-12 rounded-xl outline-none"
                  style={touched.dob && !dobOk ? errorInputStyle : inputStyle}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center overflow-hidden">
                  <Calendar
                    size={20}
                    style={{ color: "var(--brand-text-faint)" }}
                  />
                  <input
                    type="date"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.value) {
                        const [y, m, d] = e.target.value.split("-");
                        handleDobChange(`${d}/${m}/${y}`);
                      }
                    }}
                  />
                </div>
              </div>
              {touched.dob && dob.length > 0 && !dobOk && (
                <div style={errorTextStyle}>
                  <AlertCircle size={12} /> Data inválida (DD/MM/AAAA)
                </div>
              )}
              {dobOk && (
                <div
                  style={{
                    color: "var(--brand-emerald)",
                    fontSize: 11,
                    marginTop: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <CheckCircle2 size={12} /> Data válida
                </div>
              )}
            </div>

            {/* Peso e Altura */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  style={{
                    fontSize: 13,
                    color: "var(--brand-text)",
                    fontWeight: 500,
                  }}
                >
                  Peso (kg) *
                </label>
                <input
                  inputMode="decimal"
                  placeholder="70.00"
                  value={peso}
                  onChange={(e) => {
                    let val = e.target.value
                      .replace(/[^0-9.,]/g, "")
                      .replace(",", ".");
                    const parts = val.split(".");
                    if (parts[0].length > 3) parts[0] = parts[0].slice(0, 3);
                    if (parts.length > 1) parts[1] = parts[1].slice(0, 2);
                    setPeso(parts.slice(0, 2).join("."));
                  }}
                  onBlur={() => {
                    touch("peso");
                    if (peso) setPeso(Number(peso).toFixed(2));
                  }}
                  maxLength={6}
                  className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
                  style={
                    touched.peso && !pesoOk ? errorInputStyle : inputStyle
                  }
                />
                {touched.peso && !pesoOk && (
                  <div style={errorTextStyle}>
                    <AlertCircle size={12} /> Obrigatório
                  </div>
                )}
              </div>
              <div>
                <label
                  style={{
                    fontSize: 13,
                    color: "var(--brand-text)",
                    fontWeight: 500,
                  }}
                >
                  Altura (cm) *
                </label>
                <input
                  inputMode="numeric"
                  placeholder="170"
                  value={altura}
                  onChange={(e) =>
                    setAltura(e.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  onBlur={() => touch("altura")}
                  maxLength={3}
                  className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
                  style={
                    touched.altura && !alturaOk ? errorInputStyle : inputStyle
                  }
                />
                {touched.altura && !alturaOk && (
                  <div style={errorTextStyle}>
                    <AlertCircle size={12} /> Obrigatório
                  </div>
                )}
              </div>
            </div>

            {/* Gênero */}
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "var(--brand-text)",
                  fontWeight: 500,
                }}
              >
                Gênero *
              </label>
              <select
                value={genero}
                onChange={(e) => {
                  setGenero(e.target.value);
                  touch("genero");
                }}
                className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
                style={
                  touched.genero && !generoOk ? errorInputStyle : inputStyle
                }
              >
                <option>Selecione</option>
                <option>Feminino</option>
                <option>Masculino</option>
                <option>Outro</option>
                <option>Prefiro não dizer</option>
              </select>
              {touched.genero && !generoOk && (
                <div style={errorTextStyle}>
                  <AlertCircle size={12} /> Selecione o gênero
                </div>
              )}
            </div>

            {/* Mão dominante */}
            <div>
              <label
                style={{
                  fontSize: 13,
                  color: "var(--brand-text)",
                  fontWeight: 500,
                }}
              >
                Mão dominante *
              </label>
              <select
                value={maoDominante}
                onChange={(e) => {
                  setMaoDominante(e.target.value);
                  touch("mao");
                }}
                className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
                style={touched.mao && !maoOk ? errorInputStyle : inputStyle}
              >
                <option>Selecione</option>
                <option>Direita</option>
                <option>Esquerda</option>
                <option>Ambidestro</option>
              </select>
              {touched.mao && !maoOk && (
                <div style={errorTextStyle}>
                  <AlertCircle size={12} /> Selecione a mão dominante
                </div>
              )}
            </div>

            {/* E-mail (Opcional) */}
            <div>
              <div className="flex items-center gap-2">
                <label
                  style={{
                    fontSize: 13,
                    color: "var(--brand-text)",
                    fontWeight: 500,
                  }}
                >
                  E-mail
                </label>
                <span
                  className="rounded-full px-2 py-0.5"
                  style={{
                    background: "var(--brand-chip-bg)",
                    color: "var(--brand-text-faint)",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                >
                  OPCIONAL
                </span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => touch("email")}
                placeholder="paciente@email.com"
                maxLength={45}
                className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
                style={
                  touched.email && !emailOk ? errorInputStyle : inputStyle
                }
              />
              {touched.email && !emailOk && (
                <div style={errorTextStyle}>
                  <AlertCircle size={12} /> E-mail inválido
                </div>
              )}
              {/* Tooltip de apoio */}
              <div
                className="flex items-start gap-2 mt-2 rounded-xl px-3 py-2.5"
                style={{
                  background: "var(--brand-cyan-soft)",
                  border: "1px solid var(--brand-cyan)",
                }}
              >
                <Info
                  size={14}
                  style={{ color: "var(--brand-cyan)", flexShrink: 0, marginTop: 1 }}
                />
                <span
                  style={{
                    color: "var(--brand-text-muted)",
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  Preencher o e-mail permite que o paciente crie uma conta
                  para acompanhar os resultados de casa.
                </span>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <button
            onClick={handleSave}
            disabled={!formValid || saving}
            className="w-full mt-6 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              height: 52,
              background:
                formValid && !saving
                  ? "var(--brand-accent-grad)"
                  : "var(--brand-border)",
              color:
                formValid && !saving
                  ? "#FFFFFF"
                  : "var(--brand-text-faint)",
              fontSize: 15,
              fontWeight: 600,
              cursor: formValid && !saving ? "pointer" : "not-allowed",
              opacity: formValid && !saving ? 1 : 0.7,
            }}
          >
            {saving && <Loader2 size={18} className="animate-spin" />}
            {saving
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Adicionar paciente"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
