import { ChevronLeft, User, Scale, Ruler, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function AccountSettingsScreen({ onBack }: { onBack: () => void }) {
  const [showPwd, setShowPwd] = useState(false);

  const inputStyle: React.CSSProperties = {
    background: "var(--brand-input-bg)",
    border: "1px solid var(--brand-border)",
    color: "var(--brand-text)",
    fontSize: 14,
  };

  const fields = [
    { label: "Nome", Icon: User, defaultValue: "Maria Silva", type: "text" },
    { label: "E-mail", Icon: Mail, defaultValue: "maria@email.com", type: "email" },
  ];

  const metrics = [
    { label: "Peso (kg)", Icon: Scale, defaultValue: "62" },
    { label: "Altura (cm)", Icon: Ruler, defaultValue: "168" },
  ];

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

        {fields.map((f, i) => (
          <div key={f.label} className="animate-fadeSlideUp" style={{ animationDelay: `${0.05 * i}s` }}>
            <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
              {f.label}
            </label>
            <div className="relative mt-1.5">
              <f.Icon
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "var(--brand-text-faint)" }}
              />
              <input
                type={f.type}
                defaultValue={f.defaultValue}
                className="w-full h-12 pl-11 pr-4 rounded-xl outline-none"
                style={inputStyle}
              />
            </div>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div key={m.label}>
              <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
                {m.label}
              </label>
              <div className="relative mt-1.5">
                <m.Icon
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--brand-text-faint)" }}
                />
                <input
                  defaultValue={m.defaultValue}
                  className="w-full h-12 pl-11 pr-4 rounded-xl outline-none"
                  style={inputStyle}
                />
              </div>
            </div>
          ))}
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
            Nova senha
          </label>
          <div className="relative mt-1.5">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--brand-text-faint)" }}
            />
            <input
              type="password"
              placeholder="••••••••"
              className="w-full h-12 pl-11 pr-4 rounded-xl outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full rounded-xl shadow-md mt-4 active:scale-[0.97] transition-transform"
          style={{
            height: 52,
            background: "var(--brand-button-grad)",
            color: "var(--brand-on-header)",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Salvar alterações
        </button>
      </div>
    </div>
  );
}
