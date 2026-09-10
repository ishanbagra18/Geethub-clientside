import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Play, Sparkles, ListPlus, Music, Flame, Award, Radio } from "lucide-react";
import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import toast from "react-hot-toast";
import API_BASE_URL from "../src/config/api";

const HIGH_RES_SPOTLIGHT_ART = [
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1000&auto=format&fit=crop&q=80",
];

const CURATOR_TAGS = [
  "🔥 #1 Editor's Choice",
  "🎧 Trending Desi Vibe",
  "✨ Filmmaker Soundtrack",
  "⭐ High-Energy Anthem",
];

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const RandomSongs = ({ maxToShow = 4 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState({});
  const navigate = useNavigate();
  const { addToQueue, playSong } = useMusicPlayer();

  const pickRandom = (songs) => shuffle(songs).slice(0, maxToShow);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_BASE_URL}/music/allsongs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const rawList = res.data?.songs || res.data || [];
        const mapped = rawList.map((s, index) => ({
          title: s.title || "Untitled Track",
          artist: s.artist || "Unknown Artist",
          img: s.image_url || s.image || s.cover_image || s.img || HIGH_RES_SPOTLIGHT_ART[index % HIGH_RES_SPOTLIGHT_ART.length],
          fallbackImg: HIGH_RES_SPOTLIGHT_ART[index % HIGH_RES_SPOTLIGHT_ART.length],
          genre: s.genre || "Bollywood",
          lang: s.language || "Hindi",
          song_id: s.song_id || s._id || s.id,
          tag: CURATOR_TAGS[index % CURATOR_TAGS.length],
          songObj: s,
        }));

        setItems(pickRandom(mapped));
      } catch (err) {
        console.error("RandomSongs fetch error:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [maxToShow]);

  const handlePlay = (song) => {
    const songId = song?.song_id || song?._id || song?.id || song?.songObj?.song_id || song?.songObj?._id || song?.songObj?.id;
    if (songId) {
      playSong(songId);
      navigate(`/playsong/${songId}`);
    }
  };

  const handleQueue = (e, song) => {
    e.stopPropagation();
    const songId = song?.song_id || song?._id || song?.id || song?.songObj?.song_id || song?.songObj?._id || song?.songObj?.id;
    if (songId) {
      addToQueue(songId);
      toast.success(`Added "${song.title}" to queue`);
    }
  };

  const handleImageError = (id, fallback) => {
    setFailedImages((prev) => ({ ...prev, [id]: fallback }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(maxToShow)].map((_, i) => (
          <div
            key={i}
            className="h-96 rounded-3xl bg-slate-900/60 overflow-hidden animate-pulse border border-slate-800"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const primaryItem = items[0];
  const secondaryItems = items.slice(1);

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Modern Curator Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* 🌟 HERO SPOTLIGHT FEATURED CARD (Left 7 Cols) */}
        {primaryItem && (
          <div
            onClick={() => handlePlay(primaryItem)}
            className="lg:col-span-7 group relative rounded-3xl overflow-hidden cursor-pointer border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-blue-950/60 to-purple-950/40 p-8 sm:p-10 shadow-2xl transition-all duration-500 hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:-translate-y-1.5 flex flex-col justify-between min-h-[380px]"
          >
            {/* Background Image / Vinyl */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={failedImages[primaryItem.song_id] || primaryItem.img}
                alt={primaryItem.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.4] group-hover:brightness-[0.45]"
                onError={() => handleImageError(primaryItem.song_id, primaryItem.fallbackImg)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            </div>

            {/* Top Badges Bar */}
            <div className="relative z-10 flex items-center justify-between gap-3">
              <span className="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 backdrop-blur-xl text-cyan-300 text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                Featured Spotlight #1
              </span>

              <button
                onClick={(e) => handleQueue(e, primaryItem)}
                className="p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500 hover:text-black transition-all shadow-xl hover:scale-105"
                title="Add to Queue"
              >
                <ListPlus size={20} />
              </button>
            </div>

            {/* Middle Play Action Icon */}
            <div className="relative z-10 my-6 flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-cyan-500/50 group-hover:scale-110 transition-all duration-300 border-2 border-white/20">
                <Play size={34} fill="currentColor" className="ml-1" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Radio size={14} className="animate-pulse" /> Stream Now
                </span>
                <p className="text-gray-300 text-sm font-medium">Click to play featured curator pick</p>
              </div>
            </div>

            {/* Bottom Content Metadata */}
            <div className="relative z-10 space-y-2">
              <div className="inline-block px-3 py-1 rounded-md bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-[11px] font-mono font-bold uppercase">
                {primaryItem.tag}
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                {primaryItem.title}
              </h3>
              <p className="text-base text-gray-300 font-semibold flex items-center gap-2">
                <span>{primaryItem.artist}</span>
                <span>•</span>
                <span className="text-xs font-bold uppercase text-purple-400">{primaryItem.genre}</span>
              </p>
            </div>
          </div>
        )}

        {/* 🎵 SECONDARY SPOTLIGHT CARDS (Right 5 Cols Grid) */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-4">
          {secondaryItems.map((s, i) => {
            const currentImg = failedImages[s.song_id] || s.img;

            return (
              <div
                key={s.song_id || i}
                onClick={() => handlePlay(s)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-slate-800/80 bg-[#12141d]/90 p-4 shadow-xl transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/20 hover:-translate-y-1 flex items-center gap-4"
              >
                {/* Image Disc */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-700/60 shadow-md">
                  <img
                    src={currentImg}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={() => handleImageError(s.song_id, s.fallbackImg)}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                  
                  {/* Small Play Center Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg">
                      <Play size={16} fill="black" className="ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Metadata Info */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 block mb-0.5">
                    {s.tag}
                  </span>
                  <h4 className="text-base font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                    {s.title}
                  </h4>
                  <p className="text-xs text-gray-400 truncate mt-0.5 font-medium">
                    {s.artist}
                  </p>
                </div>

                {/* Queue Action Button */}
                <button
                  onClick={(e) => handleQueue(e, s)}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500 hover:text-black text-cyan-400 transition-all border border-slate-700 flex-shrink-0"
                  title="Add to Queue"
                >
                  <ListPlus size={16} />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default RandomSongs;
