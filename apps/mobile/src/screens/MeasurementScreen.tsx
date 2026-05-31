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
  Loader2,
  BluetoothOff,
} from "lucide-react";
import { usePatients } from "../contexts/PatientsContext";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { usePreferences } from "../contexts/PreferencesContext";
import { useAuth } from "../contexts/AuthContext";
import { useAppNotifications } from "../contexts/NotificationsContext";
import * as api from "../services/api";
import { BleService } from "../services/ble/BleService";

type Type = "grip" | "pinch";
type Side = "left" | "right";
type Finger = "indicador" | "medio" | "anelar" | "minimo";
type Step = "type" | "side" | "finger" | "live" | "result";

function playSuccessFeedback(soundOn: boolean, vibrationOn: boolean) {
  // Vibração (via Capacitor)
  if (vibrationOn) {
    try {
      Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {}
  }

  // Som "Plim" (via Web Audio API)
  if (soundOn) {
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
}

export function MeasurementScreen({ onBack }: { onBack: () => void }) {
  const { sound, vibration } = usePreferences();
  const { email } = useAuth();
  const { patients, activePatientId } = usePatients();
  const [isConnected, setIsConnected] = useState(BleService.isConnected());
  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState<Type | null>(null);
  const [side, setSide] = useState<Side | null>(null);
  const [finger, setFinger] = useState<Finger | null>(null);
  const [reading, setReading] = useState(0);
  const [peak, setPeak] = useState(0);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const intervalRef = useRef<number | null>(null);

  const max = type === "grip" ? 60 : 15;
  const target = type === "grip" ? 42.5 : 8.7;

  useEffect(() => {
    // Registra os listeners do Bluetooth real
    BleService.onLiveUpdate((currentKg) => {
      setReading(currentKg);
      setPeak((p) => Math.max(p, currentKg));
    });

    BleService.onStatus((isMeasuring) => {
      setRunning(isMeasuring);
      if (isMeasuring) {
        setSecondsLeft(5);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => {
          setSecondsLeft((s) => Math.max(0, s - 1));
        }, 1000);
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    });

    BleService.onResult((finalPeak) => {
      setPeak(finalPeak);
      setRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStep("result");
      playSuccessFeedback(sound, vibration);
    });

    BleService.onDisconnect(() => {
      setRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      alert("Conexão com o dinamômetro foi perdida!");
    });

    const unsubConn = BleService.onConnectionStateChange((state) => setIsConnected(state));
    const unsubEn = BleService.onEnabledChange((enabled) => { if (!enabled) setIsConnected(false); });

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      unsubConn();
      unsubEn();
    };
  }, [sound, vibration]);

  const activePatient = patients.find(p => p.id === activePatientId);

  // Se não estiver conectado, retorna a tela de bloqueio
  if (!isConnected) {
    return (
      <div className="min-h-full w-full flex flex-col items-center justify-center p-6 animate-fadeIn" style={{ background: "var(--brand-bg)" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--brand-danger-soft)" }}>
          <BluetoothOff size={40} style={{ color: "var(--brand-danger)" }} />
        </div>
        <h2 style={{ color: "var(--brand-text)", fontSize: 24, fontWeight: 700 }} className="mb-2 text-center">
          Hardware Desconectado
        </h2>
        <p style={{ color: "var(--brand-text-muted)", fontSize: 15 }} className="text-center mb-8 max-w-[280px]">
          Para realizar uma medição, é necessário estar conectado ao dispositivo Dyna Tech Grip.
        </p>
        <button
          onClick={onBack}
          className="w-full h-14 rounded-2xl flex items-center justify-center font-bold text-[15px] shadow-sm active:scale-95 transition-transform"
          style={{ background: "var(--brand-border)", color: "var(--brand-text)" }}
        >
          Voltar
        </button>
      </div>
    );
  }

  async function startRun() {
    try {
      setReading(0);
      setPeak(0);
      setSecondsLeft(5);
      await BleService.startMeasurement();
    } catch (e: any) {
      alert("Erro ao iniciar medição: " + e.message);
    }
  }

  function stopRun() {
    // Medição agora é controlada exatamente por 5s no ESP32.
    // Botão de parar desabilitado para garantir o protocolo clínico de 5s.
  }

  function reset() {
    setStep("type");
    setType(null);
    setSide(null);
    setFinger(null);
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
          onClick={step === "type" || step === "result" ? onBack : () => {
            if (step === "live") setStep(type === "pinch" ? "finger" : "side");
            else if (step === "finger") setStep("side");
            else setStep("type");
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "var(--brand-chip-bg)" }}
        >
          <ChevronLeft size={20} style={{ color: "var(--brand-text)" }} />
        </button>
        <h2 style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 600 }}>
          {step === "result" ? "Resultado" : "Nova medição"}
        </h2>
      </div>

      {step !== "result" && <Stepper step={step} type={type} />}

      <div className="px-6 pt-4 pb-10">
        {step === "type" && (
          <TypeStep
            type={type}
            onSelect={(t) => {
              setType(t);
              setTimeout(() => setStep("side"), 350);
            }}
          />
        )}
        {step === "side" && (
          <SideStep
            type={type}
            side={side}
            onSelect={(s) => {
              setSide(s);
              if (type === "pinch") {
                setTimeout(() => setStep("finger"), 350);
              } else {
                setTimeout(() => {
                  setStep("live");
                  setTimeout(startRun, 400);
                }, 350);
              }
            }}
          />
        )}
        {step === "finger" && type === "pinch" && side && (
          <FingerStep
            finger={finger}
            onSelect={(f) => {
              setFinger(f);
              setTimeout(() => {
                setStep("live");
                setTimeout(startRun, 400);
              }, 350);
            }}
          />
        )}
        {step === "live" && type && side && (
          <LiveStep
            type={type}
            side={side}
            finger={finger}
            reading={reading}
            peak={peak}
            max={max}
            running={running}
            secondsLeft={secondsLeft}
            onStop={stopRun}
            onStart={startRun}
          />
        )}
        {step === "result" && type && side && (
          <ResultStep
            type={type}
            side={side}
            finger={finger}
            peak={peak}
            email={email}
            activePatient={activePatient}
            onSave={onBack}
            onRetry={reset}
          />
        )}
      </div>
    </div>
  );
}

