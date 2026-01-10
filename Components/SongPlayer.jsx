/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import { Heart, Star, SkipBack, SkipForward, Play, Pause, Volume2 } from "lucide-react";

const SongPlayer = ({ songId, mode = "random", contextId = null, initialQueue = null }) => {
  const [song, setSong] = useState(null);
  
  // Use global music player context
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
    playSong,
  } = useMusicPlayer();

  // Initialize or sync with the song from URL
  useEffect(() => {
    if (currentSong && currentSong.song_id === songId) {
      setSong(currentSong);
    } else {
      playSong(songId, initialQueue, mode, contextId);
    }
  }, [songId]);

  // Update local song state when global current song changes
  useEffect(() => {
    if (currentSong) {
      setSong(currentSong);
    }
  }, [currentSong]);

  const formatTime = (t = 0) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!song) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
        Loading song...
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto p-6 mt-3">
      <div className="relative rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* GIF Background filler for empty space */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img src="https://i.pinimg.com/originals/fb/76/a2/fb76a2a20ba498c2867f018fe12caa40.gif" alt="" className="w-full h-full object-cover" />
        </div>

        <div className="absolute -inset-1 bg-gradient-to-br from-blue-600/30 to-blue-800/20 blur-3xl opacity-40 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-6 items-center">
          {/* Album Art */}
          <div className="flex items-center justify-center">
            <div className="h-[350px] w-[350px] p-1 shadow-xl flex items-center justify-center rounded-lg bg-white/5">
              <img
                src={song.image_url}
                alt="cover"
                className="w-[350px] h-[350px] object-cover rounded-sm block"
                style={{ width: 350, height: 350, objectFit: "cover" }}
              />
            </div>
          </div>

          {/* Song Info */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  {song.title}
                </h2>
                <p className="text-gray-300">
                  {song.artist} 
                </p>
              </div>
              {/* GIF Visualizer in the empty space of the header */}
              {isPlaying && (
                <img 
                  src="https://i.pinimg.com/originals/fb/76/a2/fb76a2a20ba498c2867f018fe12caa40.gif" 
                  alt="visualizer" 
                  className="h-12 w-24 object-cover rounded opacity-80"
                />
              )}
            </div>

            {/* Like + Save */}
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={toggleLike}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:scale-105 transition"
              >
                <Heart
                  size={18}
                  color={isLiked ? "#ef4444" : "white"}
                  fill={isLiked ? "#ef4444" : "transparent"}
                />
                <span>{song.likes?.length || 0}</span>
              </button>

              <button
                onClick={toggleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:scale-105 transition"
              >
                <Star
                  size={18}
                  color={isSaved ? "#facc15" : "white"}
                  fill={isSaved ? "#facc15" : "transparent"}
                />
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Prev / Play / Next */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={playPrevious}
                  className="p-3 rounded-full bg-white/6 hover:bg-white/10"
                >
                  <SkipBack size={22} />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-500 shadow-lg hover:scale-105"
                >
                  {isPlaying ? <Pause size={26} /> : <Play size={26} />}
                </button>

                <button
                  onClick={playNext}
                  className="p-3 rounded-full bg-white/6 hover:bg-white/10"
                >
                  <SkipForward size={22} />
                </button>
              </div>

              {/* Seek Slider */}
              <div className="px-3">
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-300 w-12 text-right">
                    {formatTime(currentTime)}
                  </div>

                  <div className="flex-1">
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.01}
                      value={currentTime}
                      onChange={(e) => seekTo(parseFloat(e.target.value))}
                      className="w-full h-2 appearance-none bg-white/10 rounded-lg"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPct}%, rgba(255,255,255,0.1) ${progressPct}%, rgba(255,255,255,0.1) 100%)`,
                      }}
                      aria-label="Seek"
                    />
                  </div>

                  <div className="text-xs text-gray-300 w-12">
                    {formatTime(duration)}
                  </div>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 px-3">
                <div className="flex items-center gap-2 text-gray-200">
                  <Volume2 size={16} />
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  className="w-48 h-2 appearance-none bg-white/10 rounded-lg"
                  aria-label="Volume"
                />
                <div className="text-xs text-gray-300 w-10 text-right">
                  {Math.round(volume * 100)}%
                </div>
                {/* Visualizer GIF at the end of volume bar */}
                <img 
                  src="https://i.pinimg.com/originals/fb/76/a2/fb76a2a20ba498c2867f018fe12caa40.gif" 
                  alt="" 
                  className="h-6 w-12 mix-blend-screen opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongPlayer;
