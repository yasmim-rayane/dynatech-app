import { Hand, Zap, Bluetooth, Bell, TrendingUp, Plus } from "lucide-react";

export function HomeScreen({
  onOpenNotifications,
  onStartMeasurement,
}: {
  onOpenNotifications: () => void;
  onStartMeasurement: () => void;
}) {
  return (
    <div
      className="h-full w-full"
      style={{ background: "var(--brand-surface)" }}
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
        <div className="animate-fadeSlideUp" style={{ animationDelay: "0.1s" }}>
          <MeasurementCard
            title="Última Medição"
            subtitle="Preensão Palmar"
            value="42.5"
            unit="kgf"
            date="Hoje, 14:32"
            delta="+3.2 kgf"
            Icon={Hand}
            accentVar="--brand-emerald"
          />
        </div>
        <div className="animate-fadeSlideUp" style={{ animationDelay: "0.2s" }}>
          <MeasurementCard
            title="Última Medição"
            subtitle="Força de Pinça"
            value="8.7"
            unit="kgf"
            date="Hoje, 14:34"
            delta="+0.4 kgf"
            Icon={Zap}
            accentVar="--brand-cyan"
          />
        </div>

        <div className="animate-fadeSlideUp" style={{ animationDelay: "0.3s" }}>
          <button
            onClick={onStartMeasurement}
            className="w-full rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] transition-transform"
            style={{
              height: 56,
              background: "var(--brand-accent-grad)",
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            <Plus size={20} />
            Iniciar nova medição
          </button>
        </div>

        <div
          className="rounded-2xl p-4 shadow-sm animate-fadeSlideUp"
          style={{
            background: "var(--brand-card)",
            border: "1px solid var(--brand-border-soft)",
            animationDelay: "0.4s",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} style={{ color: "var(--brand-emerald)" }} />
            <span style={{ color: "var(--brand-text)", fontSize: 14, fontWeight: 600 }}>
              Resumo da semana
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Sessões", value: "12", unit: "" },
              { label: "Média", value: "41.2", unit: "kgf" },
              { label: "Pico", value: "44.8", unit: "kgf" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3 text-center"
                style={{ background: "var(--brand-chip-bg)" }}
              >
                <div className="flex items-baseline justify-center gap-1">
                  <span style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 700 }}>
                    {s.value}
                  </span>
                  {s.unit && (
                    <span style={{ color: "var(--brand-text-muted)", fontSize: 10, fontWeight: 500 }}>
                      {s.unit}
                    </span>
                  )}
                </div>
                <div style={{ color: "var(--brand-text-muted)", fontSize: 11 }}>
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

function MeasurementCard({
  title,
  subtitle,
  value,
  unit,
  date,
  delta,
  Icon,
  accentVar,
}: {
  title: string;
  subtitle: string;
  value: string;
  unit: string;
  date: string;
  delta: string;
  Icon: typeof Hand;
  accentVar: string;
}) {
  const accent = `var(${accentVar})`;
  return (
    <div
      className="rounded-2xl p-5 shadow-md"
      style={{
        background: "var(--brand-card)",
        border: "1px solid var(--brand-border-soft)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div style={{ color: "var(--brand-text-faint)", fontSize: 11, fontWeight: 500, letterSpacing: "0.04em" }}>
            {title.toUpperCase()}
          </div>
          <div
            style={{ color: "var(--brand-text)", fontSize: 16, fontWeight: 600 }}
            className="mt-0.5"
          >
            {subtitle}
          </div>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: "var(--brand-chip-bg)" }}
        >
          <Icon size={20} style={{ color: accent }} />
        </div>
      </div>
      <div className="flex items-end gap-1.5 mt-4">
        <span
          style={{
            color: "var(--brand-text)",
            fontSize: 36,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {value}
        </span>
        <span
          style={{ color: "var(--brand-text-muted)", fontSize: 14, fontWeight: 500 }}
          className="mb-1"
        >
          {unit}
        </span>
        <span
          className="ml-auto rounded-full px-2 py-0.5"
          style={{
            background: "var(--brand-chip-bg)",
            color: accent,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {delta}
        </span>
      </div>
      <div style={{ color: "var(--brand-text-faint)", fontSize: 12 }} className="mt-2">
        {date}
      </div>
    </div>
  );
}
