import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import {
  Heart,
  Star,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Loader2,
  Keyboard,
  X,
  Repeat,
  Shuffle,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const GlobalMusicPlayer = () => {
  const {
    currentSong,
    isPlaying,
    isBuffering,
    isMuted,
    audioError,
    volume,
    currentTime,
    duration,
    isLiked,
    isSaved,
    repeatMode,
    setRepeatMode,
    isShuffle,
    setIsShuffle,
    showShortcutsModal,
    setShowShortcutsModal,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    changeVolume,
    toggleMute,
    toggleLike,
    toggleSave,
  } = useMusicPlayer();

  const navigate = useNavigate();
  const location = useLocation();

  // Don't render if no song is loaded
  if (!currentSong) return null;

  // Hide global player on /playsong/:id page to avoid double player UI
  if (location.pathname.startsWith("/playsong/")) return null;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const cycleRepeat = () => {
    const next = repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off";
    setRepeatMode(next);
  };

  return (
    <>
      <div
        role="region"
        aria-label="Global Audio Player"
        className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#080b13]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 shadow-2xl z-50 text-slate-900 dark:text-white transition-all"
      >
        <div className="max-w-screen-2xl mx-auto px-4 py-2.5">
          {/* Progress Bar & Accessible Slider */}
          <div className="mb-2 relative group">
            <input
              type="range"
              role="slider"
              aria-label="Playback track seek position"
              aria-valuemin="0"
              aria-valuemax={Math.round(duration || 100)}
              aria-valuenow={Math.round(currentTime)}
              aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercent}%, #cbd5e1 ${progressPercent}%, #cbd5e1 100%)`,
              }}
            />
            <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 dark:text-gray-400 mt-0.5">
              <span className="flex items-center gap-1.5">
                <span>{formatTime(currentTime)}</span>
                {isBuffering && (
                  <span className="inline-flex items-center gap-1 text-blue-500 text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded-full font-semibold animate-pulse">
                    <Loader2 size={10} className="animate-spin" /> Buffering...
                  </span>
                )}
                {audioError && (
                  <span className="text-amber-500 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                    {audioError}
                  </span>
                )}
              </span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Player Controls Flexbox */}
          <div className="flex items-center justify-between gap-3">
            {/* Song Info */}
            <div
              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-blue-800/20 p-1.5 rounded-xl transition-all"
              onClick={() => navigate(`/playsong/${currentSong.song_id}`)}
              title="Click to expand player view"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={currentSong.image_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80"}
                  alt={currentSong.title || "Song artwork"}
                  className="w-11 h-11 rounded-lg object-cover shadow-md"
                />
                {currentSong.is_private && (
                  <span
                    className="absolute -top-1 -right-1 bg-amber-500 text-black p-0.5 rounded-full shadow"
                    title="Private Upload (Signed Stream)"
                  >
                    <ShieldCheck size={11} />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-slate-900 dark:text-white font-semibold text-sm truncate flex items-center gap-1.5">
                  {currentSong.title}
                  {isPlaying && !isBuffering && (
                    <span className="flex items-end gap-[2px] h-3 ml-1" aria-hidden="true">
                      <span className="w-[3px] h-full bg-blue-500 animate-bounce" />
                      <span className="w-[3px] h-[60%] bg-blue-500 animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <span className="w-[3px] h-[80%] bg-blue-500 animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </span>
                  )}
                </h3>
                <p className="text-slate-500 dark:text-gray-400 text-xs truncate">{currentSong.artist || "Unknown Artist"}</p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Shuffle button */}
              <button
                onClick={() => setIsShuffle((prev) => !prev)}
                aria-label={`Shuffle mode: ${isShuffle ? "on" : "off"}`}
                className={`p-2 rounded-full transition-all hidden md:flex ${
                  isShuffle
                    ? "text-blue-500 bg-blue-500/20 hover:bg-blue-500/30"
                    : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
                title={isShuffle ? "Shuffle On (S)" : "Shuffle Off (S)"}
              >
                <Shuffle size={16} />
              </button>

              {/* Like Button */}
              <button
                onClick={toggleLike}
                aria-label={isLiked ? "Unlike song" : "Like song"}
                className={`p-2 rounded-full transition-all hidden md:flex ${
                  isLiked
                    ? "text-red-500 bg-red-500/20 hover:bg-red-500/30"
                    : "text-slate-500 dark:text-gray-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-blue-700/30"
                }`}
                title={isLiked ? "Unlike" : "Like"}
              >
                <Heart size={17} fill={isLiked ? "currentColor" : "none"} />
              </button>

              {/* Previous Button */}
              <button
                onClick={playPrevious}
                aria-label="Previous track (P)"
                className="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all active:scale-95"
                title="Previous Track (P)"
              >
                <SkipBack size={18} />
              </button>

              {/* Play/Pause Button */}
              <button
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pause music (Space)" : "Play music (Space)"}
                className="relative p-3 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 !text-white hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isBuffering ? (
                  <Loader2 size={20} className="animate-spin !text-white" />
                ) : isPlaying ? (
                  <Pause size={20} className="!text-white" />
                ) : (
                  <Play size={20} className="!text-white translate-x-[1px]" />
                )}
              </button>

              {/* Next Button */}
              <button
                onClick={playNext}
                aria-label="Next track (N)"
                className="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all active:scale-95"
                title="Next Track (N)"
              >
                <SkipForward size={18} />
              </button>

              {/* Repeat Button */}
              <button
                onClick={cycleRepeat}
                aria-label={`Repeat mode: ${repeatMode}`}
                className={`p-2 rounded-full transition-all hidden md:flex relative ${
                  repeatMode !== "off"
                    ? "text-blue-500 bg-blue-500/20 hover:bg-blue-500/30"
                    : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                }`}
                title={`Repeat: ${repeatMode} (R)`}
              >
                <Repeat size={16} />
                {repeatMode === "one" && (
                  <span className="absolute text-[8px] font-bold bottom-1 right-1 text-blue-500">1</span>
                )}
              </button>

              {/* Save Button */}
              <button
                onClick={toggleSave}
                aria-label={isSaved ? "Remove from saved" : "Save track"}
                className={`p-2 rounded-full transition-all hidden md:flex ${
                  isSaved
                    ? "text-yellow-500 bg-yellow-500/20 hover:bg-yellow-500/30"
                    : "text-slate-500 dark:text-gray-400 hover:text-yellow-500 hover:bg-slate-100 dark:hover:bg-blue-700/30"
                }`}
                title={isSaved ? "Saved" : "Save"}
              >
                <Star size={17} fill={isSaved ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Volume & Shortcuts Section */}
            <div className="hidden lg:flex items-center gap-3 min-w-[160px] justify-end">
              {/* Keyboard shortcuts trigger */}
              <button
                onClick={() => setShowShortcutsModal(true)}
                aria-label="Keyboard shortcuts (Press ?)"
                className="p-1.5 text-slate-500 dark:text-gray-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all"
                title="Keyboard Shortcuts (?)"
              >
                <Keyboard size={18} />
              </button>

              {/* Mute / Volume toggle button */}
              <button
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute audio (M)" : "Mute audio (M)"}
                className="p-1 text-blue-500 hover:text-blue-400 transition-colors"
                title={isMuted ? "Unmute (M)" : "Mute (M)"}
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              {/* Accessible volume slider */}
              <input
                type="range"
                role="slider"
                aria-label="Volume level"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round((isMuted ? 0 : volume) * 100)}
                aria-valuetext={`${Math.round((isMuted ? 0 : volume) * 100)} percent`}
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accessible Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-dialog-title"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Keyboard size={20} className="text-blue-500" />
                <h2 id="shortcuts-dialog-title" className="text-lg font-bold">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-sm">
              {[
                { key: "Space or K", label: "Play / Pause playback" },
                { key: "← / →", label: "Seek backward / forward 5s" },
                { key: "J / L", label: "Seek backward / forward 10s" },
                { key: "↑ / ↓", label: "Increase / Decrease volume 5%" },
                { key: "M", label: "Mute / Unmute audio" },
                { key: "N", label: "Next track in queue" },
                { key: "P", label: "Previous track" },
                { key: "R", label: "Cycle Repeat (Off / All / Track)" },
                { key: "S", label: "Toggle Shuffle mode" },
                { key: "?", label: "Toggle this shortcut guide" },
              ].map((shortcut, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <span className="text-slate-600 dark:text-gray-300">{shortcut.label}</span>
                  <kbd className="px-2 py-0.5 text-xs font-semibold bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded shadow-sm text-slate-800 dark:text-blue-300">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowShortcutsModal(false);
                  navigate("/shortcuts");
                }}
                className="text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1 group transition"
              >
                <span>Explore Full Interactive Shortcuts Page</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <span className="text-[11px] text-slate-400">Esc to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalMusicPlayer;
