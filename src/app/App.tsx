import { useState } from "react";
import { useReminders } from "./hooks/useReminders";
import { BottomNav, Tab } from "./components/common/BottomNav";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { LoginScreen } from "./components/screens/LoginScreen";
import { SignupScreen } from "./components/screens/SignupScreen";
import { ForgotScreen } from "./components/screens/ForgotScreen";
import { PairingScreen } from "./components/screens/PairingScreen";
import { TutorialScreen } from "./components/screens/TutorialScreen";
import { HomeScreen } from "./components/screens/HomeScreen";
import { HistoryScreen } from "./components/screens/HistoryScreen";
import { RemindersScreen } from "./components/screens/RemindersScreen";
import { ProfileScreen } from "./components/screens/ProfileScreen";
import { NotificationsScreen } from "./components/screens/NotificationsScreen";
import { AccountSettingsScreen } from "./components/screens/AccountSettingsScreen";
import { GeneralSettingsScreen } from "./components/screens/GeneralSettingsScreen";
import { MeasurementScreen } from "./components/screens/MeasurementScreen";

type Stage = "login" | "signup" | "forgot" | "tutorial" | "pairing" | "app";
type SubScreen = "notifications" | "account" | "general" | "pairing" | "measure" | "tutorial" | null;

function Shell() {
  const { theme } = useTheme();
  const [stage, setStage] = useState<Stage>("login");
  const [tab, setTab] = useState<Tab>("home");
  const [sub, setSub] = useState<SubScreen>(null);
  const remindersStore = useReminders();

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

export default function App() {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <Shell />
      </PreferencesProvider>
    </ThemeProvider>
  );
}
