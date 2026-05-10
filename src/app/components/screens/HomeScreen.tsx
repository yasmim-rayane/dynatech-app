import { useState } from "react";
import { createPortal } from "react-dom";
import { Hand, Zap, Bluetooth, Bell, Plus, HelpCircle, X, ShieldCheck } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export function HomeScreen({
  onOpenNotifications,
  onStartMeasurement,
}: {
  onOpenNotifications: () => void;
  onStartMeasurement: () => void;
}) {
  const [showHealthyInfo, setShowHealthyInfo] = useState(false);
  const { theme } = useTheme();

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
              Olá, boa tarde 👋
            </p>
            <h1 style={{ color: "var(--brand-on-header)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Maria Silva
            </h1>
          </div>
          <button
            onClick={onOpenNotifications}
            className="relative w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ background: "var(--brand-on-header-chip)" }}
          >
            <Bell size={18} style={{ color: "var(--brand-on-header)" }} />
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulseGlow"
              style={{ background: "var(--brand-emerald)" }}
            />
          </button>
        </div>

        <div
          className="mt-5 flex items-center gap-2 rounded-full px-3 py-2 w-fit animate-fadeIn"
          style={{ background: "var(--brand-emerald-soft)", animationDelay: "0.2s" }}
        >
          <Bluetooth size={14} style={{ color: "var(--brand-emerald)" }} />
          <span style={{ color: "var(--brand-emerald)", fontSize: 12, fontWeight: 600 }}>
            Dyna Tech Grip · Conectado
          </span>
        </div>
      </div>

      {/* Cards area */}
      <div className="px-5 -mt-14 space-y-4 pb-6">
        {/* Palmar — Mão Direita e Esquerda lado a lado */}
        <div className="grid grid-cols-2 gap-3 animate-fadeSlideUp" style={{ animationDelay: "0.1s" }}>
          <MiniMeasurementCard label="Palmar Direita" value="42.5" unit="kgf" delta="+3.2" Icon={Hand} accentVar="--brand-emerald" />
          <MiniMeasurementCard label="Palmar Esquerda" value="39.1" unit="kgf" delta="+2.1" Icon={Hand} accentVar="--brand-emerald" mirror />
        </div>

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
            {[
              { finger: "Indicador", value: "8.7", delta: "+0.4" },
              { finger: "Médio", value: "7.9", delta: "+0.3" },
              { finger: "Anelar", value: "6.5", delta: "+0.2" },
              { finger: "Mínimo", value: "5.1", delta: "+0.1" },
            ].map((f) => (
              <div key={f.finger} className="rounded-xl p-3" style={{ background: "var(--brand-chip-bg)" }}>
                <div style={{ color: "var(--brand-text-muted)", fontSize: 11, fontWeight: 500 }}>{f.finger}</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 700 }}>{f.value}</span>
                  <span style={{ color: "var(--brand-text-muted)", fontSize: 10 }}>kgf</span>
                </div>
                <span style={{ color: "var(--brand-cyan)", fontSize: 11, fontWeight: 600 }}>{f.delta} kgf</span>
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
                <div style={{ color: "var(--brand-text-faint)", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em" }}>PALMAR DIR.</div>
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
          
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="text-center">
              <div style={{ color: "var(--brand-text)", fontSize: 20, fontWeight: 700 }}>42.5 <span style={{ fontSize: 12, fontWeight: 500, color: "var(--brand-text-muted)" }}>kgf</span></div>
              <div style={{ color: "var(--brand-emerald)", fontSize: 12, fontWeight: 600 }}>Você</div>
            </div>
            
            <div className="flex-1 flex items-center px-4">
              <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "var(--brand-chip-bg)" }}>
                <div className="h-full rounded-full" style={{ background: "var(--brand-emerald)", width: "85%" }} />
              </div>
            </div>

            <div className="text-center">
              <div style={{ color: "var(--brand-text)", fontSize: 20, fontWeight: 700 }}>50.0 <span style={{ fontSize: 12, fontWeight: 500, color: "var(--brand-text-muted)" }}>kgf</span></div>
              <div style={{ color: "var(--brand-text-muted)", fontSize: 12, fontWeight: 600 }}>Alvo</div>
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
              { side: "Direita", sessions: "6", avg: "41.2", peak: "44.8" },
              { side: "Esquerda", sessions: "6", avg: "38.0", peak: "41.5" },
            ].map((h) => (
              <div key={h.side} className="rounded-xl p-3" style={{ background: "var(--brand-chip-bg)" }}>
                <div style={{ color: "var(--brand-text)", fontSize: 12, fontWeight: 600 }} className="mb-1.5">Mão {h.side}</div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ l: "Sessões", v: h.sessions, u: "" }, { l: "Média", v: h.avg, u: "kgf" }, { l: "Pico", v: h.peak, u: "kgf" }].map((s) => (
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
              { finger: "Indicador", sessions: "3", avg: "8.5", peak: "9.2" },
              { finger: "Médio", sessions: "2", avg: "7.8", peak: "8.3" },
              { finger: "Anelar", sessions: "2", avg: "6.4", peak: "6.9" },
              { finger: "Mínimo", sessions: "1", avg: "5.1", peak: "5.4" },
            ].map((f) => (
              <div key={f.finger} className="rounded-xl p-3" style={{ background: "var(--brand-chip-bg)" }}>
                <div style={{ color: "var(--brand-text)", fontSize: 12, fontWeight: 600 }} className="mb-1.5">{f.finger}</div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ l: "Sessões", v: f.sessions, u: "" }, { l: "Média", v: f.avg, u: "kgf" }, { l: "Pico", v: f.peak, u: "kgf" }].map((s) => (
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
                Os valores de referência (Alvo) apresentados no aplicativo são calculados com base em sua <strong>idade</strong>, <strong>peso</strong>, <strong>altura</strong> e <strong>gênero</strong>.
              </p>
              
              <p style={{ color: "var(--brand-text-muted)", fontSize: 14, lineHeight: 1.6 }}>
                Eles refletem médias normativas validadas por estudos científicos e são amplamente utilizados na medicina esportiva e na fisioterapia para diagnosticar força muscular e detectar compensações e desbalanços.
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
