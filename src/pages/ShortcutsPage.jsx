import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import { useMusicPlayer } from "../context/MusicPlayerContext";
import {
  Keyboard,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Search,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Command,
  Copy,
  Check,
  Music,
  HelpCircle,
  ExternalLink,
  Laptop,
  Apple,
} from "lucide-react";
import toast from "react-hot-toast";

const SHORTCUT_CATEGORIES = [
  {
    id: "playback",
    title: "Playback & Seeking",
    icon: Play,
    color: "from-blue-500 to-cyan-500",
    description: "Control playback flow, scrub through tracks, and jump through audio effortlessly.",
    shortcuts: [
      {
        keys: ["Space"],
        altKeys: ["K"],
        action: "Play / Pause",
        description: "Toggle playback of current track immediately",
        code: "Space",
      },
      {
        keys: ["←"],
        action: "Rewind 5s",
        description: "Jump back 5 seconds in track",
        code: "ArrowLeft",
      },
      {
        keys: ["→"],
        action: "Forward 5s",
        description: "Jump forward 5 seconds in track",
        code: "ArrowRight",
      },
      {
        keys: ["J"],
        action: "Rewind 10s",
        description: "Quick 10 second backward scrub (YouTube/VLC style)",
        code: "KeyJ",
      },
      {
        keys: ["L"],
        action: "Forward 10s",
        description: "Quick 10 second forward scrub (YouTube/VLC style)",
        code: "KeyL",
      },
    ],
  },
  {
    id: "volume",
    title: "Audio & Volume Controls",
    icon: Volume2,
    color: "from-purple-500 to-indigo-500",
    description: "Adjust volume levels smoothly or quickly mute sound.",
    shortcuts: [
      {
        keys: ["↑"],
        action: "Volume Up +5%",
        description: "Increment master audio volume by 5%",
        code: "ArrowUp",
      },
      {
        keys: ["↓"],
        action: "Volume Down -5%",
        description: "Decrement master audio volume by 5%",
        code: "ArrowDown",
      },
      {
        keys: ["M"],
        action: "Mute / Unmute",
        description: "Instantly toggle audio mute state while preserving volume level",
        code: "KeyM",
      },
    ],
  },
  {
    id: "queue",
    title: "Queue & Playlist Controls",
    icon: SkipForward,
    color: "from-emerald-500 to-teal-500",
    description: "Manage track sequences, cycle repeat modes, and randomize playlists.",
    shortcuts: [
      {
        keys: ["N"],
        action: "Next Track",
        description: "Advance to the next song in the active playlist queue",
        code: "KeyN",
      },
      {
        keys: ["P"],
        action: "Previous Track",
        description: "Return to the previous song in queue",
        code: "KeyP",
      },
      {
        keys: ["R"],
        action: "Cycle Repeat Mode",
        description: "Toggle repeat mode between Off, Repeat Queue All, and Repeat One Track",
        code: "KeyR",
      },
      {
        keys: ["S"],
        action: "Toggle Shuffle",
        description: "Turn playlist shuffle mode on or off",
        code: "KeyS",
      },
    ],
  },
  {
    id: "navigation",
    title: "Quick Navigation & App Hotkeys",
    icon: Command,
    color: "from-amber-500 to-orange-500",
    description: "Access instant search and jump around GeetHub without touching the mouse.",
    shortcuts: [
      {
        keys: ["?"],
        altKeys: ["Shift", "/"],
        action: "Shortcuts Dialog",
        description: "Open the quick in-app shortcut cheat sheet from any page",
        code: "Slash",
      },
      {
        keys: ["Esc"],
        action: "Close Modals",
        description: "Dismiss open dialogs, dropdowns, and search overlays",
        code: "Escape",
      },
    ],
  },
];

