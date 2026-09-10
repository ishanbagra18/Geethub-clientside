/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import API_BASE_URL from '../config/api';

const MusicPlayerContext = createContext();

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  }
  return context;
};

export const MusicPlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  const isLoadingRef = useRef(false);
  const currentSongIdRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const v = localStorage.getItem("player_volume");
    return v !== null ? Number(v) : 1;
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ⚙️ Settings & Theme State
  const [repeatMode, setRepeatModeState] = useState(() => {
    return localStorage.getItem("app_repeat_mode") || "off";
  });
  const [isShuffle, setIsShuffleState] = useState(() => {
    return localStorage.getItem("app_shuffle_mode") === "true";
  });
  const [autoPlay, setAutoPlayState] = useState(() => {
    const saved = localStorage.getItem("app_autoplay");
    return saved !== null ? saved === "true" : true;
  });
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("app_theme") || "dark";
  });

  const setRepeatMode = (mode) => {
    setRepeatModeState(mode);
    localStorage.setItem("app_repeat_mode", mode);
    const labels = { off: "Repeat Off", all: "Repeat Queue All", one: "Repeat Track One 🔂" };
    toast.success(labels[mode] || `Repeat Mode: ${mode}`);
  };

  const setIsShuffle = (val) => {
    const newVal = typeof val === "function" ? val(isShuffle) : val;
    setIsShuffleState(newVal);
    localStorage.setItem("app_shuffle_mode", String(newVal));
    toast.success(newVal ? "Shuffle Mode ON 🔀" : "Shuffle Mode OFF");
  };

  const setAutoPlay = (val) => {
    const newVal = typeof val === "function" ? val(autoPlay) : val;
    setAutoPlayState(newVal);
    localStorage.setItem("app_autoplay", String(newVal));
    toast.success(newVal ? "Autoplay ON ▶️" : "Autoplay OFF ⏸️");
  };

  const setTheme = (newTheme) => {
    const validTheme = newTheme === "light" ? "light" : "dark";
    setThemeState(validTheme);
    localStorage.setItem("app_theme", validTheme);
    document.documentElement.setAttribute("data-theme", validTheme);
    if (validTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.success(`Theme set to ${validTheme.toUpperCase()} Mode`);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // ⚡ Playback Speed State
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // ⏰ Sleep Timer State
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null);
  const sleepTimerTimeoutRef = useRef(null);

  // Get user ID from token
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

  // Initialize user
  useEffect(() => {
    const uid = getUserIdFromToken();
    setCurrentUser(uid);
  }, []);

  // Update liked/saved status when song changes
  useEffect(() => {
    if (currentSong && currentUser) {
      setIsLiked(Boolean(currentSong.likes?.includes(currentUser)));
      setIsSaved(Boolean(currentSong.saves?.includes(currentUser)));
    }
  }, [currentSong, currentUser]);

  // Calculate similarity/relatedness score between current song and candidate song
  const calculateSongRelatedness = (currentSong, candidateSong) => {
    if (!currentSong || !candidateSong) return 0;
    if (currentSong.song_id === candidateSong.song_id) return -1;

    let score = 0;

    const currentGenre = (currentSong.genre || "").toLowerCase().trim();
    const candidateGenre = (candidateSong.genre || "").toLowerCase().trim();

    // 1. Genre matching (highest priority - Party songs match Party songs)
    if (currentGenre && candidateGenre) {
      if (currentGenre === candidateGenre) {
        score += 100;
      } else {
        const currentWords = currentGenre.split(/[\s/,-]+/);
        const candidateWords = candidateGenre.split(/[\s/,-]+/);
        const hasGenreOverlap = currentWords.some((w) => w.length > 2 && candidateWords.includes(w));
        if (hasGenreOverlap) {
          score += 75;
        }
      }
    }

    // 2. Language matching
    const currentLang = (currentSong.language || "").toLowerCase().trim();
    const candidateLang = (candidateSong.language || "").toLowerCase().trim();
    if (currentLang && candidateLang && currentLang === candidateLang) {
      score += 30;
    }

    // 3. Artist matching
    const currentArtist = (currentSong.artist || "").toLowerCase().trim();
    const candidateArtist = (candidateSong.artist || "").toLowerCase().trim();
    if (currentArtist && candidateArtist && (currentArtist.includes(candidateArtist) || candidateArtist.includes(currentArtist))) {
      score += 40;
    }

    return score;
  };

  // Sort queue by relatedness to active song (Genre -> Language -> Artist)
  const sortQueueByRelatedness = (activeSong, songList) => {
    if (!activeSong || !songList || songList.length === 0) return songList || [];

    const otherSongs = songList.filter((s) => s.song_id !== activeSong.song_id);

    const scored = otherSongs.map((s) => ({
      song: s,
      score: calculateSongRelatedness(activeSong, s),
    }));

    // Group songs by score bucket
    const buckets = {};
    scored.forEach((item) => {
      if (!buckets[item.score]) buckets[item.score] = [];
      buckets[item.score].push(item.song);
    });

    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const sortedQueue = [activeSong];
    Object.keys(buckets)
      .map(Number)
      .sort((a, b) => b - a)
      .forEach((score) => {
        sortedQueue.push(...shuffle(buckets[score]));
      });

    return sortedQueue;
  };

  // Play next song - defined early so it can be used in useEffect
  const playNext = () => {
    if (!queue || queue.length === 0) return;
    const nextIdx = (currentIndex + 1) % queue.length;
    const nextSong = queue[nextIdx];
    if (!nextSong) return;
    
    setCurrentIndex(nextIdx);
    setCurrentSong(nextSong);

    // Update URL if on playsong page
    if (location.pathname.startsWith('/playsong/')) {
      navigate(`/playsong/${nextSong.song_id}`, { replace: true });
    }

    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.src = nextSong.file_url;
    audio.currentTime = 0;
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((err) => {
      console.warn("Autoplay blocked or failed:", err);
      setIsPlaying(false);
    });
  };

  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);

      if (sleepTimerMinutes === "end") {
        setSleepTimerMinutes(null);
        toast("Sleep Timer: Paused at end of track", { icon: "🌙", duration: 4000 });
        return;
      }

      // Repeat One Track Mode
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().then(() => setIsPlaying(true)).catch(console.warn);
        return;
      }

      // If Autoplay is OFF and repeat is not "all", stop playback immediately when track ends
      if (!autoPlay && repeatMode !== "all") {
        toast("Autoplay OFF: Playback paused at end of track", { icon: "⏸️", duration: 3500 });
        return;
      }

      // Auto-play / Shuffle next track
      if (queue && queue.length > 0) {
        let nextIdx;
        if (isShuffle) {
          nextIdx = Math.floor(Math.random() * queue.length);
        } else {
          nextIdx = (currentIndex + 1) % queue.length;
          if (nextIdx === 0 && repeatMode === "off") {
            toast("Reached end of playlist queue", { icon: "🏁", duration: 3500 });
            return; // Stop at end of queue if repeat is off
          }
        }

        const nextSong = queue[nextIdx];
        if (nextSong) {
          setCurrentIndex(nextIdx);
          setCurrentSong(nextSong);

          if (location.pathname.startsWith('/playsong/')) {
            navigate(`/playsong/${nextSong.song_id}`, { replace: true });
          }

          audio.src = nextSong.file_url;
          audio.currentTime = 0;
          audio.play().then(() => {
            setIsPlaying(true);
            toast(`Autoplay: Playing "${nextSong.title}"`, {
              icon: "🎧",
              duration: 3500,
            });
          }).catch((err) => {
            console.warn("Autoplay blocked:", err);
            setIsPlaying(false);
          });
        }
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [queue, currentIndex, location.pathname, navigate, repeatMode, autoPlay, isShuffle, sleepTimerMinutes]);

  // Play a specific song
  const playSong = async (songIdInput, queueData = null, mode = "random", contextId = null) => {
    const songId = typeof songIdInput === "object" ? (songIdInput?.song_id || songIdInput?._id || songIdInput?.id) : songIdInput;
    if (!songId) return;

    // Prevent loading the same song if already loading or currently playing
    if (isLoadingRef.current || (currentSongIdRef.current === songId && isPlaying)) {
      return;
    }
    
    isLoadingRef.current = true;
    currentSongIdRef.current = songId;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/song/${songId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const song = res.data.song;
      setCurrentSong(song);

      // Build queue automatically sorted by relatedness (Same Genre / Party / Language / Artist)
      let newQueue = [];
      if (queueData && queueData.length > 1) {
        newQueue = sortQueueByRelatedness(song, queueData);
      } else {
        // Fetch all songs and create related queue
        const allSongsRes = await axios.get(`${API_BASE_URL}/music/allsongs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        let songs = allSongsRes.data.songs || [];

        if (mode === "artist" && contextId) {
          songs = songs.filter((s) => (s.artist || "").toLowerCase() === String(contextId).toLowerCase());
        }

        newQueue = sortQueueByRelatedness(song, songs);
      }

      setCurrentIndex(0);
      setQueue(newQueue);

      // Play the audio
      const audio = audioRef.current;
      if (audio) {
        audio.src = song.file_url;
        audio.currentTime = 0;
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (err) {
          console.warn("Autoplay blocked:", err);
          setIsPlaying(false);
        }
      }
    } catch (err) {
      console.error("Error playing song:", err);
      currentSongIdRef.current = null; // Reset on error
    } finally {
      isLoadingRef.current = false;
    }
  };

  // Play/Pause toggle
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false); // Immediately set state for responsive UI
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Play failed:", err);
          setIsPlaying(false);
        });
    }
  };

  // Play previous song
  const playPrevious = () => {
    if (!queue || queue.length === 0) return;
    const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
    playIndex(prevIdx);
  };

  // Play specific index
  const playIndex = async (index) => {
    if (!queue || queue.length === 0) return;
    if (index < 0 || index >= queue.length) return;

    const nextSong = queue[index];
    setCurrentIndex(index);
    setCurrentSong(nextSong);

    // Update URL if on playsong page
    if (location.pathname.startsWith('/playsong/')) {
      navigate(`/playsong/${nextSong.song_id}`, { replace: true });
    }

    const audio = audioRef.current;
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

  // Seek to time
  const seekTo = (time) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Change volume
  const changeVolume = (newVolume) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume;
      setVolume(newVolume);
      localStorage.setItem("player_volume", newVolume);
    }
  };

  // Toggle like
  const toggleLike = async () => {
    if (!currentSong || !currentSong.song_id) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/music/like/${currentSong.song_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsLiked((prev) => !prev);
      setCurrentSong((prev) => {
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

  // Toggle save
  const toggleSave = async () => {
    if (!currentSong || !currentSong.song_id) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/music/save/${currentSong.song_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsSaved((prev) => !prev);
      setCurrentSong((prev) => {
        if (!prev) return prev;
        const saves = prev.saves || [];
        return isSaved
          ? { ...prev, saves: saves.filter((id) => id !== currentUser) }
          : { ...prev, saves: [...saves, currentUser] };
      });
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // Addtion of the song in the queue here
  const addToQueue = async (songIdInput) => {
    const songId = typeof songIdInput === "object" ? (songIdInput?.song_id || songIdInput?._id || songIdInput?.id) : songIdInput;
    if (!songId) return false;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/song/${songId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const song = res.data.song;
      
      // If no queue exists, start playing this song
      if (queue.length === 0) {
        playSong(songId);
        toast.success(`Playing "${song.title}"`);
        return;
      }

      // Insert the song right after the current playing song
      const newQueue = [...queue];
      newQueue.splice(currentIndex + 1, 0, song);
      setQueue(newQueue);
      
      console.log(`✅ Added "${song.title}" to queue (will play next)`);
      toast.success(`Added "${song.title}" to queue (Play Next)`);
      return true;
    } catch (err) {
      console.error("Error adding to queue:", err);
      toast.error("Failed to add song to queue");
      return false;
    }
  };

  // Add song to end of queue
  const addToQueueEnd = async (songId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/song/${songId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const song = res.data.song;
      
      // If no queue exists, start playing this song
      if (queue.length === 0) {
        playSong(songId);
        toast.success(`Playing "${song.title}"`);
        return;
      }

      // Add to the end of the queue
      setQueue((prevQueue) => [...prevQueue, song]);
      
      console.log(`✅ Added "${song.title}" to end of queue`);
      toast.success(`Added "${song.title}" to queue`);
      return true;
    } catch (err) {
      console.error("Error adding to queue end:", err);
      toast.error("Failed to add song to queue");
      return false;
    }
  };

  const playTrack = (track, queueData = null) => {
    if (!track) return;
    const songId = typeof track === "string" ? track : (track.song_id || track._id || track.id);
    if (typeof track === "object" && track.file_url) {
      setCurrentSong(track);
      const audio = audioRef.current;
      if (audio) {
        audio.src = track.file_url;
        audio.currentTime = 0;
        audio.play().then(() => setIsPlaying(true)).catch((e) => console.warn(e));
      }
    }
    if (songId) {
      playSong(songId, queueData);
    }
  };

  // Change playback speed
  const changePlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed);
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = speed;
    }
    toast.success(`Playback Speed set to ${speed}x`);
  };

  // Set Sleep Timer
  const setSleepTimer = (minutes) => {
    if (sleepTimerTimeoutRef.current) {
      clearTimeout(sleepTimerTimeoutRef.current);
      sleepTimerTimeoutRef.current = null;
    }

    if (!minutes) {
      setSleepTimerMinutes(null);
      toast("Sleep Timer turned off", { icon: "⏰" });
      return;
    }

    if (minutes === "end") {
      setSleepTimerMinutes("end");
      toast.success("Sleep Timer set to end of current track");
      return;
    }

    setSleepTimerMinutes(minutes);
    toast.success(`Sleep Timer set for ${minutes} minutes`);

    sleepTimerTimeoutRef.current = setTimeout(() => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        setIsPlaying(false);
      }
      setSleepTimerMinutes(null);
      toast("Sleep Timer: Music paused", { icon: "🌙", duration: 4000 });
    }, minutes * 60 * 1000);
  };

  const value = {
    // State
    currentSong,
    queue,
    currentIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    isLiked,
    isSaved,
    currentUser,
    audioRef,

    // Speed & Timer State
    playbackSpeed,
    sleepTimerMinutes,

    // Settings & Theme
    repeatMode,
    setRepeatMode,
    isShuffle,
    setIsShuffle,
    autoPlay,
    setAutoPlay,
    theme,
    setTheme,

    // Actions
    playSong,
    playTrack,
    togglePlayPause,
    playNext,
    playPrevious,
    playIndex,
    seekTo,
    changeVolume,
    toggleLike,
    toggleSave,
    addToQueue,
    addToQueueEnd,

    // Action Handlers
    changePlaybackSpeed,
    setSleepTimer,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {/* Hidden audio element for global playback */}
      <audio ref={audioRef} />
      {children}
    </MusicPlayerContext.Provider>
  );
};
