import React, { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calculator,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useSettings } from "../context/SettingsContext";
import { useLanguage } from "../context/LanguageContext";
import {
  AUTH_EVENT,
  clearAuthSession,
  getCurrentUser,
} from "../utils/auth";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, playSound } = useSettings();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser());

  React.useEffect(() => {
    const refreshUser = () => setUser(getCurrentUser());

    window.addEventListener(AUTH_EVENT, refreshUser);
    window.addEventListener("storage", refreshUser);

    return () => {
      window.removeEventListener(AUTH_EVENT, refreshUser);
      window.removeEventListener("storage", refreshUser);
    };
  }, []);

  const menu = [
    {
      name: "Dashboard",
      labelKey: "dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Users",
      labelKey: "users",
      path: "/users",
      icon: <Users size={20} />,
    },
    {
      name: "Analytics",
      labelKey: "analytics",
      path: "/analytics",
      icon: <BarChart3 size={20} />,
    },
    {
      name: "Transactions",
      labelKey: "transactions",
      path: "/transactions",
      icon: <CreditCard size={20} />,
    },
    {
      name: "Budget",
      labelKey: "budget",
      path: "/budget",
      icon: <Package size={20} />,
    },
    {
      name: "Tax",
      labelKey: "tax",
      path: "/tax",
      icon: <Calculator size={20} />,
    },
    {
      name: "Settings",
      labelKey: "settings",
      path: "/settings",
      icon: <Settings size={20} />,
    },
  ];

  const handleNavigate = (path) => {
    playSound("notify");
    setMobileOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    } finally {
      clearAuthSession();
      toast.success("Logged out successfully");
      navigate("/", {
        replace: true,
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--tp-app-bg)] text-[var(--tp-text)] transition-colors duration-300">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-card-bg)] p-3 shadow-xl backdrop-blur lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close navigation overlay"
        />
      )}

      <div
        className={`
        ${collapsed ? "lg:w-20" : "lg:w-56"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        z-50
        w-72
        fixed
        h-full
        border-r
        border-[var(--tp-border)]
        bg-[var(--tp-sidebar-bg)]
        p-4
        shadow-2xl
        backdrop-blur-lg
        transition-all
        duration-300
        flex
        flex-col
        justify-between
        `}
      >
        <div>
          <div className="mb-10 flex items-center justify-between">
            {(!collapsed || mobileOpen) && (
              <h2 className="text-2xl font-bold tracking-wide text-[var(--tp-primary)]">
                TAXPAL
              </h2>
            )}

            <button
              type="button"
              onClick={() => {
                if (mobileOpen) {
                  setMobileOpen(false);
                } else {
                  setCollapsed(!collapsed);
                }
                playSound("notify");
              }}
              className="rounded-2xl bg-[var(--tp-nav-bg)] p-3 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[var(--tp-nav-hover)]"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {(!collapsed || mobileOpen) && (
            <div className="mb-6 rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-nav-bg)] p-4 shadow-lg">
              <div className="flex items-center gap-3">
                {user?.profileImage || user?.photoURL ? (
                  <img
                    src={user.profileImage || user.photoURL}
                    alt="profile"
                    className="h-11 w-11 rounded-full border-2 border-[var(--tp-primary)] object-cover"
                  />
                ) : (
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--tp-primary)] text-base font-bold text-[var(--tp-active-text)]">
                    {(user?.name || user?.displayName || "User").charAt(0)}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--tp-text)]">
                    {user?.displayName || user?.name || "User"}
                  </p>
                  <p className="truncate text-xs text-[var(--tp-muted)]">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <ul className="space-y-4">
            {menu.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <motion.li
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  whileHover={{
                    scale: 1.03,
                    x: 4,
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                  className={`
                  relative
                  flex
                  cursor-pointer
                  items-center
                  gap-4
                  overflow-hidden
                  rounded-2xl
                  p-3
                  shadow-md
                  transition-all
                  duration-300
                  ${
                    isActive
                      ? "bg-[var(--tp-primary)] text-[var(--tp-active-text)] shadow-[0_12px_30px_rgba(var(--tp-primary-rgb),0.35)]"
                      : "bg-[var(--tp-nav-bg)] hover:bg-[var(--tp-nav-hover)]"
                  }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-0 h-full w-1 rounded bg-white"
                    />
                  )}

                  <span>{item.icon}</span>

                  {(!collapsed || mobileOpen) && (
                    <span className="sensitive-text text-[15px] font-medium">
                      {settings.privacyMode && item.name === "Users"
                        ? "Team"
                        : t(item.labelKey)}
                    </span>
                  )}
                </motion.li>
              );
            })}
          </ul>
        </div>

        {(!collapsed || mobileOpen) && (
          <div className="space-y-4 border-t border-[var(--tp-border)] pt-5">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-red-600"
            >
              <LogOut size={18} />
              Logout
            </button>

            <div className="text-center text-sm text-[var(--tp-muted)]">
              &copy; 2026 {t("financeDashboard")}
            </div>
          </div>
        )}

        {collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-2xl bg-red-500 p-3 text-white shadow-lg transition-all duration-300 hover:bg-red-600"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>

      <motion.div
        key={location.pathname}
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
        }}
        className={`
        ${collapsed ? "lg:ml-20" : "lg:ml-56"}
        min-h-screen
        w-full
        bg-[var(--tp-app-bg)]
        p-3 pt-20 sm:p-6 sm:pt-20 lg:pt-6
        transition-all
        duration-300
        `}
      >
        <div className="min-h-[calc(100vh-48px)] rounded-3xl border border-[var(--tp-border)] bg-[var(--tp-shell-bg)] p-4 shadow-2xl backdrop-blur-lg sm:p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export default Layout;
