import React from "react";
import { createPortal } from "react-dom";
import { X, Settings, Repeat, Shuffle, PlayCircle, Sun, Moon, Check } from "lucide-react";
import { useMusicPlayer } from "../src/context/MusicPlayerContext";

const SettingsModal = ({ isOpen, onClose }) => {
  const {
    repeatMode,
    setRepeatMode,
    isShuffle,
    setIsShuffle,
    autoPlay,
    setAutoPlay,
    theme,
    setTheme,
  } = useMusicPlayer();

  if (!isOpen) return null;

  const currentTheme = theme === "light" ? "light" : "dark";

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        isolation: 'isolate',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '32rem',
          borderRadius: '1.5rem',
          backgroundColor: '#090d16',
          border: '1px solid rgba(51, 65, 85, 0.8)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95)',
          padding: '1.75rem',
          color: '#ffffff',
          zIndex: 100000000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Settings size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">App Settings</h2>
              <p className="text-xs text-gray-400">Customize playback & appearance mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Section 1: Playback Preferences */}
        <div className="py-5 border-b border-gray-800/80 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Repeat size={14} className="text-blue-400" /> Playback Controls
          </h3>

          {/* Repeat Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800">
            <div>
              <p className="text-sm font-bold text-white">Repeat Mode</p>
              <p className="text-xs text-gray-400">
                {repeatMode === "off" ? "Off" : repeatMode === "all" ? "Repeat Queue" : "Repeat Track"}
              </p>
            </div>
            <div className="flex items-center bg-gray-950 p-1 rounded-xl border border-gray-800">
              <button
                onClick={() => setRepeatMode("off")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  repeatMode === "off" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
                }`}
              >
                Off
              </button>
              <button
                onClick={() => setRepeatMode("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  repeatMode === "all" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
                }`}
              >
                All 🔁
              </button>
              <button
                onClick={() => setRepeatMode("one")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  repeatMode === "one" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
                }`}
              >
                Track 🔂
              </button>
            </div>
          </div>

          {/* Shuffle Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800">
            <div className="flex items-center gap-3">
              <Shuffle size={18} className={isShuffle ? "text-cyan-400" : "text-gray-400"} />
              <div>
                <p className="text-sm font-bold text-white">Shuffle Mode</p>
                <p className="text-xs text-gray-400">Randomize queue order</p>
              </div>
            </div>
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`w-12 h-6 rounded-full transition-all relative p-1 ${
                isShuffle ? "bg-cyan-500" : "bg-gray-800"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isShuffle ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Autoplay Next */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800">
            <div className="flex items-center gap-3">
              <PlayCircle size={18} className={autoPlay ? "text-blue-400" : "text-gray-400"} />
              <div>
                <p className="text-sm font-bold text-white">Autoplay Next</p>
                <p className="text-xs text-gray-400">Play related songs automatically when current ends</p>
              </div>
            </div>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`w-12 h-6 rounded-full transition-all relative p-1 ${
                autoPlay ? "bg-blue-600" : "bg-gray-800"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  autoPlay ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section 2: Appearance (Dark / Light Mode Only) */}
        <div className="pt-5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
            Appearance Mode
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Dark Mode Option */}
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                currentTheme === "dark"
                  ? "border-blue-500 bg-gray-900 shadow-lg ring-1 ring-blue-500/30"
                  : "border-gray-800 bg-gray-900/40 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Moon size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Dark Mode</p>
                  <p className="text-[10px] text-gray-400">Default Dark Aesthetic</p>
                </div>
              </div>
              {currentTheme === "dark" && <Check size={18} className="text-blue-400" />}
            </button>

            {/* Light Mode Option */}
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                currentTheme === "light"
                  ? "border-amber-400 bg-gray-900 shadow-lg ring-1 ring-amber-400/30"
                  : "border-gray-800 bg-gray-900/40 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Sun size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Light Mode</p>
                  <p className="text-[10px] text-gray-400">Clean Light Aesthetic</p>
                </div>
              </div>
              {currentTheme === "light" && <Check size={18} className="text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Save & Apply Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-blue-500/20 transition-all active:scale-98"
        >
          Save & Apply
        </button>
      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;
