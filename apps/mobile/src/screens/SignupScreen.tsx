import { useState, useMemo } from "react";
import { ChevronLeft, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

/* ── Helpers de validação ──────────────────────────────────── */

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

/* ── Componente ────────────────────────────────────────────── */

export function SignupScreen({
  onBack,
  onComplete,
}: {
  onBack: () => void;
  onComplete: () => void;
}) {
  const auth = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* Campos "tocados" — exibem erro somente após interação */
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  /* Validações individuais */
  const emailOk = EMAIL_RE.test(email);
  const pwChecks = validatePassword(password);
  const confirmOk = confirm.length > 0 && confirm === password;
  const nameOk = name.trim().length >= 2;
  const usernameOk = username.trim().length >= 4;

  /* Formulário inteiro válido */
  const formValid = useMemo(
    () =>
      nameOk &&
      emailOk &&
      usernameOk &&
      pwChecks.valid &&
      confirmOk,
    [nameOk, emailOk, usernameOk, pwChecks.valid, confirmOk]
  );

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

  const errorTextStyle: React.CSSProperties = {
    color: "var(--brand-danger)",
    fontSize: 11,
    marginTop: 4,
    display: "flex",
    alignItems: "center",
    gap: 4,
  };

  const validTextStyle: React.CSSProperties = {
    color: "var(--brand-emerald)",
    fontSize: 11,
    marginTop: 4,
    display: "flex",
    alignItems: "center",
    gap: 4,
  };

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
        <h2 style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 600 }}>
          Cadastro profissional
        </h2>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 pt-4 space-y-4 scroll-y no-scrollbar">
        <div className="animate-fadeSlideUp mb-2">
          <h3
            style={{
              color: "var(--brand-text)",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Crie sua conta
          </h3>
          <p
            style={{ color: "var(--brand-text-muted)", fontSize: 13 }}
            className="mt-1"
          >
            Preencha os dados para acessar o Dyna Tech como profissional.
          </p>
        </div>

        {/* Nome */}
        <div className="animate-fadeSlideUp" style={{ animationDelay: "0s" }}>
          <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
            Nome completo
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => touch("name")}
            placeholder="Dr. João Mendes"
            maxLength={90}
            className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
            style={touched.name && !nameOk ? errorInputStyle : inputStyle}
          />
          {touched.name && !nameOk && (
            <div style={errorTextStyle}>
              <AlertCircle size={12} /> Insira seu nome completo
            </div>
          )}
        </div>

        {/* E-mail */}
        <div className="animate-fadeSlideUp" style={{ animationDelay: "0.05s" }}>
          <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => touch("email")}
            placeholder="profissional@clinica.com"
            maxLength={45}
            className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
            style={touched.email && !emailOk ? errorInputStyle : inputStyle}
          />
          {touched.email && !emailOk && (
            <div style={errorTextStyle}>
              <AlertCircle size={12} /> Insira um e-mail válido (ex: nome@domínio.com)
            </div>
          )}
        </div>

        {/* Usuário */}
        <div className="animate-fadeSlideUp" style={{ animationDelay: "0.1s" }}>
          <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
            Nome de usuário
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => touch("username")}
            placeholder="@drjoao"
            maxLength={15}
            className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
            style={touched.username && !usernameOk ? errorInputStyle : inputStyle}
          />
          {touched.username && !usernameOk && (
            <div style={errorTextStyle}>
              <AlertCircle size={12} /> Mínimo de 4 caracteres
            </div>
          )}
        </div>

        {/* Senha */}
        <div className="animate-fadeSlideUp" style={{ animationDelay: "0.15s" }}>
          <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
            Senha
          </label>
          <div className="relative mt-1.5">
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => touch("password")}
              placeholder="••••••••"
              maxLength={12}
              className="w-full h-12 pl-4 pr-11 rounded-xl outline-none"
              style={touched.password && !pwChecks.valid ? errorInputStyle : inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--brand-text-faint)" }}
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* Checklist de senha — aparece assim que começa a digitar */}
          {(touched.password || password.length > 0) && (
            <div className="mt-2 space-y-1">
              <PwRule ok={pwChecks.length} label="8 a 12 caracteres" />
              <PwRule ok={pwChecks.upper} label="Letra maiúscula (A-Z)" />
              <PwRule ok={pwChecks.lower} label="Letra minúscula (a-z)" />
              <PwRule ok={pwChecks.digit} label="Número (0-9)" />
              <PwRule ok={pwChecks.special} label="Caractere especial (!@#$…)" />
            </div>
          )}
        </div>

        {/* Confirmar senha */}
        <div className="animate-fadeSlideUp" style={{ animationDelay: "0.2s" }}>
          <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
            Confirmar senha
          </label>
          <div className="relative mt-1.5">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => touch("confirm")}
              placeholder="••••••••"
              maxLength={12}
              className="w-full h-12 pl-4 pr-11 rounded-xl outline-none"
              style={touched.confirm && !confirmOk ? errorInputStyle : inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--brand-text-faint)" }}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {touched.confirm && confirm.length > 0 && !confirmOk && (
            <div style={errorTextStyle}>
              <AlertCircle size={12} /> As senhas não coincidem
            </div>
          )}
          {confirmOk && (
            <div style={validTextStyle}>
              <CheckCircle2 size={12} /> Senhas coincidem
            </div>
          )}
        </div>
      </div>

      {/* CTA fixo */}
      <div
        className="absolute bottom-0 left-0 right-0 safe-bottom"
        style={{
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: 4,
          paddingBottom: "calc(48px + env(safe-area-inset-bottom, 0px))",
          background:
            "linear-gradient(to top, var(--brand-card) 70%, transparent)",
        }}
      >
        {submitError && (
          <div
            className="mb-3 px-4 py-3 rounded-xl text-center animate-fadeIn"
            style={{
              background: "var(--brand-danger-soft, rgba(239,68,68,0.1))",
              color: "var(--brand-danger)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {submitError}
          </div>
        )}
        <button
          onClick={async () => {
            if (!formValid || auth.isLoading) return;
            setSubmitError("");
            try {
              await auth.signupDoctor({
                name: name.trim(),
                userName: username.trim(),
                email: email.trim(),
                password,
              });
              onComplete();
            } catch (e: any) {
              if (e?.status === 409 || e?.status === 400) {
                setSubmitError("E-mail ou usuário já cadastrado.");
              } else {
                setSubmitError("Erro ao criar conta. Tente novamente.");
              }
            }
          }}
          disabled={!formValid || auth.isLoading}
          className="w-full rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            height: 52,
            minHeight: 52,
            flexShrink: 0,
            background: formValid && !auth.isLoading ? "var(--brand-button-grad)" : "var(--brand-border)",
            color: formValid && !auth.isLoading ? "var(--brand-on-header)" : "var(--brand-text-faint)",
            fontSize: 15,
            fontWeight: 600,
            cursor: formValid && !auth.isLoading ? "pointer" : "not-allowed",
            opacity: formValid && !auth.isLoading ? 1 : 0.7,
          }}
        >
          {auth.isLoading && <Loader2 size={18} className="animate-spin" />}
          {auth.isLoading ? "Criando conta..." : "Criar conta"}
        </button>
      </div>
    </div>
  );
}

/* ── Sub-componente: regra de senha ───────────────────────── */

function PwRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className="flex items-center gap-1.5 transition-colors duration-200"
      style={{
        color: ok ? "var(--brand-emerald)" : "var(--brand-text-faint)",
        fontSize: 11,
      }}
    >
      {ok ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
      {label}
    </div>
  );
}
