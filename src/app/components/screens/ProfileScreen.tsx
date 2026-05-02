import {
  ChevronRight,
  User,
  Scale,
  Ruler,
  Mail,
  Lock,
  Settings,
  Bluetooth,
  Bell,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../ThemeContext";

export function ProfileScreen({
  onLogout,
  onOpenAccount,
  onOpenGeneral,
}: {
  onLogout: () => void;
  onOpenAccount: () => void;
  onOpenGeneral: () => void;
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  type Item = {
    Icon: typeof User;
    label: string;
    value?: string;
    onClick?: () => void;
  };
  const sections: { title: string; items: Item[] }[] = [
    {
      title: "Configurações de conta",
      items: [
        { Icon: User, label: "Nome", value: "Maria Silva", onClick: onOpenAccount },
        { Icon: Scale, label: "Peso", value: "62 kg", onClick: onOpenAccount },
        { Icon: Ruler, label: "Altura", value: "168 cm", onClick: onOpenAccount },
        { Icon: Mail, label: "E-mail", value: "maria@email.com", onClick: onOpenAccount },
        { Icon: Lock, label: "Alterar senha", onClick: onOpenAccount },
      ],
    },
    {
      title: "Configurações do app",
      items: [{ Icon: Settings, label: "Geral", onClick: onOpenGeneral }],
    },
    {
      title: "Permissões",
      items: [
        { Icon: Bluetooth, label: "Bluetooth", value: "Permitido" },
        { Icon: Bell, label: "Notificações", value: "Permitido" },
      ],
    },
  ];

  return (
    <div
      className="min-h-full w-full"
      style={{ background: "var(--brand-card)" }}
    >
      <div
        className="px-6 pt-8 pb-6 animate-fadeSlideDown"
        style={{ background: "var(--brand-header-grad)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "var(--brand-on-header-chip)",
              border: "2px solid var(--brand-emerald)",
            }}
          >
            <span style={{ color: "var(--brand-on-header)", fontSize: 22, fontWeight: 700 }}>
              MS
            </span>
          </div>
          <div className="flex-1">
            <div style={{ color: "var(--brand-on-header)", fontSize: 18, fontWeight: 700 }}>
              Maria Silva
            </div>
            <div style={{ color: "var(--brand-on-header-muted)", fontSize: 13 }}>
              @maria · 28 anos
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-6 pb-6">
        <div className="animate-fadeSlideUp" style={{ animationDelay: "0.05s" }}>
          <div
            style={{ color: "var(--brand-text-faint)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}
            className="px-2 mb-2"
          >
            APARÊNCIA
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--brand-card)",
              border: "1px solid var(--brand-border-soft)",
            }}
          >
            <button
              onClick={toggle}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-black/5 transition"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "var(--brand-chip-bg)" }}
              >
                {isDark ? (
                  <Moon size={16} style={{ color: "var(--brand-emerald)" }} />
                ) : (
                  <Sun size={16} style={{ color: "var(--brand-emerald)" }} />
                )}
              </div>
              <span style={{ color: "var(--brand-text)", fontSize: 14, fontWeight: 500 }}>
                Modo escuro
              </span>
              <span
                className="ml-auto rounded-full transition-colors duration-200"
                style={{
                  width: 40,
                  height: 22,
                  background: isDark ? "var(--brand-emerald)" : "var(--brand-border)",
                  position: "relative",
                }}
              >
                <span
                  className="absolute top-0.5 rounded-full bg-white shadow"
                  style={{
                    width: 18,
                    height: 18,
                    left: isDark ? 20 : 2,
                    transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </span>
            </button>
          </div>
        </div>

        {sections.map((sec, si) => (
          <div key={sec.title} className="animate-fadeSlideUp" style={{ animationDelay: `${0.1 * (si + 1)}s` }}>
            <div
              style={{ color: "var(--brand-text-faint)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}
              className="px-2 mb-2"
            >
              {sec.title.toUpperCase()}
            </div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--brand-card)",
                border: "1px solid var(--brand-border-soft)",
              }}
            >
              {sec.items.map((it, i) => (
                <button
                  key={it.label}
                  onClick={it.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-black/5 transition"
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid var(--brand-border-soft)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--brand-chip-bg)" }}
                  >
                    <it.Icon size={16} style={{ color: "var(--brand-text)" }} />
                  </div>
                  <span style={{ color: "var(--brand-text)", fontSize: 14, fontWeight: 500 }}>
                    {it.label}
                  </span>
                  <span
                    className="ml-auto"
                    style={{ color: "var(--brand-text-muted)", fontSize: 13 }}
                  >
                    {it.value}
                  </span>
                  <ChevronRight size={16} style={{ color: "var(--brand-text-faint)" }} />
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="animate-fadeSlideUp" style={{ animationDelay: "0.4s" }}>
          <button
            onClick={onLogout}
            className="w-full rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.97]"
            style={{
              height: 50,
              border: "1.5px solid var(--brand-danger)",
              color: "var(--brand-danger)",
              fontSize: 14,
              fontWeight: 600,
              background: "transparent",
            }}
          >
            <LogOut size={18} />
            Desconectar
          </button>
        </div>
      </div>
    </div>
  );
}
