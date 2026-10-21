
import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Fingerprint,
  CircleCheck,
  AlertCircle,
  Music2,
  LoaderCircle,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import API_BASE_URL from "../config/api";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = passwordStrength(newPassword);

  const strengthLevels = [
    { label: "Very weak", color: "bg-rose-500", text: "text-rose-400" },
    { label: "Weak", color: "bg-rose-500", text: "text-rose-400" },
    { label: "Fair", color: "bg-amber-400", text: "text-amber-400" },
    { label: "Good", color: "bg-blue-400", text: "text-blue-400" },
    { label: "Strong", color: "bg-emerald-400", text: "text-emerald-400" },
  ];

  const currentStrength = strengthLevels[strength];

  const requirements = [
    { label: "8+ characters", met: newPassword.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "At least one number", met: /[0-9]/.test(newPassword) },
    {
      label: "Special character",
      met: /[^A-Za-z0-9]/.test(newPassword),
    },
  ];

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!localStorage.getItem("token")) {
      const message = "Your session has expired. Please log in again.";
      setError(message);
      toast.error(message);
      return;
    }

    if (strength < 2) {
      const message = "Please choose a stronger password.";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);

      await axios.put(
        `${API_BASE_URL}/auth/changepassword`,
        { new_password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSuccess(true);
      setNewPassword("");
      setShowPassword(false);
      toast.success("Password updated successfully!");
    } catch (err) {
      const message =
        err.response?.status === 401
          ? "Your session has expired. Please log in again."
          : err.response?.data?.message ||
            "Unable to update your password. Please try again.";

      setError(message);
      toast.error("Password update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleHome = () => navigate("/");

  const inputClass =
    "w-full rounded-xl border border-white/[0.09] bg-[#0B1019] py-4 pl-12 pr-12 text-sm text-white outline-none transition duration-200 placeholder:text-slate-600 hover:border-white/[0.16] focus:border-blue-400/70 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0B0F17] font-sans text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#171D29",
            color: "#F8FAFC",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      />

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-40 h-96 w-96 rounded-full bg-blue-600/[0.10] blur-[130px]" />
        <div className="absolute -right-40 top-64 h-96 w-96 rounded-full bg-indigo-600/[0.10] blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-500/[0.06] blur-[110px]" />
      </div>

      {/* Existing GeetHub navbar */}
      <div className="relative z-50">
        <Navbar />
      </div>

      <main className="relative mx-auto max-w-[1250px] px-4 pb-16 pt-28 sm:px-6 lg:px-10 lg:pt-32">
        {/* Breadcrumb */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleHome}
            className="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] transition group-hover:border-blue-400/30 group-hover:bg-blue-500/10">
              <ArrowLeft size={15} />
            </span>
            Back to home
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-2 text-xs font-medium text-emerald-300">
            <ShieldCheck size={15} />
            Security settings
          </div>
        </div>

        {/* Page heading */}
        <div className="mb-8 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.08] px-3 py-1.5 text-xs font-semibold text-blue-300">
            <Sparkles size={14} />
            PROTECT YOUR ACCOUNT
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Your security,{" "}
            <span className="text-blue-400">your control.</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Update your password to keep your GeetHub account protected.
            Choose something unique that only you know.
          </p>
        </div>

        {/* Main content */}
        <section className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
          {/* Password form */}
          <div className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#121824] shadow-2xl shadow-black/20">
            <div className="border-b border-white/[0.06] p-5 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/[0.10] text-blue-300">
                  <KeyRound size={23} />
                </div>

                <div>
                  <h2 className="text-xl font-bold sm:text-2xl">
                    Change password
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-slate-400">
                    Enter your new password below.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              {success && (
                <div
                  role="status"
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4"
                >
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-400"
                  />
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">
                      Password updated successfully
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-200/60">
                      Your new password has been saved.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-4"
                >
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-rose-400"
                  />
                  <p className="text-sm leading-6 text-rose-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="new-password"
                      className="text-sm font-semibold text-slate-200"
                    >
                      New password
                    </label>

                    <span className="text-xs text-slate-500">
                      Minimum 8 characters recommended
                    </span>
                  </div>

                  <div className="group relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-blue-400"
                    />

                    <input
                      id="new-password"
                      name="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => {
                        setNewPassword(event.target.value);
                        setError("");
                        setSuccess(false);
                      }}
                      className={inputClass}
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      disabled={loading}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {/* Strength meter */}
                  <div className="mt-4 rounded-2xl border border-white/[0.06] bg-[#0D121B] p-4 sm:p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-300">
                        Password strength
                      </span>

                      <span
                        className={`text-xs font-bold ${
                          newPassword
                            ? currentStrength.text
                            : "text-slate-500"
                        }`}
                      >
                        {newPassword ? currentStrength.label : "Not entered"}
                      </span>
                    </div>

                    <div
                      className="flex gap-1.5"
                      role="meter"
                      aria-label="Password strength"
                      aria-valuemin={0}
                      aria-valuemax={4}
                      aria-valuenow={strength}
                    >
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            strength >= level
                              ? currentStrength.color
                              : "bg-white/[0.08]"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {requirements.map((requirement) => (
                        <div
                          key={requirement.label}
                          className={`flex items-center gap-2 text-xs transition-colors ${
                            requirement.met
                              ? "text-emerald-300"
                              : "text-slate-500"
                          }`}
                        >
                          {requirement.met ? (
                            <CircleCheck size={15} />
                          ) : (
                            <span className="h-3.5 w-3.5 rounded-full border border-slate-600" />
                          )}
                          {requirement.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !newPassword}
                  className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-blue-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition duration-200 hover:bg-blue-400 hover:shadow-blue-900/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Update password
                      <ArrowUpRight
                        size={17}
                        className="ml-auto transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>

                <p className="flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-500">
                  <ShieldCheck
                    size={14}
                    className="shrink-0 text-emerald-400"
                  />
                  Your request uses your authenticated session.
                </p>
              </form>
            </div>
          </div>

          {/* Security information */}
          <aside className="flex flex-col gap-5">
            <div className="relative flex-1 overflow-hidden rounded-[26px] border border-blue-400/[0.13] bg-[#121B2A] p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/[0.12] blur-[80px]" />

              <div className="relative">
                <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-[22px] border border-blue-300/20 bg-blue-500/[0.10] text-blue-300">
                  <ShieldCheck size={34} strokeWidth={1.5} />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                  Your protection checklist
                </p>

                <h3 className="mt-3 text-2xl font-bold leading-snug">
                  Small steps.
                  <span className="block text-slate-400">
                    Stronger security.
                  </span>
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  A unique password helps reduce the risk of someone accessing
                  your account using credentials exposed on another service.
                </p>

                <div className="mt-8 space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-blue-300">
                      <Fingerprint size={19} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">
                        Keep it unique
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Use a password you don't use on other websites.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-blue-300">
                      <KeyRound size={19} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">
                        Add variety
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Combine different character types for better strength.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-blue-300">
                      <Shield size={19} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">
                        Keep it private
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Never share your password or authentication token.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Helpful note */}
            <div className="rounded-[22px] border border-white/[0.07] bg-[#121824] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/[0.08] text-emerald-300">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    You're in control
                  </h4>
                  <p className="mt-1.5 text-xs leading-6 text-slate-500">
                    Only submit a password you want to use going forward.
                    Keep it somewhere private and secure.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-2">
            <Music2 size={14} className="text-blue-400" />
            GeetHub Account Security
          </span>

          <button
            type="button"
            onClick={handleHome}
            className="transition hover:text-slate-300"
          >
            Return to home
          </button>
        </footer>
      </main>
    </div>
  );
}
