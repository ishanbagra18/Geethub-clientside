import React from "react";
import { useNavigate } from "react-router-dom";
import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import { useMusicSections } from "../src/context/MusicSectionsContext";
import { ListPlus, Play, Crown } from "lucide-react";

const PLACEHOLDER = "https://via.placeholder.com/400?text=No+Cover";

const Topcharts = ({ limitToHome = false }) => {
  const { sections, loading } = useMusicSections();
  const navigate = useNavigate();
  const { addToQueue } = useMusicPlayer();

  const recentSongs = limitToHome
    ? (sections.topCharts || []).slice(0, 7)
    : sections.topCharts || [];

  const topSong = recentSongs[0];
  const restSongs = recentSongs.slice(1);

  return (
    <div className="mt-12 md:mt-20 px-4 md:px-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Top Charts
          </h2>
          <p className="text-zinc-400 mt-2 text-sm md:text-base">The most played tracks right now.</p>
        </div>
        {limitToHome && (
          <button
            onClick={() => navigate("/topcharts")}
            className="hidden md:block px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all"
          >
            View Full Chart
          </button>
        )}
      </div>

      {loading.topCharts ? (
        <div className="animate-pulse h-[400px] bg-zinc-900 rounded-3xl w-full"></div>
      ) : recentSongs.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 bg-zinc-900/20 rounded-3xl">
          No chart data available.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT: THE #1 SPOTLIGHT (HERO) */}
          {topSong && (
            <div 
              onClick={() => navigate(`/playsong/${topSong.song_id}`)}
              className="lg:col-span-5 relative group cursor-pointer rounded-[2rem] overflow-hidden bg-zinc-900 shadow-2xl aspect-square md:aspect-auto md:min-h-[450px]"
            >
              {/* Blurred Background Effect */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-1000 blur-2xl"
                style={{ backgroundImage: `url(${topSong.image_url || PLACEHOLDER})` }}
              ></div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

              {/* Content */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10">
                {/* Crown Badge */}
                <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 backdrop-blur-md w-max px-4 py-2 rounded-full shadow-lg">
                  <Crown size={18} fill="currentColor" />
                  <span className="font-bold text-sm tracking-wide uppercase">#1 on Chart</span>
                </div>

                <div>
                  {/* Hero Cover Art */}
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-2xl mb-6 border border-white/10 group-hover:-translate-y-2 transition-transform duration-500">
                    <img 
                      src={topSong.image_url || PLACEHOLDER} 
                      alt={topSong.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => { if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER; }}
                    />
                  </div>

                  <h3 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2 line-clamp-2">
                    {topSong.title || "Untitled"}
                  </h3>
                  <p className="text-zinc-300 text-lg">{topSong.artist || "Unknown Artist"}</p>

                  <div className="mt-6 flex items-center gap-4">
                    <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-black hover:scale-105 transition-transform">
                      <Play fill="currentColor" size={20} className="ml-1" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToQueue(topSong.song_id); }}
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
                      title="Add to Queue"
                    >
                      <ListPlus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT: THE UNDERDOGS (RANKS 2-10) */}
          <div className="lg:col-span-7 flex flex-col gap-2 overflow-y-auto max-h-[450px] hide-scrollbar pr-2">
            {restSongs.map((song, index) => (
              <div 
                key={song.song_id}
                onClick={() => navigate(`/playsong/${song.song_id}`)}
                className="group flex items-center justify-between p-3 md:p-4 rounded-2xl hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700/50 transition-all duration-300 cursor-pointer bg-zinc-900/30"
              >
                <div className="flex items-center gap-4 md:gap-6 w-full">
                  {/* Rank Number */}
                  <span className="text-xl md:text-2xl font-bold text-zinc-500 w-6 text-center">
                    {index + 2}
                  </span>

                  {/* Image */}
                  <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={song.image_url || PLACEHOLDER} 
                      alt={song.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER; }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play fill="white" size={20} className="ml-1 text-white" />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base md:text-lg font-bold text-zinc-100 truncate group-hover:text-white transition-colors">
                      {song.title || "Untitled"}
                    </h4>
                    <p className="text-sm text-zinc-400 truncate">
                      {song.artist || "Unknown Artist"}
                    </p>
                  </div>

                  {/* Action */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToQueue(song.song_id); }}
                    className="opacity-100 lg:opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full transition-all"
                  >
                    <ListPlus size={20} />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Mobile "View All" Button */}
            {limitToHome && (
              <button
                onClick={() => navigate("/topcharts")}
                className="md:hidden mt-4 w-full py-4 rounded-2xl bg-zinc-900 text-white text-sm font-semibold border border-zinc-800"
              >
                View Full Chart
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Topcharts;