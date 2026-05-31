import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bluetooth, Bell, Users, ChevronRight, UserPlus, Activity } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useAppNotifications } from "../contexts/NotificationsContext";
import { BleService } from "../services/ble/BleService";
import { usePatients } from "../contexts/PatientsContext";

export function HomeScreen({
  onOpenNotifications,
  onOpenPairing,
  onGoToPatients,
}: {
  onOpenNotifications: () => void;
  onOpenPairing: () => void;
  onGoToPatients: () => void;
}) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { unreadCount, addNotification } = useAppNotifications();
  const [connected, setConnected] = useState(BleService.isConnected());
  const { patients } = usePatients();

  useEffect(() => {
    const unsubConn = BleService.onConnectionStateChange((state) => {
      setConnected((prev) => {
        if (prev && !state) {
          addNotification({
            title: "Conexão perdida",
            body: "O dinamômetro foi desconectado. Por favor, conecte-o novamente.",
            tone: "danger",
            icon: "bluetooth",
          });
        }
        return state;
      });
    });

    const unsubEnabled = BleService.onEnabledChange((enabled) => {
      if (!enabled) {
        setConnected((prev) => {
          if (prev) {
            addNotification({
              title: "Bluetooth desativado",
              body: "O dinamômetro perdeu a conexão. Ative o Bluetooth e conecte novamente.",
              tone: "danger",
              icon: "bluetooth",
            });
          }
          return false;
        });
      }
    });

    return () => {
      unsubConn();
      unsubEnabled();
    };
  }, [addNotification]);

  const userName = user?.name ?? "Profissional";
  const firstName = userName.split(" ")[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

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
          onClick={onOpenPairing}
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
      <div className="px-5 -mt-12 space-y-4 pb-6">
        
        {/* Dashboard Resumo */}
        <div className="grid grid-cols-2 gap-3 animate-fadeSlideUp" style={{ animationDelay: "0.1s" }}>
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
              {patients.length}
            </span>
            <span style={{ color: "var(--brand-text-muted)", fontSize: 12, fontWeight: 500 }}>
              Pacientes cadastrados
            </span>
          </div>

          <div
            onClick={onGoToPatients}
            className="rounded-2xl p-4 shadow-md flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 transition-transform"
            style={{
              background: "var(--brand-accent-grad)",
              border: "1px solid var(--brand-border-soft)",
            }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: "rgba(255,255,255,0.2)" }}>
              <Activity size={20} style={{ color: "#fff" }} />
            </div>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
              Iniciar Medição
            </span>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 500, marginTop: 2 }}>
              Acessar painel
            </span>
          </div>
        </div>

        {/* Atalho para lista de pacientes */}
        <div className="rounded-2xl p-4 shadow-sm animate-fadeSlideUp" style={{ background: "var(--brand-card)", border: "1px solid var(--brand-border-soft)", animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} style={{ color: "var(--brand-text)" }} />
              <span style={{ color: "var(--brand-text)", fontSize: 15, fontWeight: 600 }}>Pacientes recentes</span>
            </div>
            <button
              onClick={onGoToPatients}
              style={{ color: "var(--brand-emerald)", fontSize: 13, fontWeight: 600 }}
            >
              Ver todos
            </button>
          </div>

          <div className="space-y-3">
            {patients.length === 0 ? (
              <div className="text-center py-6">
                <UserPlus size={32} style={{ color: "var(--brand-border-soft)", margin: "0 auto 12px" }} />
                <p style={{ color: "var(--brand-text-muted)", fontSize: 13, lineHeight: 1.5 }}>
                  Você ainda não tem pacientes cadastrados.
                </p>
                <button
                  onClick={onGoToPatients}
                  className="mt-3 px-4 py-2 rounded-full font-semibold transition-transform active:scale-95"
                  style={{ background: "var(--brand-emerald-soft)", color: "var(--brand-emerald)", fontSize: 13 }}
                >
                  Adicionar Paciente
                </button>
              </div>
            ) : (
              patients.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  onClick={onGoToPatients}
                  className="flex items-center justify-between p-3 rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
                  style={{ background: "var(--brand-chip-bg)" }}
                >
                  <div>
                    <div style={{ color: "var(--brand-text)", fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ color: "var(--brand-text-faint)", fontSize: 12, marginTop: 2 }}>
                      {p.email || "Sem e-mail vinculado"}
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: "var(--brand-text-muted)" }} />
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

