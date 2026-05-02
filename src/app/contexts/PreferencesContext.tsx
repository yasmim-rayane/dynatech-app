import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type PreferencesContextType = {
  sound: boolean;
  vibration: boolean;
  setSound: (v: boolean) => void;
  setVibration: (v: boolean) => void;
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [sound, setSoundState] = useState(true);
  const [vibration, setVibrationState] = useState(true);

  useEffect(() => {
    const storedSound = localStorage.getItem("dynatech-sound");
    const storedVibration = localStorage.getItem("dynatech-vibration");

    if (storedSound !== null) setSoundState(storedSound === "true");
    if (storedVibration !== null) setVibrationState(storedVibration === "true");
  }, []);

  const setSound = (val: boolean) => {
    setSoundState(val);
    localStorage.setItem("dynatech-sound", String(val));
  };

  const setVibration = (val: boolean) => {
    setVibrationState(val);
    localStorage.setItem("dynatech-vibration", String(val));
  };

  return (
    <PreferencesContext.Provider value={{ sound, vibration, setSound, setVibration }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
