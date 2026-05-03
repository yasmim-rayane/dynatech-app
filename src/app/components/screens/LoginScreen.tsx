import { useState } from "react";
import { Logo } from "../common/Logo";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export function LoginScreen({
  onLogin,
  onSignup,
  onForgot,
}: {
  onLogin: () => void;
  onSignup: () => void;
  onForgot: () => void;
}) {
  const [showPwd, setShowPwd] = useState(false);
  return (
    <div
      className="min-h-full w-full px-7 pt-8 pb-8 animate-fadeSlideUp"
      style={{ background: "var(--brand-card)" }}
    >
      <div className="flex flex-col items-center mt-6 mb-10">
        <div className="animate-scaleIn">
          <Logo size={72} />
        </div>
        <h1
          style={{ color: "var(--brand-text)", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}
          className="mt-4"
        >
          Dyna Tech
        </h1>
        <p style={{ color: "var(--brand-text-muted)", fontSize: 13 }} className="mt-1">
          Saúde e performance na sua mão
        </p>
      </div>

      <div className="space-y-4">
        <Field label="E-mail ou usuário" Icon={Mail} type="email" placeholder="usuário ou seu@email.com" />
        <div>
          <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
            Senha
          </label>
          <div className="relative mt-1.5">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--brand-text-faint)" }}
            />
            <input
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              className="w-full h-12 pl-11 pr-11 rounded-xl outline-none transition"
              style={{
                background: "var(--brand-input-bg)",
                border: "1px solid var(--brand-border)",
                color: "var(--brand-text)",
                fontSize: 14,
              }}
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
        </div>

        <button
          onClick={onForgot}
          className="block ml-auto"
          style={{ color: "var(--brand-emerald)", fontSize: 13, fontWeight: 500 }}
        >
          Esqueceu sua senha?
        </button>
      </div>

      <button
        onClick={onLogin}
        className="w-full mt-8 rounded-xl shadow-md active:scale-[0.97] transition-transform"
        style={{
          height: 52,
          minHeight: 52,
          flexShrink: 0,
          background: "var(--brand-button-grad)",
          color: "var(--brand-on-header)",
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        Entrar
      </button>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px" style={{ background: "var(--brand-border)" }} />
        <span style={{ color: "var(--brand-text-faint)", fontSize: 12 }}>ou</span>
        <div className="flex-1 h-px" style={{ background: "var(--brand-border)" }} />
      </div>

      <div className="text-center">
        <span style={{ color: "var(--brand-text-muted)", fontSize: 14 }}>
          Não tem conta?{" "}
        </span>
        <button
          onClick={onSignup}
          style={{ color: "var(--brand-emerald)", fontSize: 14, fontWeight: 600 }}
        >
          Cadastre-se
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  Icon,
  type,
  placeholder,
}: {
  label: string;
  Icon: typeof Mail;
  type: string;
  placeholder: string;
}) {
  return (
    <div>
      <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
        {label}
      </label>
      <div className="relative mt-1.5">
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: "var(--brand-text-faint)" }}
        />
        <input
          type={type}
          placeholder={placeholder}
          className="w-full h-12 pl-11 pr-4 rounded-xl outline-none transition"
          style={{
            background: "var(--brand-input-bg)",
            border: "1px solid var(--brand-border)",
            color: "var(--brand-text)",
            fontSize: 14,
          }}
        />
      </div>
    </div>
  );
}