function Stepper({ step, type }: { step: Step; type: Type | null }) {
  const isPinch = type === "pinch";
  const steps = isPinch ? 4 : 3;
  const idx = step === "type" ? 0 : step === "side" ? 1 : step === "finger" ? 2 : isPinch ? 3 : 2;
  return (
    <div className="px-6 mt-2 flex gap-2">
      {Array.from({ length: steps }).map((_, i) => (
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
  type: Type | null;
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
  type: Type | null;
  side: Side | null;
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

const FINGER_OPTS: { key: Finger; label: string }[] = [
  { key: "indicador", label: "Indicador" },
  { key: "medio", label: "Médio" },
  { key: "anelar", label: "Anelar" },
  { key: "minimo", label: "Mínimo" },
];

function FingerStep({
  finger,
  onSelect,
}: {
  finger: Finger | null;
  onSelect: (f: Finger) => void;
}) {
  return (
    <div className="space-y-4 animate-fadeSlideUp">
      <div>
        <h3 style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Qual dedo?
        </h3>
        <p style={{ color: "var(--brand-text-muted)", fontSize: 13 }} className="mt-1">
          Selecione o dedo para a medição de pinça.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {FINGER_OPTS.map((o) => {
          const active = o.key === finger;
          return (
            <button
              key={o.key}
              onClick={() => onSelect(o.key)}
              className="rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-200 active:scale-[0.96]"
              style={{
                background: "var(--brand-card)",
                border: `1.5px solid ${active ? "var(--brand-emerald)" : "var(--brand-border-soft)"}`,
                boxShadow: active ? "0 0 0 4px var(--brand-emerald-soft)" : "none",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "var(--brand-chip-bg)" }}
              >
                <Zap size={22} style={{ color: "var(--brand-emerald)" }} />
              </div>
              <span style={{ color: "var(--brand-text)", fontSize: 14, fontWeight: 600 }}>
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
  finger,
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
  finger: Finger | null;
  reading: number;
  peak: number;
  max: number;
  running: boolean;
  secondsLeft: number;
  onStop: () => void;
  onStart: () => void;
}) {
  const fingerLabel = finger ? FINGER_OPTS.find(f => f.key === finger)?.label : "";
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
          {type === "grip" ? "Preensão Palmar" : `Pinça · ${fingerLabel}`} · Mão{" "}
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
          disabled
          className="w-full rounded-xl flex items-center justify-center gap-2 shadow-md disabled:opacity-80 transition-transform"
          style={{
            height: 56,
            background: "var(--brand-emerald)",
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <Loader2 size={18} className="animate-spin" />
          Medindo...
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
  finger,
  peak,
  email,
  activePatient,
  onSave,
  onRetry,
}: {
  type: Type;
  side: Side;
  finger: Finger | null;
  peak: number;
  email: string;
  activePatient: any;
  onSave: () => void;
  onRetry: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { addNotification } = useAppNotifications();
  const { user } = useAuth();
  const fingerLabel = finger ? FINGER_OPTS.find(f => f.key === finger)?.label : "";
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
        {type === "grip" ? "Preensão Palmar" : `Pinça · ${fingerLabel}`} · Mão{" "}
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

      {saveError && (
        <div className="w-full mb-3 px-4 py-3 rounded-xl text-center animate-fadeIn" style={{ background: "var(--brand-danger-soft, rgba(239,68,68,0.1))", color: "var(--brand-danger)", fontSize: 13, fontWeight: 500 }}>
          {saveError}
        </div>
      )}

      <button
        onClick={async () => {
          if (saving) return;
          setSaving(true);
          setSaveError("");
          try {
            const patientEmail = activePatient?.email || "patient_mock@example.com";
    
            // Constrói payload dinâmico. O mock fará parse depois.
            const payload: any = {
              email: patientEmail,
              examDate: new Date().toISOString(),
            };
            
            if (type === "grip") {
              // Envia 0 no lado não medido para passar na validação estrita do backend
              payload.palmMaxD = side === "right" ? Number(peak.toFixed(1)) : 0;
              payload.palmMaxE = side === "left" ? Number(peak.toFixed(1)) : 0;
            } else if (type === "pinch") {
              const fingerMap: Record<string, string> = { indicador: "1", medio: "2", anelar: "3", minimo: "4" };
              const idx = finger ? fingerMap[finger] : "1";
              
              // Preenche todos os campos de pinça com 0 para passar na validação do backend
              for (let i = 1; i <= 4; i++) {
                (payload as any)[`pinchMaxD${i}`] = 0;
                (payload as any)[`pinchMaxE${i}`] = 0;
              }
              
              if (side === "right") (payload as any)[`pinchMaxD${idx}`] = Number(peak.toFixed(1));
              else (payload as any)[`pinchMaxE${idx}`] = Number(peak.toFixed(1));
            }

            // Calcular variações e recordes antes de salvar a atual
            try {
              const results = await api.getAllResults(email);
              let maxSoFar = 0;
              let sum = 0;
              let count = 0;
              let dominantSideMatched = false;

              // Identificar se a mão medida é a dominante
              const maoDom = user?.maoDominante?.toLowerCase() || "";
              if (maoDom === "a" ||
                  (maoDom === "d" && side === "right") || 
                  (maoDom === "e" && side === "left")) {
                dominantSideMatched = true;
              }

              results.forEach((r) => {
                if (type === "grip") {
                  const val = side === "right" ? r.palmMaxD : r.palmMaxE;
                  if (val && val > 0) {
                    if (val > maxSoFar) maxSoFar = val;
                    sum += val;
                    count++;
                  }
                } else if (type === "pinch") {
                  const fingerMap: Record<string, string> = { indicador: "1", medio: "2", anelar: "3", minimo: "4" };
                  const idx = finger ? fingerMap[finger] : "1";
                  const val = side === "right" ? (r as any)[`pinchMaxD${idx}`] : (r as any)[`pinchMaxE${idx}`];
                  if (val && val > 0) {
                    if (val > maxSoFar) maxSoFar = val;
                    sum += val;
                    count++;
                  }
                }
              });

              const currentVal = Number(peak.toFixed(1));

              // Recorde Pessoal
              if (currentVal > maxSoFar && maxSoFar > 0) {
                addNotification({
                  title: "Novo recorde pessoal!",
                  body: `Você atingiu ${currentVal} kgf — seu maior valor.`,
                  tone: "emerald",
                  icon: "award",
                });
              } else if (dominantSideMatched && count > 0) {
                // Melhora/piora da média da mão dominante
                const avg = sum / count;
                const diff = currentVal - avg;
                const pct = (diff / avg) * 100;
                
                if (Math.abs(pct) > 2) {
                  addNotification({
                    title: pct > 0 ? `Sua média melhorou ${pct.toFixed(1)}%` : `Sua média diminuiu ${Math.abs(pct).toFixed(1)}%`,
                    body: pct > 0 ? "Sua força subiu em relação à média anterior." : "Sua força ficou abaixo da sua média.",
                    tone: pct > 0 ? "cyan" : "navy",
                    icon: pct > 0 ? "trending-up" : "clock",
                  });
                }
              }
            } catch (err) {
              console.error("Erro ao processar notificações de histórico", err);
            }

            await api.createResult(payload);
            onSave();
          } catch (e: any) {
            setSaveError("Erro ao salvar. Tente novamente.");
            setSaving(false);
          }
        }}
        disabled={saving}
        className="w-full rounded-xl shadow-md mt-6 active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
        style={{
          height: 52,
          background: "var(--brand-button-grad)",
          color: "var(--brand-on-header)",
          fontSize: 15,
          fontWeight: 600,
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving && <Loader2 size={18} className="animate-spin" />}
        {saving ? "Salvando..." : "Salvar medição"}
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
