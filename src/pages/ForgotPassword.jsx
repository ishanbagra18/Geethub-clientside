import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, CheckCircle, Key } from "lucide-react";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email || !/^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/.test(email)) {
      setError("Please enter a valid email address.");
      toast.error("Invalid email format.");
      return;
    }

    if (passwordStrength(newPassword) < 2) {
      setError("Password too weak — add uppercase, numbers, or symbols.");
      toast.error("Weak password.");
      return;
    }

    try {
      setLoading(true);

      await axios.put("http://localhost:9000/forgotpassword", {
        email: email,
        new_password: newPassword,
      });

      setSuccess(true);
      toast.success("Password reset successfully!");

      setEmail("");
      setNewPassword("");
    } catch (err) {
      setError("Something went wrong. Check the email or try again.");
      toast.error("Reset failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(newPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-950 via-purple-900 to-slate-800 p-6">

      {/* 🔥 TOASTER ADDED HERE 🔥 */}
      <Toaster position="top-right" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Image + Tips */}
        <div className="hidden md:flex flex-col justify-center rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-gray-800">
          <div className="p-10 text-center">
            <h2 className="text-3xl font-extrabold text-white mb-3">Forgot your password?</h2>
            <p className="text-slate-300 mb-6">
              No problem — enter your registered email and a new password.
            </p>

            <div className="mx-auto w-120 h-50 rounded-xl overflow-hidden">
              <img
                src="https://i.pinimg.com/1200x/d2/61/0a/d2610a9eaeaa14228e1be5e1c9aabc7b.jpg"
                alt="security"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="p-6 bg-slate-900/40 text-slate-300">
            <h3 className="text-sm font-medium uppercase tracking-wide mb-2">Security Tips</h3>
            <ul className="text-sm space-y-2">
              <li>• Use strong passwords with uppercase & numbers.</li>
              <li>• Do not reuse passwords.</li>
              <li>• Enable 2-factor authentication.</li>
            </ul>
          </div>
        </div>

        {/* Right: Form */}
        <div className="bg-slate-900/70 backdrop-blur rounded-2xl p-8 shadow-2xl border border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-600 shadow-lg">
              <Key size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Reset your password</h1>
              <p className="text-slate-400 text-sm">
                Enter your email and choose a strong new password.
              </p>
            </div>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-5">
            {success && (
              <div className="flex items-center gap-2 bg-green-900/40 border border-green-700 rounded-md p-3 text-green-200">
                <CheckCircle size={18} />
                <span className="text-sm">Password reset successfully.</span>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-300 bg-red-900/30 border border-red-700 rounded-md p-3">
                {error}
              </div>
            )}

            {/* Email */}
            <label className="block">
              <span className="text-sm text-slate-200 font-medium">Email</span>
              <div className="relative mt-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-100 py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </label>

            {/* New Password */}
            <label className="block">
              <span className="text-sm text-slate-200 font-medium">New password</span>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-100 py-3 pl-12 pr-11 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                />

                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength Meter */}
              <div className="mt-2">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      strength === 0
                        ? "w-0 bg-transparent"
                        : strength === 1
                        ? "w-1/4 bg-red-500"
                        : strength === 2
                        ? "w-1/2 bg-yellow-400"
                        : strength === 3
                        ? "w-3/4 bg-teal-400"
                        : "w-full bg-green-400"
                    }`}
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>Password strength</span>
                  <span>{["Very weak", "Weak", "Okay", "Good", "Strong"][strength]}</span>
                </div>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white shadow ${
                loading
                  ? "opacity-70 cursor-not-allowed bg-gradient-to-r from-slate-600 to-slate-700"
                  : "bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-95"
              } transition`}
            >
              {loading ? "Please wait..." : "Reset password"}
            </button>

            <div className="text-center text-xs text-slate-500">
              By resetting you agree to our{" "}
              <span className="text-teal-300">Terms</span> and{" "}
              <span className="text-teal-300">Privacy</span>.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
