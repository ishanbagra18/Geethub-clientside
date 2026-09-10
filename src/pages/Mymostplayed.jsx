import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useMusicPlayer } from "../context/MusicPlayerContext";
import { 
  Play, 
  Pause, 
  ListPlus, 
  Trophy, 
  TrendingUp, 
  Music2, 
  Sparkles, 
  ArrowLeft, 
  Search, 
  LayoutList, 
  LayoutGrid, 
  Crown, 
  Share2 
} from "lucide-react";
import toast from "react-hot-toast";
import API_BASE_URL from "../config/api";
import Navbar from "../../Components/Navbar.jsx";
import MoodAnalysisCard from "../../Components/MoodAnalysisCard.jsx";

const PLACEHOLDER = "https://via.placeholder.com/220?text=No+Image";

const Mymostplayed = () => {
  const [mostPlayed, setMostPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  const navigate = useNavigate();
  const { currentSong, isPlaying, togglePlayPause, addToQueue, setQueueAndPlay, playSong } = useMusicPlayer();

  useEffect(() => {
    fetchMostPlayed();
  }, []);

  const fetchMostPlayed = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your most played songs");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/music/mymostplayed`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const songs = res.data.songs || [];
      setMostPlayed(songs);
      setError(null);
    } catch (err) {
      console.error("Error fetching most played:", err);
      setError(err.response?.data?.error || "Failed to load most played songs");
    } finally {
      setLoading(false);
    }
  };

  const getUserPlayCount = (song) => {
    if (!song.user_play_counts) return 0;
    const token = localStorage.getItem("token");
    if (!token) return 0;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.Uid || payload.uid || payload.id;
      return song.user_play_counts[userId] || 0;
    } catch {
      return 0;
    }
  };

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return mostPlayed;
    const q = searchQuery.toLowerCase();
    return mostPlayed.filter(
      (song) =>
        song.title?.toLowerCase().includes(q) ||
        song.artist?.toLowerCase().includes(q) ||
        song.album?.toLowerCase().includes(q)
    );
  }, [mostPlayed, searchQuery]);

  const totalPlays = useMemo(() => {
    return mostPlayed.reduce((acc, song) => acc + getUserPlayCount(song), 0);
  }, [mostPlayed]);

  const handlePlaySong = (song, queue = filteredSongs) => {
    const songId = song.song_id || song.id || song._id;
    if (currentSong && (currentSong.song_id === songId || currentSong._id === songId)) {
      togglePlayPause();
    } else {
      const queueIds = queue.map((s) => s.song_id || s.id || s._id);
      const index = queue.findIndex((s) => (s.song_id || s.id || s._id) === songId);
      if (setQueueAndPlay && index !== -1) {
        setQueueAndPlay(queueIds, index);
      } else {
        playSong(songId, queue, "random");
        navigate(`/playsong/${songId}`);
      }
    }
  };

  const handleAddToQueue = (e, song) => {
    e.stopPropagation();
    const songId = song.song_id || song.id || song._id;
    addToQueue(songId);
    toast.success(`Added "${song.title}" to queue`);
  };

  const handleShare = (e, song) => {
    e.stopPropagation();
    const songId = song.song_id || song.id || song._id;
    const shareUrl = `${window.location.origin}/playsong/${songId}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Song link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-950 text-white pb-32">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
            <Trophy className="absolute inset-0 m-auto text-blue-400 animate-pulse" size={24} />
          </div>
          <p className="text-gray-400 mt-5 text-sm font-semibold tracking-wide">Syncing your playback history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-950 text-white pb-32">
        <Navbar />
        <div className="flex items-center justify-center min-h-[70vh] px-4">
          <div className="bg-gray-950/80 border border-blue-500/30 rounded-3xl p-8 max-w-md backdrop-blur-xl text-center shadow-2xl">
            <Music2 size={48} className="text-blue-400 mx-auto mb-4" />
            <p className="text-gray-300 text-lg font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-950 text-white font-sans pb-32">
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto">
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-6 group text-sm font-semibold"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>

        {/* AI MOOD ANALYSIS */}
        <div className="mb-10">
          <MoodAnalysisCard onVibeSelect={(vibe) => navigate(`/search?q=${encodeURIComponent(vibe)}`)} />
        </div>

        {/* HERO SECTION */}
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-blue-500/20 shadow-2xl bg-gradient-to-r from-blue-950/60 via-black/80 to-indigo-950/40 backdrop-blur-2xl p-6 sm:p-10">
          {/* Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 rounded-3xl blur-xl opacity-60 animate-pulse" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-700 flex items-center justify-center shadow-2xl border border-blue-300/30">
                  <Trophy size={44} className="text-yellow-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={12} className="text-blue-400" /> Personalized Analytics
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-300">
                  My Most Played
                </h1>
                <p className="text-gray-300 text-base sm:text-lg mt-2 font-medium">
                  Your personal heavy rotation tracks ranked by total listen time.
                </p>
              </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-4">
              <div className="bg-gray-900/80 border border-blue-500/30 rounded-2xl p-4 text-center min-w-[120px] backdrop-blur-md">
                <Music2 size={20} className="text-blue-400 mx-auto mb-1" />
                <div className="text-2xl font-black text-white">{mostPlayed.length}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Unique Songs</div>
              </div>

              <div className="bg-gray-900/80 border border-indigo-500/30 rounded-2xl p-4 text-center min-w-[120px] backdrop-blur-md">
                <TrendingUp size={20} className="text-cyan-400 mx-auto mb-1" />
                <div className="text-2xl font-black text-white">{totalPlays}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total Plays</div>
              </div>
            </div>
          </div>
        </div>

        {/* TOOLBAR: SEARCH & VIEW SWITCHER */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search your top played tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/80 border border-gray-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {filteredSongs.length} {filteredSongs.length === 1 ? "Track" : "Tracks"}
            </span>

            <div className="flex items-center bg-gray-900/90 border border-gray-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                }`}
                title="List View"
              >
                <LayoutList size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* SONGS CONTENT */}
        {filteredSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-950/60 rounded-3xl border border-gray-800">
            <Music2 size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-1">No top played tracks found</h3>
            <p className="text-gray-400 text-sm">Start listening to songs across GeetHub to build your personal chart.</p>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredSongs.map((song, index) => {
              const songId = song.song_id || song._id || song.id;
              const playCount = getUserPlayCount(song);
              const isCurrentPlaying = currentSong && (currentSong.song_id === songId || currentSong._id === songId) && isPlaying;
              const isCurrentTrack = currentSong && (currentSong.song_id === songId || currentSong._id === songId);

              return (
                <div
                  key={songId || index}
                  onClick={() => handlePlaySong(song)}
                  className={`group relative bg-gray-950/70 border border-gray-800/80 rounded-2xl p-3.5 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer ${
                    isCurrentTrack ? "ring-2 ring-blue-400 bg-blue-950/30" : ""
                  }`}
                >
                  {/* Rank Pill */}
                  <div className="absolute top-5 left-5 z-20">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-black shadow-lg ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black flex items-center gap-1"
                          : index === 1
                          ? "bg-slate-300 text-black"
                          : index === 2
                          ? "bg-amber-800 text-amber-100"
                          : "bg-black/80 backdrop-blur-md text-gray-300 border border-white/10"
                      }`}
                    >
                      {index === 0 && <Crown size={12} fill="black" />}
                      #{index + 1}
                    </span>
                  </div>

                  {/* Artwork */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-900 mb-3 border border-gray-800">
                    <img
                      src={song.image_url || PLACEHOLDER}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER;
                      }}
                    />

                    {/* Play Counter Overlay Pill */}
                    <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-extrabold text-blue-300 border border-blue-500/30 flex items-center gap-1">
                      <Play size={10} fill="currentColor" /> {playCount} plays
                    </div>

                    {/* Play Overlay */}
                    <div
                      className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity flex items-center justify-center ${
                        isCurrentPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                        {isCurrentPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" className="ml-0.5" />}
                      </div>
                    </div>

                    {/* Queue Button */}
                    <button
                      onClick={(e) => handleAddToQueue(e, song)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-black/80 border border-gray-700 text-gray-300 hover:text-white hover:bg-blue-600 transition-all opacity-0 group-hover:opacity-100"
                      title="Add to Queue"
                    >
                      <ListPlus size={16} />
                    </button>
                  </div>

                  {/* Song Info */}
                  <div>
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                      {song.title || "Untitled"}
                    </h4>
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {song.artist || "Unknown Artist"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-gray-950/70 border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-[50px_1fr_120px] md:grid-cols-[60px_1fr_200px_120px_140px] items-center px-4 py-3 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="text-center">#</div>
              <div>Title</div>
              <div className="hidden md:block">Album</div>
              <div className="hidden md:block text-right">Your Plays</div>
              <div className="text-right pr-2">Actions</div>
            </div>

            <div className="divide-y divide-gray-800/40">
              {filteredSongs.map((song, index) => {
                const songId = song.song_id || song.id || song._id;
                const playCount = getUserPlayCount(song);
                const isCurrentPlaying = currentSong && (currentSong.song_id === songId || currentSong._id === songId) && isPlaying;
                const isCurrentTrack = currentSong && (currentSong.song_id === songId || currentSong._id === songId);

                return (
                  <div
                    key={songId || index}
                    onClick={() => handlePlaySong(song)}
                    className={`group grid grid-cols-[50px_1fr_120px] md:grid-cols-[60px_1fr_200px_120px_140px] items-center px-4 py-3.5 hover:bg-blue-600/10 cursor-pointer transition-all duration-200 ${
                      isCurrentTrack ? "bg-blue-900/20 border-l-4 border-blue-400" : ""
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center font-black text-sm">
                      {index === 0 ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-black flex items-center justify-center shadow-lg shadow-yellow-500/20">
                          <Crown size={18} fill="black" />
                        </div>
                      ) : index === 1 ? (
                        <div className="w-7 h-7 rounded-full bg-slate-300 text-black flex items-center justify-center font-bold text-xs">
                          2
                        </div>
                      ) : index === 2 ? (
                        <div className="w-7 h-7 rounded-full bg-amber-800 text-amber-100 flex items-center justify-center font-bold text-xs">
                          3
                        </div>
                      ) : (
                        <span className="text-gray-400 group-hover:text-blue-400">{index + 1}</span>
                      )}
                    </div>

                    {/* Song Info */}
                    <div className="flex items-center gap-3.5 min-w-0 pr-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-900 border border-gray-800">
                        <img
                          src={song.image_url || PLACEHOLDER}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER;
                          }}
                        />
                        <div
                          className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                            isCurrentPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {isCurrentPlaying ? (
                            <Pause size={18} className="text-blue-400 fill-blue-400" />
                          ) : (
                            <Play size={18} className="text-white fill-white ml-0.5" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h4
                          className={`text-sm font-bold truncate transition-colors ${
                            isCurrentTrack ? "text-blue-400" : "text-white group-hover:text-blue-300"
                          }`}
                        >
                          {song.title || "Untitled Track"}
                        </h4>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{song.artist || "Unknown Artist"}</p>
                      </div>
                    </div>

                    {/* Album */}
                    <div className="hidden md:block min-w-0 text-xs text-gray-400 truncate pr-4">
                      {song.album || "Single"}
                    </div>

                    {/* Plays Count */}
                    <div className="hidden md:block text-right text-xs text-blue-400 font-bold pr-2">
                      {playCount} plays
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleAddToQueue(e, song)}
                        className="p-2 rounded-lg bg-gray-900/80 hover:bg-blue-500/20 text-gray-300 hover:text-blue-300 border border-gray-800 transition-all"
                        title="Add to Queue"
                      >
                        <ListPlus size={16} />
                      </button>
                      <button
                        onClick={(e) => handleShare(e, song)}
                        className="p-2 rounded-lg bg-gray-900/80 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 border border-gray-800 transition-all"
                        title="Share Song"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mymostplayed;
