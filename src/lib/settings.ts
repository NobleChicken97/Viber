import { useState, useEffect } from "react";
import type { Mood } from "@/lib/moodTheme";

export interface Settings {
  upliftEnabled: boolean;
  lastMood?: Mood;
  moodHistory?: Mood[];
}

const defaultSettings: Settings = {
  upliftEnabled: true,
  moodHistory: [],
};

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    
    setMounted(true);
    try {
      const stored = localStorage.getItem("viber_settings");
      if (stored) {
        setSettingsState(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse settings", e);
    }
  }, []);

  const setSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    try {
      localStorage.setItem("viber_settings", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  };

  return { settings, setSettings, mounted };
}
