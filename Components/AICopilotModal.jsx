import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  Sparkles,
  X,
  Play,
  Plus,
  BookmarkPlus,
  Flame,
  Clock3,
  Filter,
  Check,
  Loader2,
  Send,
  Zap,
  Volume2,
  Music2,
  Headphones,
  ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";

import API_BASE_URL from "../src/config/api";
import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import { usePlaylist } from "../src/context/PlaylistContext";

const PRESET_PROMPTS = [
  {
    label: "Workout energy",
    description: "High-energy tracks to keep you moving",
    prompt:
      "Play something energetic for a 30-minute workout, but avoid songs I've already heard today.",
    icon: Flame,
    color: "text-orange-400 bg-orange-500/10",
  },
  {
    label: "Late-night focus",
    description: "Chill acoustic music for deep study",
    prompt: "Chill acoustic songs for a deep late-night study session.",
    icon: Clock3,
    color: "text-cyan-300 bg-cyan-500/10",
  },
  {
    label: "Punjabi party",
    description: "Upbeat hits for the road",
    prompt: "Upbeat Punjabi party bangers for a 1-hour road trip with friends.",
    icon: Zap,
    color: "text-pink-300 bg-pink-500/10",
  },
  {
    label: "Hindi romance",
    description: "Soulful melodies for a slower evening",
    prompt: "Romantic soulful melodies in Hindi for a relaxing evening.",
    icon: Headphones,
    color: "text-violet-300 bg-violet-500/10",
  },
];

const FALLBACK_ART =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=160&auto=format&fit=crop&q=80";

