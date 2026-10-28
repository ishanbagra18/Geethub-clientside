import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Search as SearchIcon, X, Clock, Trash2, Play, Plus, 
  ListPlus, Share2, Music, Sparkles, TrendingUp, Compass, Heart, Flame,
  Globe, ExternalLink, Info, ShieldCheck, Layers, Radio
} from "lucide-react";
import toast from "react-hot-toast";

import Navbar from "../../Components/Navbar";
import { useMusicPlayer } from "../context/MusicPlayerContext";
import API_BASE_URL from "../config/api";

const PLACEHOLDER = "https://via.placeholder.com/300?text=No+Cover";

const POPULAR_TAGS = [
  { name: "Arijit Singh Hits", query: "Arijit" },
  { name: "Punjabi Party Beats", query: "Punjabi" },
  { name: "Hindi Romantic Songs", query: "Hindi" },
  { name: "Jamendo Chill Lo-Fi", query: "Lo-Fi" },
  { name: "Workout Energy Beats", query: "Workout" },
  { name: "Karan Aujla", query: "Karan" },
  { name: "Sidhu Moosewala", query: "Sidhu" },
  { name: "Acoustic CC Vibes", query: "Acoustic" },
];

const GENRE_CARDS = [
  { name: "Bollywood Beats", color: "from-pink-600 to-rose-700", icon: "🎬", query: "Hindi" },
  { name: "Punjabi Hits", color: "from-amber-500 to-orange-600", icon: "🔥", query: "Punjabi" },
  { name: "Romantic Vibes", color: "from-red-500 to-pink-600", icon: "💖", query: "Love" },
  { name: "Lo-Fi & Chill", color: "from-indigo-600 to-blue-700", icon: "🎧", query: "Lo-Fi" },
  { name: "Workout & EDM", color: "from-purple-600 to-indigo-800", icon: "⚡", query: "Workout" },
  { name: "Acoustic & Soft", color: "from-emerald-600 to-teal-700", icon: "🎸", query: "Acoustic" },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { playTrack, addToQueue } = useMusicPlayer();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeSource, setActiveSource] = useState("all"); // 'all' | 'local' | 'jamendo'
  const [searchResults, setSearchResults] = useState([]);
  const [breakdown, setBreakdown] = useState({ local: 0, jamendo: 0 });
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [licenseModalSong, setLicenseModalSong] = useState(null);

  const debounceTimeoutRef = useRef(null);

  // Sync state with URL parameter
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
  }, [searchParams]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recent_searches");
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {
      console.error("Error loading recent searches:", e);
    }
  }, []);

  // Fetch search results from Go backend API: GET /api/music/search?q=...&source=...
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setBreakdown({ local: 0, jamendo: 0 });
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setLoading(true);
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        const res = await axios.get(
          `${API_BASE_URL}/api/music/search?q=${encodeURIComponent(query.trim())}&limit=40&source=${activeSource}`,
          config
        );

        const songs = res.data?.songs || [];
        setSearchResults(songs);
        if (res.data?.breakdown) {
          setBreakdown(res.data.breakdown);
        }
      } catch (err) {
        console.error("Search API failed, fallback to /music/allsongs:", err);
        // Fallback to local songs if search API encounters unexpected error
        try {
          const fallbackRes = await axios.get(`${API_BASE_URL}/music/allsongs`);
          const all = fallbackRes.data?.songs || [];
          const lowerQ = query.trim().toLowerCase();
          const filtered = all.filter(
            (s) =>
              (s.title || "").toLowerCase().includes(lowerQ) ||
              (s.artist || "").toLowerCase().includes(lowerQ) ||
              (s.genre || "").toLowerCase().includes(lowerQ)
          );
          setSearchResults(filtered);
          setBreakdown({ local: filtered.length, jamendo: 0 });
        } catch (fbErr) {
          console.error("Fallback search failed:", fbErr);
          setSearchResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [query, activeSource]);

  const saveRecentSearch = (searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return;
    const cleanTerm = searchTerm.trim();
    const updated = [cleanTerm, ...recentSearches.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase())].slice(0, 8);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
      setSearchParams({ q: query.trim() });
    }
  };

  const handleSelectRecent = (term) => {
    setQuery(term);
    saveRecentSearch(term);
    setSearchParams({ q: term });
  };

  const removeRecentSearch = (e, termToRemove) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== termToRemove);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent_searches");
    toast.success("Recent searches cleared");
  };

  const copySongLink = (songId, title) => {
    const link = `${window.location.origin}/playsong/${songId}`;
    navigator.clipboard.writeText(link);
    toast.success(`Copied link for "${title}"!`);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white font-sans selection:bg-blue-500/30 relative overflow-x-hidden">
      {/* Dynamic Ambient Background Elements */}
      <div className="fixed inset-0 ambient-mesh-glow pointer-events-none -z-10" />
      <div className="fixed top-20 left-1/4 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-20 right-1/4 w-[28rem] h-[28rem] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-28 pb-32">
        {/* Search Header Container */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <SearchIcon className="absolute left-4 text-blue-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value.trim()) {
                    setSearchParams({ q: e.target.value.trim() });
                  } else {
                    setSearchParams({});
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    saveRecentSearch(query);
                  }
                }}
                placeholder="Search GeetHub library & Jamendo Creative Commons music..."
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-[#121524]/90 border border-blue-500/30 focus:border-blue-400 text-white placeholder-slate-400 text-base shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSearchParams({});
                  }}
                  className="absolute right-4 text-slate-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition"
                >
                  <X size={18} />
                </button>
              )}
            </form>
          </div>

          {/* Catalog Source Filter Pills (When active search or browsing) */}
          {query.trim() && (
            <div className="flex items-center justify-center gap-2 mt-4 animate-fadeIn">
              <button
                onClick={() => setActiveSource("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeSource === "all"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                <Layers size={13} />
                <span>All Catalog</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                  {searchResults.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSource("local")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeSource === "local"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                <Music size={13} />
                <span>GeetHub Library</span>
                {breakdown.local > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                    {breakdown.local}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSource("jamendo")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeSource === "jamendo"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-white/5 text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/30"
                }`}
              >
                <Globe size={13} />
                <span>Jamendo CC Free Music</span>
                {breakdown.jamendo > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                    {breakdown.jamendo}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* CASE 1: NO QUERY WRITTEN -> RECENT SEARCHES & TRENDING    */}
        {/* ========================================================= */}
        {!query.trim() ? (
          <div className="space-y-12 animate-fadeIn">
            
            {/* Recent Searches Section */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock size={18} className="text-blue-400" />
                    <span>Recent Searches</span>
                  </h3>
                  <button
                    onClick={clearAllRecent}
                    className="text-xs font-semibold text-slate-400 hover:text-red-400 flex items-center gap-1 transition"
                  >
                    <Trash2 size={14} /> Clear All
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {recentSearches.map((term, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectRecent(term)}
                      className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 cursor-pointer transition-all shadow-sm"
                    >
                      <Clock size={13} className="text-slate-400 group-hover:text-blue-400" />
                      <span className="text-sm font-medium text-slate-200 group-hover:text-white">{term}</span>
                      <button
                        onClick={(e) => removeRecentSearch(e, term)}
                        className="text-slate-500 hover:text-red-400 p-0.5 rounded-full hover:bg-white/10 transition ml-1"
                        title="Remove"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches / Trending Tags */}
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Flame size={18} className="text-amber-400 fill-amber-400" />
                <span>Trending Searches & Curated Tags</span>
              </h3>

              <div className="flex flex-wrap gap-3">
                {POPULAR_TAGS.map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectRecent(tag.query)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 hover:border-blue-400 text-blue-300 font-semibold text-xs flex items-center gap-1.5 hover:scale-105 transition shadow-sm"
                  >
                    <TrendingUp size={13} />
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Jamendo Creative Commons Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#10192e] to-blue-950/40 border border-emerald-500/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Globe size={26} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white flex items-center gap-2">
                    Free Creative Commons Music Integration
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">Jamendo v3.0</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Discover thousands of free, legally streamable independent tracks under Creative Commons licenses. Fully mapped to GeetHub's player format.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSelectRecent("Workout")}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/30 flex-shrink-0"
              >
                Explore Jamendo Tracks
              </button>
            </div>

            {/* Browse Categories & Genres */}
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                <Compass size={18} className="text-cyan-400" />
                <span>Browse Music Genres & Vibes</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {GENRE_CARDS.map((cat, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectRecent(cat.query)}
                    className={`p-4 rounded-2xl bg-gradient-to-br ${cat.color} cursor-pointer shadow-xl hover:scale-105 transition-all duration-300 flex flex-col justify-between h-32 border border-white/15 group relative overflow-hidden`}
                  >
                    <span className="text-3xl transform group-hover:scale-125 transition-transform duration-300">{cat.icon}</span>
                    <h4 className="font-bold text-sm text-white tracking-wide leading-tight drop-shadow-md">{cat.name}</h4>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* ========================================================= */
          /* CASE 2: ACTIVE QUERY WRITTEN -> SEARCH RESULTS            */
          /* ========================================================= */
          <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-3 border-b border-white/10 gap-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-blue-400" />
                <span>Search Results for "{query}"</span>
              </h2>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  {searchResults.length} {searchResults.length === 1 ? "track" : "tracks"}
                </span>
                {breakdown.jamendo > 0 && (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <Globe size={11} /> {breakdown.jamendo} Jamendo CC
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20 text-slate-400">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 p-8">
                <Music size={48} className="mx-auto text-slate-500 mb-3 opacity-40" />
                <h3 className="text-lg font-bold text-white mb-1">No songs found matching "{query}"</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try checking for typos or search by artist name, genre, or mood (e.g. "Lo-Fi", "Workout", "Arijit").
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((song) => {
                  const songId = song.song_id || song._id || song.id;
                  const isJamendo = typeof songId === "string" && (songId.startsWith("jamendo_") || (song.uploaded_by && song.uploaded_by.includes("Jamendo")));
                  
                  return (
                    <div
                      key={songId}
                      className="group bg-[#121524]/80 hover:bg-[#181d33] border border-white/10 hover:border-blue-500/50 rounded-2xl p-3.5 transition-all duration-300 shadow-xl flex items-center gap-3.5 relative"
                    >
                      {/* Song Image */}
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/50 flex-shrink-0">
                        <img
                          src={song.image_url || PLACEHOLDER}
                          alt={song.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          onError={(e) => (e.target.src = PLACEHOLDER)}
                        />
                        <button
                          onClick={() => {
                            if (playTrack) playTrack(song, searchResults);
                            navigate(`/playsong/${songId}`);
                          }}
                          className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center transition"
                          title={`Play ${song.title}`}
                        >
                          <div className="w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-400 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                            <Play size={18} fill="black" className="ml-0.5" />
                          </div>
                        </button>
                      </div>

                      {/* Song Title & Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4
                            onClick={() => {
                              if (playTrack) playTrack(song, searchResults);
                              navigate(`/playsong/${songId}`);
                            }}
                            className="font-bold text-sm text-white truncate hover:text-blue-400 cursor-pointer transition"
                          >
                            {song.title || "Untitled Track"}
                          </h4>
                        </div>

                        <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist || "Unknown Artist"}</p>
                        
                        <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                          <span className="inline-block text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 truncate max-w-[120px]">
                            {song.genre || song.language || "Music"}
                          </span>

                          {isJamendo ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLicenseModalSong(song);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 px-2 py-0.5 rounded border border-emerald-500/30 transition cursor-pointer"
                              title="View Creative Commons Attribution & Licensing"
                            >
                              <ShieldCheck size={11} className="text-emerald-400" />
                              <span>CC License</span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                              GeetHub
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions Toolbar */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (addToQueue) addToQueue(song);
                            toast.success(`Added "${song.title}" to Queue!`);
                          }}
                          className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition"
                          title="Add to Queue"
                        >
                          <ListPlus size={16} />
                        </button>

                        <button
                          onClick={() => copySongLink(songId, song.title)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition"
                          title="Copy Share Link"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Jamendo Creative Commons Attribution Modal */}
        {licenseModalSong && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#121626] border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-white">
              <button
                onClick={() => setLicenseModalSong(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Creative Commons Attribution</h3>
                  <p className="text-xs text-slate-400">Jamendo Free Music Licensing Compliance</p>
                </div>
              </div>

              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Track Title:</span>
                  <span className="font-semibold text-white text-sm">{licenseModalSong.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Artist:</span>
                  <span className="font-semibold text-white">{licenseModalSong.artist}</span>
                </div>
                {licenseModalSong.album && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Album:</span>
                    <span className="text-slate-200">{licenseModalSong.album}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block mb-0.5">Attribution & License:</span>
                  <p className="text-emerald-300 font-mono text-[11px] bg-black/30 p-2 rounded-lg border border-emerald-500/20 break-words">
                    {licenseModalSong.info || "Jamendo CC Track • Creative Commons License"}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                This track is provided via the Jamendo Music API under Creative Commons licensing. You are free to stream this track for personal entertainment with proper artist attribution.
              </p>

              <div className="flex items-center justify-end gap-2.5 mt-5">
                <a
                  href="https://www.jamendo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition border border-white/10"
                >
                  <Globe size={13} /> Jamendo Portal
                </a>
                <button
                  onClick={() => setLicenseModalSong(null)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
