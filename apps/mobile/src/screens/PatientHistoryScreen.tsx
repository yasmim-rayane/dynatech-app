import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FileText } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { MOCK_PATIENT_RESULTS } from "../services/mockData";
import type { ResultResponse } from "../services/api";

type ForceType = "palmar" | "pinca";
type PalmarSub = "direita" | "esquerda";
type PincaSub = "indicador" | "medio" | "anelar" | "minimo";
type PincaHand = "direita" | "esquerda";

const PALMAR_SUBS: { key: PalmarSub; label: string }[] = [
  { key: "direita", label: "Mão Direita" },
  { key: "esquerda", label: "Mão Esquerda" },
];
const PINCA_SUBS: { key: PincaSub; label: string }[] = [
  { key: "indicador", label: "Indicador" },
  { key: "medio", label: "Médio" },
  { key: "anelar", label: "Anelar" },
  { key: "minimo", label: "Mínimo" },
];
const PINCA_HANDS: { key: PincaHand; label: string }[] = [
  { key: "direita", label: "Mão Direita" },
  { key: "esquerda", label: "Mão Esquerda" },
];

export function PatientHistoryScreen() {
  const [type, setType] = useState<ForceType>("palmar");
  const [palmarSub, setPalmarSub] = useState<PalmarSub>("direita");
  const [pincaHand, setPincaHand] = useState<PincaHand>("direita");
  const [pincaSub, setPincaSub] = useState<PincaSub>("indicador");
  const [range, setRange] = useState<"15" | "30" | "60">("30");
  const { theme } = useTheme();
  const [allResults, setAllResults] = useState<ResultResponse[]>([]);

  useEffect(() => {
    setAllResults(MOCK_PATIENT_RESULTS);
  }, []);

  const grid = theme === "dark" ? "#1F2A44" : "#E2E8F0";
  const tick = theme === "dark" ? "#94A3B8" : "#94A3B8";
  const accentColor = type === "palmar" ? "var(--brand-emerald)" : "var(--brand-cyan)";
  const accentSoft = type === "palmar" ? "var(--brand-emerald-soft)" : "var(--brand-cyan-soft)";

  function getResultValue(r: ResultResponse): number | null {
    if (type === "palmar") {
      const val = palmarSub === "direita" ? r.palmMaxD : r.palmMaxE;
      return val && val > 0 ? val : null;
    }
    const fingerMap: Record<PincaSub, string> = { indicador: "1", medio: "2", anelar: "3", minimo: "4" };
    const idx = fingerMap[pincaSub];
    const key = `pinchMax${pincaHand === "direita" ? "D" : "E"}${idx}` as keyof ResultResponse;
    const val = r[key] as number | null;
    return val && val > 0 ? val : null;
  }

  const filteredResults = useMemo(() => {
    const now = new Date();
    const days = range === "15" ? 15 : range === "30" ? 30 : 60;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return allResults.filter((r) => new Date(r.examDate) >= cutoff);
  }, [allResults, range]);

  const currentData = useMemo(() => {
    return filteredResults
      .map((r) => {
        const v = getResultValue(r);
        if (v == null) return null;
        const d = new Date(r.examDate);
        const name = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
        return { name, v };
      })
      .filter(Boolean) as { name: string; v: number }[];
  }, [filteredResults, type, palmarSub, pincaHand, pincaSub]);

  const list = useMemo(() => {
    return filteredResults
      .map((r) => {
        const v = getResultValue(r);
        if (v == null) return null;
        const d = new Date(r.examDate);
        const date = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
        const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
        const subLabel =
          type === "palmar"
            ? palmarSub === "direita"
              ? "Palmar Direita"
              : "Palmar Esquerda"
            : `Pinça ${PINCA_SUBS.find((s) => s.key === pincaSub)!.label} (${pincaHand === "direita" ? "Dir." : "Esq."})`;
        return { date, time, label: subLabel, value: v };
      })
      .filter(Boolean) as { date: string; time: string; label: string; value: number }[];
  }, [filteredResults, type, palmarSub, pincaHand, pincaSub]);

  const average = currentData.length > 0 ? currentData.reduce((acc, curr) => acc + curr.v, 0) / currentData.length : 0;

  return (
    <div className="min-h-full w-full" style={{ background: "var(--brand-card)" }}>
      <div className="px-6 pt-6 animate-fadeSlideDown">
        <h1 style={{ color: "var(--brand-text)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Histórico
        </h1>
        <p style={{ color: "var(--brand-text-muted)", fontSize: 14 }} className="mt-1">
          Acompanhe sua evolução ao longo do tempo
        </p>

        {/* Tipo Toggle */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={() => setType("palmar")}
            className="flex-1 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-sm"
            style={{
              background: type === "palmar" ? accentColor : "var(--brand-chip-bg)",
              color: type === "palmar" ? "#fff" : "var(--brand-text-muted)",
            }}
          >
            Preensão Palmar
          </button>
          <button
            onClick={() => setType("pinca")}
            className="flex-1 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-sm"
            style={{
              background: type === "pinca" ? accentColor : "var(--brand-chip-bg)",
              color: type === "pinca" ? "#fff" : "var(--brand-text-muted)",
            }}
          >
            Força de Pinça
          </button>
        </div>

        {/* Sub-type chips */}
        {type === "palmar" ? (
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
            {PALMAR_SUBS.map((s) => (
              <button
                key={s.key}
                onClick={() => setPalmarSub(s.key)}
                className="px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  background: palmarSub === s.key ? accentSoft : "var(--brand-chip-bg)",
                  color: palmarSub === s.key ? accentColor : "var(--brand-text-muted)",
                  border: palmarSub === s.key ? `1.5px solid ${accentColor}` : "1.5px solid transparent",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
              {PINCA_HANDS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setPincaHand(s.key)}
                  className="px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    background: pincaHand === s.key ? accentSoft : "var(--brand-chip-bg)",
                    color: pincaHand === s.key ? accentColor : "var(--brand-text-muted)",
                    border: pincaHand === s.key ? `1.5px solid ${accentColor}` : "1.5px solid transparent",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
              {PINCA_SUBS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setPincaSub(s.key)}
                  className="px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    background: pincaSub === s.key ? "var(--brand-chip-bg)" : "transparent",
                    color: pincaSub === s.key ? accentColor : "var(--brand-text-muted)",
                    border: pincaSub === s.key ? `1.5px solid ${accentColor}` : "1.5px solid var(--brand-border-soft)",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Range selector — sem "Período" customizado para paciente */}
        <div className="flex p-1 rounded-xl mt-4" style={{ background: "var(--brand-chip-bg)" }}>
          {(["15", "30", "60"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="flex-1 py-2 rounded-lg transition-all duration-200"
              style={{
                background: range === r ? "var(--brand-card)" : "transparent",
                color: range === r ? "var(--brand-text)" : "var(--brand-text-muted)",
                fontSize: 13,
                fontWeight: 600,
                boxShadow: range === r ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
              }}
            >
              {r} dias
            </button>
          ))}
        </div>

        {/* Chart */}
        <div
          className="mt-5 rounded-2xl p-4 shadow-sm animate-fadeSlideUp"
          style={{
            background: "var(--brand-card)",
            border: "1px solid var(--brand-border-soft)",
          }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div style={{ color: "var(--brand-text-faint)", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em" }}>
                MÉDIA NO PERÍODO
              </div>
              <div style={{ color: "var(--brand-text)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {average.toFixed(1)}{" "}
                <span style={{ fontSize: 14, color: "var(--brand-text-muted)", fontWeight: 500 }}>kgf</span>
              </div>
            </div>
          </div>
          <div style={{ height: 200 }}>
            {currentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tick, fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div
                            style={{
                              background: "var(--brand-card)",
                              border: "1px solid var(--brand-border-soft)",
                              borderRadius: 8,
                              padding: "8px 12px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                            }}
                          >
                            <p style={{ margin: 0, fontSize: 11, color: "var(--brand-text-faint)", fontWeight: 600 }}>
                              {String(label).toUpperCase()}
                            </p>
                            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: accentColor, marginTop: 2 }}>
                              {Number(payload[0].value).toFixed(1)} kgf
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={accentColor}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: accentColor }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-4">
                <FileText size={36} style={{ color: "var(--brand-border-soft)", marginBottom: 12 }} />
                <span style={{ color: "var(--brand-text-muted)", fontSize: 15, fontWeight: 500, lineHeight: 1.4 }}>
                  Nenhum dado encontrado.<br />Aguarde o seu profissional realizar medições.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <h3 style={{ color: "var(--brand-text)", fontSize: 16, fontWeight: 600 }} className="mt-6 mb-3">
          Medições recentes
        </h3>

        <div className="space-y-2 pb-6">
          {list.length === 0 ? (
            <div className="text-center py-8">
              <span style={{ color: "var(--brand-text-muted)", fontSize: 14 }}>
                Sem medições neste período.
              </span>
            </div>
          ) : (
            list.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 animate-fadeSlideUp"
                style={{
                  background: "var(--brand-card)",
                  border: "1px solid var(--brand-border-soft)",
                  animationDelay: `${0.1 * i}s`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--brand-chip-bg)" }}
                  >
                    <span style={{ color: "var(--brand-text)", fontSize: 12, fontWeight: 700 }}>{item.date}</span>
                  </div>
                  <div>
                    <div style={{ color: "var(--brand-text)", fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ color: "var(--brand-text-faint)", fontSize: 12 }}>{item.time}</div>
                  </div>
                </div>
                <div style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 700 }}>
                  {Number(item.value).toFixed(1)}{" "}
                  <span style={{ fontSize: 12, color: "var(--brand-text-muted)" }}>kgf</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
