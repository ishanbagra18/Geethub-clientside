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
            className="lg:col-span-7 group relative rounded-3xl overflow-hidden cursor-pointer border border-slate-200 dark:border-cyan-500/30 bg-white dark:bg-gradient-to-br dark:from-[#0c1220] dark:via-[#080d18] dark:to-[#121626] p-6 sm:p-8 shadow-sm hover:shadow-2xl hover:shadow-cyan-500/10 dark:hover:shadow-[0_0_40px_rgba(6,182,212,0.25)] transition-all duration-500 hover:border-cyan-400 hover:-translate-y-1.5 flex flex-col justify-between min-h-[380px]"
          >
            {/* Ambient Blurred Artwork Glow (Background Accent) */}
            <div 
              className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full opacity-10 dark:opacity-20 blur-3xl pointer-events-none bg-cover bg-center"
              style={{ backgroundImage: `url(${failedImages[primaryItem.song_id] || primaryItem.img})` }}
            />

            {/* Top Badges Bar */}
            <div className="relative z-10 flex items-center justify-between gap-3 mb-6">
              <span className="px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-600 dark:text-cyan-300 text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                <Sparkles size={14} className="text-cyan-500 dark:text-cyan-400 animate-pulse" />
                Featured Spotlight #1
              </span>

              <button
                onClick={(e) => handleQueue(e, primaryItem)}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-black/80 backdrop-blur-md border border-slate-200 dark:border-cyan-500/40 text-slate-700 dark:text-cyan-300 hover:bg-cyan-500 hover:!text-black transition-all shadow-md hover:scale-105"
                title="Add to Queue"
              >
                <ListPlus size={20} />
              </button>
            </div>

            {/* Middle Section: Artwork Showcase & Stream Action */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 my-auto">
              {/* Prominent High-Res Album Art with Drop Shadow */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl border border-slate-200 dark:border-white/10 group-hover:scale-105 transition-transform duration-500 bg-slate-100 dark:bg-slate-900">
                <img
                  src={failedImages[primaryItem.song_id] || primaryItem.img}
                  alt={primaryItem.title}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(primaryItem.song_id, primaryItem.fallbackImg)}
                />
                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 !text-white flex items-center justify-center shadow-2xl shadow-cyan-500/50 transform scale-75 group-hover:scale-100 transition-transform">
                    <Play size={24} fill="currentColor" className="ml-1 !text-white" />
                  </div>
                </div>
              </div>

              {/* Action Prompt */}
              <div className="flex-1 flex flex-col justify-center text-center sm:text-left space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-400/30 text-blue-600 dark:text-cyan-300 text-xs font-mono font-bold uppercase w-fit mx-auto sm:mx-0">
                  <Flame size={13} className="text-blue-500 dark:text-cyan-400" />
                  {primaryItem.tag}
                </div>

                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 !text-white flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Play size={20} fill="currentColor" className="ml-0.5 !text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Radio size={13} className="animate-pulse" /> Stream Now
                    </span>
                    <p className="text-slate-500 dark:text-gray-400 text-xs font-medium">Click card to play featured pick</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Content Metadata */}
            <div className="relative z-10 pt-4 border-t border-slate-100 dark:border-white/5 space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors tracking-tight line-clamp-1">
                {primaryItem.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300 font-semibold flex items-center gap-2">
                <span>{primaryItem.artist}</span>
                <span>•</span>
                <span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400">{primaryItem.genre}</span>
                <span>•</span>
                <span className="text-xs font-bold uppercase text-slate-400">{primaryItem.lang}</span>
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
                className="group relative rounded-2xl overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#12141d]/90 p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/20 hover:-translate-y-1 flex items-center gap-4"
              >
                {/* Image Disc */}
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-900 flex-shrink-0 border border-slate-300 dark:border-slate-700/60 shadow-md">
                  <img
                    src={currentImg}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={() => handleImageError(s.song_id, s.fallbackImg)}
                  />
                  <div className="absolute inset-0 bg-black/10 dark:bg-black/30 group-hover:bg-transparent transition-colors" />
                  
                  {/* Small Play Center Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg">
                      <Play size={16} fill="black" className="ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Metadata Info */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-0.5">
                    {s.tag}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                    {s.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5 font-medium">
                    {s.artist}
                  </p>
                </div>

                {/* Queue Action Button */}
                <button
                  onClick={(e) => handleQueue(e, s)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-500 hover:!text-black text-cyan-600 dark:text-cyan-400 transition-all border border-slate-200 dark:border-slate-700 flex-shrink-0"
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
