import {
  ChevronLeft,
  Bell,
  TrendingUp,
  Clock,
  Bluetooth,
  Award,
  CheckCheck,
  Trash2,
  X,
} from "lucide-react";
import { useAppNotifications, AppNotification, NotificationIcon } from "../contexts/NotificationsContext";

export function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const { notifications, markAllAsRead, deleteNotification, deleteAllNotifications } = useAppNotifications();
  const toneMap = {
    emerald: { bg: "var(--brand-emerald-soft)", fg: "var(--brand-emerald)" },
    cyan: { bg: "var(--brand-chip-bg)", fg: "var(--brand-cyan)" },
    navy: { bg: "var(--brand-chip-bg)", fg: "var(--brand-text)" },
  };

  const IconMap: Record<NotificationIcon, React.ElementType> = {
    award: Award,
    clock: Clock,
    "trending-up": TrendingUp,
    bluetooth: Bluetooth,
    bell: Bell,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const groups: { label: string; items: AppNotification[] }[] = [];
  const hoje: AppNotification[] = [];
  const anteriores: AppNotification[] = [];

  notifications.forEach((n) => {
    if (n.timestamp >= today.getTime()) {
      hoje.push(n);
    } else {
      anteriores.push(n);
    }
  });

  if (hoje.length > 0) groups.push({ label: "Hoje", items: hoje });
  if (anteriores.length > 0) groups.push({ label: "Anteriores", items: anteriores });

  function formatTime(ts: number) {
    const d = new Date(ts);
    if (ts >= today.getTime()) {
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    }
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  }

  return (
    <div
      className="h-full w-full animate-slideInRight"
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
        <h2
          style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 600 }}
          className="flex-1"
        >
          Notificações
        </h2>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={deleteAllNotifications}
                className="flex items-center justify-center w-8 h-8 rounded-full active:scale-95 transition-transform"
                style={{
                  background: "var(--brand-danger-soft, rgba(239,68,68,0.1))",
                  color: "var(--brand-danger, #ef4444)",
                }}
                title="Limpar todas"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 active:scale-95 transition-transform"
                style={{
                  background: "var(--brand-emerald-soft)",
                  color: "var(--brand-emerald)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <CheckCheck size={14} />
                Ler tudo
              </button>
            </>
          )}
        </div>
      </div>

      <div className="px-5 pt-3 pb-10 space-y-6">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <Bell size={48} style={{ color: "var(--brand-border-soft)", marginBottom: 16 }} />
            <span style={{ color: "var(--brand-text-muted)", fontSize: 15, fontWeight: 500 }}>
              Nenhuma notificação por enquanto.
            </span>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.label}>
              <div
                className="px-1 mb-2"
                style={{
                  color: "var(--brand-text-faint)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                {g.label.toUpperCase()}
              </div>
              <div className="space-y-2">
                {g.items.map((it, i) => {
                  const tone = toneMap[it.tone];
                  const IconComp = IconMap[it.icon] || Bell;
                  return (
                    <div
                      key={it.id}
                      className="rounded-2xl p-4 flex gap-3 relative animate-fadeSlideUp group"
                      style={{
                        background: "var(--brand-card)",
                        border: "1px solid var(--brand-border-soft)",
                        animationDelay: `${0.05 * i}s`,
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: tone.bg }}
                      >
                        <IconComp size={18} style={{ color: tone.fg }} />
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-baseline gap-2">
                          <div
                            style={{
                              color: "var(--brand-text)",
                              fontSize: 14,
                              fontWeight: 600,
                            }}
                            className="flex-1 truncate"
                          >
                            {it.title}
                          </div>
                          <div
                            style={{ color: "var(--brand-text-faint)", fontSize: 11 }}
                          >
                            {formatTime(it.timestamp)}
                          </div>
                        </div>
                        <div
                          style={{
                            color: "var(--brand-text-muted)",
                            fontSize: 13,
                            lineHeight: 1.4,
                          }}
                          className="mt-1"
                        >
                          {it.body}
                        </div>
                      </div>
                      {it.unread && (
                        <span
                          className="absolute top-3 right-3 w-2 h-2 rounded-full"
                          style={{ background: "var(--brand-emerald)" }}
                        />
                      )}
                      <button
                        onClick={() => deleteNotification(it.id)}
                        className="absolute bottom-3 right-3 p-1 rounded-full opacity-60 active:opacity-100 transition-opacity"
                        style={{ color: "var(--brand-danger, #ef4444)" }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
