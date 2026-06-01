import { ArrowRight, HeartPulse, ShieldCheck, Activity } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function PatientBenefitsScreen({ onContinue }: { onContinue: () => void }) {
  const { theme } = useTheme();

  return (
    <div
      className="min-h-full w-full flex flex-col justify-between"
      style={{ background: "var(--brand-card)" }}
    >
      <div className="flex-1 px-6 pt-12 pb-6 scroll-y">
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center animate-scaleIn" style={{ background: "var(--brand-emerald-soft)" }}>
            <Activity size={32} style={{ color: "var(--brand-emerald)" }} />
          </div>
        </div>

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
        </div>
      </div>

      <div className="p-6" style={{ paddingBottom: "calc(48px + env(safe-area-inset-bottom, 0px))" }}>
        <button
          onClick={onContinue}
          className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          style={{ background: "var(--brand-accent-grad)", color: "#FFFFFF", fontWeight: 700, fontSize: 16 }}
        >
          Acessar meus resultados
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
