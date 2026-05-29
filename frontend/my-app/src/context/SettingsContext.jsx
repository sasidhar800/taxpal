import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "../utils/api";
import { AUTH_EVENT, updateStoredUser } from "../utils/auth";

export const SETTINGS_KEY = "taxpal-settings";

export const defaultSettings = {
  name: "Sasidhar",
  email: "user@example.com",
  darkMode: true,
  language: "English",
  startPage: "Dashboard",
  theme: "Modern Dark",
  notifications: true,
  soundEffects: false,
  privacyMode: false,
  autoSave: true,
  systemNotifications: true,
  frequency: 50,
  profileImage: "",
};

export const startPageRoutes = {
  Dashboard: "/dashboard",
  Users: "/users",
  Analytics: "/analytics",
  Transactions: "/transactions",
  Budget: "/budget",
  Tax: "/tax",
  Settings: "/settings",
};

export const themeOptions = {
  "Light Mode": {
    accent: "sky",
    cssName: "light-mode",
    primary: "#0284c7",
    primaryRgb: "2, 132, 199",
    secondary: "#14b8a6",
    secondaryRgb: "20, 184, 166",
    appLight: "#f8fafc",
    appDark: "#f8fafc",
    panelLight: "#ffffff",
    panelDark: "#ffffff",
    hero:
      "from-sky-500/16 via-teal-500/10 to-slate-100 dark:from-sky-500/16 dark:via-teal-500/10 dark:to-slate-100",
    button:
      "from-sky-500 to-teal-500 shadow-sky-500/20 hover:shadow-sky-500/30 focus:ring-sky-400/30",
    ring: "focus:ring-sky-400/20",
    text: "text-sky-700 dark:text-sky-700",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-700",
    border: "border-sky-500/30",
  },
  "Modern Dark": {
    accent: "cyan",
    cssName: "modern-dark",
    primary: "#06b6d4",
    primaryRgb: "6, 182, 212",
    secondary: "#2563eb",
    secondaryRgb: "37, 99, 235",
    appLight: "#f8fafc",
    appDark: "#0b0e14",
    panelLight: "#ffffff",
    panelDark: "#111827",
    hero:
      "from-cyan-500/20 via-blue-500/10 to-slate-950 dark:from-cyan-400/16 dark:via-indigo-500/10 dark:to-slate-950",
    button:
      "from-cyan-500 to-blue-600 shadow-cyan-500/20 hover:shadow-cyan-500/30 focus:ring-cyan-400/30",
    ring: "focus:ring-cyan-400/20",
    text: "text-cyan-600 dark:text-cyan-300",
    badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-200",
    border: "border-cyan-500/30",
  },
  "Midnight Blue": {
    accent: "blue",
    cssName: "midnight-blue",
    primary: "#3b82f6",
    primaryRgb: "59, 130, 246",
    secondary: "#0ea5e9",
    secondaryRgb: "14, 165, 233",
    appLight: "#f5f9ff",
    appDark: "#08111f",
    panelLight: "#ffffff",
    panelDark: "#101827",
    hero:
      "from-blue-600/20 via-sky-500/10 to-slate-950 dark:from-blue-500/18 dark:via-sky-500/10 dark:to-slate-950",
    button:
      "from-blue-500 to-sky-600 shadow-blue-500/20 hover:shadow-blue-500/30 focus:ring-blue-400/30",
    ring: "focus:ring-blue-400/20",
    text: "text-blue-600 dark:text-blue-300",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-200",
    border: "border-blue-500/30",
  },
  "Elegant Purple": {
    accent: "violet",
    cssName: "elegant-purple",
    primary: "#8b5cf6",
    primaryRgb: "139, 92, 246",
    secondary: "#d946ef",
    secondaryRgb: "217, 70, 239",
    appLight: "#fbf7ff",
    appDark: "#120d1d",
    panelLight: "#ffffff",
    panelDark: "#171126",
    hero:
      "from-violet-600/18 via-fuchsia-500/10 to-slate-950 dark:from-violet-500/18 dark:via-fuchsia-500/10 dark:to-slate-950",
    button:
      "from-violet-500 to-fuchsia-600 shadow-violet-500/20 hover:shadow-violet-500/30 focus:ring-violet-400/30",
    ring: "focus:ring-violet-400/20",
    text: "text-violet-600 dark:text-violet-300",
    badge: "bg-violet-500/10 text-violet-700 dark:text-violet-200",
    border: "border-violet-500/30",
  },
};

