import { useState } from "react";

import { BottomNav, Tab } from "./components/common/BottomNav";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { NotificationsProvider, useAppNotifications } from "./contexts/NotificationsContext";
import { LoginScreen } from "./screens/LoginScreen";
import { ProfessionalSignupScreen } from "./screens/ProfessionalSignupScreen";
import { ForgotScreen } from "./screens/ForgotScreen";
import { PairingScreen } from "./screens/PairingScreen";
import { TutorialScreen } from "./screens/TutorialScreen";
import { ProfessionalHomeScreen } from "./screens/ProfessionalHomeScreen";
import { ProfessionalHistoryScreen } from "./screens/ProfessionalHistoryScreen";

import { PatientProfileScreen } from "./screens/PatientProfileScreen";
import { ProfessionalProfileScreen } from "./screens/ProfessionalProfileScreen";
import { NotificationsScreen } from "./screens/NotificationsScreen";
import { AccountSettingsScreen } from "./screens/AccountSettingsScreen";
import { GeneralSettingsScreen } from "./screens/GeneralSettingsScreen";
import { MeasurementScreen } from "./screens/MeasurementScreen";
import { RoleSelectionScreen } from "./screens/RoleSelectionScreen";
import { PatientEmailScreen } from "./screens/PatientEmailScreen";
import { PatientSignupScreen } from "./screens/PatientSignupScreen";
import { PatientsScreen } from "./screens/PatientsScreen";
import { PatientHomeScreen } from "./screens/PatientHomeScreen";
import { PatientHistoryScreen } from "./screens/PatientHistoryScreen";
import { PatientBenefitsScreen } from "./screens/PatientBenefitsScreen";
import { App as CapacitorApp } from "@capacitor/app";

type Stage =
  | "login"
  | "signup"
  | "forgot"
  | "tutorial"
  | "pairing"
  | "app"
  | "role-select"
  | "patient-email"
  | "patient-signup"
  | "patient-benefits";

type SubScreen = "notifications" | "account" | "general" | "pairing" | "measure" | "tutorial" | null;

