import { useState, useMemo } from "react";
import { ChevronLeft, AlertCircle, CheckCircle2, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { generoToBack, maoToBack, dateBrToIso } from "../services/api";

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

/** Aceita DD/MM/AAAA — valida existência real do dia */
function validateDate(raw: string) {
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const [, dd, mm, yyyy] = m.map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return (
    d.getFullYear() === yyyy &&
    d.getMonth() === mm - 1 &&
    d.getDate() === dd &&
    d <= new Date() // não pode ser no futuro
  );
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
  const [dob, setDob] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [genero, setGenero] = useState("Selecione");
  const [maoDominante, setMaoDominante] = useState("Selecione");
  const [submitError, setSubmitError] = useState("");

  /* Campos "tocados" — exibem erro somente após interação */
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  /* Validações individuais */
  const emailOk = EMAIL_RE.test(email);
  const pwChecks = validatePassword(password);
  const confirmOk = confirm.length > 0 && confirm === password;
  const dobOk = validateDate(dob);
  const nameOk = name.trim().length >= 2;
  const usernameOk = username.trim().length >= 4;
  const pesoOk = peso.length > 0 && Number(peso) > 0;
  const alturaOk = altura.length > 0 && Number(altura) > 0;
  const generoOk = genero !== "Selecione";
  const maoOk = maoDominante !== "Selecione";

  /* Formulário inteiro válido */
  const formValid = useMemo(
    () =>
      nameOk &&
      emailOk &&
      usernameOk &&
      pwChecks.valid &&
      confirmOk &&
      dobOk &&
      pesoOk &&
      alturaOk &&
      generoOk &&
      maoOk,
    [nameOk, emailOk, usernameOk, pwChecks.valid, confirmOk, dobOk, pesoOk, alturaOk, generoOk, maoOk]
  );

  /* Máscara de data DD/MM/AAAA */
  function handleDobChange(raw: string) {
    // remove tudo que não é dígito
    let digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 4) digits = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    else if (digits.length > 2) digits = digits.slice(0, 2) + "/" + digits.slice(2);
    setDob(digits);
  }

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
          Criar conta
        </h2>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 pt-4 space-y-4 scroll-y no-scrollbar">
        {/* Nome */}
        <div className="animate-fadeSlideUp" style={{ animationDelay: "0s" }}>
          <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
            Nome completo
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => touch("name")}
            placeholder="Maria Silva"
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
            placeholder="maria@email.com"
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
            placeholder="@maria"
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => touch("password")}
            placeholder="••••••••"
            maxLength={12}
            className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
            style={touched.password && !pwChecks.valid ? errorInputStyle : inputStyle}
          />
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
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => touch("confirm")}
            placeholder="••••••••"
            maxLength={12}
            className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
            style={touched.confirm && !confirmOk ? errorInputStyle : inputStyle}
          />
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

        {/* Data de nascimento */}
        <div className="animate-fadeSlideUp" style={{ animationDelay: "0.25s" }}>
          <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
            Data de nascimento
          </label>
          <div className="relative mt-1.5">
            <input
              inputMode="numeric"
              value={dob}
              onChange={(e) => handleDobChange(e.target.value)}
              onBlur={() => touch("dob")}
              placeholder="DD/MM/AAAA"
              maxLength={10}
              className="w-full h-12 pl-4 pr-12 rounded-xl outline-none"
              style={touched.dob && !dobOk ? errorInputStyle : inputStyle}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center overflow-hidden">
              <Calendar size={20} style={{ color: "var(--brand-text-faint)" }} />
              <input
                type="date"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if(e.target.value) {
                    const [y, m, d] = e.target.value.split('-');
                    handleDobChange(`${d}/${m}/${y}`);
                  }
                }}
              />
            </div>
          </div>
          {touched.dob && dob.length > 0 && !dobOk && (
            <div style={errorTextStyle}>
              <AlertCircle size={12} /> Data inválida. Use o formato DD/MM/AAAA
            </div>
          )}
          {dobOk && (
            <div style={validTextStyle}>
              <CheckCircle2 size={12} /> Data válida
            </div>
          )}
        </div>

        {/* Peso e Altura */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
              Peso (kg)
            </label>
            <input
              inputMode="decimal"
              placeholder="70.00"
              value={peso}
              onChange={(e) => {
                let val = e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".");
                const parts = val.split(".");
                if (parts[0].length > 3) parts[0] = parts[0].slice(0, 3);
                if (parts.length > 1) parts[1] = parts[1].slice(0, 2);
                setPeso(parts.slice(0, 2).join("."));
              }}
              onBlur={() => {
                touch("peso");
                if(peso) setPeso(Number(peso).toFixed(2));
              }}
              maxLength={6}
              className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
              style={touched.peso && !pesoOk ? errorInputStyle : inputStyle}
            />
            {touched.peso && !pesoOk && (
              <div style={errorTextStyle}>
                <AlertCircle size={12} /> Informe seu peso
              </div>
            )}
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
              Altura (cm)
            </label>
            <input
              inputMode="numeric"
              placeholder="170"
              value={altura}
              onChange={(e) => setAltura(e.target.value.replace(/\D/g, "").slice(0, 3))}
              onBlur={() => touch("altura")}
              maxLength={3}
              className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
              style={touched.altura && !alturaOk ? errorInputStyle : inputStyle}
            />
            {touched.altura && !alturaOk && (
              <div style={errorTextStyle}>
                <AlertCircle size={12} /> Informe sua altura
              </div>
            )}
          </div>
        </div>

        {/* Gênero */}
        <div>
          <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
            Gênero
          </label>
          <select
            value={genero}
            onChange={(e) => { setGenero(e.target.value); touch("genero"); }}
            className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
            style={touched.genero && !generoOk ? errorInputStyle : inputStyle}
          >
            <option>Selecione</option>
            <option>Feminino</option>
            <option>Masculino</option>
            <option>Outro</option>
            <option>Prefiro não dizer</option>
          </select>
          {touched.genero && !generoOk && (
            <div style={errorTextStyle}>
              <AlertCircle size={12} /> Selecione seu gênero
            </div>
          )}
        </div>

        {/* Mão dominante */}
        <div>
          <label style={{ fontSize: 13, color: "var(--brand-text)", fontWeight: 500 }}>
            Mão dominante
          </label>
          <select
            value={maoDominante}
            onChange={(e) => { setMaoDominante(e.target.value); touch("mao"); }}
            className="w-full h-12 px-4 mt-1.5 rounded-xl outline-none"
            style={touched.mao && !maoOk ? errorInputStyle : inputStyle}
          >
            <option>Selecione</option>
            <option>Direita</option>
            <option>Esquerda</option>
            <option>Ambidestro</option>
          </select>
          {touched.mao && !maoOk && (
            <div style={errorTextStyle}>
              <AlertCircle size={12} /> Selecione sua mão dominante
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
          paddingBottom: 48,
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
              await auth.signup({
                name: name.trim(),
                username: username.trim(),
                email: email.trim(),
                password,
                dataNascimento: dateBrToIso(dob),
                peso: Number(peso),
                altura: Number(altura),
                genero: generoToBack(genero),
                maoDominante: maoToBack(maoDominante),
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
