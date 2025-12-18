/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import axios from "axios";
import { Heart, Star, SkipBack, SkipForward, Play, Pause, Volume2 } from "lucide-react";

const SongPlayer = ({ songId, mode = "random", contextId = null, initialQueue = null }) => {
  const playerRef = useRef(null);
  const [song, setSong] = useState(null);
  const [queue, setQueue] = useState([]); // array of songs
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(() => {
    // load saved volume or default to 1
    const v = localStorage.getItem("player_volume");
    return v !== null ? Number(v) : 1;
  });

  // ---------------- USER ID FROM TOKEN ----------------
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.Uid || payload.uid || payload.id;
    } catch {
      return null;
    }
  };

  // ---------------- FETCH SONG ----------------
  useEffect(() => {
    const uid = getUserIdFromToken();
    setCurrentUser(uid);

    const fetchSong = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:9000/song/${songId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const s = res.data.song;
        setSong(s);

        if (uid) {
          setIsLiked(Boolean(s.likes?.includes(uid)));
          setIsSaved(Boolean(s.saves?.includes(uid)));
        }
      } catch (err) {
        console.error("Error fetching song:", err);
      }
    };

    fetchSong();
  }, [songId]);

  // ---------------- BUILD QUEUE ----------------
  useEffect(() => {
    let cancelled = false;

    const buildQueue = async () => {
      if (initialQueue && initialQueue.length) {
        setQueue(initialQueue);
        const idx = initialQueue.findIndex((s) => s.song_id === songId);
        setCurrentIndex(idx >= 0 ? idx : 0);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:9000/music/allsongs", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        let songs = res.data.songs || [];

        if (mode === "artist" && contextId) {
          songs = songs.filter((s) => (s.artist || "").toLowerCase() === String(contextId).toLowerCase());
        }

        const shuffle = (arr) => {
          const a = arr.slice();
          for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
          }
          return a;
        };

        let q = shuffle(songs);

        const existing = q.findIndex((s) => s.song_id === songId);
        if (existing === -1) {
          const curRes = await axios.get(`http://localhost:9000/song/${songId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          q.unshift(curRes.data.song);
          setCurrentIndex(0);
        } else {
          setCurrentIndex(existing);
        }

        if (!cancelled) setQueue(q);
      } catch (err) {
        console.error("Error building queue:", err);
      }
    };

    buildQueue();

    return () => {
      cancelled = true;
    };
  }, [songId, initialQueue, mode, contextId]);

  // ---------------- PLAY INDEX / NEXT / PREV ----------------
  const playIndex = async (index) => {
    if (!queue || queue.length === 0) return;
    if (index < 0 || index >= queue.length) return;

    const nextSong = queue[index];
    setCurrentIndex(index);
    setSong(nextSong);

    const audio = playerRef.current?.audio?.current;
    if (!audio) return;

    try {
      audio.pause();
      audio.src = nextSong.file_url;
      audio.currentTime = 0;
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn("Autoplay blocked or failed:", err);
      setIsPlaying(false);
    }
  };

  const nextSong = () => {
    if (!queue || queue.length === 0) return;
    const nextIdx = (currentIndex + 1) % queue.length;
    playIndex(nextIdx);
  };

  const prevSong = () => {
    if (!queue || queue.length === 0) return;
    const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
    playIndex(prevIdx);
  };

  // ---------------- LIKE ----------------

  const handleLike = async () => {
    if (!song || !song.song_id) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:9000/music/like/${song.song_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsLiked((prev) => !prev);
      setSong((prev) => {
        if (!prev) return prev;
        const likes = prev.likes || [];
        return isLiked
          ? { ...prev, likes: likes.filter((id) => id !== currentUser) }
          : { ...prev, likes: [...likes, currentUser] };
      });
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // ---------------- SAVE ----------------

  const handleSave = async () => {
    if (!song || !song.song_id) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:9000/music/save/${song.song_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSaved((prev) => !prev);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // ---------------- NATIVE AUDIO LISTENERS ----------------
  useEffect(() => {
    const audio = playerRef.current?.audio?.current;
    if (!audio) return;

    audio.volume = volume;

    const onTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime || 0);
      }
      if (audio.duration > 0) {
        setDuration(audio.duration);
        setProgressPct(((audio.currentTime || 0) / audio.duration) * 100);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setCurrentTime(audio.currentTime || 0);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (!queue || queue.length === 0) {
        setIsPlaying(false);
        return;
      }

      setCurrentIndex((ci) => {
        const nextIdx = (ci + 1) % queue.length;
        const next = queue[nextIdx];
        if (next) {
          setSong(next);
          const audio2 = playerRef.current?.audio?.current;
          if (audio2) {
            try {
              audio2.pause();
              audio2.src = next.file_url;
              audio2.play().catch(() => {});
              setIsPlaying(true);
            } catch (e) {
              console.warn("Auto-play prevented", e);
            }
          }
        }
        return nextIdx;
      });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    onLoadedMetadata();
    onTimeUpdate();

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [song?.file_url, volume, isSeeking, queue]);

  // ---------------- SEEK HANDLERS ----------------
  const handleSeekChange = (e) => {
    const audio = playerRef.current?.audio?.current;
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (!audio) return;
    audio.currentTime = val;
  };

  const handleSeekMouseDown = () => setIsSeeking(true);
  const handleSeekMouseUp = (e) => {
    const audio = playerRef.current?.audio?.current;
    const val = Number(e.target.value);
    if (audio) {
      audio.currentTime = val;
    }
    setIsSeeking(false);
  };

  // ---------------- VOLUME ----------------
  useEffect(() => {
    const audio = playerRef.current?.audio?.current;
    if (!audio) return;
    audio.volume = volume;
    localStorage.setItem("player_volume", String(volume));
  }, [volume]);

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
  };

  // ---------------- PLAY / PAUSE ----------------
  const togglePlayPause = () => {
    const audio = playerRef.current?.audio?.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

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

        <div className="absolute -inset-1 bg-gradient-to-br from-purple-600/30 to-indigo-700/20 blur-3xl opacity-40 pointer-events-none" />

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
                  {song.artist} • <span className="text-purple-300">{song.genre}</span>
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
                onClick={handleLike}
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
                onClick={handleSave}
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
                  onClick={prevSong}
                  className="p-3 rounded-full bg-white/6 hover:bg-white/10"
                >
                  <SkipBack size={22} />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg hover:scale-105"
                >
                  {isPlaying ? <Pause size={26} /> : <Play size={26} />}
                </button>

                <button
                  onClick={nextSong}
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
                      onChange={handleSeekChange}
                      onMouseDown={handleSeekMouseDown}
                      onMouseUp={handleSeekMouseUp}
                      onTouchStart={handleSeekMouseDown}
                      onTouchEnd={handleSeekMouseUp}
                      className="w-full h-2 appearance-none bg-white/10 rounded-lg"
                      aria-label="Seek"
                    />
                    <div
                      aria-hidden
                      className="h-0.5 mt-[-8px] rounded-full pointer-events-none"
                      style={{
                        width: `${progressPct}%`,
                      }}
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
                  onChange={handleVolumeChange}
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

              <AudioPlayer
                ref={playerRef}
                src={song.file_url}
                autoPlay={false}
                showJumpControls={false}
                showDownloadProgress={false}
                customAdditionalControls={[]}
                customVolumeControls={[]}
                listenInterval={500}
                autoPlayAfterSrcChange={false}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatTime = (t = 0) => {
  if (!t || isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export default SongPlayer;