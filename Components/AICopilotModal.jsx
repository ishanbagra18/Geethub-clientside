import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Sparkles,
  X,
  Play,
  Plus,
  BookmarkPlus,
  Flame,
  Clock,
  Filter,
  Music,
  Check,
  Loader2,
  Send,
  Zap,
  Volume2,
  RefreshCw,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import API_BASE_URL from "../src/config/api";
import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import { usePlaylist } from "../src/context/PlaylistContext";

const PRESET_PROMPTS = [
  "Play something energetic for a 30-minute workout, but avoid songs I've already heard today.",
  "Chill acoustic songs for deep late-night study session.",
  "Upbeat Punjabi party bangers for a 1-hour road trip with friends.",
  "Romantic soulful melodies in Hindi for a relaxing evening.",
];

export default function AICopilotModal({ isOpen, onClose }) {
  const { playQueue, addMultipleToQueue, currentSong, isPlaying } = useMusicPlayer();
  const { fetchPublicPlaylists } = usePlaylist() || {};

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [savingPlaylist, setSavingPlaylist] = useState(false);
  const [savedPlaylistSuccess, setSavedPlaylistSuccess] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (promptText) => {
    const textToSend = promptText || query;
    if (!textToSend.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setSavedPlaylistSuccess(false);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/copilot/query`,
        { query: textToSend.trim() },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setResult(res.data);
      toast.success(`Copilot curated ${res.data.songs_count || 0} tracks! ✨`, {
        id: "copilot_success",
      });
    } catch (err) {
      console.error("Copilot error:", err);
      toast.error(
        err.response?.data?.error || "Failed to process query with Copilot",
        { id: "copilot_err" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePlayNow = () => {
    if (!result?.songs || result.songs.length === 0) {
      toast.error("No songs available to play");
      return;
    }
    playQueue(result.songs, 0);
    onClose();
  };

  const handleAddToQueue = () => {
    if (!result?.songs || result.songs.length === 0) {
      toast.error("No songs available to queue");
      return;
    }
    addMultipleToQueue(result.songs);
    toast.success(`Added ${result.songs.length} tracks to queue 🎧`);
  };

  const handleSavePlaylist = async () => {
    if (!result?.songs || result.songs.length === 0 || savingPlaylist) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to save a personal playlist! 🔐");
      return;
    }

    setSavingPlaylist(true);
    try {
      const songIds = result.songs.map((s) => s.song_id || s.id || s._id).filter(Boolean);
      const playlistName =
        result.action_payload?.suggested_title ||
        `${result.intent?.mood || "AI"} ${result.intent?.activity || "Music"} Mix`;
      const playlistDesc =
        result.action_payload?.suggested_desc ||
        result.message ||
        "Curated by Geethub AI Copilot";

      const res = await axios.post(
        `${API_BASE_URL}/copilot/action`,
        {
          action_type: "create_playlist",
          playlist_name: playlistName,
          playlist_description: playlistDesc,
          song_ids: songIds,
          is_public: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        setSavedPlaylistSuccess(true);
        toast.success(`Playlist "${playlistName}" created! 💾`);
        if (fetchPublicPlaylists) {
          fetchPublicPlaylists();
        }
      }
    } catch (err) {
      console.error("Create playlist error:", err);
      toast.error("Failed to create playlist");
    } finally {
      setSavingPlaylist(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-gradient-to-b from-[#141824] via-[#0d101a] to-[#08090e] border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-950/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accents */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[1px] shadow-lg shadow-violet-500/25">
              <div className="w-full h-full rounded-[11px] bg-[#0c0e17] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Geethub AI Copilot
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300 bg-violet-500/20 border border-violet-500/30 rounded-full">
                  Interactive Assistant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Natural language music curation, history filtering & direct player actions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close AI Copilot"
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
          {/* Preset Prompts / Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Try Asking
              </span>
              <span className="text-[11px] text-slate-500">Click any prompt to run</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(preset);
                    handleSubmit(preset);
                  }}
                  className="text-left p-2.5 rounded-xl text-xs bg-white/[0.03] hover:bg-violet-600/15 border border-white/5 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all duration-200 group flex items-start gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="line-clamp-2 leading-relaxed">{preset}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conversational Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="relative"
          >
            <div className="relative flex items-center rounded-xl bg-white/[0.05] border border-white/10 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all shadow-inner">
              <textarea
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                rows={2}
                placeholder='E.g. "Play something energetic for a 30-minute workout, but avoid songs I&#39;ve already heard today."'
                className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none custom-scrollbar"
              />
              <div className="pr-3 flex items-center gap-2 shrink-0">
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-violet-600/30 hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Generate Mix
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Loading Animation */}
          {loading && (
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-fuchsia-400 animate-pulse" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Consulting Music Catalog & Listening History...
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Extracting mood, calculating tempo scores, and filtering songs heard today
                </p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && !loading && (
            <div className="space-y-4 animate-fadeIn">
              {/* Extracted Intent Badge Row */}
              <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-xl bg-gradient-to-r from-violet-950/40 via-fuchsia-950/20 to-cyan-950/30 border border-violet-500/20">
                {result.intent?.mood && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    <Zap className="w-3 h-3 text-amber-400" />
                    Mood: {result.intent.mood}
                  </span>
                )}
                {result.intent?.activity && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                    <Flame className="w-3 h-3 text-orange-400" />
                    Activity: {result.intent.activity}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  ~{result.total_duration_minutes || 30} mins ({result.songs_count} tracks)
                </span>
                {result.intent?.avoid_heard_today && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Filter className="w-3 h-3 text-emerald-400" />
                    {result.excluded_today_count > 0
                      ? `Excluded ${result.excluded_today_count} heard today`
                      : "Filtered for fresh tracks"}
                  </span>
                )}
                {result.intent?.extraction_method && (
                  <span className="ml-auto text-[10px] text-slate-500 font-mono">
                    Engine: {result.intent.extraction_method}
                  </span>
                )}
              </div>

              {/* Conversational Explanation */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-start gap-3 text-xs leading-relaxed text-slate-300">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <p>{result.message}</p>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  onClick={handlePlayNow}
                  className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 hover:opacity-95 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Play Mix Now
                </button>
                <button
                  onClick={handleAddToQueue}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-2 border border-white/10 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add All to Queue
                </button>
                <button
                  onClick={handleSavePlaylist}
                  disabled={savingPlaylist || savedPlaylistSuccess}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-2 border border-white/10 active:scale-95 disabled:opacity-60 transition-all"
                >
                  {savedPlaylistSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      Saved to Library
                    </>
                  ) : savingPlaylist ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" />
                      Save as Playlist
                    </>
                  )}
                </button>
              </div>

              {/* Track list preview */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                  <span>Curated Tracklist ({result.songs?.length || 0})</span>
                  <span>AI Match Reason</span>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {result.candidates?.map((candidate, idx) => {
                    const song = candidate.song;
                    const isCurrentlyPlaying =
                      currentSong &&
                      (currentSong.song_id === song.song_id ||
                        currentSong.id === song.id ||
                        currentSong._id === song._id) &&
                      isPlaying;

                    return (
                      <div
                        key={idx}
                        className="group flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="w-5 text-center text-xs font-mono text-slate-500">
                            {idx + 1}
                          </span>
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                            <img
                              src={
                                song.image_url ||
                                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80"
                              }
                              alt={song.title || "Track art"}
                              className="w-full h-full object-cover"
                            />
                            {isCurrentlyPlaying && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Volume2 className="w-4 h-4 text-violet-400 animate-bounce" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 pr-2">
                            <h4
                              className={`text-xs font-semibold truncate ${
                                isCurrentlyPlaying ? "text-violet-400" : "text-white"
                              }`}
                            >
                              {song.title || "Untitled Song"}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate">
                              {song.artist || "Unknown Artist"}
                            </p>
                          </div>
                        </div>

                        {/* Match reason badge */}
                        <div className="flex items-center gap-2 shrink-0">
                          {candidate.tags && candidate.tags.length > 0 && (
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-violet-500/15 text-violet-300 border border-violet-500/20">
                              {candidate.tags[0]}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 italic max-w-[180px] truncate text-right">
                            {candidate.match_reason || "Catalog Match"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Status Bar */}
        <div className="px-6 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Copilot Active • Catalog & History Connected</span>
          </div>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
}
