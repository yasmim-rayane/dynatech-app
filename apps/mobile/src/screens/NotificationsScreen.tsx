import {
  ChevronLeft,
  Bell,
  TrendingUp,
  Clock,
  Bluetooth,
  Award,
  CheckCheck,
} from "lucide-react";

export function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const groups = [
    {
      label: "Hoje",
      items: [
        {
          Icon: Award,
          title: "Novo recorde pessoal!",
          body: "Você atingiu 44.8 kgf na preensão palmar — seu maior valor.",
          time: "14:35",
          unread: true,
          tone: "emerald" as const,
        },
        {
          Icon: Clock,
          title: "Lembrete: Medição matinal",
          body: "Está na hora da sua sessão de Preensão Palmar.",
          time: "08:00",
          unread: true,
          tone: "navy" as const,
        },
      ],
    },
    {
      label: "Esta semana",
      items: [
        {
          Icon: TrendingUp,
          title: "Sua semana melhorou 5.8%",
          body: "Sua média de preensão subiu em relação à semana anterior.",
          time: "Ontem",
          unread: false,
          tone: "cyan" as const,
        },
        {
          Icon: Bluetooth,
          title: "Dispositivo conectado",
          body: "Dyna Tech Grip foi pareado com sucesso.",
          time: "2 dias",
          unread: false,
          tone: "navy" as const,
        },
        {
          Icon: Bell,
          title: "Novo lembrete criado",
          body: "Treino noturno às 19:30 — Diariamente.",
          time: "3 dias",
          unread: false,
          tone: "navy" as const,
        },
      ],
    },
  ];

  const toneMap = {
    emerald: { bg: "var(--brand-emerald-soft)", fg: "var(--brand-emerald)" },
    cyan: { bg: "var(--brand-chip-bg)", fg: "var(--brand-cyan)" },
    navy: { bg: "var(--brand-chip-bg)", fg: "var(--brand-text)" },
  };

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
        <button
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
      </div>

      <div className="px-5 pt-3 pb-10 space-y-6">
        {groups.map((g) => (
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
                return (
                  <div
                    key={i}
                    className="rounded-2xl p-4 flex gap-3 relative animate-fadeSlideUp"
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
                      <it.Icon size={18} style={{ color: tone.fg }} />
                    </div>
                    <div className="flex-1 min-w-0">
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
                          {it.time}
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
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
