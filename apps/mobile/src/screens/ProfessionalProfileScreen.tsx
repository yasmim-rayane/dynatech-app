import { useState, useEffect } from "react";
import {
  ChevronRight,
  User,
  Mail,
  Lock,
  Settings,
  LogOut,
  Moon,
  Sun,
  HelpCircle,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

export function ProfessionalProfileScreen({
  onLogout,
  onOpenAccount,
  onOpenGeneral,
  onOpenTutorial,
}: {
  onLogout: () => void;
  onOpenAccount: () => void;
  onOpenGeneral: () => void;
  onOpenTutorial: () => void;
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();

  const userName = user?.name ?? "Profissional";
  const userInitials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const userEmail = user?.email ?? "";
  const userUsername = user?.username ?? "";

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
        { Icon: User, label: "Nome", value: userName, onClick: onOpenAccount },
        { Icon: Mail, label: "E-mail", value: userEmail, onClick: onOpenAccount },
        { Icon: Lock, label: "Alterar senha", onClick: onOpenAccount },
      ],
    },
    {
      title: "Configurações do app",
      items: [{ Icon: Settings, label: "Geral", onClick: onOpenGeneral }],
    },
    {
      title: "Ajuda",
      items: [
        { Icon: HelpCircle, label: "Tutorial do app", onClick: onOpenTutorial },
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
              {userInitials}
            </span>
          </div>
          <div className="flex-1">
            <div style={{ color: "var(--brand-on-header)", fontSize: 18, fontWeight: 700 }}>
              {userName}
            </div>
            <div style={{ color: "var(--brand-on-header-muted)", fontSize: 13 }}>
              @{userUsername}
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
                  disabled={!it.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-black/5 transition disabled:opacity-80 disabled:active:bg-transparent"
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid var(--brand-border-soft)",
                    cursor: it.onClick ? "pointer" : "default",
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
                  {it.onClick && <ChevronRight size={16} style={{ color: "var(--brand-text-faint)" }} />}
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
