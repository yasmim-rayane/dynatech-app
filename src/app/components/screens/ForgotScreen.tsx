import { useState } from "react";
import { ChevronLeft, Mail, AlertCircle } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ForgotScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const emailOk = EMAIL_RE.test(email);

  return (
    <div
      className="h-full w-full flex flex-col animate-slideInRight"
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
      </div>

      <div className="px-7 mt-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 animate-scaleIn"
          style={{ background: "var(--brand-emerald-soft)" }}
        >
          <Mail size={28} style={{ color: "var(--brand-emerald)" }} />
        </div>
        <h1 style={{ color: "var(--brand-text)", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Recuperar senha
        </h1>
        <p
          style={{ color: "var(--brand-text-muted)", fontSize: 14 }}
          className="mt-2"
        >
          Insira o e-mail vinculado à sua conta. Enviaremos um link de
          recuperação.
        </p>

        <div className="mt-8">
          <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="seu@email.com"
            className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none transition-colors duration-200"
            style={{
              background: "var(--brand-input-bg)",
              border: `1px solid ${touched && !emailOk ? "var(--brand-danger)" : "var(--brand-border)"}`,
              color: "var(--brand-text)",
              fontSize: 14,
            }}
          />
          {touched && email.length > 0 && !emailOk && (
            <div
              className="flex items-center gap-1 mt-1"
              style={{ color: "var(--brand-danger)", fontSize: 11 }}
            >
              <AlertCircle size={12} /> Insira um e-mail válido (ex: nome@domínio.com)
            </div>
          )}
        </div>

        <button
          onClick={emailOk ? onBack : undefined}
          disabled={!emailOk}
          className="w-full rounded-xl shadow-md mt-6 transition-all duration-200"
          style={{
            height: 52,
            background: emailOk ? "var(--brand-button-grad)" : "var(--brand-border)",
            color: emailOk ? "var(--brand-on-header)" : "var(--brand-text-faint)",
            fontSize: 15,
            fontWeight: 600,
            cursor: emailOk ? "pointer" : "not-allowed",
            opacity: emailOk ? 1 : 0.7,
          }}
        >
          Enviar link
        </button>
      </div>
    </div>
  );
}
