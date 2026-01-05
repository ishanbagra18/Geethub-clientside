/* eslint-disable react/prop-types */
import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import { Heart, Star, SkipBack, SkipForward, Play, Pause, Volume2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const GlobalMusicPlayer = () => {
  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    isLiked,
    isSaved,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    changeVolume,
    toggleLike,
    toggleSave,
  } = useMusicPlayer();

  const navigate = useNavigate();
  const location = useLocation();

  // Don't render if no song is playing
  if (!currentSong) return null;

  // Hide global player on /playsong/:id page
  if (location.pathname.startsWith('/playsong/')) return null;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-950/95 via-blue-900/95 to-indigo-950/95 backdrop-blur-lg border-t border-blue-500/40 shadow-2xl z-50">
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        {/* Progress Bar */}
        <div className="mb-2">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seekTo(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercent}%, #374151 ${progressPercent}%, #374151 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Song Info */}
          <div
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer hover:bg-blue-800/30 p-2 rounded-lg transition-colors"
            onClick={() => navigate(`/playsong/${currentSong.song_id}`)}
          >
            <img
              src={currentSong.image_url || "https://via.placeholder.com/50"}
              alt={currentSong.title}
              className="w-12 h-12 rounded-md object-cover shadow-lg"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold text-sm truncate">{currentSong.title}</h3>
              <p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-3">
            {/* Like Button */}
            <button
              onClick={toggleLike}
              className={`p-2 rounded-full transition-all ${
                isLiked
                  ? "text-red-500 bg-red-500/20 hover:bg-red-500/30"
                  : "text-gray-300 hover:text-red-500 hover:bg-blue-700/30"
              }`}
              title={isLiked ? "Unlike" : "Like"}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            </button>

            {/* Previous Button */}
            <button
              onClick={playPrevious}
              className="p-2 rounded-full bg-blue-700/50 text-white hover:bg-blue-600/70 transition-all"
              title="Previous"
            >
              <SkipBack size={20} />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="p-3 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/30"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            {/* Next Button */}
            <button
              onClick={playNext}
              className="p-2 rounded-full bg-blue-700/50 text-white hover:bg-blue-600/70 transition-all"
              title="Next"
            >
              <SkipForward size={20} />
            </button>

            {/* Save Button */}
            <button
              onClick={toggleSave}
              className={`p-2 rounded-full transition-all ${
                isSaved
                  ? "text-yellow-500 bg-yellow-500/20 hover:bg-yellow-500/30"
                  : "text-gray-300 hover:text-yellow-500 hover:bg-blue-700/30"
              }`}
              title={isSaved ? "Unsave" : "Save"}
            >
              <Star size={18} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <Volume2 size={18} className="text-blue-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalMusicPlayer;
