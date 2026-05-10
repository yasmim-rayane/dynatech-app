import { Hand, Zap, Bluetooth, Bell, Plus } from "lucide-react";

export function HomeScreen({
  onOpenNotifications,
  onStartMeasurement,
}: {
  onOpenNotifications: () => void;
  onStartMeasurement: () => void;
}) {
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
