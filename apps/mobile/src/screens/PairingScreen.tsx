import { Bluetooth, Check, ChevronLeft, Loader2 } from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { usePreferences } from "../contexts/PreferencesContext";
import { useAppNotifications } from "../contexts/NotificationsContext";
import { useState, useEffect } from "react";
import { BleService } from "../services/ble/BleService";
import type { BleDevice } from "@capacitor-community/bluetooth-le";

function playPairingFeedback(soundOn: boolean, vibrationOn: boolean) {
  // Vibração dupla (via Capacitor)
  if (vibrationOn) {
    try {
      Haptics.impact({ style: ImpactStyle.Medium });
      setTimeout(() => Haptics.impact({ style: ImpactStyle.Light }), 150);
    } catch (e) {}
  }

  // Som duplo "Plim Plim" ascendente (via Web Audio API)
  if (soundOn) {
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
}

export function PairingScreen({
  onConnect,
  onBack,
}: {
  onConnect: () => void;
  onBack?: () => void;
}) {
  const { sound, vibration } = usePreferences();
  const [alreadyConnected] = useState<boolean>(BleService.isConnected());
  const [devices, setDevices] = useState<{ device: BleDevice; rssi: number }[]>([]);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBluetoothOn, setIsBluetoothOn] = useState<boolean>(true);
  const { addNotification } = useAppNotifications();

  useEffect(() => {
    if (alreadyConnected) return;

    let isScanning = false;
    
    const scan = async () => {
      try {
        const enabled = await BleService.isBluetoothEnabled();
        setIsBluetoothOn(enabled);
        if (!enabled) {
          setError("O Bluetooth está desativado. Por favor, ative nas configurações do celular.");
          return;
        }

        await BleService.startScan((device, rssi) => {
          setDevices((prev) => {
            const exists = prev.find((d) => d.device.deviceId === device.deviceId);
            if (exists) {
              return prev.map((d) =>
                d.device.deviceId === device.deviceId ? { ...d, rssi } : d
              );
            }
            return [...prev, { device, rssi }];
          });
        });
        isScanning = true;
      } catch (e: any) {
        setError("Erro ao iniciar busca Bluetooth: " + e.message);
      }
    };

    scan();

    return () => {
      if (isScanning) {
        BleService.stopScan();
      }
    };
  }, [isBluetoothOn]); // Refaz o scan se a flag for alterada por um botão de retry

  async function handleConnect(device: BleDevice) {
    if (connectingTo) return;
    setConnectingTo(device.deviceId);
    setError(null);
    try {
      await BleService.stopScan();
      await BleService.connectToDevice(device);
      playPairingFeedback(sound, vibration);
      addNotification({
        title: "Dispositivo conectado",
        body: `${device.name || "Dyna Tech Grip"} foi pareado com sucesso.`,
        tone: "navy",
        icon: "bluetooth",
      });
      onConnect();
    } catch (e: any) {
      setError("Falha ao conectar: " + e.message);
      setConnectingTo(null);
    }
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

      {alreadyConnected ? (
        <div className="flex flex-col items-center justify-center flex-1 py-10 animate-scaleIn">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg"
            style={{ background: "var(--brand-emerald-soft)" }}
          >
            <Check size={48} style={{ color: "var(--brand-emerald)" }} />
          </div>
          <h2 style={{ color: "var(--brand-text)", fontSize: 20, fontWeight: 700 }}>
            Dispositivo já conectado
          </h2>
          <p
            style={{ color: "var(--brand-text-muted)", fontSize: 14, textAlign: "center" }}
            className="mt-2 mb-8 px-4"
          >
            O seu dinamômetro Dyna Tech Grip já está conectado e pronto para uso.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="w-full py-3.5 rounded-xl font-semibold active:scale-95 transition-transform"
              style={{
                background: "var(--brand-emerald)",
                color: "#FFFFFF",
                fontSize: 15,
              }}
            >
              Voltar ao início
            </button>
          )}
        </div>
      ) : (
        <>
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
          style={{ background: isBluetoothOn ? "var(--brand-emerald)" : "var(--brand-danger, #EF4444)", animation: isBluetoothOn ? "ping 1.5s infinite" : "none" }}
        />
        <span style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
          {!isBluetoothOn 
            ? "Bluetooth desligado" 
            : devices.length === 0 
              ? "Buscando dinamômetros próximos…" 
              : `${devices.length} dispositivo(s) encontrado(s)`}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg flex flex-col items-center text-center font-medium shadow-sm" style={{ background: "var(--brand-danger-soft, rgba(239,68,68,0.1))", color: "var(--brand-danger)" }}>
          <span className="text-sm">{error}</span>
          {!isBluetoothOn && (
            <button
              onClick={() => {
                setError(null);
                setIsBluetoothOn(true); // Força um re-render que acionará o useEffect para checar novamente
              }}
              className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold active:scale-95 transition-transform"
              style={{ background: "var(--brand-danger)", color: "#FFFFFF" }}
            >
              Já ativei (Tentar novamente)
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {devices.map((d, i) => {
          const isConnecting = connectingTo === d.device.deviceId;
          const strength = d.rssi > -60 ? "Forte" : d.rssi > -80 ? "Médio" : "Fraco";
          
          return (
            <div
              key={d.device.deviceId}
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
                {d.device.name || "Dispositivo Desconhecido"}
              </div>
              <div style={{ color: "var(--brand-text-faint)", fontSize: 12 }}>
                ID: {d.device.deviceId.slice(0,8)}... · Sinal {strength} ({d.rssi} dBm)
              </div>
            </div>
            <button
              onClick={() => handleConnect(d.device)}
              disabled={connectingTo !== null}
              className="rounded-lg px-4 py-2 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: "transparent",
                color: "var(--brand-emerald)",
                border: "1.5px solid var(--brand-emerald)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {isConnecting ? <Loader2 size={16} className="animate-spin" /> : "Conectar"}
            </button>
          </div>
          );
        })}
      </div>
        </>
      )}
    </div>
  );
}
