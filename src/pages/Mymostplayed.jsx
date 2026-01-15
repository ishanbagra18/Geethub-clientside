import { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useMusicPlayer } from "../context/MusicPlayerContext";
import { Play, ListPlus, Trophy, TrendingUp, Music2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import API_BASE_URL from '../config/api';

const PLACEHOLDER = "https://via.placeholder.com/220?text=No+Image";

const Mymostplayed = () => {
  const [mostPlayed, setMostPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { addToQueue, playSong } = useMusicPlayer();

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
      setMostPlayed(songs.slice(0, 10));
      setError(null);
    } catch (err) {
      console.error("Error fetching most played:", err);
      setError(err.response?.data?.error || "Failed to load most played songs");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (songId) => {
    playSong(songId, mostPlayed, "random");
    navigate(`/playsong/${songId}`);
  };

  const handleAddToQueue = async (songId, songTitle) => {
    const success = await addToQueue(songId);
    if (success) {
      toast.success(`Added "${songTitle}" to queue`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pb-32">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="text-blue-400 text-lg">Loading your most played songs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white pb-32">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-blue-950/50 border border-blue-700/50 rounded-2xl p-8 max-w-md backdrop-blur-sm">
            <p className="text-blue-400 text-center text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (mostPlayed.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white pb-32">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-16 rounded-full bg-gradient-to-b from-blue-500 to-blue-700" />
            <div>
              <span className="text-blue-500/70 text-xs font-semibold tracking-[0.25em] uppercase block mb-2">
                🎧 YOUR TOP TRACKS
              </span>
              <h1 className="text-5xl font-bold tracking-tight text-white">
                My Most Played
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-32 bg-blue-950/30 rounded-3xl border border-blue-800/50 backdrop-blur-sm">
            <Music2 size={80} className="text-blue-600 mb-6" />
            <p className="text-blue-300 text-xl mb-2 font-semibold">No songs played yet</p>
            <p className="text-blue-500/70 text-base">Start listening to see your most played tracks here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-16 rounded-full bg-gradient-to-b from-blue-500 to-blue-700" />
            <div>
              <span className="text-blue-500/70 text-xs font-semibold tracking-[0.25em] uppercase block mb-2">
                🎧 YOUR TOP TRACKS
              </span>
              <h1 className="text-5xl font-bold tracking-tight text-white flex items-center gap-3">
                My Most Played
                <Sparkles size={32} className="text-blue-400 animate-pulse" />
              </h1>
            </div>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="mb-10 flex flex-wrap items-center gap-6 text-base text-blue-400 bg-blue-950/30 rounded-2xl p-6 border border-blue-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Trophy size={24} className="text-yellow-400" />
            <span>
              You&apos;ve played <span className="text-white font-bold text-lg">{mostPlayed.length}</span> different songs
            </span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp size={24} className="text-green-400" />
            <span>
              Total plays:{" "}
              <span className="text-white font-bold text-lg">
                {mostPlayed.reduce((acc, song) => acc + getUserPlayCount(song), 0)}
              </span>
            </span>
          </div>
        </div>

        {/* SONG GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {mostPlayed.map((song, index) => {
            const playCount = getUserPlayCount(song);
            
            return (
              <div
                key={song.song_id || song._id || index}
                className="group relative"
              >
                {/* Rank Badge */}
                <div className="absolute -top-3 -left-3 z-30 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/50 border-4 border-black">
                  #{index + 1}
                </div>

                {/* Card Container */}
                <div className="relative p-4 rounded-2xl bg-blue-950/40 border border-blue-800/50 backdrop-blur-md transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-2">
                  {/* Image Card */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-black/80 mb-4">
                    <img
                      src={song.image_url || PLACEHOLDER}
                      alt={song.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

                    {/* Play Count Badge */}
                    <div className="absolute top-3 right-3 bg-black/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-white border border-blue-500/40 shadow-lg">
                      <Play size={12} fill="white" />
                      {playCount}
                    </div>

                    {/* Hover Play Button */}
                    <div
                      onClick={() => handlePlaySong(song.song_id || song._id)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                    >
                      <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-full p-5 shadow-2xl shadow-blue-500/60 transform hover:scale-110 transition-transform">
                        <Play size={28} fill="white" className="text-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Song Info */}
                  <div className="px-1">
                    <h3 className="text-white font-bold text-sm truncate mb-1.5">
                      {song.title}
                    </h3>
                    <p className="text-blue-400 text-xs truncate mb-4">
                      {song.artist}
                    </p>

                    {/* Add to Queue Button */}
                    <button
                      onClick={() => handleAddToQueue(song.song_id || song._id, song.title)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-blue-600/20 text-blue-300 text-xs font-semibold border border-blue-500/40 hover:bg-blue-600/40 hover:border-blue-400 hover:text-white transition-all duration-200"
                    >
                      <ListPlus size={14} />
                      Add to Queue
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div> 
  );
};

export default Mymostplayed;
