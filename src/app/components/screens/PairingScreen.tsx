import { Bluetooth, Check, ChevronLeft } from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

function playPairingFeedback() {
  // Vibração dupla (via Capacitor)
  try {
    Haptics.impact({ style: ImpactStyle.Medium });
    setTimeout(() => Haptics.impact({ style: ImpactStyle.Light }), 150);
  } catch (e) {}

  // Som duplo "Plim Plim" ascendente (via Web Audio API)
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    
    // Nota Mi(5) para Si(5)
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); 
    osc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.15);

    // Envelope de volume
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.15);
    gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

export function PairingScreen({
  onConnect,
  onBack,
}: {
  onConnect: () => void;
  onBack?: () => void;
}) {
  const devices = [
    { name: "Dyna Tech Grip", id: "DT-A21F", strength: "Forte" },
    { name: "Dyna Tech Grip", id: "DT-7C13", strength: "Médio" },
  ];

  function handleConnect() {
    playPairingFeedback();
    onConnect();
  }

  return (
    <div
      className="h-full w-full flex flex-col px-6 pt-6 animate-fadeSlideUp"
      style={{ background: "var(--brand-card)" }}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center mb-3 active:scale-90 transition-transform"
          style={{ background: "var(--brand-chip-bg)" }}
        >
          <ChevronLeft size={20} style={{ color: "var(--brand-text)" }} />
        </button>
      )}
      <h1 style={{ color: "var(--brand-text)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
        Conectar dispositivo
      </h1>
      <p
        style={{ color: "var(--brand-text-muted)", fontSize: 13 }}
        className="mt-1"
      >
        Mantenha seu dinamômetro próximo e ligado.
      </p>

      <div
        className="flex items-center justify-center my-8 relative"
        style={{ height: 200 }}
      >
        <span
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            background: "var(--brand-emerald-soft)",
            animation: "ping 2s infinite",
            opacity: 0.5,
          }}
        />
        <span
          className="absolute rounded-full"
          style={{
            width: 140,
            height: 140,
            background: "var(--brand-emerald-soft)",
          }}
        />
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg animate-pulseGlow"
          style={{ background: "var(--brand-button-grad)" }}
        >
          <Bluetooth size={32} style={{ color: "var(--brand-emerald)" }} />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: "var(--brand-emerald)", animation: "ping 1.5s infinite" }}
        />
        <span style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
          Buscando dispositivos próximos…
        </span>
      </div>

      <div className="space-y-3">
        {devices.map((d, i) => (
          <div
            key={d.id}
            className="rounded-2xl p-4 flex items-center gap-3 shadow-sm animate-fadeSlideUp"
            style={{
              background: "var(--brand-card)",
              border: "1px solid var(--brand-border)",
              animationDelay: `${0.2 + 0.1 * i}s`,
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "var(--brand-chip-bg)" }}
            >
              <Bluetooth size={20} style={{ color: "var(--brand-text)" }} />
            </div>
            <div className="flex-1">
              <div style={{ color: "var(--brand-text)", fontSize: 14, fontWeight: 600 }}>
                {d.name}
              </div>
              <div style={{ color: "var(--brand-text-faint)", fontSize: 12 }}>
                ID: {d.id} · Sinal {d.strength}
              </div>
            </div>
            <button
              onClick={handleConnect}
              className="rounded-lg px-4 py-2 active:scale-95 transition-transform"
              style={{
                background: i === 0 ? "var(--brand-emerald)" : "transparent",
                color: i === 0 ? "#FFFFFF" : "var(--brand-emerald)",
                border: i === 0 ? "none" : "1.5px solid var(--brand-emerald)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {i === 0 ? (
                <span className="flex items-center gap-1">
                  <Check size={14} /> Conectar
                </span>
              ) : (
                "Conectar"
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
