import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import {
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import {
  auth,
  authReady,
  isGoogleAuthConfigured,
  provider,
} from "../firebase";
import { useSettings } from "../context/SettingsContext";
import {
  saveGoogleSession,
  savePasswordSession,
} from "../utils/auth";
import api from "../utils/api";

function Login() {
  const {
    startPagePath,
    playSound,
  } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || startPagePath || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const finishGoogleLogin = useCallback(
    async (firebaseUser) => {
      const idToken = await firebaseUser.getIdToken(true);

      const backendRes = await api.post("/google-login", {
        idToken,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
      });

      const user = await saveGoogleSession(firebaseUser, backendRes.data);

      toast.success(`Welcome ${user.displayName || user.name}`);
      navigate(redirectPath, {
        replace: true,
      });
    },
    [navigate, redirectPath]
  );

  useEffect(() => {
    let isMounted = true;

    authReady
      .then(() => getRedirectResult(auth))
      .then(async (result) => {
        if (!isMounted || !result?.user) {
          return;
        }

        setGoogleLoading(true);
        await finishGoogleLogin(result.user);
      })
      .catch((error) => {
        console.error(error);

        if (isGoogleAuthConfigured) {
          toast.error(error.message || "Google sign-in redirect failed");
        }
      })
      .finally(() => {
        if (isMounted) {
          setGoogleLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [finishGoogleLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Fill all fields");
    }

    if (!email.includes("@")) {
      return toast.error("Invalid email");
    }

    try {
      setLoading(true);

      const res = await api.post("/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const token = res.data.token || res.data.data?.token;

      if (!token) {
        toast.error("Token not received");
        return;
      }

      savePasswordSession({
        token,
        user: res.data.user,
      });

      toast.success(res.data.message || "Login success");
      navigate(redirectPath, {
        replace: true,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      playSound("error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isGoogleAuthConfigured) {
      toast.error("Google Sign-In is not configured for this environment.");
      return;
    }

    try {
      setGoogleLoading(true);
      await authReady;

      const result = await signInWithPopup(auth, provider);
      await finishGoogleLogin(result.user);
    } catch (error) {
      console.error(error);

      if (
        error.code === "auth/popup-blocked" ||
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        await signInWithRedirect(auth, provider);
        return;
      }

      toast.error(error.message || "Google Login Failed");
      playSound("error");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900 px-4 py-8">
      <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-blue-300 opacity-30 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-blue-900 opacity-30 blur-3xl" />

      <div className="relative w-full max-w-[400px] rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <h2 className="mb-2 text-center text-3xl font-bold text-white sm:text-4xl">
          Welcome Back
        </h2>

        <p className="text-center text-gray-200 mb-8">
          Login to continue to TaxPal
        </p>

        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label className="text-white text-sm">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@gmail.com"
              className="w-full mt-2 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none border border-white/20 focus:border-white"
            />
          </div>

          <div className="relative mb-4">
            <label className="text-white text-sm">
              Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full mt-2 px-4 py-3 pr-12 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none border border-white/20 focus:border-white"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[52px] text-white"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <div className="flex justify-between items-center mb-6 text-sm text-white">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember me
            </label>

            <span
              onClick={() => navigate("/forgot-password")}
              className="hover:underline cursor-pointer"
            >
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center text-gray-300 mt-6 mb-4">
          OR
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading || !isGoogleAuthConfigured}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50"
        >
          <FcGoogle size={22} />
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        {!isGoogleAuthConfigured && (
          <p className="mt-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-center text-xs text-gray-100">
            Google Sign-In is not configured for this environment.
          </p>
        )}

        <p className="text-center text-gray-300 mt-6 text-sm">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-white font-semibold hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
