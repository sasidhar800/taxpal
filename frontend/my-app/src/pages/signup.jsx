import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { savePasswordSession } from "../utils/auth";
import { useSettings } from "../context/SettingsContext";

function Signup() {
  const navigate = useNavigate();
  const { startPagePath } = useSettings();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      return toast.error("All fields are required");
    }

    if (!email.includes("@")) {
      return toast.error("Please enter a valid email address");
    }

    try {
      setLoading(true);

      const res = await api.post("/signup", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data.token && res.data.user) {
        savePasswordSession({
          token: res.data.token,
          user: res.data.user,
        });
      }

      toast.success(res.data.message || "Signup success");
      setName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate(res.data.token ? startPagePath || "/dashboard" : "/", {
          replace: true,
        });
      }, 500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 via-blue-500 to-blue-900 px-4 py-8">
      <div className="w-full max-w-96 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        <h2 className="mb-6 text-center text-3xl font-bold text-white">
          Sign Up
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-lg bg-white/20 px-4 py-3 text-white outline-none placeholder:text-gray-200"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg bg-white/20 px-4 py-3 text-white outline-none placeholder:text-gray-200"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-lg bg-white/20 px-4 py-3 text-white outline-none placeholder:text-gray-200"
        />

        <button
          type="button"
          onClick={handleSignup}
          disabled={loading}
          className="w-full rounded-lg bg-purple-700 py-3 font-semibold text-white transition hover:bg-purple-800 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-5 w-full text-sm font-semibold text-white hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default Signup;
