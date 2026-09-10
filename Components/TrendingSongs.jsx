import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import { useMusicSections } from "../src/context/MusicSectionsContext";
import { ListPlus, Zap, ChevronLeft, ChevronRight, Play, Flame } from "lucide-react";
import toast from "react-hot-toast";

const PLACEHOLDER = "https://via.placeholder.com/220?text=No+Image";

const TrendingSongs = ({ limitToHome = false }) => {
  const { sections } = useMusicSections();
  const navigate = useNavigate();
  const rowRef = useRef(null);
  const { addToQueue, playSong } = useMusicPlayer();

  const trendingSongs = limitToHome 
    ? (sections.trendingSongs || []).slice(0, 10) 
    : (sections.trendingSongs || []);

  const scroll = (direction) => {
    if (rowRef.current) {
      const amount = 340;
      rowRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  const handlePlay = (song) => {
    const songId = song.song_id || song._id || song.id;
    if (songId) {
      navigate(`/playsong/${songId}`);
    }
  };

  const handleQueue = (e, song) => {
    e.stopPropagation();
    const songId = song.song_id || song._id || song.id;
    if (songId) {
      addToQueue(songId);
      toast.success(`Added "${song.title}" to queue`);
    }
  };

  return (
    <section className="mt-16 px-4 md:px-10 max-w-7xl mx-auto text-white">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-12 rounded-full bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-600 shadow-lg shadow-cyan-500/30" />
          <div>
            <span className="text-cyan-400 text-xs font-extrabold tracking-[0.25em] uppercase flex items-center gap-1 mb-1">
              <Flame size={14} className="text-cyan-400 animate-pulse" /> Hot Right Now
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Trending Songs
            </h2>
          </div>
        </div>

        {limitToHome && (
          <button 
            onClick={() => navigate("/trending")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-cyan-500/30 bg-black/60 backdrop-blur-md text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 hover:border-cyan-400 hover:text-white hover:scale-105 transition-all duration-300 shadow-lg"
          >
            SEE ALL CHARTS
            <span className="text-sm">→</span>
          </button>
        )}
      </div>

      {/* SCROLLER CONTAINER */}
      <div className="relative group">
        {/* Navigation Buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-950/90 border border-cyan-500/40 text-cyan-300 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-cyan-500 hover:text-black hover:scale-110 shadow-2xl backdrop-blur-md"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button
          onClick={() => scroll("right")}
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-950/90 border border-cyan-500/40 text-cyan-300 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-cyan-500 hover:text-black hover:scale-110 shadow-2xl backdrop-blur-md"
        >
          <ChevronRight size={20} />
        </button>

        {/* SONG SCROLLER */}
        <div
          ref={rowRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6 pt-2"
        >
          {trendingSongs.map((song, index) => (
            <div
              key={song.song_id || song._id || index}
              className="group/card relative flex-shrink-0 w-[210px] snap-start"
            >
              {/* Card Container */}
              <div 
                onClick={() => handlePlay(song)}
                className="relative p-3.5 rounded-2xl bg-gray-950/70 border border-gray-800/80 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/60 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1.5 cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
                  <img
                    src={song.image_url || PLACEHOLDER}
                    alt={song.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-108"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER;
                    }}
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover/card:opacity-80 transition-opacity" />
                  
                  {/* Rank Tag */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-black text-cyan-300 border border-cyan-400/30">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Play Trigger Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                    <div className="w-13 h-13 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-2xl shadow-cyan-500/50 transform scale-75 group-hover/card:scale-100 transition-transform">
                      <Play size={22} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>

                  {/* Add to Queue Button */}
                  <button
                    onClick={(e) => handleQueue(e, song)}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-black/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500 hover:text-black transition-all opacity-0 group-hover/card:opacity-100 shadow-md"
                    title="Add to Queue"
                  >
                    <ListPlus size={16} />
                  </button>
                </div>

                {/* Info Section */}
                <div className="mt-3.5">
                  <h3 className="text-sm font-bold text-white truncate group-hover/card:text-cyan-300 transition-colors">
                    {song.title || "Untitled Track"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {song.artist || "Unknown Artist"}
                  </p>

                  {/* Trending Tag */}
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                    <Zap size={11} className="text-cyan-400 fill-cyan-400" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">Trending</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSongs;
``