import { useState, useEffect } from "react";
import { Music, Disc3, Sparkles, Volume2, Radio, Zap } from "lucide-react";

const SaaSLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing HD Audio Engine...");
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Progress increment timer (Total ~4.5 seconds for premium SaaS feel)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 42);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 30) {
      setLoadingText("⚡ Initializing High-Definition Audio Engine...");
    } else if (progress < 60) {
      setLoadingText("🎧 Syncing Curated Playlists & Spatial Sound...");
    } else if (progress < 85) {
      setLoadingText("✨ Calibrating Equalizer & User Studio...");
    } else {
      setLoadingText("🚀 Welcome to GeetHub Studio!");
    }

    if (progress >= 100) {
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 700); // smooth fade transition
      }, 400);
    }
  }, [progress, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black text-white transition-opacity duration-700 select-none overflow-hidden ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Grid Mesh Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main SaaS Card Container */}
      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
        {/* Animated Vinyl Record & Equalizer Hero */}
        <div className="relative mb-8 group">
          {/* Pulsing Glowing Ring */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 rounded-full blur-xl opacity-75 animate-spin-slow" />
          
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#0c1226] via-[#121b36] to-[#080d1e] border-2 border-blue-400/40 flex items-center justify-center shadow-2xl shadow-blue-500/30">
            {/* Spinning Disc */}
            <Disc3 className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-400 animate-spin-slow" />
            
            {/* Center Music Note */}
            <div className="absolute w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
              <Music className="w-4 h-4 text-white animate-bounce" />
            </div>
          </div>

          {/* Floating Music Notes Particles */}
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-bounce delay-100" />
          <Radio className="absolute -bottom-2 -left-2 w-6 h-6 text-cyan-400 animate-pulse delay-300" />
          <Zap className="absolute top-1/2 -right-6 w-5 h-5 text-indigo-400 animate-pulse delay-500" />
        </div>

        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="text-blue-400 animate-pulse" size={28} />
          <h1 className="text-4xl font-black tracking-tight font-heading">
            <span className="text-white">Geet</span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Hub</span>
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase border border-blue-400/30">
            PRO STUDIO
          </span>
        </div>

        {/* Subtitle / Tagline */}
        <p className="text-xs text-blue-300 font-extrabold tracking-widest uppercase mb-8 bg-blue-500/10 py-1.5 px-4 rounded-full border border-blue-400/30">
          GeetHub: Stream the beat, share the vibe.
        </p>

        {/* Equalizer Waveform Bars Animation */}
        <div className="flex items-end justify-center gap-1.5 h-10 mb-6">
          {[40, 75, 55, 90, 65, 80, 45, 95, 60, 85, 50].map((h, idx) => (
            <div
              key={idx}
              className="w-1.5 rounded-full bg-gradient-to-t from-blue-600 via-cyan-400 to-indigo-400 animate-pulse"
              style={{
                height: `${(h * Math.min(progress + 20, 100)) / 100}%`,
                animationDelay: `${idx * 0.08}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-white/10 p-1 rounded-full border border-white/10 shadow-inner mb-4">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 transition-all duration-100 relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer effect inside progress bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Dynamic Loading Text & Percentage */}
        <div className="flex items-center justify-between w-full text-xs font-semibold px-1">
          <span className="text-blue-300 truncate max-w-[260px]">{loadingText}</span>
          <span className="text-cyan-400 font-mono font-bold">{progress}%</span>
        </div>

        {/* Quick Skip Button */}
        <button
          onClick={() => {
            setFadeOut(true);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 300);
          }}
          className="mt-8 text-[11px] text-gray-500 hover:text-gray-300 underline tracking-wider uppercase transition"
        >
          Skip Intro →
        </button>
      </div>
    </div>
  );
};

export default SaaSLoader;
