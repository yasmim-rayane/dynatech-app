import { useState, useEffect } from "react";
import { Hand, Zap, Bell, TrendingUp, ShieldCheck, Activity, Info, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useAppNotifications } from "../contexts/NotificationsContext";
import * as api from "../services/api";
import type { ResultResponse } from "../services/api";

const GRIP_NORMS: [number, number, number, number, number][] = [
  // idade  H_dir  H_esq  M_dir  M_esq
  [  20,    47.0,  43.2,  28.2,  25.6 ],
  [  25,    47.1,  44.0,  28.9,  26.4 ],
  [  30,    47.1,  44.6,  28.7,  26.0 ],
  [  35,    47.1,  44.6,  28.3,  25.7 ],
  [  40,    45.3,  43.5,  27.2,  25.3 ],
  [  45,    43.3,  41.0,  26.2,  24.1 ],
  [  50,    42.5,  40.0,  25.1,  22.5 ],
  [  55,    40.0,  37.0,  23.5,  20.8 ],
  [  60,    36.8,  34.7,  22.5,  20.0 ],
  [  65,    34.7,  32.6,  20.3,  18.0 ],
  [  70,    31.5,  28.4,  18.4,  16.2 ],
  [  75,    25.6,  22.4,  15.4,  13.3 ],
];

