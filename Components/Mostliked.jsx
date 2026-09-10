import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import { useMusicSections } from "../src/context/MusicSectionsContext";
import { ListPlus, Heart, ChevronLeft, ChevronRight, Play, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const PLACEHOLDER = "https://via.placeholder.com/220?text=No+Image";

const Mostliked = ({ limitToHome = false }) => {
  const { sections } = useMusicSections();
  const navigate = useNavigate();
  const rowRef = useRef(null);
  const { addToQueue } = useMusicPlayer();

  const mostliked = limitToHome
    ? (sections.mostLiked || []).slice(0, 10)
    : (sections.mostLiked || []);

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

  const getLikesCount = (likes) => {
    if (Array.isArray(likes)) return likes.length;
    if (typeof likes === "number") return likes;
    return 0;
  };

  return (
    <section className="mt-16 px-4 md:px-10 max-w-[1600px] mx-auto text-white">
      {/* HEADER ROW */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-12 rounded-full bg-gradient-to-b from-rose-500 via-pink-500 to-red-500 shadow-lg shadow-rose-500/30" />
          <div>
            <span className="text-rose-400 text-xs font-extrabold tracking-[0.25em] uppercase flex items-center gap-1 mb-1">
              <Sparkles size={14} className="text-rose-400 animate-pulse" /> Community Choice
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Most Liked Songs
            </h2>
          </div>
        </div>

        {limitToHome && (
          <button
            onClick={() => navigate("/mostliked")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-rose-500/30 bg-slate-950/70 backdrop-blur-md text-rose-300 text-xs font-bold hover:bg-rose-500/20 hover:border-rose-400 hover:text-white hover:scale-105 transition-all duration-300 shadow-lg"
          >
            MORE IN MOST LIKED
            <span className="text-sm">→</span>
          </button>
        )}
      </div>

      {/* SCROLLER SHELL */}
      <div className="relative group">
        {/* Navigation Buttons */}
        <button
          onClick={() => scrollByAmount("left")}
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-950/90 border border-rose-500/40 text-rose-300 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-600 hover:text-white hover:scale-110 shadow-2xl backdrop-blur-md"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => scrollByAmount("right")}
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-950/90 border border-rose-500/40 text-rose-300 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-600 hover:text-white hover:scale-110 shadow-2xl backdrop-blur-md"
        >
          <ChevronRight size={20} />
        </button>

        {/* CAROUSEL TRACK */}
        <div
          ref={rowRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide hide-scrollbar no-scrollbar snap-x snap-mandatory pb-6 pt-2 transform-gpu"
        >
          {mostliked.map((song, index) => {
            const songId = song.song_id || song._id || song.id;
            const likesCount = getLikesCount(song.likes);

            return (
              <div
                key={songId || index}
                className="group/card relative flex-shrink-0 w-[210px] snap-start"
              >
                <div
                  onClick={() => handlePlay(songId)}
                  className="relative p-3.5 rounded-2xl bg-gray-950/70 border border-gray-800/80 backdrop-blur-xl transition-all duration-300 hover:border-rose-500/60 hover:shadow-2xl hover:shadow-rose-500/20 hover:-translate-y-1.5 cursor-pointer"
                >
                  {/* Artwork Container */}
                  <div className="relative w-full h-[180px] aspect-square rounded-xl overflow-hidden bg-gray-900 border border-gray-800 flex-shrink-0">
                    <img
                      src={song.image_url || PLACEHOLDER}
                      alt={song.title || "Cover"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-108"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER;
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover/card:opacity-80 transition-opacity" />

                    {/* Play Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                      <div className="w-13 h-13 flex items-center justify-center rounded-full bg-gradient-to-br from-rose-600 to-pink-500 text-white shadow-2xl shadow-rose-500/50 transform scale-75 group-hover/card:scale-100 transition-transform">
                        <Play size={22} fill="currentColor" className="ml-0.5" />
                      </div>
                    </div>

                    {/* Add to Queue Button */}
                    <button
                      onClick={(e) => handleQueue(e, song)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-black/80 backdrop-blur-md border border-rose-500/40 text-rose-300 hover:bg-rose-600 hover:text-white transition-all opacity-0 group-hover/card:opacity-100 shadow-md"
                      title="Add to Queue"
                    >
                      <ListPlus size={16} />
                    </button>
                  </div>

                  {/* Song Metadata */}
                  <div className="mt-3.5">
                    <h3 className="text-sm font-bold text-white truncate group-hover/card:text-rose-300 transition-colors">
                      {song.title || "Untitled"}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {song.artist || "Unknown Artist"}
                    </p>

                    {/* Like Counter Badge */}
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30">
                      <Heart size={11} className="text-rose-500 fill-rose-500" />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300">
                        {likesCount} {likesCount === 1 ? "Like" : "Likes"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {mostliked.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">
            No liked songs to display yet. Start exploring and liking tracks!
          </p>
        )}
      </div>
    </section>
  );
};

export default Mostliked;
