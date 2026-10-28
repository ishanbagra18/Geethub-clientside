/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import API_BASE_URL from "../config/api";

const MusicPlayerContext = createContext();

const STORAGE_STATE_KEY = "geethub_player_state_v1";

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  }
  return context;
};

// Safe helper to read initial state from localStorage
const getSavedPlayerState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to parse saved player state", err);
    return null;
  }
};

export const MusicPlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  const isLoadingRef = useRef(false);
  const currentSongIdRef = useRef(null);
  const retryCountRef = useRef(0);
  const lastPersistTimeRef = useRef(0);
  const prevVolumeRef = useRef(1);
  const sleepTimerTimeoutRef = useRef(null);
  const initialRestoreDoneRef = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Load saved state once
  const savedState = useRef(getSavedPlayerState()).current;

  const [currentSong, setCurrentSong] = useState(() => savedState?.currentSong || null);
  const [queue, setQueue] = useState(() => (Array.isArray(savedState?.queue) ? savedState.queue : []));
  const [currentIndex, setCurrentIndex] = useState(() =>
    typeof savedState?.currentIndex === "number" ? savedState.currentIndex : 0
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const [volume, setVolumeState] = useState(() => {
    if (typeof savedState?.volume === "number") return savedState.volume;
    const v = localStorage.getItem("player_volume");
    return v !== null ? Number(v) : 1;
  });
  const [currentTime, setCurrentTime] = useState(() =>
    typeof savedState?.currentTime === "number" ? savedState.currentTime : 0
  );
  const [duration, setDuration] = useState(() =>
    typeof savedState?.duration === "number" ? savedState.duration : 0
  );
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ⚙️ Settings & Theme State
  const [repeatMode, setRepeatModeState] = useState(() => {
    return savedState?.repeatMode || localStorage.getItem("app_repeat_mode") || "off";
  });
  const [isShuffle, setIsShuffleState] = useState(() => {
    if (typeof savedState?.isShuffle === "boolean") return savedState.isShuffle;
    return localStorage.getItem("app_shuffle_mode") === "true";
  });
  const [autoPlay, setAutoPlayState] = useState(() => {
    const saved = localStorage.getItem("app_autoplay");
    return saved !== null ? saved === "true" : true;
  });
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("app_theme") || "dark";
  });
  const [playbackSpeed, setPlaybackSpeedState] = useState(() => {
    return typeof savedState?.playbackSpeed === "number" ? savedState.playbackSpeed : 1.0;
  });
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null);

  // Sync volume ref
  useEffect(() => {
    if (volume > 0) prevVolumeRef.current = volume;
  }, [volume]);

  // Save current player state to localStorage (throttled for time updates)
  const persistState = useCallback(
    (overrides = {}) => {
      try {
        const audio = audioRef.current;
        const curTime = overrides.currentTime !== undefined ? overrides.currentTime : audio?.currentTime || currentTime;
        const stateToSave = {
          currentSong: overrides.currentSong !== undefined ? overrides.currentSong : currentSong,
          queue: overrides.queue !== undefined ? overrides.queue : queue,
          currentIndex: overrides.currentIndex !== undefined ? overrides.currentIndex : currentIndex,
          currentTime: curTime,
          duration: overrides.duration !== undefined ? overrides.duration : audio?.duration || duration,
          volume: overrides.volume !== undefined ? overrides.volume : volume,
          repeatMode: overrides.repeatMode !== undefined ? overrides.repeatMode : repeatMode,
          isShuffle: overrides.isShuffle !== undefined ? overrides.isShuffle : isShuffle,
          playbackSpeed: overrides.playbackSpeed !== undefined ? overrides.playbackSpeed : playbackSpeed,
        };
        localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(stateToSave));
      } catch (err) {
        console.warn("Error persisting player state:", err);
      }
    },
    [currentSong, queue, currentIndex, currentTime, duration, volume, repeatMode, isShuffle, playbackSpeed]
  );

  // Restore playback element on initial mount without violating autoplay policy
  useEffect(() => {
    if (initialRestoreDoneRef.current) return;
    initialRestoreDoneRef.current = true;

    const audio = audioRef.current;
    if (!audio) return;

    if (savedState?.currentSong?.file_url) {
      audio.src = savedState.currentSong.file_url;
      audio.volume = savedState.volume ?? 1;
      audio.playbackRate = savedState.playbackSpeed ?? 1.0;

      const targetPos = savedState.currentTime || 0;
      if (targetPos > 0) {
        const restoreTimeHandler = () => {
          try {
            audio.currentTime = targetPos;
            setCurrentTime(targetPos);
          } catch {
            // ignore
          }
          audio.removeEventListener("loadedmetadata", restoreTimeHandler);
        };
        audio.addEventListener("loadedmetadata", restoreTimeHandler);
      }
    }
  }, [savedState]);

  // Securely resolve streaming URL: supports signed media URLs & private tracks
  const resolveStreamURL = async (song) => {
    if (!song) return null;
    const songId = song.song_id || song._id || song.id;
    if (!songId) return song.file_url;

    // Check if song is private or if we want signed verification
    if (song.is_private) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/music/stream-url/${songId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.data?.stream_url) {
          return `${API_BASE_URL}${res.data.stream_url}`;
        }
        if (res.data?.direct_url) {
          return res.data.direct_url;
        }
      } catch (err) {
        if (err.response?.status === 403) {
          toast.error("🔒 Private Track: Access restricted to owner");
          throw err;
        }
      }
    }
    return song.file_url;
  };

  // User auth token extraction
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

  useEffect(() => {
    const uid = getUserIdFromToken();
    setCurrentUser(uid);
  }, []);

  useEffect(() => {
    if (currentSong && currentUser) {
      setIsLiked(Boolean(currentSong.likes?.includes(currentUser)));
      setIsSaved(Boolean(currentSong.saves?.includes(currentUser)));
    }
  }, [currentSong, currentUser]);

  // Song relatedness sorting
  const calculateSongRelatedness = (currSong, candidateSong) => {
    if (!currSong || !candidateSong) return 0;
    if (currSong.song_id === candidateSong.song_id) return -1;

    let score = 0;
    const currentGenre = (currSong.genre || "").toLowerCase().trim();
    const candidateGenre = (candidateSong.genre || "").toLowerCase().trim();

    if (currentGenre && candidateGenre) {
      if (currentGenre === candidateGenre) {
        score += 100;
      } else {
        const currentWords = currentGenre.split(/[\s/,-]+/);
        const candidateWords = candidateGenre.split(/[\s/,-]+/);
        const hasGenreOverlap = currentWords.some((w) => w.length > 2 && candidateWords.includes(w));
        if (hasGenreOverlap) score += 75;
      }
    }

    const currentLang = (currSong.language || "").toLowerCase().trim();
    const candidateLang = (candidateSong.language || "").toLowerCase().trim();
    if (currentLang && candidateLang && currentLang === candidateLang) {
      score += 30;
    }

    const currentArtist = (currSong.artist || "").toLowerCase().trim();
    const candidateArtist = (candidateSong.artist || "").toLowerCase().trim();
    if (currentArtist && candidateArtist && (currentArtist.includes(candidateArtist) || candidateArtist.includes(currentArtist))) {
      score += 40;
    }

    return score;
  };

  const sortQueueByRelatedness = (activeSong, songList) => {
    if (!activeSong || !songList || songList.length === 0) return songList || [];
    const otherSongs = songList.filter((s) => s.song_id !== activeSong.song_id);

    const scored = otherSongs.map((s) => ({
      song: s,
      score: calculateSongRelatedness(activeSong, s),
    }));

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

  // Play Next Song with auto skip signal and URL navigation
  const playNext = useCallback(() => {
    if (!queue || queue.length === 0) return;

    const audio = audioRef.current;
    if (currentSong && audio && (audio.currentTime < 30 || (audio.duration && audio.currentTime / audio.duration < 0.35))) {
      const skippedId = currentSong.song_id || currentSong._id || currentSong.id;
      if (skippedId) {
        const token = localStorage.getItem("token");
        axios.post(`${API_BASE_URL}/music/skip/${skippedId}`, {}, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }).catch(() => {});
      }
    }

    const nextIdx = (currentIndex + 1) % queue.length;
    const nextSong = queue[nextIdx];
    if (!nextSong) return;

    setCurrentIndex(nextIdx);
    setCurrentSong(nextSong);
    retryCountRef.current = 0;
    setAudioError(null);

    persistState({ currentSong: nextSong, currentIndex: nextIdx, currentTime: 0 });

    if (location.pathname.startsWith("/playsong/")) {
      navigate(`/playsong/${nextSong.song_id}`, { replace: true });
    }

    if (!audio) return;

    setIsBuffering(true);
    audio.pause();

    resolveStreamURL(nextSong)
      .then((streamUrl) => {
        audio.src = streamUrl || nextSong.file_url;
        audio.currentTime = 0;
        return audio.play();
      })
      .then(() => {
        setIsPlaying(true);
        setIsBuffering(false);
      })
      .catch((err) => {
        console.warn("Autoplay / stream error:", err);
        setIsPlaying(false);
        setIsBuffering(false);
      });
  }, [queue, currentIndex, currentSong, location.pathname, navigate, persistState]);

  // Play Previous Song
  const playPrevious = useCallback(() => {
    if (!queue || queue.length === 0) return;
    const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
    const prevSong = queue[prevIdx];
    if (!prevSong) return;

    setCurrentIndex(prevIdx);
    setCurrentSong(prevSong);
    retryCountRef.current = 0;
    setAudioError(null);

    persistState({ currentSong: prevSong, currentIndex: prevIdx, currentTime: 0 });

    if (location.pathname.startsWith("/playsong/")) {
      navigate(`/playsong/${prevSong.song_id}`, { replace: true });
    }

    const audio = audioRef.current;
    if (!audio) return;

    setIsBuffering(true);
    audio.pause();

    resolveStreamURL(prevSong)
      .then((streamUrl) => {
        audio.src = streamUrl || prevSong.file_url;
        audio.currentTime = 0;
        return audio.play();
      })
      .then(() => {
        setIsPlaying(true);
        setIsBuffering(false);
      })
      .catch((err) => {
        console.warn("Autoplay / stream error:", err);
        setIsPlaying(false);
        setIsBuffering(false);
      });
  }, [queue, currentIndex, location.pathname, navigate, persistState]);

  // Play Specific Index
  const playIndex = useCallback(
    async (index) => {
      if (!queue || queue.length === 0) return;
      if (index < 0 || index >= queue.length) return;

      const nextSong = queue[index];
      setCurrentIndex(index);
      setCurrentSong(nextSong);
      retryCountRef.current = 0;
      setAudioError(null);

      persistState({ currentSong: nextSong, currentIndex: index, currentTime: 0 });

      if (location.pathname.startsWith("/playsong/")) {
        navigate(`/playsong/${nextSong.song_id}`, { replace: true });
      }

      const audio = audioRef.current;
      if (!audio) return;

      try {
        setIsBuffering(true);
        audio.pause();
        const streamUrl = await resolveStreamURL(nextSong);
        audio.src = streamUrl || nextSong.file_url;
        audio.currentTime = 0;
        await audio.play();
        setIsPlaying(true);
        setIsBuffering(false);
      } catch (err) {
        console.warn("Play index error:", err);
        setIsPlaying(false);
        setIsBuffering(false);
      }
    },
    [queue, location.pathname, navigate, persistState]
  );

  // Play/Pause toggle
  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      persistState({ currentTime: audio.currentTime });
    } else {
      if (!audio.src && currentSong?.file_url) {
        audio.src = currentSong.file_url;
      }
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch((err) => {
          console.warn("Play failed:", err);
          setIsPlaying(false);
        });
    }
  }, [isPlaying, currentSong, persistState]);

  // Seek to specific time
  const seekTo = useCallback(
    (time) => {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = time;
        setCurrentTime(time);
        persistState({ currentTime: time });
      }
    },
    [persistState]
  );

  // Change volume
  const changeVolume = useCallback((newVolume) => {
    const audio = audioRef.current;
    const clamped = Math.max(0, Math.min(1, newVolume));
    if (audio) {
      audio.volume = clamped;
      if (clamped > 0 && audio.muted) {
        audio.muted = false;
        setIsMuted(false);
      }
    }
    setVolumeState(clamped);
    localStorage.setItem("player_volume", clamped);
  }, []);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted || volume === 0) {
      const restoreVol = prevVolumeRef.current || 0.5;
      audio.muted = false;
      audio.volume = restoreVol;
      setIsMuted(false);
      setVolumeState(restoreVol);
      toast("Volume unmuted 🔊", { id: "vol_mute", duration: 1000 });
    } else {
      prevVolumeRef.current = volume;
      audio.muted = true;
      setIsMuted(true);
      toast("Volume muted 🔇", { id: "vol_mute", duration: 1000 });
    }
  }, [isMuted, volume]);

  // Audio loading error recovery handler
  const handleAudioError = useCallback(async () => {
    setIsBuffering(false);
    setIsPlaying(false);

    if (!currentSong) return;

    // Attempt stream URL re-signing / recovery if under 2 retries
    if (retryCountRef.current < 2) {
      retryCountRef.current += 1;
      toast.loading(`Reconnecting audio stream (${retryCountRef.current}/2)...`, {
        id: "audio_recovery",
        duration: 2500,
      });

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/music/stream-url/${currentSong.song_id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const freshUrl = res.data?.stream_url ? `${API_BASE_URL}${res.data.stream_url}` : res.data?.direct_url;
        if (freshUrl && audioRef.current) {
          audioRef.current.src = freshUrl;
          audioRef.current.currentTime = currentTime || 0;
          await audioRef.current.play();
          setIsPlaying(true);
          toast.success("Stream re-connected 🎵", { id: "audio_recovery" });
          return;
        }
      } catch (err) {
        console.warn("Audio recovery attempt failed:", err);
      }
    }

    // Retries exhausted: Notify & skip smoothly
    retryCountRef.current = 0;
    setAudioError("Stream unavailable");
    toast.error(`"${currentSong.title || "Track"}" audio unavailable. Skipping...`, {
      id: "audio_recovery",
      duration: 3500,
    });

    if (queue && queue.length > 1) {
      setTimeout(() => {
        playNext();
      }, 1000);
    }
  }, [currentSong, currentTime, queue, playNext]);

  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const cur = audio.currentTime;
      setCurrentTime(cur);

      // Throttle localStorage writes to once every 3 seconds during playback
      const now = Date.now();
      if (now - lastPersistTimeRef.current > 3000) {
        lastPersistTimeRef.current = now;
        persistState({ currentTime: cur });
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsBuffering(false);
      setAudioError(null);
    };

    const handleWaiting = () => setIsBuffering(true);
    const handleStalled = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handlePlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => {
      setIsPlaying(false);
      persistState({ currentTime: audio.currentTime });
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsBuffering(false);

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

      // If Autoplay is OFF and repeat is not "all", stop playback immediately
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
            return;
          }
        }

        const nextSong = queue[nextIdx];
        if (nextSong) {
          setCurrentIndex(nextIdx);
          setCurrentSong(nextSong);
          persistState({ currentSong: nextSong, currentIndex: nextIdx, currentTime: 0 });

          if (location.pathname.startsWith("/playsong/")) {
            navigate(`/playsong/${nextSong.song_id}`, { replace: true });
          }

          resolveStreamURL(nextSong)
            .then((streamUrl) => {
              audio.src = streamUrl || nextSong.file_url;
              audio.currentTime = 0;
              return audio.play();
            })
            .then(() => {
              setIsPlaying(true);
              toast(`Playing: "${nextSong.title}"`, { icon: "🎧", duration: 3000 });
            })
            .catch((err) => {
              console.warn("Autoplay blocked:", err);
              setIsPlaying(false);
            });
        }
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("stalled", handleStalled);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleAudioError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("stalled", handleStalled);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleAudioError);
    };
  }, [
    queue,
    currentIndex,
    location.pathname,
    navigate,
    repeatMode,
    autoPlay,
    isShuffle,
    sleepTimerMinutes,
    persistState,
    handleAudioError,
  ]);

  // MediaSession API Integration (Lock Screen, Wearables, Android/iOS Notifications)
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    if (currentSong) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentSong.title || "Geethub Song",
        artist: currentSong.artist || "Unknown Artist",
        album: currentSong.album || "Geethub Music",
        artwork: [
          {
            src: currentSong.image_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=512&auto=format&fit=crop&q=80",
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      });
    }

    const actionHandlers = [
      ["play", () => togglePlayPause()],
      ["pause", () => togglePlayPause()],
      ["previoustrack", () => playPrevious()],
      ["nexttrack", () => playNext()],
      ["stop", () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }],
      ["seekto", (details) => {
        if (details.seekTime !== undefined) seekTo(details.seekTime);
      }],
      ["seekbackward", (details) => {
        const skip = details.seekOffset || 10;
        seekTo(Math.max(0, (audioRef.current?.currentTime || 0) - skip));
      }],
      ["seekforward", (details) => {
        const skip = details.seekOffset || 10;
        seekTo(Math.min(audioRef.current?.duration || 0, (audioRef.current?.currentTime || 0) + skip));
      }],
    ];

    actionHandlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // unsupported action
      }
    });

    return () => {
      actionHandlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {}
      });
    };
  }, [currentSong, togglePlayPause, playPrevious, playNext, seekTo]);

  // MediaSession playbackState and positionState updates
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    if (duration > 0 && !isNaN(duration) && "setPositionState" in navigator.mediaSession) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(0, duration),
          playbackRate: playbackSpeed,
          position: Math.min(Math.max(0, currentTime), duration),
        });
      } catch {
        // ignore
      }
    }
  }, [isPlaying, currentTime, duration, playbackSpeed]);

  // Accessible Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const active = document.activeElement;
      const tagName = active?.tagName?.toLowerCase();
      const isInput = tagName === "input" || tagName === "textarea" || tagName === "select" || active?.isContentEditable;
      if (isInput) return;

      const audio = audioRef.current;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowRight":
          e.preventDefault();
          if (audio) {
            const nextTime = Math.min(audio.duration || 0, (audio.currentTime || 0) + 5);
            seekTo(nextTime);
            toast("Forward 5s ⏩", { id: "kbd_action", duration: 800 });
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (audio) {
            const prevTime = Math.max(0, (audio.currentTime || 0) - 5);
            seekTo(prevTime);
            toast("Rewind 5s ⏪", { id: "kbd_action", duration: 800 });
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          changeVolume(Math.min(1, Number(((audio?.volume ?? volume) + 0.05).toFixed(2))));
          toast(`Volume: ${Math.round(Math.min(1, (audio?.volume ?? volume) + 0.05) * 100)}% 🔊`, {
            id: "kbd_action",
            duration: 800,
          });
          break;
        case "ArrowDown":
          e.preventDefault();
          changeVolume(Math.max(0, Number(((audio?.volume ?? volume) - 0.05).toFixed(2))));
          toast(`Volume: ${Math.round(Math.max(0, (audio?.volume ?? volume) - 0.05) * 100)}% 🔉`, {
            id: "kbd_action",
            duration: 800,
          });
          break;
        case "KeyM":
          toggleMute();
          break;
        case "KeyN":
          playNext();
          toast("Next track ⏭️", { id: "kbd_action", duration: 800 });
          break;
        case "KeyP":
          playPrevious();
          toast("Previous track ⏮️", { id: "kbd_action", duration: 800 });
          break;
        case "KeyK":
          togglePlayPause();
          break;
        case "KeyJ":
          if (audio) {
            seekTo(Math.max(0, (audio.currentTime || 0) - 10));
            toast("Rewind 10s ⏪", { id: "kbd_action", duration: 800 });
          }
          break;
        case "KeyL":
          if (audio) {
            seekTo(Math.min(audio.duration || 0, (audio.currentTime || 0) + 10));
            toast("Forward 10s ⏩", { id: "kbd_action", duration: 800 });
          }
          break;
        case "KeyR": {
          const nextMode = repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off";
          setRepeatMode(nextMode);
          break;
        }
        case "KeyS":
          setIsShuffle((prev) => !prev);
          break;
        case "Slash":
          if (e.shiftKey) {
            setShowShortcutsModal((prev) => !prev);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    volume,
    isMuted,
    repeatMode,
    togglePlayPause,
    seekTo,
    changeVolume,
    toggleMute,
    playNext,
    playPrevious,
  ]);

  // Play a specific song by ID
  const playSong = async (songIdInput, queueData = null, mode = "random", contextId = null) => {
    const songId = typeof songIdInput === "object" ? (songIdInput?.song_id || songIdInput?._id || songIdInput?.id) : songIdInput;
    if (!songId) return;

    if (isLoadingRef.current || (currentSongIdRef.current === songId && isPlaying)) {
      return;
    }

    isLoadingRef.current = true;
    currentSongIdRef.current = songId;
    retryCountRef.current = 0;
    setAudioError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/song/${songId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const song = res.data.song;
      setCurrentSong(song);

      let newQueue = [];
      if (queueData && queueData.length > 1) {
        newQueue = sortQueueByRelatedness(song, queueData);
      } else {
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
      persistState({ currentSong: song, queue: newQueue, currentIndex: 0, currentTime: 0 });

      const audio = audioRef.current;
      if (audio) {
        setIsBuffering(true);
        const streamUrl = await resolveStreamURL(song);
        audio.src = streamUrl || song.file_url;
        audio.currentTime = 0;
        try {
          await audio.play();
          setIsPlaying(true);
          setIsBuffering(false);
        } catch (err) {
          console.warn("Autoplay blocked:", err);
          setIsPlaying(false);
          setIsBuffering(false);
        }
      }
    } catch (err) {
      console.error("Error playing song:", err);
      currentSongIdRef.current = null;
      setIsBuffering(false);
    } finally {
      isLoadingRef.current = false;
    }
  };

  const playTrack = (track, queueData = null) => {
    if (!track) return;
    const songId = typeof track === "string" ? track : (track.song_id || track._id || track.id);
    if (typeof track === "object" && track.file_url) {
      setCurrentSong(track);
      const audio = audioRef.current;
      if (audio) {
        setIsBuffering(true);
        resolveStreamURL(track).then((url) => {
          audio.src = url || track.file_url;
          audio.currentTime = 0;
          return audio.play();
        }).then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        }).catch((e) => {
          console.warn(e);
          setIsBuffering(false);
        });
      }
    }
    if (songId) {
      playSong(songId, queueData);
    }
  };

  // Clear queue and stop playback
  const clearQueue = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setCurrentSong(null);
    setQueue([]);
    setCurrentIndex(0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsBuffering(false);
    localStorage.removeItem(STORAGE_STATE_KEY);
    toast("Queue cleared 🧹");
  };

  // Add to Queue (Next)
  const addToQueue = async (songIdInput) => {
    const songId = typeof songIdInput === "object" ? (songIdInput?.song_id || songIdInput?._id || songIdInput?.id) : songIdInput;
    if (!songId) return false;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/song/${songId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const song = res.data.song;

      if (queue.length === 0) {
        playSong(songId);
        toast.success(`Playing "${song.title}"`);
        return true;
      }

      const newQueue = [...queue];
      newQueue.splice(currentIndex + 1, 0, song);
      setQueue(newQueue);
      persistState({ queue: newQueue });
      toast.success(`Added "${song.title}" to play next`);
      return true;
    } catch (err) {
      console.error("Error adding to queue:", err);
      toast.error("Failed to add song to queue");
      return false;
    }
  };

  // Add to Queue (End)
  const addToQueueEnd = async (songId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/song/${songId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const song = res.data.song;

      if (queue.length === 0) {
        playSong(songId);
        toast.success(`Playing "${song.title}"`);
        return true;
      }

      const newQueue = [...queue, song];
      setQueue(newQueue);
      persistState({ queue: newQueue });
      toast.success(`Added "${song.title}" to queue`);
      return true;
    } catch (err) {
      console.error("Error adding to queue end:", err);
      toast.error("Failed to add song to queue");
      return false;
    }
  };

  // Play an entire queue of songs directly (used by AI Copilot)
  const playQueue = async (songsList, startIndex = 0) => {
    if (!songsList || songsList.length === 0) return;
    const initialIndex = Math.max(0, Math.min(startIndex, songsList.length - 1));
    const song = songsList[initialIndex];
    if (!song) return;

    setCurrentSong(song);
    setQueue(songsList);
    setCurrentIndex(initialIndex);
    persistState({ currentSong: song, queue: songsList, currentIndex: initialIndex, currentTime: 0 });

    const audio = audioRef.current;
    if (audio) {
      setIsBuffering(true);
      try {
        const streamUrl = await resolveStreamURL(song);
        audio.src = streamUrl || song.file_url;
        audio.currentTime = 0;
        await audio.play();
        setIsPlaying(true);
        setIsBuffering(false);
        toast.success(`Playing mix starting with "${song.title}" 🎶`);
      } catch (err) {
        console.warn("Autoplay / stream error:", err);
        setIsBuffering(false);
      }
    }
  };

  // Add multiple tracks to queue (used by AI Copilot)
  const addMultipleToQueue = (songsList) => {
    if (!songsList || songsList.length === 0) return;
    const newQueue = [...queue, ...songsList];
    setQueue(newQueue);
    persistState({ queue: newQueue });
    toast.success(`Added ${songsList.length} tracks to queue 🎧`);
  };

  // Toggle Like
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

  // Toggle Save
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

  // Change playback speed
  const changePlaybackSpeed = (speed) => {
    setPlaybackSpeedState(speed);
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = speed;
    }
    persistState({ playbackSpeed: speed });
    toast.success(`Speed: ${speed}x`);
  };

  // Repeat & Shuffle Modes
  const setRepeatMode = (mode) => {
    setRepeatModeState(mode);
    localStorage.setItem("app_repeat_mode", mode);
    persistState({ repeatMode: mode });
    const labels = { off: "Repeat Off", all: "Repeat Queue All 🔁", one: "Repeat Track One 🔂" };
    toast.success(labels[mode] || `Repeat: ${mode}`);
  };

  const setIsShuffle = (val) => {
    const newVal = typeof val === "function" ? val(isShuffle) : val;
    setIsShuffleState(newVal);
    localStorage.setItem("app_shuffle_mode", String(newVal));
    persistState({ isShuffle: newVal });
    toast.success(newVal ? "Shuffle ON 🔀" : "Shuffle OFF");
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
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    toast.success(`Theme: ${validTheme.toUpperCase()}`);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [theme]);

  // Sleep Timer
  const setSleepTimer = (minutes) => {
    if (sleepTimerTimeoutRef.current) {
      clearTimeout(sleepTimerTimeoutRef.current);
      sleepTimerTimeoutRef.current = null;
    }

    if (!minutes) {
      setSleepTimerMinutes(null);
      toast("Sleep Timer Off ⏰");
      return;
    }

    if (minutes === "end") {
      setSleepTimerMinutes("end");
      toast.success("Sleep Timer set to end of current track");
      return;
    }

    setSleepTimerMinutes(minutes);
    toast.success(`Sleep Timer set for ${minutes}m 🌙`);

    sleepTimerTimeoutRef.current = setTimeout(() => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        setIsPlaying(false);
      }
      setSleepTimerMinutes(null);
      toast("Sleep Timer: Playback paused 🌙", { duration: 4000 });
    }, minutes * 60 * 1000);
  };

  const value = {
    // State
    currentSong,
    queue,
    currentIndex,
    isPlaying,
    isBuffering,
    isMuted,
    audioError,
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
    showShortcutsModal,
    setShowShortcutsModal,

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
    toggleMute,
    toggleLike,
    toggleSave,
    addToQueue,
    addToQueueEnd,
    playQueue,
    addMultipleToQueue,
    clearQueue,
    resolveStreamURL,

    // Handlers
    changePlaybackSpeed,
    setSleepTimer,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      <audio ref={audioRef} preload="metadata" />
      {children}
    </MusicPlayerContext.Provider>
  );
};
