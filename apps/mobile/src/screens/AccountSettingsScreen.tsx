import { ChevronLeft, User, Scale, Ruler, Mail, Hand, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { maoToFront, maoToBack } from "../services/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validatePassword(pw: string) {
  if (pw.length === 0) return { valid: true }; // Opcional alterar senha em configs
  return { valid: true };
}

export function AccountSettingsScreen({ onBack }: { onBack: () => void }) {
  const auth = useAuth();
  const [showPwd, setShowPwd] = useState(false);

  // Para profissionais: usar doctorData; para pacientes: usar user
  const initialName = auth.isProfessional
    ? (auth.doctorData?.name ?? "")
    : (auth.user?.name ?? "");
  const initialEmail = auth.isProfessional
    ? (auth.doctorData?.email ?? auth.email ?? "")
    : (auth.user?.email ?? auth.email ?? "");

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [peso, setPeso] = useState(auth.user?.peso != null ? auth.user.peso.toFixed(2) : "");
  const [altura, setAltura] = useState(auth.user?.altura != null ? String(auth.user.altura) : "");
  const [maoDominante, setMaoDominante] = useState(auth.user?.maoDominante ? maoToFront(auth.user.maoDominante) : "Direita");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [saveError, setSaveError] = useState("");

  const emailOk = EMAIL_RE.test(email);
  const nameOk = name.trim().length >= 2;
  const pwChecks = validatePassword(newPwd);
  const pesoOk = peso.length > 0;
  const alturaOk = altura.length > 0;
  const maoOk = maoDominante !== "Selecione";

  const formValid = nameOk && emailOk && pwChecks.valid && pesoOk && alturaOk && maoOk;

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

      <div 
        className="px-6 pt-4 space-y-5"
        style={{ paddingBottom: "calc(40px + env(safe-area-inset-bottom, 0px))" }}
      >
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
                maxLength={90}
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
                maxLength={45}
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
                  inputMode="decimal"
                  maxLength={6}
                  value={peso}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".");
                    const parts = val.split(".");
                    if (parts[0].length > 3) parts[0] = parts[0].slice(0, 3);
                    if (parts.length > 1) parts[1] = parts[1].slice(0, 2);
                    setPeso(parts.slice(0, 2).join("."));
                  }}
                  onBlur={() => { if(peso) setPeso(Number(peso).toFixed(2)) }}
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

        <div>
            <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>Mão dominante</label>
            <div className="relative mt-1.5">
              <Hand size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--brand-text-faint)" }} />
              <select
                value={maoDominante}
                onChange={(e) => setMaoDominante(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl outline-none appearance-none transition-colors"
                style={inputStyle}
              >
                <option>Direita</option>
                <option>Esquerda</option>
                <option>Ambidestro</option>
              </select>
            </div>
        </div>

        <div
          className="px-2 pt-2"
          style={{ color: "var(--brand-text-faint)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}
        >
          SEGURANÇA
        </div>

        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--brand-chip-bg)",
            border: "1px solid var(--brand-border-soft)",
          }}
        >
          <p style={{ color: "var(--brand-text-muted)", fontSize: 13, lineHeight: 1.5 }}>
            Para alterar sua senha, use a opção <strong style={{ color: "var(--brand-text)" }}>"Esqueceu sua senha?"</strong> na tela de login. Um código de verificação será enviado para o seu e-mail.
          </p>
        </div>

        {saveError && (
          <div
            className="mb-3 px-4 py-3 rounded-xl text-center animate-fadeIn"
            style={{
              background: "var(--brand-danger-soft, rgba(239,68,68,0.1))",
              color: "var(--brand-danger)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {saveError}
          </div>
        )}
        <button
          onClick={async () => {
            if (!formValid || auth.isLoading) return;
            setSaveError("");
            try {
<<<<<<< Updated upstream
              const payload: Record<string, any> = {};
              if (name !== auth.user?.name) payload.name = name.trim();
              if (email !== auth.user?.email) payload.email = email.trim();
              if (peso !== (auth.user?.peso != null ? auth.user.peso.toFixed(2) : "")) payload.peso = Number(peso);
              if (altura !== (auth.user?.altura != null ? String(auth.user.altura) : "")) payload.altura = Number(altura);
              const backMao = maoToBack(maoDominante);
              if (backMao !== auth.user?.maoDominante) payload.maoDominante = backMao;
              // Atualiza no servidor se houver mudanças
              if (Object.keys(payload).length > 0) {
                await auth.updateUser(payload);
=======
              if (auth.isProfessional) {
                // Profissional: usa updateDoctor
                const payload: Record<string, any> = {};
                if (name !== initialName) payload.name = name.trim();
                if (email !== initialEmail) payload.email = email.trim();
                if (Object.keys(payload).length > 0) {
                  await auth.updateDoctor(payload);
                }
              } else {
                // Paciente: usa updateUser
                const payload: Record<string, any> = {};
                if (name !== auth.user?.name) payload.name = name.trim();
                if (email !== auth.user?.email) payload.email = email.trim();
                if (Object.keys(payload).length > 0) {
                  await auth.updateUser(payload);
                }
>>>>>>> Stashed changes
              }
              onBack();
            } catch (e: any) {
              setSaveError(e?.backendMessage || "Erro ao salvar alterações.");
            }
          }}
          disabled={!formValid || auth.isLoading}
          className="w-full rounded-xl shadow-md mt-4 transition-all flex items-center justify-center gap-2"
          style={{
            height: 52,
            minHeight: 52,
            flexShrink: 0,
            background: formValid && !auth.isLoading ? "var(--brand-button-grad)" : "var(--brand-border)",
            color: formValid && !auth.isLoading ? "var(--brand-on-header)" : "var(--brand-text-faint)",
            fontSize: 15,
            fontWeight: 600,
            opacity: formValid && !auth.isLoading ? 1 : 0.7,
            cursor: formValid && !auth.isLoading ? "pointer" : "not-allowed"
          }}
        >
          {auth.isLoading && <Loader2 size={18} className="animate-spin" />}
          {auth.isLoading ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}
