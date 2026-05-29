import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import {
  Bell,
  Check,
  HelpCircle,
  Lock,
  Moon,
  Palette,
  Save,
  Shield,
  Sun,
  User,
  Volume2,
} from "lucide-react";
import Layout from "../components/Layout";
import {
  startPageRoutes,
  themeOptions,
  useSettings,
} from "../context/SettingsContext";
import { useLanguage } from "../context/LanguageContext";

const Toggle = ({
  checked,
  onChange,
  label,
  tone,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border p-1 transition duration-200 focus:outline-none focus:ring-4 ${tone.ring} ${
      checked
        ? `bg-gradient-to-r ${tone.button} ${tone.border}`
        : "border-slate-300 bg-slate-200 dark:border-white/10 dark:bg-slate-700"
    }`}
  >
    <span
      className={`h-6 w-6 rounded-full bg-white shadow transition duration-200 ${
        checked ? "translate-x-6" : "translate-x-0"
      }`}
    />
  </button>
);

const SectionHeader = ({
  icon: Icon,
  eyebrow,
  title,
  description,
  tone,
}) => (
  <div className="flex gap-3 border-b border-slate-200/80 px-5 py-5 dark:border-white/10 sm:px-6">
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.badge}`}
    >
      <Icon size={19} />
    </div>
    <div className="min-w-0">
      <p className={`text-xs font-bold uppercase tracking-[0.22em] ${tone.text}`}>
        {eyebrow}
      </p>
      <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
        {title}
      </h2>
      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  </div>
);

const SettingRow = ({
  title,
  description,
  children,
}) => (
  <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
    {children}
  </div>
);

