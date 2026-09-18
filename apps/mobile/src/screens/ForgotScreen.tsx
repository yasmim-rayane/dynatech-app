import { useState } from "react";
import { ChevronLeft, Mail, AlertCircle, KeyRound, Lock, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import * as api from "../services/api";

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
  const [isLoading, setIsLoading] = useState(false);
  const [stepError, setStepError] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const identifierOk = EMAIL_RE.test(identifier);

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
              Insira o e-mail vinculado à sua conta. Enviaremos um código de
              recuperação.
            </p>

            <div className="mt-8">
              <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
                E-mail
              </label>
              <input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onBlur={() => touch("identifier")}
                placeholder="seu@email.com"
                className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none transition-colors duration-200"
                style={touched.identifier && !identifierOk ? errorInputStyle : inputStyle}
              />
              {touched.identifier && identifier.length > 0 && !identifierOk && (
                <div
                  className="flex items-center gap-1 mt-1.5"
                  style={{ color: "var(--brand-danger)", fontSize: 11 }}
                >
                  <AlertCircle size={12} /> Insira um e-mail válido (ex: nome@domínio.com)
                </div>
              )}
            </div>

            {stepError && step === "identifier" && (
              <div className="mt-4 px-4 py-3 rounded-xl text-center animate-fadeIn" style={{ background: "var(--brand-danger-soft, rgba(239,68,68,0.1))", color: "var(--brand-danger)", fontSize: 13, fontWeight: 500 }}>
                {stepError}
              </div>
            )}

            <button
              onClick={async () => {
                if (!identifierOk || isLoading) return;
                setIsLoading(true);
                setStepError("");
                try {
                  await api.sendResetCode(identifier.trim());
                  setStep("code");
                } catch (e: any) {
                  if (e?.status === 404) setStepError("Usu\u00e1rio n\u00e3o encontrado.");
                  else setStepError("Erro ao enviar c\u00f3digo. Tente novamente.");
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={!identifierOk || isLoading}
              className="w-full rounded-xl shadow-md mt-6 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              style={{
                height: 52,
                minHeight: 52,
                flexShrink: 0,
                background: identifierOk && !isLoading ? "var(--brand-button-grad)" : "var(--brand-border)",
                color: identifierOk && !isLoading ? "var(--brand-on-header)" : "var(--brand-text-faint)",
                fontSize: 15,
                fontWeight: 600,
                cursor: identifierOk && !isLoading ? "pointer" : "not-allowed",
                opacity: identifierOk && !isLoading ? 1 : 0.7,
              }}
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoading ? "Enviando..." : "Enviar código"}
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

            {stepError && step === "code" && (
              <div className="mt-4 px-4 py-3 rounded-xl text-center animate-fadeIn" style={{ background: "var(--brand-danger-soft, rgba(239,68,68,0.1))", color: "var(--brand-danger)", fontSize: 13, fontWeight: 500 }}>
                {stepError}
              </div>
            )}

            <button
              onClick={async () => {
                if (!codeOk || isLoading) return;
                setIsLoading(true);
                setStepError("");
                try {
                  await api.validateResetCode(identifier.trim(), code);
                  setStep("newPassword");
                } catch (e: any) {
                  if (e?.status === 401) setStepError("C\u00f3digo inv\u00e1lido ou expirado.");
                  else setStepError("Erro ao validar c\u00f3digo.");
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={!codeOk || isLoading}
              className="w-full rounded-xl shadow-md mt-6 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              style={{
                height: 52,
                minHeight: 52,
                flexShrink: 0,
                background: codeOk && !isLoading ? "var(--brand-button-grad)" : "var(--brand-border)",
                color: codeOk && !isLoading ? "var(--brand-on-header)" : "var(--brand-text-faint)",
                fontSize: 15,
                fontWeight: 600,
                cursor: codeOk && !isLoading ? "pointer" : "not-allowed",
                opacity: codeOk && !isLoading ? 1 : 0.7,
              }}
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoading ? "Verificando..." : "Verificar código"}
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
                <div className="relative">
                  <input
                    type={showNewPwd ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={() => touch("newPassword")}
                    placeholder="Mínimo 8 caracteres"
                    maxLength={12}
                    className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none transition-colors duration-200"
                    style={touched.newPassword && !pwChecks.valid ? errorInputStyle : inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-4 top-[22px]"
                    style={{ color: "var(--brand-text-muted)" }}
                  >
                    {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
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
                <div className="relative">
                  <input
                    type={showConfirmPwd ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => touch("confirmPassword")}
                    placeholder="Repita a senha"
                    maxLength={12}
                    className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none transition-colors duration-200"
                    style={touched.confirmPassword && !confirmOk ? errorInputStyle : inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="absolute right-4 top-[22px]"
                    style={{ color: "var(--brand-text-muted)" }}
                  >
                    {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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

            {stepError && step === "newPassword" && (
              <div className="mt-4 px-4 py-3 rounded-xl text-center animate-fadeIn" style={{ background: "var(--brand-danger-soft, rgba(239,68,68,0.1))", color: "var(--brand-danger)", fontSize: 13, fontWeight: 500 }}>
                {stepError}
              </div>
            )}

            <button
              onClick={async () => {
                if (!newPasswordOk || isLoading) return;
                setIsLoading(true);
                setStepError("");
                try {
                  await api.resetPassword(identifier.trim(), code, newPassword);
                  onBack();
                } catch (e: any) {
                  setStepError("Erro ao redefinir senha. Tente novamente.");
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={!newPasswordOk || isLoading}
              className="w-full rounded-xl shadow-md mt-8 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              style={{
                height: 52,
                minHeight: 52,
                flexShrink: 0,
                background: newPasswordOk && !isLoading ? "var(--brand-button-grad)" : "var(--brand-border)",
                color: newPasswordOk && !isLoading ? "var(--brand-on-header)" : "var(--brand-text-faint)",
                fontSize: 15,
                fontWeight: 600,
                cursor: newPasswordOk && !isLoading ? "pointer" : "not-allowed",
                opacity: newPasswordOk && !isLoading ? 1 : 0.7,
              }}
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {isLoading ? "Salvando..." : "Salvar e Voltar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
