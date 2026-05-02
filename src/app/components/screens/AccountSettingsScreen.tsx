import { ChevronLeft, User, Scale, Ruler, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validatePassword(pw: string) {
  if (pw.length === 0) return { valid: true }; // Opcional alterar senha em configs
  const checks = {
    length: pw.length >= 8 && pw.length <= 12,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    digit: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  return { ...checks, valid: Object.values(checks).every(Boolean) };
}

export function AccountSettingsScreen({ onBack }: { onBack: () => void }) {
  const [showPwd, setShowPwd] = useState(false);

  const [name, setName] = useState("Maria Silva");
  const [email, setEmail] = useState("maria@email.com");
  const [peso, setPeso] = useState("62");
  const [altura, setAltura] = useState("168");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");

  const emailOk = EMAIL_RE.test(email);
  const nameOk = name.trim().length >= 2;
  const pwChecks = validatePassword(newPwd);
  const pesoOk = peso.length > 0;
  const alturaOk = altura.length > 0;

  const formValid = nameOk && emailOk && pwChecks.valid && pesoOk && alturaOk;

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
      className="min-h-full w-full animate-slideInRight"
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
        <h2 style={{ color: "var(--brand-text)", fontSize: 18, fontWeight: 600 }}>
          Configurações de conta
        </h2>
      </div>

      <div className="px-6 pt-4 pb-10 space-y-5">
        <div
          className="px-2"
          style={{ color: "var(--brand-text-faint)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}
        >
          DADOS PESSOAIS
        </div>

        <div>
            <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>Nome</label>
            <div className="relative mt-1.5">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--brand-text-faint)" }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl outline-none transition-colors"
                style={!nameOk ? errorInputStyle : inputStyle}
              />
            </div>
        </div>

        <div>
            <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>E-mail</label>
            <div className="relative mt-1.5">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--brand-text-faint)" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl outline-none transition-colors"
                style={!emailOk ? errorInputStyle : inputStyle}
              />
            </div>
            {!emailOk && (
              <div className="mt-1.5 text-[11px] text-[var(--brand-danger)] px-2">
                Insira um e-mail válido (ex: nome@domínio.com).
              </div>
            )}
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>Peso (kg)</label>
              <div className="relative mt-1.5">
                <Scale size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--brand-text-faint)" }} />
                <input
                  inputMode="numeric"
                  maxLength={3}
                  value={peso}
                  onChange={(e) => setPeso(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  className="w-full h-12 pl-11 pr-4 rounded-xl outline-none transition-colors"
                  style={!pesoOk ? errorInputStyle : inputStyle}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>Altura (cm)</label>
              <div className="relative mt-1.5">
                <Ruler size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--brand-text-faint)" }} />
                <input
                  inputMode="numeric"
                  maxLength={3}
                  value={altura}
                  onChange={(e) => setAltura(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  className="w-full h-12 pl-11 pr-4 rounded-xl outline-none transition-colors"
                  style={!alturaOk ? errorInputStyle : inputStyle}
                />
              </div>
            </div>
        </div>

        <div
          className="px-2 pt-2"
          style={{ color: "var(--brand-text-faint)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}
        >
          SEGURANÇA
        </div>

        <div>
          <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
            Senha atual
          </label>
          <div className="relative mt-1.5">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--brand-text-faint)" }}
            />
            <input
              type={showPwd ? "text" : "password"}
              value={currentPwd}
              onChange={(e)=>setCurrentPwd(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 pl-11 pr-11 rounded-xl outline-none"
              style={inputStyle}
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

        <div>
          <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
            Nova senha (Opcional)
          </label>
          <div className="relative mt-1.5">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--brand-text-faint)" }}
            />
            <input
              type="password"
              value={newPwd}
              maxLength={12}
              onChange={(e)=>setNewPwd(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 pl-11 pr-4 rounded-xl outline-none transition-colors"
              style={!pwChecks.valid ? errorInputStyle : inputStyle}
            />
          </div>
          {newPwd.length > 0 && !pwChecks.valid && (
            <div className="mt-1.5 text-[11px] text-[var(--brand-danger)] px-2">
              A nova senha deve ter entre 8 e 12 caracteres, incluindo ao menos uma letra maiúscula, uma minúscula, um número e um caractere especial.
            </div>
          )}
        </div>

        <button
          onClick={formValid ? onBack : undefined}
          disabled={!formValid}
          className="w-full rounded-xl shadow-md mt-4 transition-all"
          style={{
            height: 52,
            background: formValid ? "var(--brand-button-grad)" : "var(--brand-border)",
            color: formValid ? "var(--brand-on-header)" : "var(--brand-text-faint)",
            fontSize: 15,
            fontWeight: 600,
            opacity: formValid ? 1 : 0.7,
            cursor: formValid ? "pointer" : "not-allowed"
          }}
        >
          Salvar alterações
        </button>
      </div>
    </div>
  );
}