const SettingsContext = createContext(null);

const getStoredSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    const legacySettings = {
      theme: localStorage.getItem("theme") || undefined,
      language: localStorage.getItem("language") || undefined,
      darkMode:
        localStorage.getItem("darkMode") === null
          ? undefined
          : JSON.parse(localStorage.getItem("darkMode")),
    };

    return {
      ...legacySettings,
      ...(stored ? JSON.parse(stored) : {}),
    };
  } catch {
    return {};
  }
};

const sanitizeSettings = (data = {}) => {
  const settings = {
    ...defaultSettings,
    ...getStoredSettings(),
    ...Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined && value !== null)
    ),
  };

  if (!themeOptions[settings.theme]) {
    settings.theme = defaultSettings.theme;
  }

  if (!["English", "Tamil", "Hindi"].includes(settings.language)) {
    settings.language = defaultSettings.language;
  }

  if (settings.theme === "Light Mode") {
    settings.darkMode = false;
  }

  return settings;
};

const syncStoredUser = (profile) => {
  updateStoredUser(profile);
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => sanitizeSettings());
  const [loading, setLoading] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const audioContextRef = useRef(null);

  const tone = useMemo(
    () => themeOptions[settings.theme] || themeOptions["Modern Dark"],
    [settings.theme]
  );

  const startPagePath = useMemo(
    () => startPageRoutes[settings.startPage] || "/dashboard",
    [settings.startPage]
  );

  const persistLocal = useCallback((nextSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
  }, []);

  const persistRemote = useCallback(
    async (nextSettings) => {
      const res = await api.put("/settings", nextSettings);

      const savedSettings = sanitizeSettings(res.data.settings || res.data);
      setLastSavedAt(new Date().toISOString());
      persistLocal(savedSettings);
      return savedSettings;
    },
    [persistLocal]
  );

  const playSound = useCallback(
    (type = "success") => {
      if (!settings.soundEffects || typeof window === "undefined") {
        return;
      }

      const AudioContext = window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) {
        return;
      }

      const context =
        audioContextRef.current ||
        new AudioContext();

      audioContextRef.current = context;

      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const frequency = type === "error" ? 220 : type === "notify" ? 520 : 420;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * 1.25,
        context.currentTime + 0.08
      );
      gain.gain.setValueAtTime(0.001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.18);
    },
    [settings.soundEffects]
  );

  const updateSettings = useCallback(
    async (updates, options = {}) => {
      const nextSettings = sanitizeSettings({
        ...settings,
        ...updates,
      });

      setSettings(nextSettings);
      persistLocal(nextSettings);

      if (options.localOnly) {
        return {
          synced: false,
          settings: nextSettings,
        };
      }

      try {
        const savedSettings = await persistRemote(nextSettings);
        setSettings(savedSettings);

        if (!options.silentSound) {
          playSound("success");
        }

        return {
          synced: true,
          settings: savedSettings,
        };
      } catch (error) {
        console.log(error);

        return {
          synced: false,
          settings: nextSettings,
          error,
        };
      }
    },
    [persistLocal, persistRemote, playSound, settings]
  );

  const saveProfile = useCallback(
    async (profile) => {
      const payload = {
        name: profile.name.trim(),
        email: profile.email.trim().toLowerCase(),
        profileImage: profile.profileImage || settings.profileImage || "",
      };

      const res = await api.put("/settings/profile", payload);

      const savedSettings = sanitizeSettings(res.data.settings || res.data);
      setSettings(savedSettings);
      persistLocal(savedSettings);
      syncStoredUser({
        ...payload,
        photoURL: payload.profileImage,
      });
      playSound("success");

      return savedSettings;
    },
    [persistLocal, playSound, settings.profileImage]
  );

  const uploadProfileImage = useCallback(
    async (file) => {
      const formData = new FormData();
      formData.append("profileImage", file);

      const res = await api.post("/settings/profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const savedSettings = sanitizeSettings(res.data.settings || res.data);
      setSettings(savedSettings);
      persistLocal(savedSettings);
      syncStoredUser({
        profileImage: savedSettings.profileImage,
        photoURL: savedSettings.profileImage,
      });
      playSound("success");

      return savedSettings;
    },
    [persistLocal, playSound]
  );

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }) => {
      const res = await api.put(
        "/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      playSound("success");
      return res.data;
    },
    [playSound]
  );

  const requestPasswordReset = useCallback(
    async (email) => {
      const res = await api.post("/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      playSound("notify");
      return res.data;
    },
    [playSound]
  );

  const sendNotification = useCallback(
    async (title, body, options = {}) => {
      if (!settings.notifications && !options.force) {
        return false;
      }

      const shouldShow =
        options.force ||
        Number(settings.frequency) >= Number(options.priority || 50);

      if (!shouldShow) {
        return false;
      }

      if (
        settings.systemNotifications &&
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        await Notification.requestPermission();
      }

      if (
        settings.systemNotifications &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(title, {
          body,
        });
      }

      try {
        await api.post(
          "/settings/notifications/test",
          {
            title,
            body,
            frequency: settings.frequency,
            priority: options.priority || 50,
          }
        );
      } catch (error) {
        console.log(error);
      }

      playSound("notify");
      return true;
    },
    [
      playSound,
      settings.frequency,
      settings.notifications,
      settings.systemNotifications,
    ]
  );

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("dark", settings.darkMode);
    root.classList.toggle("light", !settings.darkMode);
    root.dataset.theme = tone.cssName;
    root.dataset.mode = settings.darkMode ? "dark" : "light";
    root.dataset.privacy = settings.privacyMode ? "on" : "off";
    root.lang =
      settings.language === "Tamil"
        ? "ta"
        : settings.language === "Hindi"
          ? "hi"
          : "en";
    root.style.setProperty("--tp-primary", tone.primary);
    root.style.setProperty("--tp-primary-rgb", tone.primaryRgb);
    root.style.setProperty("--tp-secondary", tone.secondary);
    root.style.setProperty("--tp-secondary-rgb", tone.secondaryRgb);
    root.style.setProperty("--tp-app-light", tone.appLight);
    root.style.setProperty("--tp-app-dark", tone.appDark);
    root.style.setProperty("--tp-panel-light", tone.panelLight);
    root.style.setProperty("--tp-panel-dark", tone.panelDark);
    persistLocal(settings);
    localStorage.setItem("theme", settings.theme);
    localStorage.setItem("language", settings.language);
    localStorage.setItem("darkMode", JSON.stringify(settings.darkMode));
  }, [persistLocal, settings, tone]);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = () => {
      setLoading(true);
      api
        .get("/settings")
      .then((res) => {
        if (!isMounted) {
          return;
        }

        const remoteSettings = sanitizeSettings(res.data.settings || res.data);
        setSettings(remoteSettings);
        persistLocal(remoteSettings);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    };

    loadSettings();
    window.addEventListener(AUTH_EVENT, loadSettings);

    return () => {
      isMounted = false;
      window.removeEventListener(AUTH_EVENT, loadSettings);
    };
  }, [persistLocal]);

  const value = useMemo(
    () => ({
      settings,
      setSettings,
      updateSettings,
      saveProfile,
      uploadProfileImage,
      changePassword,
      requestPasswordReset,
      sendNotification,
      playSound,
      tone,
      themeOptions,
      startPagePath,
      loading,
      lastSavedAt,
    }),
    [
      changePassword,
      lastSavedAt,
      loading,
      playSound,
      requestPasswordReset,
      saveProfile,
      sendNotification,
      settings,
      startPagePath,
      tone,
      updateSettings,
      uploadProfileImage,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }

  return context;
};
