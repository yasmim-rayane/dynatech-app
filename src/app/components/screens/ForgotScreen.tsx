import { useState } from "react";
import { ChevronLeft, Mail, AlertCircle, KeyRound, Lock, CheckCircle2 } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validatePassword(pw: string) {
  const checks = {
    length: pw.length >= 8 && pw.length <= 12,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    digit: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  return { ...checks, valid: Object.values(checks).every(Boolean) };
}

export function ForgotScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"identifier" | "code" | "newPassword">("identifier");

  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const isEmail = EMAIL_RE.test(identifier);
  const isUsername = identifier.length >= 4 && !identifier.includes(" ");
  const identifierOk = isEmail || isUsername;

  const codeOk = code.length === 6 && /^\d+$/.test(code);

  const pwChecks = validatePassword(newPassword);
  const confirmOk = confirmPassword.length > 0 && confirmPassword === newPassword;
  const newPasswordOk = pwChecks.valid && confirmOk;

  const handleBack = () => {
    if (step === "newPassword") setStep("code");
    else if (step === "code") setStep("identifier");
    else onBack();
  };

  const inputStyle: React.CSSProperties = {
    background: "var(--brand-input-bg)",
    border: "1px solid var(--brand-border)",
    color: "var(--brand-text)",
    fontSize: 14,
  };

  const errorInputStyle: React.CSSProperties = {
    ...inputStyle,
    border: "1px solid var(--brand-danger)",
  };

  return (
    <div
      className="min-h-full w-full flex flex-col animate-slideInRight"
      style={{ background: "var(--brand-card)" }}
    >
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "var(--brand-chip-bg)" }}
        >
          <ChevronLeft size={20} style={{ color: "var(--brand-text)" }} />
        </button>
      </div>

      <div className="px-7 mt-6 flex-1 overflow-y-auto no-scrollbar pb-10">
        
        {step === "identifier" && (
          <div className="animate-fadeIn">
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
              Insira o e-mail ou nome de usuário vinculado à sua conta. Enviaremos um código de
              recuperação.
            </p>

            <div className="mt-8">
              <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
                E-mail ou Nome de usuário
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onBlur={() => touch("identifier")}
                placeholder="seu@email.com ou @usuario"
                className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none transition-colors duration-200"
                style={touched.identifier && !identifierOk ? errorInputStyle : inputStyle}
              />
              {touched.identifier && identifier.length > 0 && !identifierOk && (
                <div
                  className="flex items-center gap-1 mt-1.5"
                  style={{ color: "var(--brand-danger)", fontSize: 11 }}
                >
                  <AlertCircle size={12} /> Insira um e-mail ou usuário válido (mín. 4 caracteres)
                </div>
              )}
            </div>

            <button
              onClick={() => { if(identifierOk) setStep("code") }}
              disabled={!identifierOk}
              className="w-full rounded-xl shadow-md mt-6 transition-all duration-200 active:scale-95"
              style={{
                height: 52,
                minHeight: 52,
                flexShrink: 0,
                background: identifierOk ? "var(--brand-button-grad)" : "var(--brand-border)",
                color: identifierOk ? "var(--brand-on-header)" : "var(--brand-text-faint)",
                fontSize: 15,
                fontWeight: 600,
                cursor: identifierOk ? "pointer" : "not-allowed",
                opacity: identifierOk ? 1 : 0.7,
              }}
            >
              Enviar código
            </button>
          </div>
        )}

        {step === "code" && (
          <div className="animate-fadeIn">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 animate-scaleIn"
              style={{ background: "var(--brand-blue-soft)" }}
            >
              <KeyRound size={28} style={{ color: "var(--brand-blue)" }} />
            </div>
            <h1 style={{ color: "var(--brand-text)", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Verifique seu e-mail
            </h1>
            <p
              style={{ color: "var(--brand-text-muted)", fontSize: 14 }}
              className="mt-2"
            >
              Enviamos um código de 6 dígitos para o e-mail cadastrado.
            </p>

            <div className="mt-8">
              <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
                Código de verificação
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none text-center tracking-[0.5em] transition-colors duration-200"
                style={{ ...inputStyle, fontSize: 18, fontWeight: 600 }}
              />
            </div>

            <button
              onClick={() => { if(codeOk) setStep("newPassword") }}
              disabled={!codeOk}
              className="w-full rounded-xl shadow-md mt-6 transition-all duration-200 active:scale-95"
              style={{
                height: 52,
                minHeight: 52,
                flexShrink: 0,
                background: codeOk ? "var(--brand-button-grad)" : "var(--brand-border)",
                color: codeOk ? "var(--brand-on-header)" : "var(--brand-text-faint)",
                fontSize: 15,
                fontWeight: 600,
                cursor: codeOk ? "pointer" : "not-allowed",
                opacity: codeOk ? 1 : 0.7,
              }}
            >
              Verificar código
            </button>
          </div>
        )}

        {step === "newPassword" && (
          <div className="animate-fadeIn">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 animate-scaleIn"
              style={{ background: "var(--brand-emerald-soft)" }}
            >
              <Lock size={28} style={{ color: "var(--brand-emerald)" }} />
            </div>
            <h1 style={{ color: "var(--brand-text)", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Nova senha
            </h1>
            <p
              style={{ color: "var(--brand-text-muted)", fontSize: 14 }}
              className="mt-2"
            >
              Crie uma nova senha forte e segura para a sua conta.
            </p>

            <div className="mt-8 space-y-4">
              <div>
                <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
                  Nova senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => touch("newPassword")}
                  placeholder="Mínimo 8 caracteres"
                  maxLength={12}
                  className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none transition-colors duration-200"
                  style={touched.newPassword && !pwChecks.valid ? errorInputStyle : inputStyle}
                />
                
                {/* Indicadores de senha */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                  <div style={{ color: pwChecks.length ? "var(--brand-emerald)" : "var(--brand-text-faint)", display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={12} /> 8 a 12 caracteres
                  </div>
                  <div style={{ color: pwChecks.upper ? "var(--brand-emerald)" : "var(--brand-text-faint)", display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={12} /> Letra maiúscula
                  </div>
                  <div style={{ color: pwChecks.lower ? "var(--brand-emerald)" : "var(--brand-text-faint)", display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={12} /> Letra minúscula
                  </div>
                  <div style={{ color: pwChecks.digit ? "var(--brand-emerald)" : "var(--brand-text-faint)", display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={12} /> Número
                  </div>
                  <div style={{ color: pwChecks.special ? "var(--brand-emerald)" : "var(--brand-text-faint)", display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 size={12} /> Caractere especial
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => touch("confirmPassword")}
                  placeholder="Repita a senha"
                  maxLength={12}
                  className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none transition-colors duration-200"
                  style={touched.confirmPassword && !confirmOk ? errorInputStyle : inputStyle}
                />
                {touched.confirmPassword && !confirmOk && (
                  <div
                    className="flex items-center gap-1 mt-1.5"
                    style={{ color: "var(--brand-danger)", fontSize: 11 }}
                  >
                    <AlertCircle size={12} /> As senhas não coincidem
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => { if(newPasswordOk) onBack() }}
              disabled={!newPasswordOk}
              className="w-full rounded-xl shadow-md mt-8 transition-all duration-200 active:scale-95"
              style={{
                height: 52,
                minHeight: 52,
                flexShrink: 0,
                background: newPasswordOk ? "var(--brand-button-grad)" : "var(--brand-border)",
                color: newPasswordOk ? "var(--brand-on-header)" : "var(--brand-text-faint)",
                fontSize: 15,
                fontWeight: 600,
                cursor: newPasswordOk ? "pointer" : "not-allowed",
                opacity: newPasswordOk ? 1 : 0.7,
              }}
            >
              Salvar e Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
