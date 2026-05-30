import { useState } from "react";
import { ChevronLeft, Stethoscope, UserCircle } from "lucide-react";
import type { UserRole } from "../services/mockData";

export function RoleSelectionScreen({
  onBack,
  onSelectRole,
}: {
  onBack: () => void;
  onSelectRole: (role: UserRole) => void;
}) {
  const [selected, setSelected] = useState<UserRole | null>(null);

  function handleSelect(role: UserRole) {
    setSelected(role);
    setTimeout(() => onSelectRole(role), 350);
  }

  const roles: {
    key: UserRole;
    Icon: typeof Stethoscope;
    title: string;
    subtitle: string;
    description: string;
    accentColor: string;
    accentSoft: string;
  }[] = [
    {
      key: "professional",
      Icon: Stethoscope,
      title: "Profissional da Saúde",
      subtitle: "Fisioterapeuta, Médico, Terapeuta...",
      description: "Realizo medições, gerencio pacientes e opero o dinamômetro.",
      accentColor: "var(--brand-emerald)",
      accentSoft: "var(--brand-emerald-soft)",
    },
    {
      key: "patient",
      Icon: UserCircle,
      title: "Paciente",
      subtitle: "Acompanho meus resultados",
      description:
        "Visualizo os resultados das medições realizadas pelo meu profissional de saúde.",
      accentColor: "var(--brand-cyan)",
      accentSoft: "var(--brand-cyan-soft)",
    },
  ];

  return (
    <div
      className="min-h-full w-full flex flex-col animate-slideInRight"
      style={{ background: "var(--brand-card)" }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "var(--brand-chip-bg)" }}
        >
          <ChevronLeft size={20} style={{ color: "var(--brand-text)" }} />
        </button>
        <h2
          style={{
            color: "var(--brand-text)",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          Criar conta
        </h2>
      </div>

      <div className="flex-1 px-6 pt-6 pb-10">
        <div className="animate-fadeSlideUp">
          <h3
            style={{
              color: "var(--brand-text)",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Qual é o seu perfil?
          </h3>
          <p
            style={{ color: "var(--brand-text-muted)", fontSize: 14 }}
            className="mt-2 mb-8"
          >
            Escolha como você utilizará o Dyna Tech.
          </p>
        </div>

        <div className="space-y-4">
          {roles.map((role, index) => {
            const isActive = selected === role.key;
            return (
              <button
                key={role.key}
                onClick={() => handleSelect(role.key)}
                className="w-full rounded-2xl p-5 text-left transition-all duration-200 active:scale-[0.98] animate-fadeSlideUp"
                style={{
                  background: "var(--brand-card)",
                  border: `1.5px solid ${isActive ? role.accentColor : "var(--brand-border-soft)"}`,
                  boxShadow: isActive
                    ? `0 0 0 4px ${role.accentSoft}`
                    : "0 2px 8px rgba(0,0,0,0.04)",
                  animationDelay: `${0.1 + index * 0.1}s`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: role.accentSoft }}
                  >
                    <role.Icon
                      size={26}
                      style={{ color: role.accentColor }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        color: "var(--brand-text)",
                        fontSize: 16,
                        fontWeight: 600,
                      }}
                    >
                      {role.title}
                    </div>
                    <div
                      style={{
                        color: role.accentColor,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                      className="mt-0.5"
                    >
                      {role.subtitle}
                    </div>
                    <div
                      style={{
                        color: "var(--brand-text-muted)",
                        fontSize: 13,
                        lineHeight: 1.4,
                      }}
                      className="mt-2"
                    >
                      {role.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
