import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, CheckCircle, ShieldCheck, Key, ArrowLeft, ShieldAlert, LifeBuoy, Globe } from "lucide-react";
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


  const handlehome=()=>{
    window.location.href="/";
  }




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
      toast.error("Reset failed.");
    } finally {
      setLoading(false);
    }
  };






  const strength = passwordStrength(newPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 font-sans relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
      </div>

      <Toaster position="top-right" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden rounded-[2rem] shadow-2xl border border-slate-800">
        
        {/* Left Section: Information (Occupies 5 columns) */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 p-10 text-white border-r border-slate-800">
          
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold tracking-wider text-xs uppercase">
              <Globe size={14} />
              <span>Secure Network Active</span>
            </div>

            <div>
              <h2 className="text-4xl font-bold mb-4 tracking-tight leading-tight">
                Secure your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Digital Identity.</span>
              </h2>
              <p className="text-slate-400 leading-relaxed text-sm">
                If you've forgotten your access credentials, please follow the verification process to regain control of your account.
              </p>
            </div>

            {/* Empty Space Filler 1: System Status */}
            <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-5 space-y-4">
               <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                 <ShieldAlert size={14} className="text-cyan-400"/> Security Environment
               </h3>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Encryption</span>
                    <span className="text-cyan-400 font-mono">AES-256 Bit</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full w-[85%]"></div>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-slate-500">Firewall Status</span>
                    <span className="text-emerald-400 font-mono">Active</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Empty Space Filler 2: Quick Support */}
          <div className="pt-8 mt-8 border-t border-slate-800">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <LifeBuoy size={20} className="text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Need help?</h4>
                <p className="text-xs text-slate-500 mt-1">Contact our 24/7 security desk for immediate assistance with account recovery.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Form (Occupies 7 columns) */}
        <div className="md:col-span-7 bg-slate-900/50 backdrop-blur-xl p-8 md:p-14 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Key size={28} className="text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-slate-400 text-sm">Enter your registered email to update your security.</p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            {success && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm animate-pulse">
                <CheckCircle size={18} />
                <span>Password updated successfully! Redirecting...</span>
              </div>
            )}

            {error && (
              <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 text-white py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-1">New Secure Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 text-white py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Enhanced Segmented Strength Meter */}
              <div className="pt-3">
                <div className="flex gap-2 h-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 rounded-full transition-all duration-500 ${
                        strength >= step 
                          ? (strength <= 1 ? "bg-rose-500" : strength <= 2 ? "bg-amber-400" : "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]")
                          : "bg-slate-800"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-3 px-1">
                  <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold">Safety Rating</span>
                  <span className={`text-[10px] uppercase tracking-widest font-bold ${strength >= 3 ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {["Low", "Weak", "Average", "Good", "Strong"][strength]}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transform transition-all active:scale-[0.98] mt-4 ${
                loading
                  ? "bg-slate-800 cursor-not-allowed text-slate-500"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 hover:shadow-cyan-900/20"
              }`}
            >
              {loading ? "Authorizing..." : "Update Security Credentials"}
            </button>

            <button 
            onClick={handlehome}
              type="button"
              className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-white transition-colors py-2"
            >
              <ArrowLeft size={16} /> Back to Home
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}