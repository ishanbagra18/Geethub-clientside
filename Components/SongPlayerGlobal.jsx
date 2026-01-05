/* eslint-disable react/prop-types */
import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import { Heart, Star, SkipBack, SkipForward, Play, Pause, Volume2 } from "lucide-react";

const SongPlayerGlobal = () => {
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

  if (!currentSong) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <p>No song is currently playing</p>
      </div>
    );
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Album Art */}
      <div className="relative mb-8">
        <div className="aspect-square max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={currentSong.image_url || "https://via.placeholder.com/500"}
            alt={currentSong.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Song Info */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{currentSong.title}</h1>
        <p className="text-xl text-gray-400">{currentSong.artist}</p>
        {currentSong.album && (
          <p className="text-sm text-gray-500 mt-1">{currentSong.album}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={(e) => seekTo(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercent}%, #374151 ${progressPercent}%, #374151 100%)`,
          }}
        />
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-8">
        {/* Like Button */}
        <button
          onClick={toggleLike}
          className={`p-3 rounded-full transition-all ${
            isLiked
              ? "text-red-500 bg-red-500/20 hover:bg-red-500/30"
              : "text-gray-400 hover:text-red-500 hover:bg-blue-800/30"
          }`}
          title={isLiked ? "Unlike" : "Like"}
        >
          <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
        </button>

        {/* Previous Button */}
        <button
          onClick={playPrevious}
          className="p-4 rounded-full bg-blue-700/50 text-white hover:bg-blue-600/70 transition-all"
          title="Previous"
        >
          <SkipBack size={28} />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="p-6 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg transform hover:scale-105"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={36} /> : <Play size={36} />}
        </button>

        {/* Next Button */}
        <button
          onClick={playNext}
          className="p-4 rounded-full bg-blue-700/50 text-white hover:bg-blue-600/70 transition-all"
          title="Next"
        >
          <SkipForward size={28} />
        </button>

        {/* Save Button */}
        <button
          onClick={toggleSave}
          className={`p-3 rounded-full transition-all ${
            isSaved
              ? "text-yellow-500 bg-yellow-500/20 hover:bg-yellow-500/30"
              : "text-gray-400 hover:text-yellow-500 hover:bg-blue-800/30"
          }`}
          title={isSaved ? "Unsave" : "Save"}
        >
          <Star size={24} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-center gap-4 max-w-xs mx-auto">
        <Volume2 size={24} className="text-blue-400" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => changeVolume(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-sm text-gray-400 w-12 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* Song Details */}
      {currentSong.info && (
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">About this song</h3>
          <p className="text-gray-400 text-sm">{currentSong.info}</p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 flex justify-center gap-8 text-center">
        {currentSong.likes && (
          <div>
            <p className="text-2xl font-bold text-white">{currentSong.likes.length}</p>
            <p className="text-sm text-gray-400">Likes</p>
          </div>
        )}
        {currentSong.saves && (
          <div>
            <p className="text-2xl font-bold text-white">{currentSong.saves.length}</p>
            <p className="text-sm text-gray-400">Saves</p>
          </div>
        )}
        {currentSong.play_count !== undefined && (
          <div>
            <p className="text-2xl font-bold text-white">{currentSong.play_count}</p>
            <p className="text-sm text-gray-400">Plays</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongPlayerGlobal;
