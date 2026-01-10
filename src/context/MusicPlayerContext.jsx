/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

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

  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
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
  }, [queue, currentIndex]);

  // Play a specific song
  const playSong = async (songId, queueData = null, mode = "random", contextId = null) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:9000/song/${songId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const song = res.data.song;
      setCurrentSong(song);

      // Build queue
      let newQueue = [];
      if (queueData && queueData.length) {
        newQueue = queueData;
      } else {
        // Fetch all songs and create queue
        const allSongsRes = await axios.get("http://localhost:9000/music/allsongs", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        let songs = allSongsRes.data.songs || [];

        if (mode === "artist" && contextId) {
          songs = songs.filter((s) => (s.artist || "").toLowerCase() === String(contextId).toLowerCase());
        }

        // Shuffle songs
        const shuffle = (arr) => {
          const a = arr.slice();
          for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
          }
          return a;
        };

        newQueue = shuffle(songs);
      }

      // Ensure current song is in queue
      const existingIndex = newQueue.findIndex((s) => s.song_id === songId);
      if (existingIndex === -1) {
        newQueue.unshift(song);
        setCurrentIndex(0);
      } else {
        setCurrentIndex(existingIndex);
      }

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
    }
  };

  // Play/Pause toggle
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => console.warn("Play failed:", err));
    }
  };

  // Play next song
  const playNext = () => {
    if (!queue || queue.length === 0) return;
    const nextIdx = (currentIndex + 1) % queue.length;
    playIndex(nextIdx);
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
        `http://localhost:9000/music/like/${currentSong.song_id}`,
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
        `http://localhost:9000/music/save/${currentSong.song_id}`,
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
  const addToQueue = async (songId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:9000/song/${songId}`, {
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
      const res = await axios.get(`http://localhost:9000/song/${songId}`, {
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

    // Actions
    playSong,
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
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {/* Hidden audio element for global playback */}
      <audio ref={audioRef} />
      {children}
    </MusicPlayerContext.Provider>
  );
};
