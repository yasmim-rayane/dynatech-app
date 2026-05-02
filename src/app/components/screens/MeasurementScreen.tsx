import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Hand,
  Zap,
  Play,
  Square,
  RotateCcw,
  Check,
  TrendingUp,
} from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

type Type = "grip" | "pinch";
type Side = "left" | "right";
type Step = "type" | "side" | "live" | "result";

function playSuccessFeedback() {
  // Vibração (via Capacitor)
  try {
    Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (e) {}

  // Som "Plim" (via Web Audio API)
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    // Toca a nota lá (A5) e escorrega rapidamente para a próxima oitava (A6)
    osc.frequency.setValueAtTime(880, ctx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

    // Fade out para não dar "estalo" no fim
    gainNode.gain.setValueAtTime(1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

export function MeasurementScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<Type>("grip");
  const [side, setSide] = useState<Side>("right");
  const [reading, setReading] = useState(0);
  const [peak, setPeak] = useState(0);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const intervalRef = useRef<number | null>(null);

  const max = type === "grip" ? 60 : 15;
  const target = type === "grip" ? 42.5 : 8.7;

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setReading((prev) => {
        const noise = (Math.random() - 0.4) * 6;
        const next = Math.max(
          0,
          Math.min(max, prev + (target - prev) * 0.18 + noise)
        );
        setPeak((p) => Math.max(p, next));
        return next;
      });
      setSecondsLeft((s) => {
        if (s <= 1) {
          stopRun();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  function startRun() {
    setReading(0);
    setPeak(0);
    setSecondsLeft(5);
    setRunning(true);
  }

  function stopRun() {
    setRunning(false);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setStep("result");
    playSuccessFeedback();
  }

  function reset() {
    setStep("type");
    setReading(0);
    setPeak(0);
    setSecondsLeft(5);
    setRunning(false);
  }

  return (
    <div
      className="h-full w-full animate-slideInRight"
      style={{ background: "var(--brand-card)" }}
    >
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={step === "type" || step === "result" ? onBack : () => setStep(step === "live" ? "side" : "type")}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "var(--brand-chip-bg)" }}
        >
          <ChevronLeft size={20} style={{ color: "var(--brand-text)" }} />
        </button>
        <h2 style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 600 }}>
          {step === "result" ? "Resultado" : "Nova medição"}
        </h2>
      </div>

      {step !== "result" && <Stepper step={step} />}

      <div className="px-6 pt-4 pb-10">
        {step === "type" && (
          <TypeStep
            type={type}
            onSelect={(t) => {
              setType(t);
              setStep("side");
            }}
          />
        )}
        {step === "side" && (
          <SideStep
            type={type}
            side={side}
            onSelect={(s) => {
              setSide(s);
              setStep("live");
              setTimeout(startRun, 400);
            }}
          />
        )}
        {step === "live" && (
          <LiveStep
            type={type}
            side={side}
            reading={reading}
            peak={peak}
            max={max}
            running={running}
            secondsLeft={secondsLeft}
            onStop={stopRun}
            onStart={startRun}
          />
        )}
        {step === "result" && (
          <ResultStep
            type={type}
            side={side}
            peak={peak}
            onSave={onBack}
            onRetry={reset}
          />
        )}
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const idx = step === "type" ? 0 : step === "side" ? 1 : 2;
  return (
    <div className="px-6 mt-2 flex gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex-1 h-1 rounded-full"
          style={{
            background:
              i <= idx ? "var(--brand-emerald)" : "var(--brand-border)",
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
}

function TypeStep({
  type,
  onSelect,
}: {
  type: Type;
  onSelect: (t: Type) => void;
}) {
  const opts: { key: Type; label: string; sub: string; Icon: typeof Hand }[] = [
    { key: "grip", label: "Preensão Palmar", sub: "Força total da mão", Icon: Hand },
    { key: "pinch", label: "Força de Pinça", sub: "Polegar e indicador", Icon: Zap },
  ];
  return (
    <div className="space-y-4 animate-fadeSlideUp">
      <div>
        <h3 style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Que tipo de medição?
        </h3>
        <p style={{ color: "var(--brand-text-muted)", fontSize: 13 }} className="mt-1">
          Selecione o tipo que deseja realizar agora.
        </p>
      </div>
      {opts.map((o) => {
        const active = o.key === type;
        return (
          <button
            key={o.key}
            onClick={() => onSelect(o.key)}
            className="w-full rounded-2xl p-5 flex items-center gap-4 text-left transition-all duration-200 active:scale-[0.98]"
            style={{
              background: "var(--brand-card)",
              border: `1.5px solid ${active ? "var(--brand-emerald)" : "var(--brand-border-soft)"}`,
              boxShadow: active ? "0 0 0 4px var(--brand-emerald-soft)" : "none",
            }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: "var(--brand-emerald-soft)" }}
            >
              <o.Icon size={24} style={{ color: "var(--brand-emerald)" }} />
            </div>
            <div className="flex-1">
              <div style={{ color: "var(--brand-text)", fontSize: 15, fontWeight: 600 }}>
                {o.label}
              </div>
              <div style={{ color: "var(--brand-text-muted)", fontSize: 12 }}>
                {o.sub}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SideStep({
  type,
  side,
  onSelect,
}: {
  type: Type;
  side: Side;
  onSelect: (s: Side) => void;
}) {
  const opts: { key: Side; label: string }[] = [
    { key: "left", label: "Esquerda" },
    { key: "right", label: "Direita" },
  ];
  return (
    <div className="space-y-4 animate-fadeSlideUp">
      <div>
        <h3 style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Qual mão?
        </h3>
        <p style={{ color: "var(--brand-text-muted)", fontSize: 13 }} className="mt-1">
          {type === "grip" ? "Preensão Palmar" : "Força de Pinça"} · escolha o lado
          a medir.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {opts.map((o) => {
          const active = o.key === side;
          return (
            <button
              key={o.key}
              onClick={() => onSelect(o.key)}
              className="rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-200 active:scale-[0.96]"
              style={{
                background: "var(--brand-card)",
                border: `1.5px solid ${active ? "var(--brand-emerald)" : "var(--brand-border-soft)"}`,
                boxShadow: active ? "0 0 0 4px var(--brand-emerald-soft)" : "none",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--brand-chip-bg)" }}
              >
                <Hand
                  size={28}
                  style={{
                    color: "var(--brand-emerald)",
                    transform: o.key === "left" ? "scaleX(-1)" : "none",
                  }}
                />
              </div>
              <span style={{ color: "var(--brand-text)", fontSize: 15, fontWeight: 600 }}>
                {o.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LiveStep({
  type,
  side,
  reading,
  peak,
  max,
  running,
  secondsLeft,
  onStop,
  onStart,
}: {
  type: Type;
  side: Side;
  reading: number;
  peak: number;
  max: number;
  running: boolean;
  secondsLeft: number;
  onStop: () => void;
  onStart: () => void;
}) {
  const pct = Math.min(100, (reading / max) * 100);
  const radius = 110;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center animate-scaleIn">
      <div
        className="rounded-full px-3 py-1"
        style={{ background: "var(--brand-chip-bg)" }}
      >
        <span style={{ color: "var(--brand-text-muted)", fontSize: 12, fontWeight: 600 }}>
          {type === "grip" ? "Preensão Palmar" : "Força de Pinça"} · Mão{" "}
          {side === "left" ? "esquerda" : "direita"}
        </span>
      </div>

      <div className="relative my-8" style={{ width: 260, height: 260 }}>
        <svg width="260" height="260" viewBox="0 0 260 260" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="130"
            cy="130"
            r={radius}
            stroke="var(--brand-border-soft)"
            strokeWidth="14"
            fill="none"
          />
          <circle
            cx="130"
            cy="130"
            r={radius}
            stroke="var(--brand-emerald)"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ color: "var(--brand-text-faint)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>
            {running ? "MEDINDO" : "PRONTO"}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              style={{
                color: "var(--brand-text)",
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {reading.toFixed(1)}
            </span>
            <span style={{ color: "var(--brand-text-muted)", fontSize: 16, fontWeight: 500 }}>
              kgf
            </span>
          </div>
          <div
            className="mt-3 rounded-full px-3 py-1 flex items-center gap-1"
            style={{ background: "var(--brand-emerald-soft)" }}
          >
            <TrendingUp size={12} style={{ color: "var(--brand-emerald)" }} />
            <span
              style={{ color: "var(--brand-emerald)", fontSize: 12, fontWeight: 600 }}
            >
              Pico {peak.toFixed(1)} kgf
            </span>
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl px-4 py-3 mb-6"
        style={{ background: "var(--brand-chip-bg)" }}
      >
        <span style={{ color: "var(--brand-text-muted)", fontSize: 13 }}>
          Tempo restante:{" "}
        </span>
        <span style={{ color: "var(--brand-text)", fontSize: 14, fontWeight: 700 }}>
          {secondsLeft}s
        </span>
      </div>

      {running ? (
        <button
          onClick={onStop}
          className="w-full rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.97] transition-transform"
          style={{
            height: 56,
            background: "var(--brand-danger)",
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <Square size={18} fill="#FFFFFF" />
          Parar medição
        </button>
      ) : (
        <button
          onClick={onStart}
          className="w-full rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.97] transition-transform"
          style={{
            height: 56,
            background: "var(--brand-accent-grad)",
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <Play size={18} fill="#FFFFFF" />
          Iniciar
        </button>
      )}
    </div>
  );
}

function ResultStep({
  type,
  side,
  peak,
  onSave,
  onRetry,
}: {
  type: Type;
  side: Side;
  peak: number;
  onSave: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center animate-scaleIn">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mt-2"
        style={{ background: "var(--brand-emerald-soft)" }}
      >
        <Check size={36} style={{ color: "var(--brand-emerald)" }} />
      </div>
      <h3
        style={{ color: "var(--brand-text)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}
        className="mt-4"
      >
        Medição concluída!
      </h3>
      <p style={{ color: "var(--brand-text-muted)", fontSize: 13 }} className="mt-1">
        {type === "grip" ? "Preensão Palmar" : "Força de Pinça"} · Mão{" "}
        {side === "left" ? "esquerda" : "direita"}
      </p>

      <div
        className="w-full rounded-2xl p-6 mt-6 text-center"
        style={{
          background: "var(--brand-card)",
          border: "1px solid var(--brand-border-soft)",
        }}
      >
        <div style={{ color: "var(--brand-text-faint)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}>
          PICO REGISTRADO
        </div>
        <div className="flex items-baseline justify-center gap-1 mt-2">
          <span style={{ color: "var(--brand-text)", fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em" }}>
            {peak.toFixed(1)}
          </span>
          <span style={{ color: "var(--brand-text-muted)", fontSize: 16, fontWeight: 500 }}>
            kgf
          </span>
        </div>
        <span
          className="inline-block mt-3 rounded-full px-3 py-1"
          style={{
            background: "var(--brand-emerald-soft)",
            color: "var(--brand-emerald)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          +3.2 kgf vs. última
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full mt-4">
        {[
          { l: "Média", v: (peak * 0.82).toFixed(1) },
          { l: "Mínimo", v: (peak * 0.4).toFixed(1) },
          { l: "Duração", v: "5s" },
        ].map((s) => (
          <div
            key={s.l}
            className="rounded-xl p-3 text-center"
            style={{ background: "var(--brand-chip-bg)" }}
          >
            <div style={{ color: "var(--brand-text)", fontSize: 16, fontWeight: 700 }}>
              {s.v}
            </div>
            <div style={{ color: "var(--brand-text-muted)", fontSize: 11 }}>
              {s.l}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onSave}
        className="w-full rounded-xl shadow-md mt-6 active:scale-[0.97] transition-transform"
        style={{
          height: 52,
          background: "var(--brand-button-grad)",
          color: "var(--brand-on-header)",
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        Salvar medição
      </button>
      <button
        onClick={onRetry}
        className="w-full rounded-xl mt-3 flex items-center justify-center gap-2 transition active:scale-[0.97]"
        style={{
          height: 50,
          border: "1.5px solid var(--brand-border)",
          color: "var(--brand-text)",
          fontSize: 14,
          fontWeight: 600,
          background: "transparent",
        }}
      >
        <RotateCcw size={16} />
        Refazer medição
      </button>
    </div>
  );
}
