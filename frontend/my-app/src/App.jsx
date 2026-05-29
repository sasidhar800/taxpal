import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/dashboard";
import Analytics from "./pages/analytics";
import Transactions from "./pages/transactions";
import Budget from "./pages/budget";
import TaxEstimator from "./pages/tax";
import Settings from "./pages/settings";
import Users from "./pages/users";
import ProtectedRoute from "./components/ProtectedRoute";
import { isAuthenticated } from "./utils/auth";
import {
  SettingsProvider,
  useSettings,
} from "./context/SettingsContext";

function PublicRoute({ children }) {
  const { startPagePath } = useSettings();

  if (isAuthenticated()) {
    return (
      <Navigate
        to={startPagePath}
        replace
      />
    );
  }

  return children;
}

function StartPageRedirect() {
  const { startPagePath } = useSettings();

  return (
    <Navigate
      to={startPagePath}
      replace
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/budget"
        element={
          <ProtectedRoute>
            <Budget />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tax"
        element={
          <ProtectedRoute>
            <TaxEstimator />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <ProtectedRoute>
            <StartPageRedirect />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function AppShell() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-[var(--tp-app-bg)] text-[var(--tp-text)] transition-colors duration-300">
      <AppRoutes />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={settings.darkMode ? "dark" : "light"}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        toastClassName="rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-card-bg)] text-[var(--tp-text)] shadow-2xl"
      />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            border: "1px solid var(--tp-border)",
            background: "var(--tp-card-bg)",
            color: "var(--tp-text)",
            borderRadius: "1rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AppShell />
          </LanguageProvider>
        </ThemeProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;
