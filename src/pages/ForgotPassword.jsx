import React, { useState } from "react";
import { Eye, EyeOff, Lock, CheckCircle, Key, ArrowLeft, ShieldAlert, LifeBuoy, Globe } from "lucide-react";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import API_BASE_URL from '../config/api';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const handleHome = () => {
    window.location.href = "/";
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (passwordStrength(newPassword) < 2) {
      toast.error("Password too weak");
      setError("Use uppercase, numbers or symbols.");
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

      toast.success("Password updated successfully");
      setSuccess(true);
      setNewPassword("");
    } catch (err) {
      toast.error("Password update failed");
      setError("Unauthorized or session expired.");
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(newPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden">
      <Toaster position="top-right" />

      <div className="w-full max-w-5xl grid md:grid-cols-12 rounded-[2rem] shadow-2xl border border-slate-800 overflow-hidden">


<div className="hidden md:flex md:col-span-5 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 p-10 text-white relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-700/20 rounded-full blur-2xl z-0" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl z-0" />
          <div className="relative z-10 flex flex-col h-full justify-between w-full">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs uppercase mb-4">
                <Globe size={18} /> Secure Session Active
              </div>
              <div className="flex flex-col items-center mb-8">
                <div className="bg-gradient-to-tr from-cyan-500 via-blue-400 to-blue-700 rounded-full p-4 shadow-lg mb-4">
                  <Lock size={38} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-center mb-2">
                  Account <span className="text-cyan-400">Security</span>
                </h2>
                <p className="text-base text-slate-300 text-center max-w-xs">
                  Your password is encrypted and never stored in plain text. Changing your password regularly helps keep your account safe.
                </p>
              </div>
              <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 mb-6 flex flex-col items-center">
                <h3 className="text-xs uppercase flex items-center gap-2 text-cyan-300">
                  <ShieldAlert size={16} /> Protection
                </h3>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Password change requires a valid login token.<br />
                  Make sure your new password is strong and unique.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 mt-8">
                <div className="flex items-center gap-2 text-blue-300 text-sm">
                  <LifeBuoy className="text-blue-400" />
                  Need help? <span className="underline cursor-pointer hover:text-cyan-400">Contact support</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-400 text-xs">
                  <Key size={16} /> Tip: Use a mix of letters, numbers, and symbols.
                </div>
              </div>
            </div>
            <div className="mt-10 flex flex-col items-center">
              <div className="w-16 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-60 mb-2" />
              <span className="text-xs text-slate-500">Your security is our priority</span>
            </div>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="md:col-span-7 bg-slate-900/60 backdrop-blur-xl p-10">
          <div className="mb-8 text-center md:text-left">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
              <Key size={26} className="text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Change Password</h1>
            <p className="text-slate-400 text-sm">You can update your password securely.</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            {success && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm">
                <CheckCircle size={18} /> Password updated successfully
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 uppercase font-bold tracking-widest">
                New Password
              </label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-12 text-white focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {/* Strength Meter */}
              <div className="flex gap-2 mt-4 h-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full ${
                      strength >= i ? "bg-cyan-400" : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold ${
                loading
                  ? "bg-slate-800 text-slate-500"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
              }`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

            <button
              type="button"
              onClick={handleHome}
              className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-white"
            >
              <ArrowLeft size={16} /> Back to Home
            </button>
          </form>
        </div>

        {/* ENHANCED INFO PANEL */}
        

      </div>
    </div>
  );
}
