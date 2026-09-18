<<<<<<< Updated upstream
import { Home, LineChart, Bell, User } from "lucide-react";
=======
import { Home, LineChart, User, Users } from "lucide-react";
import type { UserRole } from "../../contexts/AuthContext";
>>>>>>> Stashed changes

export type Tab = "home" | "history" | "reminders" | "profile";

export function BottomNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  const items: { key: Tab; label: string; Icon: typeof Home }[] = [
    { key: "home", label: "Início", Icon: Home },
    { key: "history", label: "Histórico", Icon: LineChart },
    { key: "reminders", label: "Lembretes", Icon: Bell },
    { key: "profile", label: "Perfil", Icon: User },
  ];
  return (
    <nav
      className="flex justify-around items-end safe-bottom"
      style={{
        paddingTop: 8,
        paddingBottom: 15,
        background: "var(--brand-card)",
        borderTop: "1px solid var(--brand-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {items.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="flex flex-col items-center gap-0.5 flex-1 py-1 transition-all duration-200"
            style={{
              transform: isActive ? "scale(1.08)" : "scale(1)",
            }}
          >
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 36,
                height: 35,
              }}
            >
              {isActive && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "var(--brand-emerald-soft)",
                    transform: "scaleX(1.2)",
                  }}
                />
              )}
              <Icon
                size={22}
                className="relative z-10"
                style={{
                  color: isActive ? "var(--brand-emerald)" : "var(--brand-text-faint)",
                }}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                color: isActive ? "var(--brand-emerald)" : "var(--brand-text-faint)",
                fontWeight: isActive ? 600 : 400,
                letterSpacing: isActive ? "0.01em" : "normal",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
