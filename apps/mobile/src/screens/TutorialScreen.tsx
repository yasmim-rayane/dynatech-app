import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Bluetooth,
  Smartphone,
  Zap,
  Grip,
  ArrowRight,
} from "lucide-react";

/* ── Dados dos passos do tutorial ──────────────────────────── */

const STEPS = [
  {
    icon: Grip,
    color: "var(--brand-emerald)",
    title: "Conheça seu dinamômetro",
    description:
      "O DynaTech Grip é um dinamômetro digital portátil que mede a força de preensão palmar. " +
      "Ele registra a força aplicada em quilogramas-força (kgf) e transmite os dados em tempo real " +
      "para o aplicativo via Bluetooth.",
    tips: [
      "Segure o aparelho com firmeza na mão dominante",
      "Mantenha o braço estendido ao lado do corpo",
      "Aperte com a máxima força por 3 a 5 segundos",
    ],
  },
  {
    icon: Smartphone,
    color: "var(--brand-cyan)",
    title: "Como usar o aplicativo",
    description:
      "O app DynaTech permite visualizar suas medições em tempo real, acompanhar o histórico de " +
      "aferições e monitorar a evolução da sua força ao longo do tempo. Configure lembretes para " +
      "manter a regularidade.",
    tips: [
      "Na tela inicial, inicie uma nova medição",
      "Consulte seu histórico de medições a qualquer momento",
      "Configure lembretes para aferições regulares",
    ],
  },
  {
    icon: Bluetooth,
    color: "#6366F1",
    title: "O que é pareamento Bluetooth?",
    description:
      "O pareamento Bluetooth é o processo de estabelecer uma conexão sem fio entre o dinamômetro " +
      "e o seu celular. Após o pareamento, os dois dispositivos se reconhecem automaticamente e " +
      "trocam dados de medição de forma segura.",
    tips: [
      "O Bluetooth deve estar ativado no celular",
      "O dinamômetro precisa estar ligado e próximo",
      "O alcance máximo é de aproximadamente 10 metros",
    ],
  },
  {
    icon: Zap,
    color: "var(--brand-emerald)",
    title: "Pronto para começar!",
    description:
      "Na próxima tela, você verá os dispositivos DynaTech disponíveis por perto. " +
      'Toque em "Conectar" no dispositivo desejado para iniciar o pareamento. ' +
      "Após a conexão, você será levado à tela inicial do app.",
    tips: [
      "Ligue o dinamômetro antes de prosseguir",
      "Mantenha-o a menos de 1 metro do celular",
      "O pareamento leva apenas alguns segundos",
    ],
  },
];

/* ── Componente ────────────────────────────────────────────── */

export function TutorialScreen({
  onComplete,
  onBack,
}: {
  onComplete: () => void;
  onBack?: () => void;
}) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="h-full w-full flex flex-col animate-fadeSlideUp"
      style={{ background: "var(--brand-card)" }}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-3" style={{ flexShrink: 0 }}>
        {onBack && step === 0 && (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: "var(--brand-chip-bg)" }}
          >
            <ChevronLeft size={20} style={{ color: "var(--brand-text)" }} />
          </button>
        )}
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: "var(--brand-chip-bg)" }}
          >
            <ChevronLeft size={20} style={{ color: "var(--brand-text)" }} />
          </button>
        )}
        <h2 style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 600 }}>
          Como funciona
        </h2>

        {/* Pular */}
        {!isLast && (
          <button
            onClick={onComplete}
            className="ml-auto active:scale-95 transition-transform"
            style={{ color: "var(--brand-text-muted)", fontSize: 13, fontWeight: 500 }}
          >
            Pular
          </button>
        )}
      </div>

      {/* Step indicator dots */}
      <div className="flex items-center justify-center gap-2 py-3" style={{ flexShrink: 0 }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === step ? 24 : 8,
              height: 8,
              background:
                i === step
                  ? "var(--brand-emerald)"
                  : i < step
                    ? "var(--brand-emerald-soft)"
                    : "var(--brand-border)",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-36 scroll-y no-scrollbar">
        {/* Icon hero */}
        <div
          className="flex items-center justify-center my-6 animate-scaleIn"
          key={`icon-${step}`}
        >
          <div
            className="relative w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: `${current.color}14`,
              boxShadow: `0 0 40px ${current.color}22`,
            }}
          >
            <div
              className="absolute inset-0 rounded-full animate-pulseGlow"
              style={{
                boxShadow: `0 0 0 0 ${current.color}40`,
              }}
            />
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${current.color}22, ${current.color}44)`,
              }}
            >
              <current.icon size={36} style={{ color: current.color }} />
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="animate-fadeSlideUp" key={`content-${step}`}>
          <h3
            className="text-center mb-3"
            style={{
              color: "var(--brand-text)",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {current.title}
          </h3>

          <p
            className="text-center mb-6"
            style={{
              color: "var(--brand-text-muted)",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {current.description}
          </p>

          {/* Tips list */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{
              background: "var(--brand-input-bg)",
              border: "1px solid var(--brand-border-soft)",
            }}
          >
            <div
              style={{
                color: "var(--brand-text-faint)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              {isLast ? "ANTES DE PROSSEGUIR" : "DICAS IMPORTANTES"}
            </div>
            {current.tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 animate-fadeSlideUp"
                style={{ animationDelay: `${0.1 * (i + 1)}s` }}
              >
                <div
                  className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${current.color}18`,
                    fontSize: 11,
                    fontWeight: 700,
                    color: current.color,
                  }}
                >
                  {i + 1}
                </div>
                <span
                  style={{
                    color: "var(--brand-text)",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA fixo */}
      <div
        className="absolute bottom-0 left-0 right-0 safe-bottom"
        style={{
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 4,
          paddingBottom: 48,
          background:
            "linear-gradient(to top, var(--brand-card) 70%, transparent)",
        }}
      >
        <button
          onClick={() => {
            if (isLast) onComplete();
            else setStep((s) => s + 1);
          }}
          className="w-full rounded-xl shadow-md transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-2"
          style={{
            height: 52,
            minHeight: 52,
            flexShrink: 0,
            background: isLast
              ? "var(--brand-accent-grad)"
              : "var(--brand-button-grad)",
            color: "var(--brand-on-header)",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          {isLast ? (
            <>
              Conectar dispositivo
              <Bluetooth size={18} />
            </>
          ) : (
            <>
              Próximo
              <ChevronRight size={18} />
            </>
          )}
        </button>

        {/* Step counter */}
        <div
          className="text-center mt-3"
          style={{
            color: "var(--brand-text-faint)",
            fontSize: 12,
          }}
        >
          {step + 1} de {STEPS.length}
        </div>
      </div>
    </div>
  );
}
