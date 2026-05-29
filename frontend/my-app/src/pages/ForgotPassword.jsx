import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";
import api from "../utils/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setDevResetUrl("");

      const res = await api.post("/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setMessage(res.data.message || "Password reset instructions sent");
      setDevResetUrl(res.data.resetUrl || "");
      toast.success("Password reset instructions sent");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Reset request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900 px-4 py-8">
      <div className="relative w-full max-w-[420px] rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-800 shadow-lg">
          <Mail size={24} />
        </div>

        <h1 className="mb-2 text-center text-3xl font-bold text-white">
          Forgot Password
        </h1>
        <p className="mb-8 text-center text-sm leading-6 text-gray-200">
          Enter your registered email and we will send reset instructions.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-white">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@gmail.com"
              className="mt-2 w-full rounded-xl border border-white/20 bg-white/20 px-4 py-3 text-white outline-none placeholder:text-gray-300 focus:border-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <div className="mt-5 rounded-xl border border-emerald-200/40 bg-emerald-500/20 px-4 py-3 text-sm text-emerald-50">
            {message}
          </div>
        )}

        {devResetUrl && (
          <button
            type="button"
            onClick={() => window.location.assign(devResetUrl)}
            className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Open Reset Page
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 w-full text-sm font-semibold text-white hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
