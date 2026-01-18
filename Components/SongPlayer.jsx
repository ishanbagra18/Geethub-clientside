/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import { usePlaylist } from "../src/context/PlaylistContext";
import { Heart, Star, SkipBack, SkipForward, Play, Pause, Volume2, ListPlus, X, Check } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../src/config/api";

const SongPlayer = ({ songId, mode = "random", contextId = null, initialQueue = null }) => {
  const [song, setSong] = useState(null);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);
  const [addSuccess, setAddSuccess] = useState(null);
  const [addError, setAddError] = useState(null);
  const dropdownRef = useRef(null);
  
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

  // Use playlist context
  const { playlists, loading: playlistsLoading } = usePlaylist();

  // Initialize or sync with the song from URL
  useEffect(() => {
    if (currentSong && currentSong.song_id === songId) {
      setSong(currentSong);
    } else {
      playSong(songId, initialQueue, mode, contextId);
    }
  }, [songId, currentSong, initialQueue, mode, contextId, playSong]);

  // Update local song state when global current song changes
  useEffect(() => {
    if (currentSong) {
      setSong(currentSong);
    }
  }, [currentSong]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPlaylistDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add song to playlist function
  const handleAddToPlaylist = async (playlistId) => {
    if (!song?.song_id) return;
    
    setAddingToPlaylist(playlistId);
    setAddError(null);
    setAddSuccess(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAddError("Please login to add songs to playlist");
        setAddingToPlaylist(null);
        return;
      }

      await axios.post(
        `${API_BASE_URL}/playlist/${playlistId}/addsong`,
        { song_id: song.song_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAddSuccess(playlistId);
      setTimeout(() => {
        setAddSuccess(null);
        setShowPlaylistDropdown(false);
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to add song";
      setAddError(errorMsg);
    } finally {
      setAddingToPlaylist(null);
    }
  };

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

            {/* Like + Save + Add to Playlist */}
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

              {/* Add to Playlist */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:scale-105 transition bg-white/10 hover:bg-white/20"
                >
                  <ListPlus size={18} />
                  <span>Add to Playlist</span>
                </button>

                {/* Playlist Dropdown */}
                {showPlaylistDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <span className="text-sm font-semibold text-white">Add to Playlist</span>
                      <button
                        onClick={() => setShowPlaylistDropdown(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {addError && (
                      <div className="px-4 py-2 text-xs text-red-400 bg-red-500/10">
                        {addError}
                      </div>
                    )}

                    <div className="max-h-60 overflow-y-auto">
                      {playlistsLoading ? (
                        <div className="px-4 py-3 text-gray-400 text-sm">Loading playlists...</div>
                      ) : playlists && playlists.length > 0 ? (
                        playlists.map((playlist) => (
                          <button
                            key={playlist.id}
                            onClick={() => handleAddToPlaylist(playlist.id)}
                            disabled={addingToPlaylist === playlist.id}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition text-left"
                          >
                            {playlist.cover_image ? (
                              <img
                                src={playlist.cover_image}
                                alt={playlist.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <ListPlus size={16} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {playlist.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {playlist.song_ids?.length || 0} songs
                              </p>
                            </div>
                            {addingToPlaylist === playlist.id && (
                              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            )}
                            {addSuccess === playlist.id && (
                              <Check size={18} className="text-green-500" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-400 text-sm">
                          <p>No playlists found</p>
                          <p className="text-xs mt-1">Create a playlist first</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
