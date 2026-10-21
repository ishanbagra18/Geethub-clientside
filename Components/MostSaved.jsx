// Mostsaved.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import { useMusicSections } from "../src/context/MusicSectionsContext";
import { ListPlus, Bookmark, ChevronLeft, ChevronRight, Play, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const PLACEHOLDER = "https://via.placeholder.com/220?text=No+Image";

const Mostsaved = ({ limitToHome = false }) => {
  const { sections, loading } = useMusicSections();
  const navigate = useNavigate();
  const rowRef = useRef(null);
  const { addToQueue } = useMusicPlayer();

  // Get songs from context and limit if on homepage
  const mostsaved = limitToHome ? (sections.mostSaved || []).slice(0, 10) : (sections.mostSaved || []);

  const scrollByAmount = (direction) => {
    if (!rowRef.current) return;
    const amount = 340;
    rowRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handlePlay = (songId) => {
    if (songId) navigate(`/playsong/${songId}`);
  };

  const handleQueue = (e, song) => {
    e.stopPropagation();
    const songId = song.song_id || song._id || song.id;
    if (songId) {
      addToQueue(songId);
      toast.success(`Added "${song.title}" to queue`);
    }
  };

  const getSavedCount = (saves) => {
    if (Array.isArray(saves)) return saves.length;
    if (typeof saves === "number") return saves;
    return 0;
  };

  return (
    <section className="mt-16 px-4 md:px-10 max-w-[1600px] mx-auto text-slate-900 dark:text-white font-sans">
      {/* HEADER ROW */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-12 rounded-full bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30" />
          <div>
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-extrabold tracking-[0.25em] uppercase flex items-center gap-1 mb-1">
              <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400 animate-pulse" /> Your Collection
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              Most Saved Songs
            </h2>
          </div>
        </div>

        {limitToHome && (
          <button
            onClick={() => navigate("/mostsaved")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 dark:border-emerald-500/30 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/70 backdrop-blur-md text-emerald-600 dark:text-emerald-300 text-xs font-bold hover:dark:bg-emerald-500/20 hover:border-emerald-400 hover:text-white hover:scale-105 transition-all duration-300 shadow-sm"
          >
            MORE IN MOST SAVED
            <span className="text-sm">→</span>
          </button>
        )}
      </div>

      {/* SCROLLER SHELL */}
      <div className="relative group">
        {/* Navigation Buttons */}
        <button
          onClick={() => scrollByAmount("left")}
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-emerald-500/40 text-slate-700 dark:text-emerald-300 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-emerald-600 hover:!text-white hover:scale-110 shadow-xl backdrop-blur-md"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => scrollByAmount("right")}
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-emerald-500/40 text-slate-700 dark:text-emerald-300 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-emerald-600 hover:!text-white hover:scale-110 shadow-xl backdrop-blur-md"
        >
          <ChevronRight size={20} />
        </button>

        {/* CAROUSEL TRACK */}
        <div
          ref={rowRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide hide-scrollbar no-scrollbar snap-x snap-mandatory pb-6 pt-2 transform-gpu"
        >
          {mostsaved.map((song, index) => {
            const songId = song.song_id || song._id || song.id;
            const savedCount = getSavedCount(song.saved || song.saves);

            return (
              <div
                key={songId || index}
                className="group/card relative flex-shrink-0 w-[210px] snap-start"
              >
                <div
                  onClick={() => handlePlay(songId)}
                  className="relative p-3.5 rounded-2xl bg-white dark:bg-gray-950/70 border border-slate-200 dark:border-gray-800/80 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/60 shadow-sm hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1.5 cursor-pointer"
                >
                  {/* Artwork Container */}
                  <div className="relative w-full h-[180px] aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 flex-shrink-0">
                    <img
                      src={song.image_url || PLACEHOLDER}
                      alt={song.title || "Cover"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-108"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER;
                      }}
                    />

                    {/* Gradient Overlay (Only on Hover for Play Button) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/card:opacity-70 transition-opacity pointer-events-none" />

                    {/* Play Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 !text-white shadow-2xl shadow-emerald-500/60 border border-white/20 transform scale-75 group-hover/card:scale-100 hover:!scale-110 active:scale-95 transition-all duration-300">
                        <Play size={22} fill="currentColor" className="ml-1 !text-white" />
                      </div>
                    </div>

                    {/* Add to Queue Button */}
                    <button
                      onClick={(e) => handleQueue(e, song)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-black/80 backdrop-blur-md border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600 hover:!text-white transition-all opacity-0 group-hover/card:opacity-100 shadow-md"
                      title="Add to Queue"
                    >
                      <ListPlus size={16} />
                    </button>
                  </div>

                  {/* Song Metadata */}
                  <div className="mt-3.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-300 transition-colors">
                      {song.title || "Untitled"}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 truncate">
                      {song.artist || "Unknown Artist"}
                    </p>

                    {/* Saved Counter Badge */}
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      <Bookmark size={11} className="text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        {savedCount} {savedCount === 1 ? "Save" : "Saves"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {mostsaved.length === 0 && (
          <p className="mt-4 text-sm text-slate-500 dark:text-gray-500">
            No saved songs to display yet. Explore and save your favorite tracks!
          </p>
        )}
      </div>
    </section>
  );
};

export default Mostsaved;
