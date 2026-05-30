import { useState, useEffect } from "react";
import { Hand, Zap, Bell, TrendingUp, ShieldCheck, Activity } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useAppNotifications } from "../contexts/NotificationsContext";
import { MOCK_PATIENT_RESULTS } from "../services/mockData";
import type { ResultResponse } from "../services/api";

export function PatientHomeScreen({
  onOpenNotifications,
}: {
  onOpenNotifications: () => void;
}) {
  const { user } = useAuth();
  const { unreadCount } = useAppNotifications();
  const [lastResult, setLastResult] = useState<ResultResponse | null>(null);
  const [allResults, setAllResults] = useState<ResultResponse[]>([]);

  useEffect(() => {
    // Usa resultados mockados para o paciente
    setAllResults(MOCK_PATIENT_RESULTS);
    if (MOCK_PATIENT_RESULTS.length > 0) {
      setLastResult(MOCK_PATIENT_RESULTS[0]);
    }
  }, []);

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
      </div>
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
