import { useState } from "react";
import { Logo } from "../components/common/Logo";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const auth = useAuth();

  async function handleLogin() {
    setLocalError("");
    if (!email.trim() || !password.trim()) {
      setLocalError("Preencha e-mail e senha.");
      return;
    }
    try {
      await auth.login(email.trim(), password);
      onLogin();
    } catch (e: any) {
      // Auth context already sets the error message
      if (e?.status === 404) setLocalError("Usuário não encontrado.");
      else if (e?.status === 401) setLocalError("Senha incorreta.");
      else setLocalError("Erro de conexão. Verifique sua internet.");
    }
  }

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
        <div>
          <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
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
              placeholder="seu@email.com"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 pl-11 pr-11 rounded-xl outline-none transition"
              style={{
                background: "var(--brand-input-bg)",
                border: "1px solid var(--brand-border)",
                color: "var(--brand-text)",
                fontSize: 14,
              }}
              onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
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

      {/* Error message */}
      {localError && (
        <div
          className="mt-4 px-4 py-3 rounded-xl text-center animate-fadeIn"
          style={{
            background: "var(--brand-danger-soft, rgba(239,68,68,0.1))",
            color: "var(--brand-danger)",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {localError}
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={auth.isLoading}
        className="w-full mt-8 rounded-xl shadow-md active:scale-[0.97] transition-transform flex items-center justify-center gap-2"
        style={{
          height: 52,
          minHeight: 52,
          flexShrink: 0,
          background: "var(--brand-button-grad)",
          color: "var(--brand-on-header)",
          fontSize: 15,
          fontWeight: 600,
          opacity: auth.isLoading ? 0.7 : 1,
        }}
      >
        {auth.isLoading && <Loader2 size={18} className="animate-spin" />}
        {auth.isLoading ? "Entrando..." : "Entrar"}
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
