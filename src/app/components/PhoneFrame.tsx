import { ReactNode } from "react";
import { Signal, Wifi, BatteryFull } from "lucide-react";
import { useTheme } from "./ThemeContext";

export function PhoneFrame({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <div
      className={theme === "dark" ? "dark" : ""}
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "var(--brand-shell)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="relative rounded-[3rem] shadow-2xl overflow-hidden border-[10px]"
        style={{
          width: 393,
          height: 852,
          background: "var(--brand-card)",
          borderColor: theme === "dark" ? "#000000" : "#0F172A",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-11 flex items-center justify-between px-8 z-50"
          style={{ color: "var(--brand-text)" }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>9:41</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-28 h-7 rounded-full bg-black" />
          <div className="flex items-center gap-1">
            <Signal size={14} />
            <Wifi size={14} />
            <BatteryFull size={16} />
          </div>
        </div>
        <div className="h-full w-full pt-11 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
