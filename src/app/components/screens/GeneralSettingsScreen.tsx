import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Ruler,
  Volume2,
  Vibrate,
  Cloud,
  Trash2,
  Info,
  Moon,
  Bluetooth,
} from "lucide-react";
import { useTheme } from "../ThemeContext";

export function GeneralSettingsScreen({
  onBack,
  onOpenPairing,
}: {
  onBack: () => void;
  onOpenPairing: () => void;
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [cacheSize, setCacheSize] = useState<string>("Calculando...");
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    calculateCache();
  }, []);

  async function calculateCache() {
    let totalBytes = 0;

    // LocalStorage estimate
    let lsBytes = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        lsBytes += (localStorage[key].length + key.length) * 2;
      }
    }
    totalBytes += lsBytes;

    // CacheStorage & IndexedDB estimate
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage) {
        totalBytes += estimate.usage;
      }
    }

    if (totalBytes === 0) {
      setCacheSize("0 B");
    } else if (totalBytes < 1024 * 1024) {
      setCacheSize((totalBytes / 1024).toFixed(1) + " KB");
    } else {
      setCacheSize((totalBytes / (1024 * 1024)).toFixed(1) + " MB");
    }
  }

  async function handleClearCache() {
    if (isClearing) return;
    setIsClearing(true);

    try {
      // Limpa os caches da API (Service Workers, assets PWA, requisições)
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      // Mantemos o localStorage intocado para não apagar dados do usuário 
      // como lembretes, tema e perfil. Apenas o cache temporário é limpo.

      await calculateCache();
      // Se calculou muito rápido, garantir que exibe ao menos "0 KB"
      // ou próximo a isso (já que localStorage permanece)
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <div
      className="min-h-full w-full animate-slideInRight"
      style={{ background: "var(--brand-card)" }}
    >
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "var(--brand-chip-bg)" }}
        >
          <ChevronLeft size={20} style={{ color: "var(--brand-text)" }} />
        </button>
        <h2 style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 600 }}>
          Geral
        </h2>
      </div>

      <div className="px-5 pt-4 pb-10 space-y-6">
        <Group title="Aparência" delay={0}>
          <ToggleRow
            Icon={Moon}
            label="Modo escuro"
            sub="Reduz brilho em ambientes com pouca luz"
            on={isDark}
            onChange={toggle}
          />
        </Group>

        <Group title="Dispositivo" delay={0.05}>
          <NavRow
            Icon={Bluetooth}
            label="Parear dinamômetro"
            value="Dyna Tech Grip"
            onClick={onOpenPairing}
          />
        </Group>

        <Group title="Preferências" delay={0.1}>
          <NavRow Icon={Globe} label="Idioma" value="Português (BR)" />
          <NavRow Icon={Ruler} label="Unidade de medida" value="kgf" />
        </Group>

        <Group title="Som e vibração" delay={0.15}>
          <ToggleRow
            Icon={Volume2}
            label="Som"
            sub="Reproduz feedback ao concluir medição"
            on={sound}
            onChange={() => setSound((v) => !v)}
          />
          <ToggleRow
            Icon={Vibrate}
            label="Vibração"
            sub="Feedback tátil durante uso do dispositivo"
            on={vibration}
            onChange={() => setVibration((v) => !v)}
          />
        </Group>

        <Group title="Dados" delay={0.2}>
          <ToggleRow
            Icon={Cloud}
            label="Sincronização automática"
            sub="Envia medições para a nuvem ao conectar"
            on={autoSync}
            onChange={() => setAutoSync((v) => !v)}
          />
          <NavRow 
            Icon={Trash2} 
            label={isClearing ? "Limpando..." : "Limpar cache"} 
            value={cacheSize} 
            danger 
            onClick={handleClearCache}
          />
        </Group>

        <Group title="Sobre" delay={0.25}>
          <NavRow Icon={Info} label="Versão do app" value="1.0.0" />
        </Group>
      </div>
    </div>
  );
}

function Group({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div className="animate-fadeSlideUp" style={{ animationDelay: `${delay}s` }}>
      <div
        className="px-2 mb-2"
        style={{
          color: "var(--brand-text-faint)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
        }}
      >
        {title.toUpperCase()}
      </div>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--brand-card)",
          border: "1px solid var(--brand-border-soft)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function NavRow({
  Icon,
  label,
  value,
  danger,
  onClick,
}: {
  Icon: typeof Globe;
  label: string;
  value?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-black/5 transition"
      style={{ borderTop: "1px solid var(--brand-border-soft)" }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: "var(--brand-chip-bg)" }}
      >
        <Icon
          size={16}
          style={{ color: danger ? "var(--brand-danger)" : "var(--brand-text)" }}
        />
      </div>
      <span
        style={{
          color: danger ? "var(--brand-danger)" : "var(--brand-text)",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span
        className="ml-auto"
        style={{ color: "var(--brand-text-muted)", fontSize: 13 }}
      >
        {value}
      </span>
      <ChevronRight size={16} style={{ color: "var(--brand-text-faint)" }} />
    </button>
  );
}

function ToggleRow({
  Icon,
  label,
  sub,
  on,
  onChange,
}: {
  Icon: typeof Globe;
  label: string;
  sub?: string;
  on: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-black/5 transition"
      style={{ borderTop: "1px solid var(--brand-border-soft)" }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--brand-chip-bg)" }}
      >
        <Icon size={16} style={{ color: "var(--brand-text)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ color: "var(--brand-text)", fontSize: 14, fontWeight: 500 }}>
          {label}
        </div>
        {sub && (
          <div
            style={{
              color: "var(--brand-text-muted)",
              fontSize: 12,
              lineHeight: 1.3,
            }}
            className="mt-0.5"
          >
            {sub}
          </div>
        )}
      </div>
      <span
        className="rounded-full transition-colors duration-200 flex-shrink-0"
        style={{
          width: 40,
          height: 22,
          background: on ? "var(--brand-emerald)" : "var(--brand-border)",
          position: "relative",
        }}
      >
        <span
          className="absolute top-0.5 rounded-full bg-white shadow"
          style={{
            width: 18,
            height: 18,
            left: on ? 20 : 2,
            transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </span>
    </button>
  );
}
