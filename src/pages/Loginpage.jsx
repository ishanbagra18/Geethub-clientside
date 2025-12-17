import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

const Loginpage = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-black p-6">

      {/* 🔥 TOASTER HERE */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-slate-900/60 to-black/40 border border-slate-800">

        {/* LEFT: Login Form */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">Sign In</h2>
              <p className="text-sm text-slate-400 mt-1">Welcome back — get straight to the music.</p>
            </div>

            <form className="space-y-4">
              <label className="block text-slate-300 text-sm">
                Email
                <input
                  id="email"
                  type="email"
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full px-3 py-2 rounded-lg bg-slate-900/60 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </label>

              <label className="block text-slate-300 text-sm">
                Password
                <input
                  id="password"
                  type="password"
                  value={Password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="mt-2 w-full px-3 py-2 rounded-lg bg-slate-900/60 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </label>

              <button
                type="submit"
                onClick={handleLogin}
                className="w-full mt-1 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow hover:brightness-105 transition"
              >
                Login
              </button>

              <div className="flex items-center justify-between text-sm text-slate-400 mt-2">
                <a href="/signup" className="hover:underline text-indigo-300">Create Account</a>
                <a href="/forgotpassword" className="hover:underline text-indigo-300">Forgot?</a>
              </div>

              <div className="mt-4 text-center text-xs text-slate-500">© SoundSpace</div>
            </form>
          </div>
        </div>

        {/* RIGHT: Branding + Art */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900">
          <div className="mb-6 text-center flex flex-col-reverse items-center">
            <img
              src="https://i.pinimg.com/originals/ff/ad/a6/ffada6adce9743cf44abdd99577d6391.gif"
              alt="logo"
              className="mx-auto w-40 h-20 object-contain"
            />
            <h3 className="text-2xl font-bold text-white mt-4">GeetHub</h3>
            <p className="text-sm text-indigo-200/80 mt-1">
              Curated vibes. Quick sign in and start listening.
            </p>
          </div>

          {/* Album Art */}
          <div className="w-56 h-56 rounded-2xl overflow-hidden shadow-lg mb-4">
            <img
              src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=60"
              alt="album"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center text-sm text-indigo-200/70">
            <div className="font-semibold">Late Night Tones</div>
            <div className="mt-1">Chill • 3.1k listeners</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Loginpage;
