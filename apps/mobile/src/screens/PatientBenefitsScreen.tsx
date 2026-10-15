import { ArrowRight, HeartPulse, ShieldCheck, Activity, Zap, ChevronLeft } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function PatientBenefitsScreen({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack?: () => void;
}) {
  const { theme } = useTheme();

  return (
    <div
      className="min-h-full w-full flex flex-col justify-between"
      style={{ background: "var(--brand-card)" }}
    >
      {/* Header opcional para modo "Tutorial" via Perfil */}
      {onBack && (
        <div className="px-5 pt-4 pb-2 flex items-center gap-3 animate-fadeSlideDown">
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
            Benefícios
          </h2>
        </div>
      )}

      <div className="flex-1 px-6 pt-12 pb-6 scroll-y no-scrollbar">
        {!onBack && (
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center animate-scaleIn" style={{ background: "var(--brand-emerald-soft)" }}>
              <Activity size={32} style={{ color: "var(--brand-emerald)" }} />
            </div>
          </div>
        )}

        <h1
          className="text-center animate-fadeSlideDown"
          style={{ color: "var(--brand-text)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.2 }}
        >
          A força nas suas mãos
        </h1>
        <p
          className="text-center mt-3 animate-fadeSlideDown"
          style={{ color: "var(--brand-text-muted)", fontSize: 15, animationDelay: "0.1s" }}
        >
          A preensão palmar é um dos indicadores mais precisos sobre sua saúde e vitalidade.
        </p>

        <div className="mt-10 space-y-6">
          <div className="flex gap-4 items-start animate-fadeSlideUp" style={{ animationDelay: "0.2s" }}>
            <div className="mt-1 w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm" style={{ background: "var(--brand-blue-soft)" }}>
              <HeartPulse size={24} style={{ color: "var(--brand-blue)" }} />
            </div>
            <div>
              <h3 style={{ color: "var(--brand-text)", fontSize: 16, fontWeight: 700 }}>Marcador de Longevidade</h3>
              <p style={{ color: "var(--brand-text-muted)", fontSize: 14, lineHeight: 1.4 }} className="mt-1">
                A força com que você aperta reflete a qualidade da sua massa muscular geral e saúde cardiovascular.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start animate-fadeSlideUp" style={{ animationDelay: "0.3s" }}>
            <div className="mt-1 w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm" style={{ background: "var(--brand-emerald-soft)" }}>
              <ShieldCheck size={24} style={{ color: "var(--brand-emerald)" }} />
            </div>
            <div>
              <h3 style={{ color: "var(--brand-text)", fontSize: 16, fontWeight: 700 }}>Prevenção de Riscos</h3>
              <p style={{ color: "var(--brand-text-muted)", fontSize: 14, lineHeight: 1.4 }} className="mt-1">
                Uma boa preensão ajuda a prevenir quedas, fraqueza progressiva e melhora a qualidade do sono e recuperação.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start animate-fadeSlideUp" style={{ animationDelay: "0.4s" }}>
            <div className="mt-1 w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm" style={{ background: "var(--brand-chip-bg)" }}>
              <Activity size={24} style={{ color: "var(--brand-text)" }} />
            </div>
            <div>
              <h3 style={{ color: "var(--brand-text)", fontSize: 16, fontWeight: 700 }}>O que é o Dinamômetro?</h3>
              <p style={{ color: "var(--brand-text-muted)", fontSize: 14, lineHeight: 1.4 }} className="mt-1">
                É um dispositivo de alta precisão que mede a força máxima que você consegue aplicar ao apertá-lo, permitindo aos profissionais avaliar e monitorar sua saúde muscular de forma exata.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start animate-fadeSlideUp" style={{ animationDelay: "0.5s" }}>
            <div className="mt-1 w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm" style={{ background: "var(--brand-warning-soft, rgba(245,158,11,0.1))" }}>
              <Zap size={24} style={{ color: "var(--brand-warning, #f59e0b)" }} />
            </div>
            <div>
              <h3 style={{ color: "var(--brand-text)", fontSize: 16, fontWeight: 700 }}>Por que acompanhar?</h3>
              <p style={{ color: "var(--brand-text-muted)", fontSize: 14, lineHeight: 1.4 }} className="mt-1">
                Com o acompanhamento contínuo da sua força, o seu profissional de saúde pode ajustar tratamentos, dietas e treinos com base no seu progresso real.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6" style={{ paddingBottom: "calc(48px + env(safe-area-inset-bottom, 0px))" }}>
        <button
          onClick={onContinue}
          className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform animate-fadeSlideUp"
          style={{ animationDelay: "0.6s", background: "var(--brand-accent-grad)", color: "#FFFFFF", fontWeight: 700, fontSize: 16 }}
        >
          {onBack ? "Entendi" : "Acessar meus resultados"}
          {!onBack && <ArrowRight size={20} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
}
