import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { LockKeyhole } from "lucide-react";
import api from "../utils/api";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Reset token is missing");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.post("/reset-password", {
        token,
        password,
      });
      setSuccess(true);
      toast.success("Password reset successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900 px-4 py-8">
      <div className="relative w-full max-w-[420px] rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-800 shadow-lg">
          <LockKeyhole size={24} />
        </div>

        <h1 className="mb-2 text-center text-3xl font-bold text-white">
          Reset Password
        </h1>
        <p className="mb-8 text-center text-sm leading-6 text-gray-200">
          Create a new password for your TaxPal account.
        </p>

        {success ? (
          <div>
            <div className="rounded-xl border border-emerald-200/40 bg-emerald-500/20 px-4 py-3 text-sm text-emerald-50">
              Your password has been reset successfully.
            </div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-5 w-full rounded-xl bg-blue-800 py-3 font-semibold text-white transition hover:bg-blue-900"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm text-white">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="mt-2 w-full rounded-xl border border-white/20 bg-white/20 px-4 py-3 text-white outline-none placeholder:text-gray-300 focus:border-white"
              />
            </div>

            <div>
              <label className="text-sm text-white">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="mt-2 w-full rounded-xl border border-white/20 bg-white/20 px-4 py-3 text-white outline-none placeholder:text-gray-300 focus:border-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {!token && (
          <p className="mt-4 rounded-xl border border-rose-200/40 bg-rose-500/20 px-4 py-3 text-sm text-rose-50">
            Reset token is missing. Please request a new reset link.
          </p>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
