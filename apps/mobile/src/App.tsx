import { useState } from "react";
import { useReminders } from "./hooks/useReminders";
import { BottomNav, Tab } from "./components/common/BottomNav";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { NotificationsProvider, useAppNotifications } from "./contexts/NotificationsContext";
import { LoginScreen } from "./screens/LoginScreen";
import { SignupScreen } from "./screens/SignupScreen";
import { ForgotScreen } from "./screens/ForgotScreen";
import { PairingScreen } from "./screens/PairingScreen";
import { TutorialScreen } from "./screens/TutorialScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { RemindersScreen } from "./screens/RemindersScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { NotificationsScreen } from "./screens/NotificationsScreen";
import { AccountSettingsScreen } from "./screens/AccountSettingsScreen";
import { GeneralSettingsScreen } from "./screens/GeneralSettingsScreen";
import { MeasurementScreen } from "./screens/MeasurementScreen";

type Stage = "login" | "signup" | "forgot" | "tutorial" | "pairing" | "app";
type SubScreen = "notifications" | "account" | "general" | "pairing" | "measure" | "tutorial" | null;

function Shell() {
  const { theme } = useTheme();
  const [stage, setStage] = useState<Stage>("login");
  const [tab, setTab] = useState<Tab>("home");
  const [sub, setSub] = useState<SubScreen>(null);
  const remindersStore = useReminders();
  const { addNotification } = useAppNotifications();

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

  let content;
  let showNav = false;

  if (stage === "login") {
    content = (
      <LoginScreen
        onLogin={() => setStage("app")}
        onSignup={() => setStage("signup")}
        onForgot={() => setStage("forgot")}
      />
    );
  } else if (stage === "signup") {
    content = <SignupScreen onComplete={() => setStage("tutorial")} onBack={() => setStage("login")} />;
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
    if (tab === "home")
      inner = (
        <HomeScreen
          onOpenNotifications={() => setSub("notifications")}
          onStartMeasurement={() => setSub("measure")}
          onOpenPairing={() => setSub("pairing")}
        />
      );
    else if (tab === "history") inner = <HistoryScreen />;
    else if (tab === "reminders")
      inner = <RemindersScreen remindersStore={remindersStore} />;
    else
      inner = (
        <ProfileScreen
          onLogout={() => {
            setTab("home");
            setStage("login");
          }}
          onOpenAccount={() => setSub("account")}
          onOpenGeneral={() => setSub("general")}
          onOpenTutorial={() => setSub("tutorial")}
        />
      );
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
            paddingBottom: showNav ? 80 : 0,
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
          <BottomNav active={tab} onChange={setTab} />
        </div>
      )}
    </div>
  );
}

import { AuthProvider } from "./contexts/AuthContext";
import React from "react";

export default function App() {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <NotificationsProvider>
          <AuthProvider>
            <Shell />
          </AuthProvider>
        </NotificationsProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