const ShortcutsPage = () => {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrevious,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
  } = useMusicPlayer();

  const [activeKey, setActiveKey] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [platform, setPlatform] = useState("windows");
  const [copied, setCopied] = useState(false);

  // Detect platform on mount
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.platform?.toLowerCase().includes("mac")) {
      setPlatform("mac");
    }
  }, []);

  // Listen for real-time keypresses to highlight shortcuts live on the page
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;

      setActiveKey(e.code);

      // Match key with shortcut
      let matchedAction = null;
      SHORTCUT_CATEGORIES.forEach((cat) => {
        cat.shortcuts.forEach((sc) => {
          if (sc.code === e.code) {
            matchedAction = `${sc.action} (${cat.title})`;
          }
        });
      });

      if (matchedAction) {
        setLastAction(matchedAction);
      }

      const timer = setTimeout(() => {
        setActiveKey(null);
      }, 700);

      return () => clearTimeout(timer);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Copy full markdown cheatsheet
  const handleCopyCheatsheet = () => {
    let text = "# GeetHub Keyboard Shortcuts Cheatsheet\n\n";
    SHORTCUT_CATEGORIES.forEach((cat) => {
      text += `## ${cat.title}\n`;
      cat.shortcuts.forEach((sc) => {
        text += `- **${sc.keys.join(" + ")}** : ${sc.action} - ${sc.description}\n`;
      });
      text += "\n";
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Shortcuts cheatsheet copied to clipboard! 📋");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const filteredCategories = SHORTCUT_CATEGORIES.map((cat) => {
    const matchingShortcuts = cat.shortcuts.filter(
      (sc) =>
        sc.action.toLowerCase().includes(searchFilter.toLowerCase()) ||
        sc.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
        sc.keys.some((k) => k.toLowerCase().includes(searchFilter.toLowerCase()))
    );
    return { ...cat, shortcuts: matchingShortcuts };
  }).filter((cat) => cat.shortcuts.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-white pb-36 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 ambient-mesh-glow pointer-events-none -z-10" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-cyan-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Global Navbar */}
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide uppercase">
            <Keyboard size={14} className="animate-pulse" />
            <span>Power User Command Center</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Keyboard Shortcuts & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500">Hotkeys</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-gray-400 leading-relaxed">
            Control playback, scrub audio, adjust sound, and browse millions of songs at the speed of thought without ever taking your hands off the keyboard.
          </p>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleCopyCheatsheet}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white text-sm font-semibold border border-slate-200 dark:border-white/10 transition shadow-sm hover:scale-105 active:scale-95"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              <span>{copied ? "Copied Cheatsheet" : "Copy Cheatsheet"}</span>
            </button>

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 !text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-blue-400 transition hover:scale-105 active:scale-95"
            >
              <Music size={16} />
              <span>Back to Music</span>
            </button>
          </div>
        </div>

        {/* Live Interactive Shortcut Tester Card */}
        <div className="mt-10 p-6 rounded-2xl bg-white/70 dark:bg-[#0c121e]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Sparkles size={22} className="animate-spin" style={{ animationDuration: "6s" }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Interactive Live Key Tester
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                    Live Active
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                  Press any shortcut on your physical keyboard now to test and see it light up!
                </p>
              </div>
            </div>

            {/* Live Indicator Box */}
            <div className="flex items-center gap-3 w-full md:w-auto bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5">
              <span className="text-xs font-medium text-slate-500 dark:text-gray-400">
                Last Triggered:
              </span>
              {activeKey ? (
                <div className="flex items-center gap-2 animate-bounce">
                  <kbd className="px-2.5 py-1 text-xs font-bold bg-blue-500 text-white rounded-md shadow-md">
                    {activeKey}
                  </kbd>
                  <span className="text-xs font-semibold text-blue-500 dark:text-blue-400">
                    {lastAction || "Key Detected"}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 dark:text-gray-500 italic">
                  Press any key (e.g. Space, M, N)...
                </span>
              )}
            </div>
          </div>

          {/* Quick Active Status Strip */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/5">
              <span className="text-slate-500 dark:text-gray-400">Playback:</span>
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                {isPlaying ? <Play size={12} className="text-emerald-500" /> : <Pause size={12} className="text-amber-500" />}
                {isPlaying ? "Playing" : "Paused"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/5">
              <span className="text-slate-500 dark:text-gray-400">Volume:</span>
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                {isMuted ? <VolumeX size={12} className="text-red-500" /> : <Volume2 size={12} className="text-blue-500" />}
                {isMuted ? "Muted" : `${Math.round(volume * 100)}%`}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/5">
              <span className="text-slate-500 dark:text-gray-400">Repeat:</span>
              <span className="font-semibold text-slate-900 dark:text-white uppercase">
                {repeatMode}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/5">
              <span className="text-slate-500 dark:text-gray-400">Shuffle:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {isShuffle ? "On 🔀" : "Off"}
              </span>
            </div>
          </div>
        </div>

        {/* Filter and OS Toggle Toolbar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search shortcuts input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search shortcut (e.g. Volume, Next, Seek)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* OS layout toggle */}
          <div className="flex items-center p-1 bg-slate-200 dark:bg-white/10 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setPlatform("windows")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                platform === "windows"
                  ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Laptop size={14} />
              <span>Windows / Linux</span>
            </button>
            <button
              onClick={() => setPlatform("mac")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                platform === "mac"
                  ? "bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Apple size={14} />
              <span>macOS</span>
            </button>
          </div>
        </div>

        {/* Categorized Shortcuts Grid */}
        <div className="mt-6 space-y-8">
          {filteredCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <section
                key={category.id}
                className="bg-white/80 dark:bg-[#0c121e]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-lg transition-all"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-md`}
                  >
                    <IconComponent size={18} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {category.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Shortcuts Table / Cards */}
                <div className="mt-4 divide-y divide-slate-100 dark:divide-white/5">
                  {category.shortcuts.map((sc, index) => {
                    const isTriggered = activeKey === sc.code;
                    return (
                      <div
                        key={index}
                        className={`py-3.5 px-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                          isTriggered
                            ? "bg-blue-500/15 ring-2 ring-blue-500 scale-[1.01]"
                            : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-900 dark:text-white">
                              {sc.action}
                            </span>
                            {isTriggered && (
                              <span className="text-[10px] bg-blue-500 text-white font-bold px-1.5 py-0.2 rounded animate-pulse">
                                Active Now
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-gray-400">
                            {sc.description}
                          </p>
                        </div>

                        {/* Keys Badge Row */}
                        <div className="flex items-center gap-1.5 self-start sm:self-center">
                          {sc.keys.map((k, ki) => (
                            <kbd
                              key={ki}
                              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border shadow-sm transition-all ${
                                isTriggered
                                  ? "bg-blue-600 text-white border-blue-400 scale-110"
                                  : "bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/20 text-slate-800 dark:text-blue-300"
                              }`}
                            >
                              {k}
                            </kbd>
                          ))}

                          {sc.altKeys && (
                            <>
                              <span className="text-xs text-slate-400 font-semibold px-1">or</span>
                              {sc.altKeys.map((ak, aki) => (
                                <kbd
                                  key={aki}
                                  className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/20 text-slate-600 dark:text-gray-300 shadow-sm"
                                >
                                  {ak}
                                </kbd>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 bg-white/50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
              <HelpCircle className="mx-auto text-slate-400 mb-2" size={32} />
              <h3 className="font-bold text-slate-800 dark:text-white">No shortcuts matched &ldquo;{searchFilter}&rdquo;</h3>
              <p className="text-xs text-slate-500 mt-1">Try searching for &quot;volume&quot;, &quot;seek&quot;, &quot;next&quot;, or &quot;space&quot;.</p>
            </div>
          )}
        </div>

        {/* Pro Tip Box */}
        <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="text-blue-500 flex-shrink-0" size={24} />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Pro Tip: Quick In-App Help
              </h4>
              <p className="text-xs text-slate-600 dark:text-gray-400">
                You can press <kbd className="px-1.5 py-0.5 bg-white/20 rounded font-mono font-bold text-blue-500">?</kbd> (<kbd className="px-1 py-0.5 bg-white/20 rounded">Shift</kbd> + <kbd className="px-1 py-0.5 bg-white/20 rounded">/</kbd>) anywhere on GeetHub to pop up the instant shortcut guide without navigating away.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95"
          >
            Go to Dashboard →
          </button>
        </div>
      </main>
    </div>
  );
};

export default ShortcutsPage;