function calculateAge(dobIso: string | undefined) {
  if (!dobIso) return null;
  const birthDate = new Date(dobIso);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function getNorms(age: number | null, gender: string | undefined) {
  if (age == null || !gender || (gender !== 'm' && gender !== 'f')) return null;
  let matchRow = GRIP_NORMS[0];
  for (const row of GRIP_NORMS) {
    if (age >= row[0]) {
      matchRow = row;
    } else {
      break;
    }
  }
  return {
    dir: gender === 'm' ? matchRow[1] : matchRow[3],
    esq: gender === 'm' ? matchRow[2] : matchRow[4],
  };
}

export function PatientHomeScreen({
  onOpenNotifications,
}: {
  onOpenNotifications: () => void;
}) {
  const { user, email } = useAuth();
  const { unreadCount } = useAppNotifications();
  const [lastResult, setLastResult] = useState<ResultResponse | null>(null);
  const [allResults, setAllResults] = useState<ResultResponse[]>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    if (!email) return;
    // Carrega resultados reais do backend
    api.getAllResults(email).then((results) => {
      setAllResults(results);
      if (results.length > 0) {
        setLastResult(results[0]);
      }
    }).catch((e) => {
      console.error("Erro ao carregar resultados do paciente:", e);
    });
  }, [email]);

  const userName = user?.name ?? "Paciente";
  const firstName = userName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  // Dados da última medição
  const palmD = lastResult?.palmMaxD;
  const palmE = lastResult?.palmMaxE;
  const pinchD = [
    { finger: "Indicador", value: lastResult?.pinchMaxD1 },
    { finger: "Médio", value: lastResult?.pinchMaxD2 },
    { finger: "Anelar", value: lastResult?.pinchMaxD3 },
    { finger: "Mínimo", value: lastResult?.pinchMaxD4 },
  ];

  // Calcula evolução (comparação com penúltima medição)
  const prevResult = allResults.length > 1 ? allResults[1] : null;
  function getEvolution(current: number | null | undefined, previous: number | null | undefined): string {
    if (current == null || previous == null || previous === 0) return "";
    const diff = current - previous;
    const pct = ((diff / previous) * 100).toFixed(1);
    return diff >= 0 ? `+${pct}%` : `${pct}%`;
  }

  // Última data de medição
  const lastDate = lastResult
    ? (() => {
        const d = new Date(lastResult.examDate);
        return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
      })()
    : "--";

  const age = calculateAge(user?.dataNascimento);
  const norms = getNorms(age, user?.genero);

  return (
    <div
      className="min-h-full w-full"
      style={{ background: "var(--brand-card)" }}
    >
      {/* Header — simplificado, sem Bluetooth */}
      <div
        className="px-6 pt-6 pb-16 rounded-b-[2rem]"
        style={{ background: "var(--brand-header-grad)" }}
      >
        <div className="flex items-center justify-between animate-fadeSlideDown">
          <div>
            <p
              style={{
                color: "var(--brand-on-header-muted)",
                fontSize: 14,
              }}
            >
              {greeting} 👋
            </p>
            <h1
              style={{
                color: "var(--brand-on-header)",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              {userName}
            </h1>
          </div>
          <button
            onClick={onOpenNotifications}
            className="relative w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ background: "var(--brand-on-header-chip)" }}
          >
            <Bell size={18} style={{ color: "var(--brand-on-header)" }} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center rounded-full animate-pulseGlow"
                style={{
                  background: "var(--brand-danger, #ef4444)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Badge de status */}
        <div
          className="mt-4 flex items-center gap-2 rounded-full px-3 py-2 w-fit animate-fadeIn"
          style={{
            background: "var(--brand-emerald-soft)",
            animationDelay: "0.2s",
          }}
        >
          <ShieldCheck
            size={14}
            style={{ color: "var(--brand-emerald)" }}
          />
          <span
            style={{
              color: "var(--brand-emerald)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Resultados atualizados pelo seu profissional
          </span>
        </div>
      </div>

      {/* Cards area */}
      <div className="px-5 -mt-10 space-y-4 pb-6">
        {/* Info da última medição */}
        <div
          className="rounded-2xl p-4 shadow-md animate-fadeSlideUp"
          style={{
            background: "var(--brand-card)",
            border: "1px solid var(--brand-border-soft)",
            animationDelay: "0.05s",
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Activity
                size={16}
                style={{ color: "var(--brand-emerald)" }}
              />
              <span
                style={{
                  color: "var(--brand-text)",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Última medição
              </span>
            </div>
            <span
              className="rounded-full px-2.5 py-1"
              style={{
                background: "var(--brand-chip-bg)",
                color: "var(--brand-text-muted)",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {lastDate}
            </span>
          </div>
        </div>

        {/* Palmar — Cards grandes e legíveis */}
        <div
          className="grid grid-cols-2 gap-3 animate-fadeSlideUp"
          style={{ animationDelay: "0.1s" }}
        >
          <BigValueCard
            label="Palmar Direita"
            value={palmD != null ? palmD.toFixed(1) : "--"}
            unit="kgf"
            evolution={getEvolution(palmD, prevResult?.palmMaxD)}
            Icon={Hand}
            accentColor="var(--brand-emerald)"
            accentSoft="var(--brand-emerald-soft)"
          />
          <BigValueCard
            label="Palmar Esquerda"
            value={palmE != null ? palmE.toFixed(1) : "--"}
            unit="kgf"
            evolution={getEvolution(palmE, prevResult?.palmMaxE)}
            Icon={Hand}
            accentColor="var(--brand-emerald)"
            accentSoft="var(--brand-emerald-soft)"
            mirror
          />
        </div>

        {/* Pinça — por dedo */}
        <div
          className="rounded-2xl p-4 shadow-md animate-fadeSlideUp"
          style={{
            background: "var(--brand-card)",
            border: "1px solid var(--brand-border-soft)",
            animationDelay: "0.2s",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "var(--brand-cyan-soft)" }}
            >
              <Zap size={20} style={{ color: "var(--brand-cyan)" }} />
            </div>
            <div>
              <div
                style={{
                  color: "var(--brand-text-faint)",
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                }}
              >
                ÚLTIMA MEDIÇÃO
              </div>
              <div
                style={{
                  color: "var(--brand-text)",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                Força de Pinça
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {pinchD.map((f) => (
              <div
                key={f.finger}
                className="rounded-xl p-3.5"
                style={{ background: "var(--brand-chip-bg)" }}
              >
                <div
                  style={{
                    color: "var(--brand-text-muted)",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {f.finger}
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span
                    style={{
                      color: "var(--brand-text)",
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    {f.value != null ? f.value.toFixed(1) : "--"}
                  </span>
                  <span
                    style={{
                      color: "var(--brand-text-muted)",
                      fontSize: 11,
                    }}
                  >
                    kgf
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo de evolução */}
        <div
          className="rounded-2xl p-4 shadow-md animate-fadeSlideUp"
          style={{
            background: "var(--brand-card)",
            border: "1px solid var(--brand-border-soft)",
            animationDelay: "0.3s",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp
              size={16}
              style={{ color: "var(--brand-emerald)" }}
            />
            <span
              style={{
                color: "var(--brand-text)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Sua evolução
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Medições",
                value: String(allResults.length),
                unit: "",
              },
              {
                label: "Melhor Palmar",
                value:
                  allResults.length > 0
                    ? Math.max(
                        ...allResults.map((r) =>
                          Math.max(r.palmMaxD ?? 0, r.palmMaxE ?? 0),
                        ),
                      ).toFixed(1)
                    : "--",
                unit: "kgf",
              },
              {
                label: "Última vs Anterior",
                value: palmD != null && prevResult?.palmMaxD != null
                  ? (palmD - prevResult.palmMaxD >= 0 ? "+" : "") +
                    (palmD - prevResult.palmMaxD).toFixed(1)
                  : "--",
                unit: "kgf",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3 text-center"
                style={{ background: "var(--brand-chip-bg)" }}
              >
                <div
                  className="flex items-baseline justify-center gap-0.5"
                  style={{ minHeight: 28 }}
                >
                  <span
                    style={{
                      color: "var(--brand-text)",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {s.value}
                  </span>
                  {s.unit && (
                    <span
                      style={{
                        color: "var(--brand-text-muted)",
                        fontSize: 10,
                      }}
                    >
                      {s.unit}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    color: "var(--brand-text-muted)",
                    fontSize: 11,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparativo Normativo */}
        {norms && (palmD != null || palmE != null) && (
          <div
            className="rounded-2xl p-4 shadow-md animate-fadeSlideUp relative"
            style={{
              background: "var(--brand-card)",
              border: "1px solid var(--brand-border-soft)",
              animationDelay: "0.4s",
            }}
          >
            <button
              onClick={() => setShowInfoModal(true)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-transform active:scale-90"
              style={{ background: "var(--brand-chip-bg)" }}
            >
              <Info size={16} style={{ color: "var(--brand-text-muted)" }} />
            </button>

            <div className="flex items-center gap-2 mb-4 pr-10">
              <ShieldCheck
                size={16}
                style={{ color: "var(--brand-blue)" }}
              />
              <span
                style={{
                  color: "var(--brand-text)",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Comparativo (Dados Saudáveis)
              </span>
            </div>

            <div className="space-y-4">
              {palmD != null && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--brand-text-muted)", fontWeight: 500 }}>Direita</span>
                    <span style={{ color: "var(--brand-text-muted)" }}>Sua: {palmD.toFixed(1)} / Ref: {norms.dir.toFixed(1)} kgf</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--brand-border-soft)" }}>
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min((palmD / norms.dir) * 100, 100)}%`,
                        background: palmD >= norms.dir ? "var(--brand-emerald)" : (palmD >= norms.dir * 0.8 ? "var(--brand-accent)" : "var(--brand-danger)")
                      }}
                    />
                  </div>
                </div>
              )}
              {palmE != null && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--brand-text-muted)", fontWeight: 500 }}>Esquerda</span>
                    <span style={{ color: "var(--brand-text-muted)" }}>Sua: {palmE.toFixed(1)} / Ref: {norms.esq.toFixed(1)} kgf</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "var(--brand-border-soft)" }}>
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min((palmE / norms.esq) * 100, 100)}%`,
                        background: palmE >= norms.esq ? "var(--brand-emerald)" : (palmE >= norms.esq * 0.8 ? "var(--brand-accent)" : "var(--brand-danger)")
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Informação Normativa */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div 
            className="w-full max-w-sm rounded-3xl p-6 animate-scaleIn relative"
            style={{ background: "var(--brand-card)", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}
          >
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-transform active:scale-90"
              style={{ background: "var(--brand-chip-bg)" }}
            >
              <X size={18} style={{ color: "var(--brand-text)" }} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--brand-blue-soft)" }}>
                <Info size={20} style={{ color: "var(--brand-blue)" }} />
              </div>
              <h3 style={{ color: "var(--brand-text)", fontSize: 16, fontWeight: 700 }}>Sobre os Dados</h3>
            </div>
            <div className="space-y-3" style={{ color: "var(--brand-text-muted)", fontSize: 13, lineHeight: 1.5 }}>
              <p>
                Os valores de referência apresentados representam a força de preensão palmar (kgf) média de indivíduos saudáveis, medidos com o dinamômetro padrão.
              </p>
              <p>
                Eles são calculados com base em sua <strong>idade ({age} anos)</strong> e <strong>gênero</strong>.
              </p>
              <div className="mt-4 p-3 rounded-xl" style={{ background: "var(--brand-chip-bg)", fontSize: 12 }}>
                <strong style={{ color: "var(--brand-text)" }}>Fontes Principais:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Bohannon et al. (2006) — Meta-análise descritiva</li>
                  <li>Caporrino et al. (1998) — População brasileira</li>
                  <li>Hogrel (2015) — Dados normativos 5–80 anos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Card de valor grande (otimizado para idosos) ────────── */

function BigValueCard({
  label,
  value,
  unit,
  evolution,
  Icon,
  accentColor,
  accentSoft,
  mirror,
}: {
  label: string;
  value: string;
  unit: string;
  evolution: string;
  Icon: typeof Hand;
  accentColor: string;
  accentSoft: string;
  mirror?: boolean;
}) {
  const isPositive = evolution.startsWith("+");
  return (
    <div
      className="rounded-2xl p-4 shadow-md"
      style={{
        background: "var(--brand-card)",
        border: "1px solid var(--brand-border-soft)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: accentSoft }}
        >
          <Icon
            size={18}
            style={{
              color: accentColor,
              transform: mirror ? "scaleX(-1)" : "none",
            }}
          />
        </div>
      </div>
      <div
        style={{
          color: "var(--brand-text-muted)",
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span
          style={{
            color: "var(--brand-text)",
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {value}
        </span>
        <span
          style={{ color: "var(--brand-text-muted)", fontSize: 12 }}
        >
          {unit}
        </span>
      </div>
      {evolution && (
        <span
          className="inline-block mt-2 rounded-full px-2 py-0.5"
          style={{
            background: isPositive
              ? "var(--brand-emerald-soft)"
              : "var(--brand-danger-soft)",
            color: isPositive
              ? "var(--brand-emerald)"
              : "var(--brand-danger)",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {evolution}
        </span>
      )}
    </div>
  );
}