export default function AICopilotModal({ isOpen, onClose }) {
  const { playQueue, addMultipleToQueue, currentSong, isPlaying } =
    useMusicPlayer();

  const { fetchPublicPlaylists } = usePlaylist() || {};

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [savingPlaylist, setSavingPlaylist] = useState(false);
  const [savedPlaylistSuccess, setSavedPlaylistSuccess] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => inputRef.current?.focus(), 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleSubmit = async (promptText) => {
    const textToSend = (promptText ?? query).trim();

    if (!textToSend || loading) return;

    setQuery(textToSend);
    setLoading(true);
    setResult(null);
    setSavedPlaylistSuccess(false);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE_URL}/copilot/query`,
        { query: textToSend },
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      setResult(response.data);

      toast.success(
        `Copilot curated ${response.data.songs_count || 0} tracks! ✨`
      );
    } catch (error) {
      console.error("Copilot error:", error);

      toast.error(
        error.response?.data?.error ||
          "Couldn't create your mix. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const songs = result?.songs || [];
  const candidates = result?.candidates || [];

  const handlePlayNow = () => {
    if (!songs.length) {
      toast.error("No songs available to play");
      return;
    }

    playQueue(songs, 0);
    onClose();
  };

  const handleAddToQueue = () => {
    if (!songs.length) {
      toast.error("No songs available to queue");
      return;
    }

    addMultipleToQueue(songs);
    toast.success(`Added ${songs.length} tracks to your queue 🎧`);
  };

  const handleSavePlaylist = async () => {
    if (!songs.length || savingPlaylist || savedPlaylistSuccess) return;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in to save a personal playlist 🔐");
      return;
    }

    setSavingPlaylist(true);

    try {
      const songIds = songs
        .map((song) => song.song_id || song.id || song._id)
        .filter(Boolean);

      const playlistName =
        result.action_payload?.suggested_title ||
        `${result.intent?.mood || "AI"} ${
          result.intent?.activity || "Music"
        } Mix`;

      const playlistDescription =
        result.action_payload?.suggested_desc ||
        result.message ||
        "Curated by GeetHub AI Copilot";

      const response = await axios.post(
        `${API_BASE_URL}/copilot/action`,
        {
          action_type: "create_playlist",
          playlist_name: playlistName,
          playlist_description: playlistDescription,
          song_ids: songIds,
          is_public: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setSavedPlaylistSuccess(true);
        toast.success(`Playlist "${playlistName}" created! 💾`);

        if (fetchPublicPlaylists) fetchPublicPlaylists();
      } else {
        toast.error("Playlist couldn't be saved. Please try again.");
      }
    } catch (error) {
      console.error("Create playlist error:", error);

      toast.error(
        error.response?.data?.error || "Failed to create playlist"
      );
    } finally {
      setSavingPlaylist(false);
    }
  };

  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-0 backdrop-blur-xl sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="copilot-title"
        className="relative flex h-[100dvh] max-h-[900px] w-full flex-col overflow-hidden border border-violet-400/20 bg-[#0b0e17] text-slate-100 shadow-2xl shadow-black/50 sm:h-auto sm:max-h-[91vh] sm:max-w-[900px] sm:rounded-3xl"
      >
        {/* Top gradient */}
        <div className="h-[2px] shrink-0 bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-400" />

        {/* Header */}
        <header className="flex items-center justify-between gap-4 border-b border-white/[0.07] bg-white/[0.015] px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-300/20 bg-gradient-to-br from-violet-500/30 to-pink-500/10 text-violet-200 sm:h-12 sm:w-12 sm:rounded-2xl">
              <Sparkles size={22} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="copilot-title"
                  className="text-base font-extrabold tracking-tight text-white sm:text-lg"
                >
                  Your AI music copilot
                </h2>

                <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300 sm:inline-flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  AI powered
                </span>
              </div>

              <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                Tell us the vibe. We’ll build the soundtrack.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI Copilot"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
          >
            <X size={19} />
          </button>
        </header>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Intro */}
          {!result && !loading && (
            <section className="pb-6">
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-violet-200/80">
                <span className="grid h-6 w-6 place-items-center rounded-lg border border-violet-300/20 bg-violet-500/10">
                  <Sparkles size={13} />
                </span>
                YOUR PERSONAL MUSIC DISCOVERY
              </div>

              <h3 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.05em] text-white sm:text-4xl">
                What do you want to{" "}
                <span className="bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
                  feel?
                </span>
              </h3>

              <p className="mt-2 max-w-xl text-xs leading-6 text-slate-400 sm:text-sm">
                Describe a mood, an activity, a genre, or a moment. Your mix
                is tailored to your request and listening context.
              </p>
            </section>
          )}

          {/* Preset prompts */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold tracking-[0.12em] text-slate-400">
                {result
                  ? "MAKE ANOTHER MIX"
                  : "NEED A LITTLE INSPIRATION?"}
              </span>

              <span className="hidden text-[10px] text-slate-500 sm:inline">
                Enter ↵ to generate
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {PRESET_PROMPTS.map((preset) => {
                const PresetIcon = preset.icon;

                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSubmit(preset.prompt)}
                    disabled={loading}
                    className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 text-left transition hover:-translate-y-0.5 hover:border-violet-300/30 hover:bg-violet-500/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${preset.color}`}
                    >
                      <PresetIcon size={18} />
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <strong className="text-xs font-bold text-slate-100">
                        {preset.label}
                      </strong>

                      <span className="truncate text-[10px] text-slate-400">
                        {preset.description}
                      </span>
                    </span>

                    <ArrowUpRight
                      size={15}
                      className="shrink-0 text-slate-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-300"
                    />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Prompt composer */}
          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <label
              htmlFor="copilot-query"
              className="mb-2 block text-[10px] font-bold tracking-[0.12em] text-slate-400"
            >
              DESCRIBE YOUR SOUNDTRACK
            </label>

            <div className="rounded-2xl border border-violet-300/25 bg-white/[0.025] p-3 transition focus-within:border-violet-300/60 focus-within:ring-4 focus-within:ring-violet-500/[0.08]">
              <div className="flex items-start gap-3">
                <Sparkles
                  size={18}
                  className="mt-1 shrink-0 text-violet-300"
                />

                <textarea
                  id="copilot-query"
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmit();
                    }
                  }}
                  rows={2}
                  maxLength={600}
                  disabled={loading}
                  placeholder="e.g. Dreamy indie tracks for a rainy evening..."
                  className="max-h-32 min-h-[52px] flex-1 resize-y bg-transparent py-1 text-sm leading-6 text-white outline-none placeholder:text-slate-600 disabled:opacity-50"
                />
              </div>

              <div className="mt-3 flex flex-col gap-3 border-t border-white/[0.06] pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[10px] text-slate-500">
                  <kbd className="rounded border border-white/10 px-1.5 py-1 text-slate-400">
                    ↵
                  </kbd>{" "}
                  Generate{" "}
                  <kbd className="rounded border border-white/10 px-1.5 py-1 text-slate-400">
                    ⇧ ↵
                  </kbd>{" "}
                  New line
                  <span className="ml-2">{query.length}/600</span>
                </span>

                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-600 px-4 text-xs font-bold text-white shadow-lg shadow-violet-900/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}

                  {loading ? "Creating..." : "Create my mix"}
                </button>
              </div>
            </div>
          </form>

          {/* Loading state */}
          {loading && (
            <section className="mt-6 flex items-center gap-4 rounded-2xl border border-violet-300/15 bg-gradient-to-r from-violet-500/[0.08] to-white/[0.015] p-5">
              <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border border-violet-300/25 bg-violet-500/10 text-violet-200">
                <span className="absolute -inset-2 animate-spin rounded-full border border-transparent border-t-violet-300/70" />
                <Sparkles size={22} />
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-100">
                  Finding your next favourite tracks
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Reading the vibe, exploring the catalog, and shaping your
                  mix…
                </p>
              </div>

              <div className="ml-auto hidden h-8 items-center gap-1 sm:flex">
                {[0, 1, 2, 3, 4].map((bar) => (
                  <span
                    key={bar}
                    className="w-1 animate-pulse rounded-full bg-violet-400"
                    style={{
                      height: `${12 + (bar % 3) * 7}px`,
                      animationDelay: `${bar * 100}ms`,
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Results */}
          {result && !loading && (
            <section className="mt-6">
              {/* Mix hero */}
              <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-violet-300/20 bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.17),transparent_55%),linear-gradient(120deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))] p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
                <div className="relative grid h-24 w-24 shrink-0 place-items-center self-start overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-900 via-violet-700 to-pink-700 shadow-xl sm:h-28 sm:w-28">
                  <div className="absolute h-24 w-24 rounded-full bg-fuchsia-400/60 blur-3xl" />

                  <div className="relative grid h-16 w-16 place-items-center rounded-full border border-white/25 bg-black/30 text-pink-100 shadow-[0_0_0_9px_rgba(255,255,255,0.04),0_0_0_18px_rgba(255,255,255,0.02)]">
                    <Music2 size={34} />
                  </div>

                  <Sparkles
                    size={16}
                    className="absolute right-3 top-3 text-white"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[9px] font-extrabold tracking-[0.13em] text-violet-300">
                    <Sparkles size={12} />
                    YOUR AI-CURATED MIX
                  </span>

                  <h3 className="mt-2 break-words text-2xl font-extrabold tracking-tight text-white">
                    {result.action_payload?.suggested_title ||
                      `${result.intent?.mood || "Your"} ${
                        result.intent?.activity || "Mix"
                      }`}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {result.message ||
                      "A soundtrack selected around your vibe."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.intent?.mood && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/15 bg-violet-500/[0.09] px-2 py-1 text-[10px] font-semibold text-violet-200">
                        <Zap size={12} />
                        {result.intent.mood}
                      </span>
                    )}

                    {result.intent?.activity && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/15 bg-violet-500/[0.09] px-2 py-1 text-[10px] font-semibold text-violet-200">
                        <Flame size={12} />
                        {result.intent.activity}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/15 bg-violet-500/[0.09] px-2 py-1 text-[10px] font-semibold text-violet-200">
                      <Clock3 size={12} />~
                      {result.total_duration_minutes || 30} min
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/15 bg-violet-500/[0.09] px-2 py-1 text-[10px] font-semibold text-violet-200">
                      <Music2 size={12} />
                      {songs.length} tracks
                    </span>
                  </div>

                  {result.intent?.avoid_heard_today && (
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-300">
                      <Filter size={13} />

                      {result.excluded_today_count > 0
                        ? `${result.excluded_today_count} tracks heard today filtered out`
                        : "Prioritising fresh tracks"}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="my-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  onClick={handlePlayNow}
                  disabled={!songs.length}
                  className="col-span-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 text-xs font-bold text-white shadow-lg shadow-violet-900/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-1"
                >
                  <Play size={16} fill="currentColor" />
                  Play mix
                </button>

                <button
                  type="button"
                  onClick={handleAddToQueue}
                  disabled={!songs.length}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-[10px] font-bold text-slate-200 transition hover:border-violet-300/30 hover:bg-violet-500/[0.08] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-xs"
                >
                  <Plus size={16} />
                  Add to queue
                </button>

                <button
                  type="button"
                  onClick={handleSavePlaylist}
                  disabled={
                    !songs.length ||
                    savingPlaylist ||
                    savedPlaylistSuccess
                  }
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-[10px] font-bold text-slate-200 transition hover:border-violet-300/30 hover:bg-violet-500/[0.08] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4 sm:text-xs"
                >
                  {savedPlaylistSuccess ? (
                    <Check size={16} />
                  ) : savingPlaylist ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <BookmarkPlus size={16} />
                  )}

                  {savedPlaylistSuccess
                    ? "Saved"
                    : savingPlaylist
                    ? "Saving..."
                    : "Save playlist"}
                </button>
              </div>

              {/* Tracklist heading */}
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-100">
                    Your tracklist

                    <span className="grid h-5 min-w-5 place-items-center rounded-md bg-violet-500/15 px-1.5 text-[10px] text-violet-300">
                      {songs.length}
                    </span>
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Picked for your vibe, one track at a time.
                  </p>
                </div>

                <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-slate-500">
                  <Sparkles size={12} />
                  AI MATCH
                </span>
              </div>

              {/* Songs */}
              {songs.length ? (
                <div className="flex flex-col gap-1.5">
                  {songs.map((song, index) => {
                    const candidate =
                      candidates.find((item) => {
                        const candidateSong = item?.song || item;

                        const candidateId =
                          candidateSong?.song_id ||
                          candidateSong?.id ||
                          candidateSong?._id;

                        const songId =
                          song?.song_id || song?.id || song?._id;

                        return candidateId && songId
                          ? String(candidateId) === String(songId)
                          : candidateSong?.title === song?.title;
                      }) || candidates[index];

                    const isCurrent =
                      currentSong &&
                      [
                        currentSong.song_id,
                        currentSong.id,
                        currentSong._id,
                      ].some(
                        (id) =>
                          id &&
                          [song.song_id, song.id, song._id].includes(id)
                      ) &&
                      isPlaying;

                    return (
                      <article
                        key={
                          song.song_id ||
                          song.id ||
                          song._id ||
                          `${song.title}-${index}`
                        }
                        className={`group flex min-w-0 items-center gap-2 rounded-xl border p-2 transition sm:gap-3 sm:p-2.5 ${
                          isCurrent
                            ? "border-violet-300/20 bg-violet-500/[0.07]"
                            : "border-transparent bg-white/[0.015] hover:border-white/[0.06] hover:bg-white/[0.035]"
                        }`}
                      >
                        <span
                          className={`w-5 shrink-0 text-center text-[10px] tabular-nums ${
                            isCurrent ? "text-violet-300" : "text-slate-600"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-800 sm:h-12 sm:w-12">
                          <img
                            src={song.image_url || FALLBACK_ART}
                            alt=""
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.src = FALLBACK_ART;
                            }}
                            className="h-full w-full object-cover"
                          />

                          <span className="absolute inset-0 grid place-items-center bg-black/60 text-white opacity-0 transition group-hover:opacity-100">
                            {isCurrent ? (
                              <Volume2 size={17} />
                            ) : (
                              <Play size={16} fill="currentColor" />
                            )}
                          </span>
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <strong
                            title={song.title || "Untitled Song"}
                            className={`truncate text-[11px] font-bold sm:text-xs ${
                              isCurrent
                                ? "text-violet-200"
                                : "text-slate-200"
                            }`}
                          >
                            {song.title || "Untitled Song"}
                          </strong>

                          <span
                            title={song.artist || "Unknown Artist"}
                            className="truncate text-[10px] text-slate-500"
                          >
                            {song.artist || "Unknown Artist"}
                          </span>
                        </div>

                        <div className="hidden max-w-[35%] min-w-0 flex-col items-end gap-1 sm:flex">
                          {candidate?.tags?.[0] && (
                            <span className="max-w-full truncate rounded-md border border-violet-300/15 bg-violet-500/[0.08] px-1.5 py-0.5 text-[9px] text-violet-200">
                              {candidate.tags[0]}
                            </span>
                          )}

                          <span
                            title={candidate?.match_reason || "Catalog match"}
                            className="max-w-full truncate text-[10px] text-slate-500"
                          >
                            {candidate?.match_reason || "Catalog match"}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-5 py-10 text-center">
                  <Music2 size={25} className="text-slate-500" />

                  <strong className="text-xs text-slate-300">
                    No tracks found for this prompt
                  </strong>

                  <span className="text-[11px] text-slate-500">
                    Try a different mood, genre, or activity.
                  </span>
                </div>
              )}
            </section>
          )}

          {/* Empty-state tip */}
          {!result && !loading && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-500/10 text-indigo-300">
                <Filter size={15} />
              </span>

              <p className="text-[11px] leading-5 text-slate-400">
                <strong className="text-slate-300">
                  More personal, less random.
                </strong>{" "}
                Ask for a mood, genre, activity, duration, or tracks to avoid.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-white/[0.07] bg-white/[0.01] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
            GeetHub AI is ready
          </div>

          <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <Sparkles size={12} />
            Made for your next repeat
          </span>
        </footer>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}