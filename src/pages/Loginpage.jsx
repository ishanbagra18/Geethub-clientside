import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaMusic } from "react-icons/fa";

const Loginpage = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:9000/login", {
        email: Email,
        password: Password,
      });

      console.log("✅ Login Success:", response.data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        console.log("Token saved to localStorage");
      }

      toast.success("Login successful! Redirecting to homepage...");
      navigate("/");
    } catch (error) {
      console.error("❌ Login Error:", error.response?.data || error.message);
      toast.error("Login failed: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 to-black p-6">
      {/* 🔥 TOASTER HERE */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-slate-900/70 to-black/60 border border-slate-800 backdrop-blur-md">
        {/* LEFT: Login Form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Logo and Title */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-2 mb-2">
                <FaMusic className="text-indigo-400 text-3xl animate-pulse" />
                <span className="text-3xl font-extrabold text-white tracking-tight drop-shadow">GeetHub</span>
              </div>
              <span className="text-xs text-indigo-200/80 tracking-wide mb-1">Curated vibes. Quick sign in and start listening.</span>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Sign In</h2>
              <p className="text-sm text-slate-400 mt-1">Welcome back — get straight to the music.</p>
            </div>

            <form className="space-y-5">
              <div className="relative">
                <label className="block text-slate-300 text-sm mb-1" htmlFor="email">Email</label>
                <span className="absolute left-3 top-9 text-slate-400 pointer-events-none">
                  <FaEnvelope />
                </span>
                <input
                  id="email"
                  type="email"
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 mt-1 w-full px-3 py-2 rounded-lg bg-slate-900/70 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:border-indigo-400"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="relative">
                <label className="block text-slate-300 text-sm mb-1" htmlFor="password">Password</label>
                <span className="absolute left-3 top-9 text-slate-400 pointer-events-none">
                  <FaLock />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={Password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="pl-10 mt-1 w-full px-3 py-2 rounded-lg bg-slate-900/70 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm hover:border-indigo-400"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-indigo-400 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button
                type="submit"
                onClick={handleLogin}
                className="w-full mt-1 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg hover:brightness-110 hover:scale-[1.01] focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-150"
              >
                Login
              </button>

              <div className="flex items-center justify-between text-sm text-slate-400 mt-2">
                <a href="/signup" className="hover:underline text-indigo-300 transition-colors">Create Account</a>
              </div>

              <div className="mt-4 text-center text-xs text-slate-500">© GeetHub {new Date().getFullYear()}</div>
            </form>
          </div>
        </div>

        {/* RIGHT: Branding + Art (Enhanced) */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 relative bg-gradient-to-br from-indigo-900/80 via-violet-900/80 to-slate-900/90 backdrop-blur-xl border-l border-indigo-800/30 shadow-2xl">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-800/30 via-violet-700/20 to-black/30 backdrop-blur-2xl z-0" />

          {/* Animated music visualizer */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1 z-10" aria-hidden="true">
            <span className="block w-1.5 h-6 bg-indigo-400 rounded animate-bounce [animation-delay:0.1s]" style={{animationDuration:'1.1s'}}></span>
            <span className="block w-1.5 h-4 bg-violet-400 rounded animate-bounce [animation-delay:0.2s]" style={{animationDuration:'0.9s'}}></span>
            <span className="block w-1.5 h-8 bg-indigo-300 rounded animate-bounce [animation-delay:0.3s]" style={{animationDuration:'1.3s'}}></span>
            <span className="block w-1.5 h-5 bg-violet-300 rounded animate-bounce [animation-delay:0.4s]" style={{animationDuration:'1.05s'}}></span>
            <span className="block w-1.5 h-7 bg-indigo-400 rounded animate-bounce [animation-delay:0.5s]" style={{animationDuration:'1.2s'}}></span>
          </div>

          {/* Logo and branding */}
          <div className="mb-6 text-center flex flex-col-reverse items-center z-10">
            <img
              src="https://i.pinimg.com/originals/ff/ad/a6/ffada6adce9743cf44abdd99577d6391.gif"
              alt="logo"
              className="mx-auto w-40 h-20 object-contain drop-shadow-xl"
            />
            <h3 className="text-2xl font-bold text-white mt-4 tracking-tight drop-shadow">GeetHub</h3>
            <p className="text-sm text-indigo-200/90 mt-1 italic">
              Curated vibes. Quick sign in and start listening.
            </p>
          </div>

          {/* Album Art with glow and border animation */}
          <div className="relative w-56 h-56 rounded-3xl overflow-hidden shadow-2xl mb-4 border-4 border-indigo-700/60 group z-10">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-indigo-500/40 via-violet-400/30 to-indigo-900/20 blur-lg opacity-70 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
            <img
              src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=60"
              alt="album"
              className="relative w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-300 rounded-2xl"
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/80 p-3 rounded-full shadow-lg">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" stroke="#6366f1" strokeWidth="2" /><polygon points="11,9 20,14 11,19" fill="#6366f1" /></svg>
              </div>
            </div>
          </div>

          {/* Music quote */}
          <div className="text-center text-base text-indigo-100/80 font-medium italic px-4 z-10 mb-2">
            "Where words fail, music speaks."
          </div>

          <div className="text-center text-sm text-indigo-200/70 z-10">
            <div className="font-semibold">Late Night Tones</div>
            <div className="mt-1">Chill • 3.1k listeners</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loginpage;
