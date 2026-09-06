import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Search as SearchIcon, X, Clock, Trash2, Play, Plus, 
  ListPlus, Share2, Music, Sparkles, TrendingUp, Compass, Heart, Flame 
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
  { name: "Top Charts", query: "Top" },
  { name: "Lo-Fi Chill", query: "Chill" },
  { name: "Karan Aujla", query: "Karan" },
  { name: "Sidhu Moosewala", query: "Sidhu" },
  { name: "Bollywood Classics", query: "Bollywood" },
];

const GENRE_CARDS = [
  { name: "Bollywood Beats", color: "from-pink-600 to-rose-700", icon: "🎬", query: "Hindi" },
  { name: "Punjabi Hits", color: "from-amber-500 to-orange-600", icon: "🔥", query: "Punjabi" },
  { name: "Romantic Vibes", color: "from-red-500 to-pink-600", icon: "💖", query: "Love" },
  { name: "Lo-Fi & Chill", color: "from-indigo-600 to-blue-700", icon: "🎧", query: "Lo-Fi" },
  { name: "Party & Club", color: "from-purple-600 to-indigo-800", icon: "🪩", query: "Party" },
  { name: "Acoustic & Soft", color: "from-emerald-600 to-teal-700", icon: "🎸", query: "Acoustic" },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { playTrack, addToQueue } = useMusicPlayer();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [allSongs, setAllSongs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync state with URL parameter
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
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

  // Fetch all songs on mount to perform fast searching & filtering
  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_BASE_URL}/music/allsongs`, config);
        setAllSongs(res.data?.songs || []);
      } catch (err) {
        console.error("Error fetching songs for search:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  // Semantic search matching & relevance scoring algorithm
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const rawQuery = query.trim().toLowerCase();
    const tokens = rawQuery.split(/\s+/).filter(Boolean);

    // Semantic Concept & Mood Dictionary
    const semanticMappings = {
      lofi: ["lo-fi", "chill", "soft", "acoustic", "ambient", "night", "quiet", "relax"],
      chill: ["lo-fi", "soft", "peaceful", "slow", "acoustic", "relax", "ambient"],
      romantic: ["love", "soulful", "heartbreak", "arijit", "sad", "unplugged", "ballad"],
      love: ["romantic", "soulful", "heartbreak", "arijit", "unplugged"],
      sad: ["soulful", "heartbreak", "arijit", "slow", "unplugged", "sadness"],
      introspective: ["soulful", "heartbreak", "arijit", "slow", "acoustic", "lofi"],
      party: ["dance", "punjabi", "remix", "banger", "club", "hype", "beat", "energy"],
      energy: ["party", "dance", "punjabi", "club", "workout", "hype", "beat"],
      workout: ["energy", "party", "dance", "hype", "beat", "club"],
      retro: ["classic", "old", "vintage", "hindi", "90s", "80s"],
      punjabi: ["bhangu", "karan", "sidhu", "guru", "hardy", "party", "beat"],
      bollywood: ["hindi", "arijit", "pritam", "film", "movie", "soundtrack"],
    };

    // Expand search tokens with semantic synonyms
    const expandedTokens = new Set(tokens);
    tokens.forEach((t) => {
      if (semanticMappings[t]) {
        semanticMappings[t].forEach((syn) => expandedTokens.add(syn));
      }
    });

    const scoredSongs = allSongs.map((song) => {
      let score = 0;
      const title = (song.title || "").toLowerCase();
      const artist = (song.artist || "").toLowerCase();
      const genre = (song.genre || "").toLowerCase();
      const language = (song.language || "").toLowerCase();
      const info = (song.info || "").toLowerCase();
      const album = (song.album || "").toLowerCase();

      const combinedText = `${title} ${artist} ${genre} ${language} ${info} ${album}`;

      // 1. Direct exact phrase match (highest weight)
      if (combinedText.includes(rawQuery)) score += 25;
      if (title.includes(rawQuery)) score += 15;
      if (artist.includes(rawQuery)) score += 10;

      // 2. Token matches
      tokens.forEach((token) => {
        if (title.includes(token)) score += 8;
        if (artist.includes(token)) score += 6;
        if (genre.includes(token)) score += 5;
        if (language.includes(token)) score += 4;
        if (combinedText.includes(token)) score += 3;
      });

      // 3. Semantic Synonym Matches
      expandedTokens.forEach((synToken) => {
        if (combinedText.includes(synToken)) score += 2;
      });

      return { song, score };
    });

    // Filter out 0-score tracks and sort by relevance score descending
    const results = scoredSongs
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.song);

    setSearchResults(results);
  }, [query, allSongs]);

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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0c16] via-[#050509] to-[#020204] text-white font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-28 pb-32">
        {/* Search Header Container */}
        <div className="mb-8">
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
                placeholder="Search songs, artists, genres, or languages..."
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
                <span>Trending Searches</span>
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

            {/* Browse Categories & Genres */}
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                <Compass size={18} className="text-cyan-400" />
                <span>Browse Music Genres</span>
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
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-blue-400" />
                <span>Search Results for "{query}"</span>
              </h2>
              <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                {searchResults.length} {searchResults.length === 1 ? "track" : "tracks"} found
              </span>
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
                  Try checking for typos or search by artist name, genre, or album.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((song) => {
                  const songId = song.song_id || song._id;
                  return (
                    <div
                      key={songId}
                      className="group bg-[#121524]/80 hover:bg-[#181d33] border border-white/10 hover:border-blue-500/50 rounded-2xl p-3.5 transition-all duration-300 shadow-xl flex items-center gap-3.5"
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
                            if (playTrack) playTrack(song);
                            navigate(`/playsong/${songId}`);
                          }}
                          className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center transition"
                        >
                          <div className="w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-400 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                            <Play size={18} fill="black" className="ml-0.5" />
                          </div>
                        </button>
                      </div>

                      {/* Song Title & Info */}
                      <div className="flex-1 min-w-0">
                        <h4
                          onClick={() => navigate(`/playsong/${songId}`)}
                          className="font-bold text-sm text-white truncate hover:text-blue-400 cursor-pointer transition"
                        >
                          {song.title || "Untitled Track"}
                        </h4>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist || "Unknown Artist"}</p>
                        <span className="inline-block text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded mt-1.5 border border-blue-500/20">
                          {song.language || song.genre || "Music"}
                        </span>
                      </div>

                      {/* Actions Toolbar */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (addToQueue) addToQueue(songId);
                            toast.success("Added to Queue!");
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
      </main>
    </div>
  );
};

export default SearchPage;
