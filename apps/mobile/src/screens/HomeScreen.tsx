import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Hand, Zap, Bluetooth, Bell, Plus, HelpCircle, X, ShieldCheck } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useAppNotifications } from "../contexts/NotificationsContext";
import * as api from "../services/api";
import type { ResultResponse, WeeklyStatsResponse } from "../services/api";
import { BleService } from "../services/ble/BleService";

export function HomeScreen({
  onOpenNotifications,
  onStartMeasurement,
  onOpenPairing,
}: {
  onOpenNotifications: () => void;
  onStartMeasurement: () => void;
  onOpenPairing: () => void;
}) {
  const [showHealthyInfo, setShowHealthyInfo] = useState(false);
  const { theme } = useTheme();
<<<<<<< Updated upstream
  const { user, email } = useAuth();
  const [lastResult, setLastResult] = useState<ResultResponse | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStatsResponse | null>(null);
  const [weeklyResults, setWeeklyResults] = useState<ResultResponse[]>([]);
=======
  const { user, doctorData } = useAuth();
  const { unreadCount, addNotification } = useAppNotifications();
>>>>>>> Stashed changes
  const [connected, setConnected] = useState(BleService.isConnected());
  const { unreadCount } = useAppNotifications();

  useEffect(() => {
    BleService.onConnectionStateChange((state) => {
      setConnected(state);
    });
  }, []);

  useEffect(() => {
    if (!email) return;
    api.getLastResults(email, 1).then(r => { if (r.length > 0) setLastResult(r[0]); }).catch(() => {});
    api.getWeeklyStats(email, 1).then(s => { if (s.length > 0) setWeeklyStats(s[0]); }).catch(() => {});

    // Busca resultados da última semana para contagem individual por campo
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().slice(0, 19); // "YYYY-MM-DDTHH:mm:ss"
    api.getDateRangeResults(email, fmt(weekAgo), fmt(now))
      .then(setWeeklyResults)
      .catch(() => setWeeklyResults([]));
  }, [email]);

<<<<<<< Updated upstream
  /** Conta quantos resultados da semana tiveram um campo específico > 0 */
  function countSessions(field: keyof ResultResponse): number {
    return weeklyResults.filter(r => {
      const v = r[field] as number | null;
      return v != null && v > 0;
    }).length;
  }

  const userName = user?.name ?? "Usuário";
=======
  const userName = doctorData?.name || user?.name || "Profissional";
>>>>>>> Stashed changes
  const firstName = userName.split(" ")[0];

  // Hora do dia para saudação
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  /**
   * Tabela normativa de força de preensão palmar (kgf) — dinamômetro Jamar.
   * Fontes:
   *   • Bohannon et al. (2006) — meta-análise descritiva (EUA, Austrália, Canadá, Ucrânia, Suécia)
   *   • Caporrino et al. (1998) — população brasileira
   *   • Hogrel (2015) — PMC4460675 — dados normativos 5–80 anos
   * Cada entrada: [idadeMínima, mãoDireitaHomem, mãoEsquerdaHomem, mãoDireitaMulher, mãoEsquerdaMulher]
   */
  const GRIP_NORMS: [number, number, number, number, number][] = [
    //  idade   H_dir  H_esq  M_dir  M_esq
    [  20,      47.0,  43.2,  28.2,  25.6 ],
    [  25,      47.1,  44.0,  28.9,  26.4 ],
    [  30,      47.1,  44.6,  28.7,  26.0 ],
    [  35,      47.1,  44.6,  28.3,  25.7 ],
    [  40,      45.3,  43.5,  27.2,  25.3 ],
    [  45,      43.3,  41.0,  26.2,  24.1 ],
    [  50,      42.5,  40.0,  25.1,  22.5 ],
    [  55,      40.0,  37.0,  23.5,  20.8 ],
    [  60,      36.8,  34.7,  22.5,  20.0 ],
    [  65,      34.7,  32.6,  20.3,  18.0 ],
    [  70,      31.5,  28.4,  18.4,  16.2 ],
    [  75,      25.6,  22.4,  15.4,  13.3 ],
  ];

  function getGripReference(side: "right" | "left"): number {
    // Calcula idade
    let age = 30; // fallback
    if (user?.dataNascimento) {
      const [y, m, d] = user.dataNascimento.split("-").map(Number);
      const birth = new Date(y, m - 1, d);
      age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }
    // Gênero: "m" = masculino, qualquer outro = feminino (para referência conservadora)
    const isMale = user?.genero === "m";

    // Encontra a faixa etária mais próxima
    let row = GRIP_NORMS[0];
    for (const r of GRIP_NORMS) {
      if (age >= r[0]) row = r;
      else break;
    }

    if (isMale) return side === "right" ? row[1] : row[2];
    return side === "right" ? row[3] : row[4];
  }

  const targetGripD = getGripReference("right");
  const targetGripE = getGripReference("left");

  // Dados da última medição (com fallback)
  const palmD = lastResult?.palmMaxD;
  const palmE = lastResult?.palmMaxE;
  const pinchD = [
    { finger: "Indicador", value: lastResult?.pinchMaxD1 },
    { finger: "Médio", value: lastResult?.pinchMaxD2 },
    { finger: "Anelar", value: lastResult?.pinchMaxD3 },
    { finger: "Mínimo", value: lastResult?.pinchMaxD4 },
  ];

  return (
    <div
      className="min-h-full w-full"
      style={{ background: "var(--brand-card)" }}
    >
      {/* Header gradient */}
      <div
        className="px-6 pt-6 pb-20 rounded-b-[2rem]"
        style={{ background: "var(--brand-header-grad)" }}
      >
        <div className="flex items-center justify-between animate-fadeSlideDown">
          <div>
            <p style={{ color: "var(--brand-on-header-muted)", fontSize: 13 }}>
              Olá, {greeting} 👋
            </p>
            <h1 style={{ color: "var(--brand-on-header)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
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
                  fontWeight: 700 
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        <div
          onClick={connected ? undefined : onOpenPairing}
          className={`mt-5 flex items-center gap-2 rounded-full px-3 py-2 w-fit animate-fadeIn ${!connected ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
          style={{ 
            background: connected ? "var(--brand-emerald-soft)" : "var(--brand-danger-soft, rgba(239,68,68,0.15))", 
            animationDelay: "0.2s" 
          }}
        >
          <Bluetooth size={14} style={{ color: connected ? "var(--brand-emerald)" : "var(--brand-danger, #ef4444)" }} />
          <span style={{ color: connected ? "var(--brand-emerald)" : "var(--brand-danger, #ef4444)", fontSize: 12, fontWeight: 600 }}>
            {connected ? "Dyna Tech Grip · Conectado" : "Desconectado · Toque para parear"}
          </span>
        </div>
      </div>

      {/* Cards area */}
      <div className="px-5 -mt-14 space-y-4 pb-6">
        {/* Palmar — Mão Direita e Esquerda lado a lado */}
        <div className="grid grid-cols-2 gap-3 animate-fadeSlideUp" style={{ animationDelay: "0.1s" }}>
<<<<<<< Updated upstream
          <MiniMeasurementCard label="Palmar Direita" value={palmD != null ? palmD.toFixed(1) : "--"} unit="kgf" delta="" Icon={Hand} accentVar="--brand-emerald" />
          <MiniMeasurementCard label="Palmar Esquerda" value={palmE != null ? palmE.toFixed(1) : "--"} unit="kgf" delta="" Icon={Hand} accentVar="--brand-emerald" mirror />
        </div>
=======
          <div
            className="rounded-2xl p-4 shadow-md flex flex-col items-center justify-center text-center"
            style={{
              background: "var(--brand-card)",
              border: "1px solid var(--brand-border-soft)",
            }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: "var(--brand-emerald-soft)" }}>
              <Users size={20} style={{ color: "var(--brand-emerald)" }} />
            </div>
            <span style={{ color: "var(--brand-text)", fontSize: 24, fontWeight: 700 }}>
              {patients.filter((p) => !p.inativo).length}
            </span>
            <span style={{ color: "var(--brand-text-muted)", fontSize: 12, fontWeight: 500 }}>
              Pacientes ativos
            </span>
          </div>
>>>>>>> Stashed changes

        {/* Pinça — por dedo */}
        <div className="rounded-2xl p-4 shadow-md animate-fadeSlideUp" style={{ background: "var(--brand-card)", border: "1px solid var(--brand-border-soft)", animationDelay: "0.2s" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-chip-bg)" }}>
              <Zap size={18} style={{ color: "var(--brand-cyan)" }} />
            </div>
            <div>
              <div style={{ color: "var(--brand-text-faint)", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em" }}>ÚLTIMA MEDIÇÃO</div>
              <div style={{ color: "var(--brand-text)", fontSize: 14, fontWeight: 600 }}>Força de Pinça</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {pinchD.map((f) => (
              <div key={f.finger} className="rounded-xl p-3" style={{ background: "var(--brand-chip-bg)" }}>
                <div style={{ color: "var(--brand-text-muted)", fontSize: 11, fontWeight: 500 }}>{f.finger}</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 700 }}>{f.value != null ? f.value.toFixed(1) : "--"}</span>
                  <span style={{ color: "var(--brand-text-muted)", fontSize: 10 }}>kgf</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medição Saudável */}
        <div className="rounded-2xl p-4 shadow-md animate-fadeSlideUp" style={{ background: "var(--brand-card)", border: "1px solid var(--brand-border-soft)", animationDelay: "0.25s" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-emerald-soft)" }}>
                <ShieldCheck size={18} style={{ color: "var(--brand-emerald)" }} />
              </div>
              <div>
                <div style={{ color: "var(--brand-text)", fontSize: 14, fontWeight: 600 }}>Medição Saudável</div>
                <div style={{ color: "var(--brand-text-faint)", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em" }}>PREENSÃO PALMAR</div>
              </div>
            </div>
            <button
              onClick={() => setShowHealthyInfo(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform"
              style={{ background: "var(--brand-chip-bg)" }}
            >
              <HelpCircle size={16} style={{ color: "var(--brand-text-muted)" }} />
            </button>
          </div>
          
          {/* Mão Direita */}
          <div className="rounded-xl p-3 mb-2" style={{ background: "var(--brand-chip-bg)" }}>
            <div style={{ color: "var(--brand-text-muted)", fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Mão Direita</div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 700 }}>{palmD != null && palmD > 0 ? palmD.toFixed(1) : "--"} <span style={{ fontSize: 11, fontWeight: 500, color: "var(--brand-text-muted)" }}>kgf</span></div>
                <div style={{ color: "var(--brand-emerald)", fontSize: 11, fontWeight: 600 }}>Você</div>
              </div>
              <div className="flex-1 flex items-center px-3">
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "var(--brand-card)" }}>
                  <div className="h-full rounded-full" style={{ background: "var(--brand-emerald)", width: palmD != null && palmD > 0 ? `${Math.min(100, (palmD / targetGripD) * 100)}%` : "0%" }} />
                </div>
              </div>
              <div className="text-center">
                <div style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 700 }}>{targetGripD.toFixed(1)} <span style={{ fontSize: 11, fontWeight: 500, color: "var(--brand-text-muted)" }}>kgf</span></div>
                <div style={{ color: "var(--brand-text-muted)", fontSize: 11, fontWeight: 600 }}>Alvo</div>
              </div>
            </div>
          </div>

          {/* Mão Esquerda */}
          <div className="rounded-xl p-3" style={{ background: "var(--brand-chip-bg)" }}>
            <div style={{ color: "var(--brand-text-muted)", fontSize: 11, fontWeight: 600, marginBottom: 6 }}>Mão Esquerda</div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 700 }}>{palmE != null && palmE > 0 ? palmE.toFixed(1) : "--"} <span style={{ fontSize: 11, fontWeight: 500, color: "var(--brand-text-muted)" }}>kgf</span></div>
                <div style={{ color: "var(--brand-emerald)", fontSize: 11, fontWeight: 600 }}>Você</div>
              </div>
              <div className="flex-1 flex items-center px-3">
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "var(--brand-card)" }}>
                  <div className="h-full rounded-full" style={{ background: "var(--brand-emerald)", width: palmE != null && palmE > 0 ? `${Math.min(100, (palmE / targetGripE) * 100)}%` : "0%" }} />
                </div>
              </div>
              <div className="text-center">
                <div style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 700 }}>{targetGripE.toFixed(1)} <span style={{ fontSize: 11, fontWeight: 500, color: "var(--brand-text-muted)" }}>kgf</span></div>
                <div style={{ color: "var(--brand-text-muted)", fontSize: 11, fontWeight: 600 }}>Alvo</div>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-fadeSlideUp" style={{ animationDelay: "0.3s" }}>
          <button onClick={onStartMeasurement} className="w-full rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] transition-transform" style={{ height: 56, background: "var(--brand-accent-grad)", color: "#FFFFFF", fontSize: 15, fontWeight: 600 }}>
            <Plus size={20} />
            Iniciar nova medição
          </button>
        </div>

        {/* Resumo Semanal — Palmar por mão */}
        <div className="rounded-2xl p-4 shadow-sm animate-fadeSlideUp" style={{ background: "var(--brand-card)", border: "1px solid var(--brand-border-soft)", animationDelay: "0.4s" }}>
          <div className="flex items-center gap-2 mb-3">
            <Hand size={16} style={{ color: "var(--brand-emerald)" }} />
            <span style={{ color: "var(--brand-text)", fontSize: 14, fontWeight: 600 }}>Resumo Semanal — Palmar</span>
          </div>
          <div className="space-y-2">
            {[
              { side: "Direita", sessions: countSessions("palmMaxD"), avg: weeklyStats?.avgPalmD != null ? weeklyStats.avgPalmD.toFixed(1) : "--", peak: weeklyStats?.maxPalmD != null ? weeklyStats.maxPalmD.toFixed(1) : "--" },
              { side: "Esquerda", sessions: countSessions("palmMaxE"), avg: weeklyStats?.avgPalmE != null ? weeklyStats.avgPalmE.toFixed(1) : "--", peak: weeklyStats?.maxPalmE != null ? weeklyStats.maxPalmE.toFixed(1) : "--" },
            ].map((h) => (
              <div key={h.side} className="rounded-xl p-3" style={{ background: "var(--brand-chip-bg)" }}>
                <div style={{ color: "var(--brand-text)", fontSize: 12, fontWeight: 600 }} className="mb-1.5">Mão {h.side}</div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ l: "Sessões", v: String(h.sessions), u: "" }, { l: "Média", v: h.avg, u: "kgf" }, { l: "Pico", v: h.peak, u: "kgf" }].map((s) => (
                    <div key={s.l} className="text-center">
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span style={{ color: "var(--brand-text)", fontSize: 15, fontWeight: 700 }}>{s.v}</span>
                        {s.u && <span style={{ color: "var(--brand-text-muted)", fontSize: 9 }}>{s.u}</span>}
                      </div>
                      <div style={{ color: "var(--brand-text-muted)", fontSize: 10 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo Semanal — Pinça por dedo */}
        <div className="rounded-2xl p-4 shadow-sm animate-fadeSlideUp" style={{ background: "var(--brand-card)", border: "1px solid var(--brand-border-soft)", animationDelay: "0.5s" }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} style={{ color: "var(--brand-cyan)" }} />
            <span style={{ color: "var(--brand-text)", fontSize: 14, fontWeight: 600 }}>Resumo Semanal — Pinça</span>
          </div>
          <div className="space-y-2">
            {[
              { finger: "Indicador", sessions: countSessions("pinchMaxD1"), avg: weeklyStats?.avgPinchD1 != null ? weeklyStats.avgPinchD1.toFixed(1) : "--", peak: weeklyStats?.maxPinchD1 != null ? weeklyStats.maxPinchD1.toFixed(1) : "--" },
              { finger: "Médio", sessions: countSessions("pinchMaxD2"), avg: weeklyStats?.avgPinchD2 != null ? weeklyStats.avgPinchD2.toFixed(1) : "--", peak: weeklyStats?.maxPinchD2 != null ? weeklyStats.maxPinchD2.toFixed(1) : "--" },
              { finger: "Anelar", sessions: countSessions("pinchMaxD3"), avg: weeklyStats?.avgPinchD3 != null ? weeklyStats.avgPinchD3.toFixed(1) : "--", peak: weeklyStats?.maxPinchD3 != null ? weeklyStats.maxPinchD3.toFixed(1) : "--" },
              { finger: "Mínimo", sessions: countSessions("pinchMaxD4"), avg: weeklyStats?.avgPinchD4 != null ? weeklyStats.avgPinchD4.toFixed(1) : "--", peak: weeklyStats?.maxPinchD4 != null ? weeklyStats.maxPinchD4.toFixed(1) : "--" },
            ].map((f) => (
              <div key={f.finger} className="rounded-xl p-3" style={{ background: "var(--brand-chip-bg)" }}>
                <div style={{ color: "var(--brand-text)", fontSize: 12, fontWeight: 600 }} className="mb-1.5">{f.finger}</div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ l: "Sessões", v: String(f.sessions), u: "" }, { l: "Média", v: f.avg, u: "kgf" }, { l: "Pico", v: f.peak, u: "kgf" }].map((s) => (
                    <div key={s.l} className="text-center">
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span style={{ color: "var(--brand-text)", fontSize: 15, fontWeight: 700 }}>{s.v}</span>
                        {s.u && <span style={{ color: "var(--brand-text-muted)", fontSize: 9 }}>{s.u}</span>}
                      </div>
                      <div style={{ color: "var(--brand-text-muted)", fontSize: 10 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal / Bottom Sheet - Explicação Medição Saudável */}
      {showHealthyInfo && typeof document !== "undefined" && createPortal(
        <div className={theme === "dark" ? "dark" : ""}>
          <div className="fixed inset-0 flex items-end justify-center sm:items-center" style={{ zIndex: 9999 }}>
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setShowHealthyInfo(false)}
            />
            
            {/* Sheet */}
            <div 
              className="relative w-full sm:w-[400px] max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-slideUp sm:animate-scaleIn"
              style={{ background: "var(--brand-card)", border: "1px solid var(--brand-border-soft)" }}
            >
              <button 
                onClick={() => setShowHealthyInfo(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                style={{ background: "var(--brand-chip-bg)" }}
              >
                <X size={18} style={{ color: "var(--brand-text)" }} />
              </button>
              
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--brand-emerald-soft)" }}>
                <ShieldCheck size={24} style={{ color: "var(--brand-emerald)" }} />
              </div>
              
              <h2 style={{ color: "var(--brand-text)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }} className="mb-2">
                Medição Saudável
              </h2>
              
              <p style={{ color: "var(--brand-text-muted)", fontSize: 14, lineHeight: 1.6 }} className="mb-4">
                Os valores de referência (Alvo) são baseados em tabelas normativas validadas cientificamente, considerando sua <strong>idade</strong> e <strong>gênero</strong>.
              </p>
              
              <p style={{ color: "var(--brand-text-muted)", fontSize: 14, lineHeight: 1.6 }} className="mb-3">
                As fontes utilizadas são:
              </p>

              <ul style={{ color: "var(--brand-text-muted)", fontSize: 13, lineHeight: 1.7, paddingLeft: 18, listStyleType: "disc" }} className="mb-4">
                <li><strong>Bohannon et al. (2006)</strong> — Meta-análise descritiva com dinamômetro Jamar em populações dos EUA, Austrália, Canadá, Ucrânia e Suécia.</li>
                <li><strong>Caporrino et al. (1998)</strong> — Estudo populacional brasileiro com dinamômetro Jamar.</li>
                <li><strong>Hogrel (2015)</strong> — Dados normativos de 5 a 80 anos, PMC4460675.</li>
              </ul>
              
              <p style={{ color: "var(--brand-text-muted)", fontSize: 14, lineHeight: 1.6 }}>
                Esses dados são amplamente utilizados na medicina esportiva e fisioterapia para diagnosticar força muscular e detectar desbalanços.
              </p>
              
              <button 
                onClick={() => setShowHealthyInfo(false)}
                className="w-full mt-6 py-3.5 rounded-xl text-white font-semibold text-[15px] active:scale-95 transition-transform shadow-md"
                style={{ background: "var(--brand-accent-grad)" }}
              >
                Entendi
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function MiniMeasurementCard({
  label,
  value,
  unit,
  delta,
  Icon,
  accentVar,
  mirror,
}: {
  label: string;
  value: string;
  unit: string;
  delta: string;
  Icon: typeof Hand;
  accentVar: string;
  mirror?: boolean;
}) {
  const accent = `var(${accentVar})`;
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
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--brand-chip-bg)" }}
        >
          <Icon
            size={16}
            style={{
              color: accent,
              transform: mirror ? "scaleX(-1)" : "none",
            }}
          />
        </div>
      </div>
      <div style={{ color: "var(--brand-text-muted)", fontSize: 11, fontWeight: 500 }}>
        {label}
      </div>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span
          style={{
            color: "var(--brand-text)",
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {value}
        </span>
        <span style={{ color: "var(--brand-text-muted)", fontSize: 11 }}>
          {unit}
        </span>
      </div>
      <span
        className="inline-block mt-1.5 rounded-full px-2 py-0.5"
        style={{
          background: "var(--brand-chip-bg)",
          color: accent,
          fontSize: 10,
          fontWeight: 600,
        }}
      >
        {delta} kgf
      </span>
    </div>
  );
}
