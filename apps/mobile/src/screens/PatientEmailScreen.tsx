import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, Mail, AlertCircle, Loader2, ShieldAlert, X } from "lucide-react";
import { getUser } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function PatientEmailScreen({
  onBack,
  onEmailValid,
}: {
  onBack: () => void;
  onEmailValid: (email: string) => void;
}) {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [showDenied, setShowDenied] = useState(false);

  const emailOk = EMAIL_RE.test(email);

  async function handleSubmit() {
    if (!emailOk || isLoading) return;
    setIsLoading(true);
    try {
      // Verifica se o email existe no backend (cadastrado por um profissional)
      await getUser(email.trim());
      // Se não lançou erro, o user existe → pode criar conta
      onEmailValid(email.trim());
    } catch (e: any) {
      // 404 = email não cadastrado por profissional
      setShowDenied(true);
    } finally {
      setIsLoading(false);
    }
  }

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
          Conta de paciente
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
            Qual é o seu e-mail?
          </h3>
          <p
            style={{
              color: "var(--brand-text-muted)",
              fontSize: 14,
              lineHeight: 1.5,
            }}
            className="mt-2 mb-8"
          >
            Insira o e-mail que o seu profissional de saúde cadastrou no sistema.
          </p>
        </div>

        <div className="animate-fadeSlideUp" style={{ animationDelay: "0.1s" }}>
          <label
            style={{
              fontSize: 13,
              color: "var(--brand-text)",
              fontWeight: 500,
            }}
          >
            E-mail
          </label>
          <div className="relative mt-1.5">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--brand-text-faint)" }}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="seu@email.com"
              maxLength={45}
              className="w-full h-14 pl-11 pr-4 rounded-xl outline-none transition"
              style={{
                background: "var(--brand-input-bg)",
                border: `1px solid ${touched && !emailOk ? "var(--brand-danger)" : "var(--brand-border)"}`,
                color: "var(--brand-text)",
                fontSize: 15,
              }}
            />
          </div>
          {touched && !emailOk && (
            <div
              style={{
                color: "var(--brand-danger)",
                fontSize: 12,
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <AlertCircle size={12} /> Insira um e-mail válido
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!emailOk || isLoading}
          className="w-full mt-8 rounded-xl shadow-md active:scale-[0.97] transition-transform flex items-center justify-center gap-2 animate-fadeSlideUp"
          style={{
            height: 52,
            minHeight: 52,
            background:
              emailOk && !isLoading
                ? "var(--brand-accent-grad)"
                : "var(--brand-border)",
            color:
              emailOk && !isLoading
                ? "#FFFFFF"
                : "var(--brand-text-faint)",
            fontSize: 15,
            fontWeight: 600,
            cursor: emailOk && !isLoading ? "pointer" : "not-allowed",
            opacity: emailOk && !isLoading ? 1 : 0.7,
            animationDelay: "0.2s",
          }}
        >
          {isLoading && <Loader2 size={18} className="animate-spin" />}
          {isLoading ? "Verificando..." : "Continuar"}
        </button>
      </div>

      {/* Modal — Acesso Negado */}
      {showDenied &&
        typeof document !== "undefined" &&
        createPortal(
          <div className={theme === "dark" ? "dark" : ""}>
            <div
              className="fixed inset-0 flex items-end justify-center sm:items-center"
              style={{ zIndex: 9999 }}
            >
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={() => setShowDenied(false)}
              />

              {/* Sheet */}
              <div
                className="relative w-full sm:w-[400px] max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 pb-8 animate-slideUp sm:animate-scaleIn"
                style={{
                  background: "var(--brand-card)",
                  border: "1px solid var(--brand-border-soft)",
                }}
              >
                <button
                  onClick={() => setShowDenied(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                  style={{ background: "var(--brand-chip-bg)" }}
                >
                  <X size={18} style={{ color: "var(--brand-text)" }} />
                </button>

                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "var(--brand-danger-soft)" }}
                >
                  <ShieldAlert
                    size={28}
                    style={{ color: "var(--brand-danger)" }}
                  />
                </div>

                <h2
                  style={{
                    color: "var(--brand-text)",
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  }}
                  className="mb-2"
                >
                  Acesso negado
                </h2>

                <p
                  style={{
                    color: "var(--brand-text-muted)",
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                  className="mb-2"
                >
                  Um profissional de saúde precisa cadastrar o seu e-mail no
                  sistema antes de você criar sua conta.
                </p>

                <p
                  style={{
                    color: "var(--brand-text-faint)",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                  className="mb-6"
                >
                  Entre em contato com o seu fisioterapeuta ou profissional
                  responsável e solicite que ele adicione seu e-mail na aba de
                  pacientes do aplicativo.
                </p>

                <button
                  onClick={() => setShowDenied(false)}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] active:scale-95 transition-transform shadow-md"
                  style={{ background: "var(--brand-button-grad)" }}
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
