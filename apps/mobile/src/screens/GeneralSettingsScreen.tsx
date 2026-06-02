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
  Bell,
  X,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { usePreferences } from "../contexts/PreferencesContext";
import { useAuth } from "../contexts/AuthContext";
import * as api from "../services/api";
import { LocalNotifications } from "@capacitor/local-notifications";
import { BleClient } from "@capacitor-community/bluetooth-le";
import { BleService } from "../services/ble/BleService";

export function GeneralSettingsScreen({
  onBack,
  onOpenPairing,
  onLogout,
}: {
  onBack: () => void;
  onOpenPairing: () => void;
  onLogout?: () => void;
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const { sound, vibration, setSound, setVibration } = usePreferences();
  const { email, isPatient } = useAuth();
  const [autoSync, setAutoSync] = useState(true);
  const [cacheSize, setCacheSize] = useState<string>("Calculando...");
  const [isClearing, setIsClearing] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [bleConnected, setBleConnected] = useState(BleService.isConnected());

  const [notifPerm, setNotifPerm] = useState("Verificando...");
  const [btPerm, setBtPerm] = useState("Verificando...");

  useEffect(() => {
    calculateCache();
    checkPerms();
    const unsubConn = BleService.onConnectionStateChange((state) => setBleConnected(state));
    return () => {
      unsubConn();
    };
  }, []);

  async function checkPerms() {
    // Verifica Notificações
    try {
      const { display } = await LocalNotifications.checkPermissions();
      setNotifPerm(display === "granted" ? "Permitido" : "Negado");
    } catch (e) {
      setNotifPerm("Indisponível");
    }

    // Verifica Bluetooth
    try {
      await BleClient.initialize();
      const isEnabled = await BleClient.isEnabled();
      setBtPerm(isEnabled ? "Ligado / Permitido" : "Desligado");
    } catch (e) {
      setBtPerm("Negado ou Sem Suporte");
    }
  }

  async function handleRequestNotif() {
    try {
      const { display } = await LocalNotifications.requestPermissions();
      setNotifPerm(display === "granted" ? "Permitido" : "Negado");
    } catch {}
  }

  async function handleRequestBt() {
    try {
      await BleClient.initialize();
      const isEnabled = await BleClient.isEnabled();
      setBtPerm(isEnabled ? "Ligado / Permitido" : "Desligado");
    } catch {
      setBtPerm("Negado ou Sem Suporte");
    }
  }

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

      <div 
        className="px-5 pt-4 space-y-6"
        style={{ paddingBottom: "calc(40px + env(safe-area-inset-bottom, 0px))" }}
      >
        <Group title="Aparência" delay={0}>
          <ToggleRow
            Icon={Moon}
            label="Modo escuro"
            sub="Reduz brilho em ambientes com pouca luz"
            on={isDark}
            onChange={toggle}
          />
        </Group>

        {!isPatient && (
          <Group title="Dispositivo" delay={0.05}>
            <NavRow
              Icon={Bluetooth}
              label="Parear dinamômetro"
              value={bleConnected ? "Conectado" : "Desconectado"}
              onClick={onOpenPairing}
            />
          </Group>
        )}

        <Group title="Preferências" delay={0.1}>
          <NavRow Icon={Globe} label="Idioma" value="Português (BR)" hideArrow />
          <NavRow Icon={Ruler} label="Unidade de medida" value="kgf" hideArrow />
        </Group>

        <Group title="Som e vibração" delay={0.15}>
          <ToggleRow
            Icon={Volume2}
            label="Som"
            sub="Reproduz feedback ao concluir medição"
            on={sound}
            onChange={() => setSound(!sound)}
          />
          <ToggleRow
            Icon={Vibrate}
            label="Vibração"
            sub="Feedback tátil durante uso do dispositivo"
            on={vibration}
            onChange={() => setVibration(!vibration)}
          />
        </Group>

        <Group title="Dados" delay={0.2}>
          {!isPatient && (
            <ToggleRow
              Icon={Cloud}
              label="Sincronização automática"
              sub="Envia medições para a nuvem ao conectar"
              on={autoSync}
              onChange={() => setAutoSync((v) => !v)}
            />
          )}
          <NavRow 
            Icon={Trash2} 
            label={isClearing ? "Limpando..." : "Limpar cache"} 
            value={cacheSize} 
            danger 
            onClick={handleClearCache}
          />
        </Group>

        <Group title="Permissões" delay={0.22}>
          {!isPatient && (
            <NavRow
              Icon={Bluetooth}
              label="Bluetooth"
              value={btPerm}
              onClick={handleRequestBt}
            />
          )}
          <NavRow
            Icon={Bell}
            label="Notificações"
            value={notifPerm}
            onClick={handleRequestNotif}
          />
        </Group>

        <Group title="Sobre" delay={0.25}>
          <NavRow 
            Icon={Info} 
            label="Versão do app" 
            value="1.0.0" 
            onClick={() => setShowChangelog(true)} 
          />
        </Group>

        <Group title="Zona de perigo" delay={0.3} danger>
          <NavRow 
            Icon={Trash2} 
            label="Excluir conta" 
            danger 
            onClick={() => setShowDeleteModal(true)} 
          />
        </Group>
      </div>

      {showChangelog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fadeIn" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <div 
            className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slideUp flex flex-col max-h-[85vh]"
            style={{ background: "var(--brand-card)", boxShadow: "0 -4px 24px rgba(0,0,0,0.1)" }}
          >
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--brand-border-soft)" }}>
              <h3 style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Histórico de Versões</h3>
              <button onClick={() => setShowChangelog(false)} className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: "var(--brand-chip-bg)" }}>
                <X size={18} style={{ color: "var(--brand-text)" }} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8 no-scrollbar">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ color: "var(--brand-emerald)", fontSize: 17, fontWeight: 700 }}>v1.0.0</span>
                  <span className="px-2 py-0.5 rounded-md" style={{ background: "var(--brand-emerald-soft)", color: "var(--brand-emerald)", fontSize: 11, fontWeight: 700 }}>ATUAL</span>
                </div>
                <ul className="space-y-2" style={{ color: "var(--brand-text-muted)", fontSize: 14, lineHeight: "1.5" }}>
                  <li>• Lançamento oficial da versão Release Candidate.</li>
                  <li>• Pareamento Bluetooth e conexão nativa aprimorados.</li>
                  <li>• Notificações locais integradas com o sistema de lembretes.</li>
                  <li>• Feedback tátil (Haptics) e áudio dinâmico durante medições.</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ color: "var(--brand-text)", fontSize: 16, fontWeight: 600 }}>v0.9.0</span>
                  <span className="px-2 py-0.5 rounded-md" style={{ background: "var(--brand-chip-bg)", color: "var(--brand-text-muted)", fontSize: 11, fontWeight: 600 }}>BETA</span>
                </div>
                <ul className="space-y-2" style={{ color: "var(--brand-text-muted)", fontSize: 14, lineHeight: "1.5" }}>
                  <li>• Interface redesenhada para suportar Modo Escuro dinâmico.</li>
                  <li>• Gerenciamento completo de cache e armazenamento.</li>
                  <li>• Validações estritas de segurança para cadastro e senhas.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn px-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div 
            className="w-full sm:max-w-sm rounded-3xl overflow-hidden animate-slideUp p-6 flex flex-col"
            style={{ background: "var(--brand-card)", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--brand-danger-soft)" }}>
              <Trash2 size={24} style={{ color: "var(--brand-danger)" }} />
            </div>
            
            <h3 style={{ color: "var(--brand-text)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
              Excluir sua conta?
            </h3>
            
            <p style={{ color: "var(--brand-text-muted)", fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>
              Sua conta e dados poderão ser recuperados caso você faça login novamente em até <strong>60 dias</strong>. Após esse período, a exclusão será <strong>permanente</strong>.
            </p>

            <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 600, marginBottom: 8 }}>
              Digite sua senha para confirmar
            </label>
            <input
              type="password"
              placeholder="Sua senha"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl outline-none mb-6 transition-all"
              style={{
                background: "var(--brand-chip-bg)",
                color: "var(--brand-text)",
                border: "1px solid var(--brand-border-soft)"
              }}
            />

            {deleteError && (
              <div className="mb-4 px-4 py-2 rounded-xl text-center" style={{ background: "var(--brand-danger-soft, rgba(239,68,68,0.1))", color: "var(--brand-danger)", fontSize: 13, fontWeight: 500 }}>
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
                className="flex-1 h-12 rounded-xl font-semibold transition-transform active:scale-95"
                style={{ background: "var(--brand-chip-bg)", color: "var(--brand-text)" }}
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  if (!deletePassword || deleteLoading) return;
                  setDeleteLoading(true);
                  setDeleteError("");
                  try {
                    // Primeiro valida a senha tentando login
                    await api.login(email, deletePassword);
                    // Depois desativa a conta
                    await api.deactivateAccount(email);
                    if (onLogout) onLogout();
                  } catch (e: any) {
                    if (e?.status === 401) setDeleteError("Senha incorreta.");
                    else setDeleteError("Erro ao excluir. Tente novamente.");
                    setDeleteLoading(false);
                  }
                }}
                disabled={!deletePassword || deleteLoading}
                className="flex-1 h-12 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ 
                  background: deletePassword && !deleteLoading ? "var(--brand-danger)" : "var(--brand-border)", 
                  color: "#fff" 
                }}
              >
                {deleteLoading ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({
  title,
  children,
  delay = 0,
  danger = false,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
  danger?: boolean;
}) {
  return (
    <div className="animate-fadeSlideUp" style={{ animationDelay: `${delay}s` }}>
      <div
        className="px-2 mb-2"
        style={{
          color: danger ? "var(--brand-danger)" : "var(--brand-text-faint)",
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
          background: danger ? "var(--brand-danger-soft)" : "var(--brand-card)",
          border: danger ? "1px solid var(--brand-danger)" : "1px solid var(--brand-border-soft)",
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
  hideArrow,
  onClick,
}: {
  Icon: typeof Globe;
  label: string;
  value?: string;
  danger?: boolean;
  hideArrow?: boolean;
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
      {!hideArrow && (
        <ChevronRight size={16} style={{ color: "var(--brand-text-faint)" }} />
      )}
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
