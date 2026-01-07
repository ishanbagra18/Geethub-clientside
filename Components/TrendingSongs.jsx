import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import { useMusicSections } from "../src/context/MusicSectionsContext";
import { ListPlus, Zap, ChevronLeft, ChevronRight, Play } from "lucide-react";

const PLACEHOLDER = "https://via.placeholder.com/220?text=No+Image";

const TrendingSongs = ({ limitToHome = false }) => {
  const { sections } = useMusicSections();
  const navigate = useNavigate();
  const rowRef = useRef(null);
  const { addToQueue } = useMusicPlayer();

  const trendingSongs = limitToHome 
    ? (sections.trendingSongs || []).slice(0, 10) 
    : (sections.trendingSongs || []);

  const scroll = (direction) => {
    if (rowRef.current) {
      const amount = 300;
      rowRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="mt-20 px-8 text-white bg-black">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-1 h-12 rounded-full bg-gradient-to-b from-blue-500 via-blue-600 to-cyan-500" />
          <div>
            <span className="text-blue-400/70 text-[10px] font-semibold tracking-[0.25em] uppercase block mb-1">
              🔥 Hot Right Now
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-white">
              Trending Songs
            </h2>
          </div>
        </div>

        {limitToHome && (
          <button 
            onClick={() => navigate("/trending")}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-black/50 backdrop-blur-sm text-blue-400 text-sm font-semibold hover:bg-blue-500/10 hover:border-blue-400 hover:scale-105 transition-all duration-300"
          >
            See All
            <span className="text-base">→</span>
          </button>
        )}
      </div>

      {/* SCROLLER CONTAINER */}
      <div className="relative group">
        {/* Navigation Buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/95 border border-blue-500/40 text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 shadow-xl"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/95 border border-blue-500/40 text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-110 shadow-xl"
        >
          <ChevronRight size={20} />
        </button>

        {/* SONG GRID/SCROLLER */}
        <div
          ref={rowRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 pt-2"
        >
          {trendingSongs.map((song) => (
            <div
              key={song.song_id || song._id}
              className="group relative flex-shrink-0 w-[220px] snap-start"
            >
              {/* Card Container */}
              <div className="relative p-3 rounded-2xl bg-black/60 border border-gray-800/50 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1">
                {/* Image Card */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-black/80">
                  <img
                    src={song.image_url || PLACEHOLDER}
                    alt={song.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
                  
                  {/* Hover Play Button */}
                  <div 
                    onClick={() => navigate(`/playsong/${song.song_id || song._id}`)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-2xl shadow-blue-500/50 transform scale-75 group-hover:scale-100 transition-transform">
                      <Play size={24} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>

                  {/* Add to Queue Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(song.song_id || song._id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-black/80 backdrop-blur-md border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-400 transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    <ListPlus size={16} />
                  </button>
                </div>

                {/* Info Section */}
                <div className="mt-3">
                  <h3 className="text-sm font-bold text-gray-100 truncate group-hover:text-blue-400 transition-colors cursor-pointer"
                      onClick={() => navigate(`/playsong/${song.song_id || song._id}`)}>
                    {song.title || "Untitled"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    <span className="text-blue-400/80">{song.artist || "Unknown Artist"}</span>
                  </p>

                  {/* Trending Badge */}
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">
                    <Zap size={11} className="text-blue-400 fill-blue-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-blue-400">Trending</span>
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