function Settings() {
  const {
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
    lastSavedAt,
  } = useSettings();
  const { t } = useLanguage();
  const [showHelp, setShowHelp] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    name: settings.name,
    email: settings.email,
    profileImage: settings.profileImage,
  });
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);

  useEffect(() => {
    setProfileDraft({
      name: settings.name,
      email: settings.email,
      profileImage: settings.profileImage,
    });
  }, [settings.email, settings.name, settings.profileImage]);

  useEffect(() => {
    if (!settings.autoSave || !profileDirty) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      handleProfileSave({
        silent: true,
      });
    }, 900);

    return () => window.clearTimeout(timeoutId);
    // handleProfileSave is intentionally excluded to keep the autosave timer stable while typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileDraft, profileDirty, settings.autoSave]);

  const notificationLabel = useMemo(() => {
    if (!settings.notifications) {
      return "Off";
    }

    if (settings.frequency < 25) {
      return "Low";
    }

    if (settings.frequency < 70) {
      return "Balanced";
    }

    return "High";
  }, [settings.frequency, settings.notifications]);

  const cardClass =
    "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#171A23]/95 dark:shadow-[0_20px_60px_rgba(0,0,0,0.24)]";

  const fieldClass = `w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-transparent focus:ring-4 ${tone.ring} dark:border-white/10 dark:bg-[#0F121A] dark:text-white dark:placeholder:text-slate-500 dark:hover:border-white/20`;

  const selectClass = `mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition duration-200 hover:border-slate-300 focus:border-transparent focus:ring-4 ${tone.ring} dark:border-white/10 dark:bg-[#0F121A] dark:text-white dark:hover:border-white/20`;

  const showSyncToast = (result, message) => {
    toast.success(result.synced ? message : `${message} locally`);
  };

  const handleSettingUpdate = async (updates, message, options = {}) => {
    const result = await updateSettings(updates, options);
    showSyncToast(result, message);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileDirty(true);
    setProfileDraft((current) => ({
      ...current,
      [name]: value,
    }));
    setSettings((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProfileSave = async (options = {}) => {
    if (!profileDraft.name.trim() || !profileDraft.email.trim()) {
      toast.error("Please fill all profile fields");
      playSound("error");
      return;
    }

    if (!profileDraft.email.includes("@")) {
      toast.error("Please enter a valid email address");
      playSound("error");
      return;
    }

    try {
      setSavingProfile(true);
      await saveProfile(profileDraft);
      setProfileDirty(false);

      if (!options.silent) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.log(error);
      const result = await updateSettings(profileDraft, {
        silentSound: true,
      });
      setProfileDirty(false);

      if (!options.silent) {
        showSyncToast(result, "Profile saved");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      playSound("error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile image must be under 2MB");
      playSound("error");
      return;
    }

    try {
      setSavingProfile(true);
      const savedSettings = await uploadProfileImage(file);
      setProfileDraft((current) => ({
        ...current,
        profileImage: savedSettings.profileImage,
      }));
      toast.success("Profile image updated successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Image upload failed");
      playSound("error");
    } finally {
      setSavingProfile(false);
      e.target.value = "";
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      toast.error("Please fill all password fields");
      playSound("error");
      return;
    }

    if (passwords.next.length < 8) {
      toast.error("Password must be at least 8 characters");
      playSound("error");
      return;
    }

    if (passwords.next !== passwords.confirm) {
      toast.error("New passwords do not match");
      playSound("error");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setPasswords({
        current: "",
        next: "",
        confirm: "",
      });
      toast.success("Password updated successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Password update failed");
      playSound("error");
    }
  };

  const handleForgotPassword = async () => {
    if (!profileDraft.email.trim()) {
      toast.error("Please enter your email first");
      playSound("error");
      return;
    }

    try {
      await requestPasswordReset(profileDraft.email);
      toast.success("Password reset instructions sent");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Reset request failed");
      playSound("error");
    }
  };

  const updatePasswordField = (e) => {
    const { name, value } = e.target;
    setPasswords((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const profileInitial = profileDraft.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <Layout>
      <div className="min-h-screen overflow-x-hidden rounded-3xl bg-slate-50 px-4 py-5 text-slate-950 transition-colors duration-300 dark:bg-[#0B0E14] dark:text-white sm:px-6 lg:px-8">
        <div
          className={`mb-6 flex flex-col gap-5 rounded-3xl border border-slate-200 bg-gradient-to-br ${tone.hero} p-5 shadow-sm dark:border-white/10 dark:shadow-2xl dark:shadow-black/20 sm:p-7 lg:flex-row lg:items-end lg:justify-between`}
        >
          <div className="min-w-0">
            <p className={`text-xs font-bold uppercase tracking-[0.28em] ${tone.text}`}>
              {t("accountControl")}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
              {t("settings")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              Manage profile details, security, appearance, preferences, and
              notifications from a cleaner workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-black/20">
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("theme")}</p>
              <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                {settings.theme}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-black/20">
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("mode")}</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                {settings.darkMode ? <Moon size={16} /> : <Sun size={16} />}
                {settings.darkMode ? t("dark") : t("light")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(280px,0.78fr)]">
          <div className="space-y-6">
            <div className={cardClass}>
              <SectionHeader
                icon={User}
                eyebrow={t("profile")}
                title="Account Profile"
                description="Update the identity details attached to your workspace."
                tone={tone}
              />

              <div className="p-5 sm:p-6">
                <div className="mb-6 flex min-w-0 items-center gap-4">
                  <label className="group relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-lg">
                    {profileDraft.profileImage && !settings.privacyMode ? (
                      <img
                        src={profileDraft.profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${tone.button} text-2xl font-bold uppercase text-white`}
                      >
                        {settings.privacyMode ? "P" : profileInitial}
                      </span>
                    )}
                    <span className="absolute inset-0 grid place-items-center bg-black/55 text-[10px] font-bold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100">
                      Upload
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="sr-only"
                    />
                  </label>

                  <div className="min-w-0">
                    <h3 className="sensitive-text truncate text-2xl font-bold text-slate-950 dark:text-white">
                      {settings.privacyMode ? "Private User" : profileDraft.name}
                    </h3>
                    <p className="sensitive-text truncate text-sm text-slate-500 dark:text-slate-400">
                      {settings.privacyMode ? "hidden@privacy.local" : profileDraft.email}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                      {lastSavedAt
                        ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`
                        : "Member since 2025"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("name")}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileDraft.name}
                      onChange={handleProfileChange}
                      onBlur={() => settings.autoSave && profileDirty && handleProfileSave({ silent: true })}
                      placeholder="Username"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("emailAddress")}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileDraft.email}
                      onChange={handleProfileChange}
                      onBlur={() => settings.autoSave && profileDirty && handleProfileSave({ silent: true })}
                      placeholder="Email"
                      className={fieldClass}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleProfileSave()}
                    disabled={savingProfile}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${tone.button} px-5 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-4 disabled:hover:translate-y-0`}
                  >
                    <Save size={17} />
                    {savingProfile ? "Saving..." : settings.autoSave ? "Save Profile Now" : t("saveProfile")}
                  </button>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <SectionHeader
                icon={Lock}
                eyebrow={t("security")}
                title="Security Center"
                description="Keep account access controlled and current."
                tone={tone}
              />

              <div className="space-y-4 p-5 sm:p-6">
                <input
                  type="password"
                  name="current"
                  value={passwords.current}
                  onChange={updatePasswordField}
                  placeholder="Current Password"
                  className={fieldClass}
                />

                <input
                  type="password"
                  name="next"
                  value={passwords.next}
                  onChange={updatePasswordField}
                  placeholder="New Password"
                  className={fieldClass}
                />

                <p className="text-xs text-slate-500">Minimum 8 characters</p>

                <input
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={updatePasswordField}
                  placeholder="Confirm Password"
                  className={fieldClass}
                />

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition duration-200 hover:-translate-y-0.5 hover:bg-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-400/20"
                  >
                    <Shield size={17} />
                    {t("changePassword")}
                  </button>

                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold ${tone.text} transition duration-200 hover:bg-slate-100 dark:hover:bg-white/10`}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={cardClass}>
              <SectionHeader
                icon={Palette}
                eyebrow={t("appearance")}
                title="Appearance & Interface"
                description="Tune the visual style and default navigation experience."
                tone={tone}
              />

              <div className="space-y-6 p-5 sm:p-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("theme")}
                  </label>

                  <select
                    value={settings.theme}
                    onChange={(e) =>
                      handleSettingUpdate(
                        {
                          theme: e.target.value,
                          darkMode: e.target.value !== "Light Mode",
                        },
                        `Theme changed to ${e.target.value}`
                      )
                    }
                    className={selectClass}
                  >
                    {Object.keys(themeOptions).map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <SettingRow
                  title="Dark Mode"
                  description="Switch between light and dark workspace surfaces."
                >
                  <Toggle
                    checked={settings.darkMode}
                    label="Toggle dark mode"
                    tone={tone}
                    onChange={() =>
                      handleSettingUpdate(
                        {
                          darkMode: !settings.darkMode,
                        },
                        !settings.darkMode ? "Dark Mode Enabled" : "Light Mode Enabled"
                      )
                    }
                  />
                </SettingRow>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("interfaceLanguage")}
                  </label>

                  <select
                    value={settings.language}
                    onChange={(e) =>
                      handleSettingUpdate(
                        {
                          language: e.target.value,
                        },
                        `Language changed to ${e.target.value}`
                      )
                    }
                    className={selectClass}
                  >
                    <option>English</option>
                    <option>Tamil</option>
                    <option>Hindi</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t("startPage")}
                  </label>

                  <select
                    value={settings.startPage}
                    onChange={(e) =>
                      handleSettingUpdate(
                        {
                          startPage: e.target.value,
                        },
                        `${e.target.value} set as start page`
                      )
                    }
                    className={selectClass}
                  >
                    {Object.keys(startPageRoutes).map((page) => (
                      <option key={page}>{page}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <SectionHeader
                icon={Check}
                eyebrow={t("preferences")}
                title={t("workspaceBehavior")}
                description="Control privacy, autosave, and interaction feedback."
                tone={tone}
              />

              <div className="space-y-4 p-5 sm:p-6">
                <SettingRow
                  title="Auto Save"
                  description="Save eligible changes automatically while you work."
                >
                  <Toggle
                    checked={settings.autoSave}
                    label="Toggle auto save"
                    tone={tone}
                    onChange={() =>
                      handleSettingUpdate(
                        {
                          autoSave: !settings.autoSave,
                        },
                        !settings.autoSave ? "Auto Save Enabled" : "Auto Save Disabled"
                      )
                    }
                  />
                </SettingRow>

                <SettingRow
                  title="Privacy Mode"
                  description="Reduce visible personal details in shared spaces."
                >
                  <Toggle
                    checked={settings.privacyMode}
                    label="Toggle privacy mode"
                    tone={tone}
                    onChange={() =>
                      handleSettingUpdate(
                        {
                          privacyMode: !settings.privacyMode,
                        },
                        !settings.privacyMode
                          ? "Privacy Mode Enabled"
                          : "Privacy Mode Disabled"
                      )
                    }
                  />
                </SettingRow>

                <SettingRow
                  title="Sound Effects"
                  description="Play subtle audio feedback for key actions."
                >
                  <Toggle
                    checked={settings.soundEffects}
                    label="Toggle sound effects"
                    tone={tone}
                    onChange={() =>
                      handleSettingUpdate(
                        {
                          soundEffects: !settings.soundEffects,
                        },
                        !settings.soundEffects
                          ? "Sound Effects Enabled"
                          : "Sound Effects Disabled"
                      )
                    }
                  />
                </SettingRow>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={cardClass}>
              <SectionHeader
                icon={Bell}
                eyebrow="Alerts"
                title={t("notifications")}
                description="Choose how often TaxPal should keep you informed."
                tone={tone}
              />

              <div className="space-y-4 p-5 sm:p-6">
                <SettingRow
                  title="App Notifications"
                  description="Receive alerts about account and tax activity."
                >
                  <Toggle
                    checked={settings.notifications}
                    label="Toggle app notifications"
                    tone={tone}
                    onChange={() =>
                      handleSettingUpdate(
                        {
                          notifications: !settings.notifications,
                        },
                        !settings.notifications
                          ? "Notifications Enabled"
                          : "Notifications Disabled"
                      )
                    }
                  />
                </SettingRow>

                <SettingRow
                  title="System Notifications"
                  description="Allow important operating and service updates."
                >
                  <Toggle
                    checked={settings.systemNotifications}
                    label="Toggle system notifications"
                    tone={tone}
                    onChange={() =>
                      handleSettingUpdate(
                        {
                          systemNotifications: !settings.systemNotifications,
                        },
                        !settings.systemNotifications
                          ? "System Notifications Enabled"
                          : "System Notifications Disabled"
                      )
                    }
                  />
                </SettingRow>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Notification Frequency
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Balance fewer reminders with faster updates.
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${tone.badge}`}
                    >
                      {notificationLabel} {settings.frequency}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.frequency}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        frequency: Number(e.target.value),
                      }))
                    }
                    onMouseUp={(e) =>
                      handleSettingUpdate(
                        {
                          frequency: Number(e.currentTarget.value),
                        },
                        "Notification frequency updated"
                      )
                    }
                    onTouchEnd={(e) =>
                      handleSettingUpdate(
                        {
                          frequency: Number(e.currentTarget.value),
                        },
                        "Notification frequency updated"
                      )
                    }
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[var(--tp-primary)] dark:bg-slate-700"
                  />

                  <button
                    type="button"
                    onClick={async () => {
                      const delivered = await sendNotification(
                        "TaxPal notification test",
                        "Your current notification settings are working.",
                        {
                          force: true,
                          priority: 1,
                        }
                      );
                      toast.success(delivered ? "Test notification sent" : "Notifications are disabled");
                    }}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border ${tone.border} px-4 py-2 text-sm font-semibold ${tone.text} transition hover:bg-slate-100 dark:hover:bg-white/10`}
                  >
                    <Bell size={16} />
                    Test Notification
                  </button>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <SectionHeader
                icon={HelpCircle}
                eyebrow="Support"
                title={t("helpGuidance")}
                description="Get quick assistance without leaving settings."
                tone={tone}
              />

              <div className="space-y-4 p-5 sm:p-6">
                <div className={`rounded-2xl border ${tone.border} ${tone.badge} p-4`}>
                  <h3 className="font-semibold text-slate-950 dark:text-white">
                    Need help?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Open the support panel for account, interface, and security
                    guidance.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowHelp(true);
                    playSound("notify");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-white/20 dark:hover:bg-white/[0.07] dark:focus:ring-white/10"
                >
                  <HelpCircle size={17} />
                  Open Help Center
                </button>

                {showHelp && (
                  <div
                    className={`rounded-xl border ${tone.border} bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm dark:bg-[#0F1823] dark:text-slate-300`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-950 dark:text-white">
                          Help Center
                        </h4>
                        <p className="mt-1">
                          Review your profile, password, theme, notifications,
                          and privacy settings from this page.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowHelp(false)}
                        className={`rounded-lg px-2 py-1 text-xs font-semibold ${tone.text} transition hover:bg-slate-100 dark:hover:bg-white/10`}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                    <Volume2
                      size={18}
                      className="text-slate-500 dark:text-slate-400"
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Sound
                    </p>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      {settings.soundEffects ? "On" : "Off"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                    <Shield
                      size={18}
                      className="text-slate-500 dark:text-slate-400"
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Privacy
                    </p>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      {settings.privacyMode ? "On" : "Off"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;