function Shell() {
  const { theme } = useTheme();
  const [stage, setStage] = useState<Stage>("login");
  const [tab, setTab] = useState<Tab>("home");
  const [sub, setSub] = useState<SubScreen>(null);
  const [patientEmail, setPatientEmail] = useState("");

  const { addNotification } = useAppNotifications();

  // Auth context — para acessar userRole
  const auth = useAuth();
  const { userRole, isProfessional, isPatient } = auth;

  // Auto-login / Logout observer
  React.useEffect(() => {
    if (auth.email && stage === "login") {
      setStage("app");
    } else if (!auth.email && stage === "app") {
      setStage("login");
    }
  }, [auth.email, stage]);

  // Escutar notificações locais que disparam (lembretes agendados)
  React.useEffect(() => {
    import("@capacitor/local-notifications").then(({ LocalNotifications }) => {
      const listener = LocalNotifications.addListener("localNotificationReceived", (notification) => {
        addNotification({
          title: notification.title || "Lembrete",
          body: notification.body || "Lembrete recebido.",
          tone: "navy",
          icon: "clock",
        });
      });
      return () => {
        listener.then(l => l.remove());
      };
    }).catch(err => console.error("Error setting up local notifications listener", err));
  }, [addNotification]);

  // Listener para o botão voltar físico do Android
  React.useEffect(() => {
    const handleBackButton = () => {
      if (sub) {
        // Se estiver em uma subtela, fecha ela
        setSub(null);
      } else if (stage === "patient-signup" || stage === "patient-email") {
        setStage("role-select");
      } else if (stage === "signup" || stage === "forgot" || stage === "role-select") {
        setStage("login");
      } else if (stage === "app" && tab !== "home") {
        // Se estiver no app mas não na home, volta para a home
        setTab("home");
      } else if (stage === "app" && tab === "home") {
        // Na home, sai do app
        CapacitorApp.minimizeApp();
      }
    };

    const listener = CapacitorApp.addListener("backButton", handleBackButton);
    return () => {
      listener.then(l => l.remove());
    };
  }, [sub, stage, tab]);

  /* ── Controle Global ── */
  let content;
  let showNav = false;

  if (stage === "login") {
    content = (
      <LoginScreen
        onLogin={() => {
          // Após login, direciona conforme o role
          if (auth.userRole === "patient") {
            setStage("app");
          } else {
            setStage("app");
          }
        }}
        onSignup={() => setStage("role-select")}
        onForgot={() => setStage("forgot")}
      />
    );
  } else if (stage === "role-select") {
    content = (
      <RoleSelectionScreen
        onBack={() => setStage("login")}
        onSelectRole={(role) => {
          if (role === "professional") {
            setStage("signup");
          } else {
            setStage("patient-email");
          }
        }}
      />
    );
  } else if (stage === "signup") {
    content = <ProfessionalSignupScreen onComplete={() => setStage("tutorial")} onBack={() => setStage("role-select")} />;
  } else if (stage === "patient-email") {
    content = (
      <PatientEmailScreen
        onBack={() => setStage("role-select")}
        onEmailValid={(email) => {
          setPatientEmail(email);
          setStage("patient-signup");
        }}
      />
    );
  } else if (stage === "patient-signup") {
    content = (
      <PatientSignupScreen
        email={patientEmail}
        onBack={() => setStage("patient-email")}
        onComplete={() => setStage("patient-benefits")}
      />
    );
  } else if (stage === "patient-benefits") {
    content = <PatientBenefitsScreen onContinue={() => setStage("app")} />;
  } else if (stage === "forgot") {
    content = <ForgotScreen onBack={() => setStage("login")} />;
  } else if (stage === "tutorial") {
    content = <TutorialScreen onComplete={() => setStage("pairing")} />;
  } else if (stage === "pairing") {
    content = <PairingScreen onConnect={() => setStage("app")} />;
  } else if (sub === "notifications") {
    content = <NotificationsScreen onBack={() => setSub(null)} />;
  } else if (sub === "account") {
    content = <AccountSettingsScreen onBack={() => setSub(null)} />;
  } else if (sub === "general") {
    content = (
      <GeneralSettingsScreen
        onBack={() => setSub(null)}
        onOpenPairing={() => setSub("pairing")}
        onLogout={() => {
          setSub(null);
          setTab("home");
          setStage("login");
          auth.logout();
        }}
      />
    );
  } else if (sub === "tutorial") {
    content = <TutorialScreen onComplete={() => setSub(null)} onBack={() => setSub(null)} />;
  } else if (sub === "pairing") {
    content = <PairingScreen onConnect={() => setSub(null)} onBack={() => setSub(null)} />;
  } else if (sub === "measure") {
    content = <MeasurementScreen onBack={() => setSub(null)} />;
  } else {
    showNav = true;
    let inner;

    if (isPatient) {
      // ── View do Paciente (Read-Only) ──
      if (tab === "home") {
        inner = (
          <PatientHomeScreen
            onOpenNotifications={() => setSub("notifications")}
          />
        );
      } else if (tab === "history") {
        inner = <PatientHistoryScreen />;
      } else {
        inner = (
          <PatientProfileScreen
            onLogout={() => {
              setTab("home");
              setStage("login");
              auth.logout();
            }}
            onOpenAccount={() => setSub("account")}
            onOpenGeneral={() => setSub("general")}
            onOpenTutorial={() => setSub("tutorial")}
          />
        );
      }
    } else {
      // ── View do Profissional (Acesso Total) ──
      if (tab === "home") {
        inner = (
          <ProfessionalHomeScreen
            onOpenNotifications={() => setSub("notifications")}
            onOpenPairing={() => setSub("pairing")}
            onGoToPatients={() => setTab("patients")}
          />
        );
      } else if (tab === "history") {
        inner = <ProfessionalHistoryScreen />;
      } else if (tab === "patients") {
        inner = <PatientsScreen onStartMeasurement={() => setSub("measure")} />;

      } else {
        inner = (
          <ProfessionalProfileScreen
            onLogout={() => {
              setTab("home");
              setStage("login");
              auth.logout();
            }}
            onOpenAccount={() => setSub("account")}
            onOpenGeneral={() => setSub("general")}
            onOpenTutorial={() => setSub("tutorial")}
          />
        );
      }
    }

    content = inner;
  }

  return (
    <div
      className={theme === "dark" ? "dark" : ""}
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--brand-surface)",
        position: "relative",
      }}
    >
      {/* Status bar area */}
      <div
        className="safe-top"
        style={{
          background: stage === "app" && !sub && tab === "home"
            ? "var(--brand-navy)"
            : stage === "app" && !sub && tab === "profile"
            ? "var(--brand-navy)"
            : "var(--brand-card)",
          flexShrink: 0,
        }}
      />

      {/* Main content area */}
      <div
        className="animate-fadeIn"
        key={`${stage}-${tab}-${sub}`}
        style={{
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          className="scroll-y no-scrollbar"
          style={{
            height: "100%",
            paddingBottom: showNav ? "calc(70px + max(env(safe-area-inset-bottom), 16px))" : 0,
          }}
        >
          {content}
        </div>
      </div>

      {/* Bottom navigation */}
      {showNav && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
          }}
        >
          <BottomNav active={tab} onChange={setTab} userRole={userRole} />
        </div>
      )}
    </div>
  );
}

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PatientsProvider } from "./contexts/PatientsContext";
import React from "react";

export default function App() {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <NotificationsProvider>
          <AuthProvider>
            <PatientsProvider>
              <Shell />
            </PatientsProvider>
          </AuthProvider>
        </NotificationsProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
