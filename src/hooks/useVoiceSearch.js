import { useState, useRef } from "react";
import { useMusicPlayer } from "../context/MusicPlayerContext";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
import toast from "react-hot-toast";

export const useVoiceSearch = () => {
  const { playSong, playNext, playPrevious, togglePlayPause, changeVolume, volume } = useMusicPlayer();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Browser does not support Speech Recognition API");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      toast("Voice search listening... Speak now!", { icon: "🎙️", duration: 3000 });
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
      if (event.error === "network") {
        toast.error("Voice search network error. Please check your internet connection or browser settings.");
      } else if (event.error === "not-allowed") {
        toast.error("Microphone permission blocked. Please allow mic access in your browser settings.");
      } else {
        toast.error("Speech recognition error: " + event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = async (event) => {
      const transcriptText = event.results[0][0].transcript.toLowerCase().trim();
      console.log("🎙️ Voice Transcript:", transcriptText);
      toast(`Heard: "${transcriptText}"`, { icon: "💬" });

      // Match commands:
      // 1. Play Song (e.g. "play believer", "play arijit", "play mock song")
      if (transcriptText.startsWith("play ")) {
        const query = transcriptText.substring(5).trim();
        if (query === "next") {
          playNext();
          toast("Playing next song", { icon: "⏭️" });
        } else if (query === "previous" || query === "prev") {
          playPrevious();
          toast("Playing previous song", { icon: "⏮️" });
        } else {
          // Play specific song by query
          await playSongByQuery(query);
        }
      }
      // 2. Play controls (e.g. "play", "pause", "resume", "stop")
      else if (transcriptText === "pause" || transcriptText === "stop") {
        togglePlayPause();
        toast("Playback paused", { icon: "⏸️" });
      } else if (transcriptText === "resume") {
        togglePlayPause();
        toast("Playback resumed", { icon: "▶️" });
      }
      // 3. Search command (e.g. "search arijit", "search diljit")
      else if (transcriptText.startsWith("search ")) {
        const query = transcriptText.substring(7).trim();
        navigate(`/search?q=${encodeURIComponent(query)}`);
        toast(`Searching for "${query}"`, { icon: "🔍" });
      }
      // 4. Volume controls (e.g. "increase volume", "volume up", "decrease volume", "volume down")
      else if (transcriptText.includes("increase volume") || transcriptText.includes("volume up")) {
        const newVol = Math.min(volume + 0.15, 1);
        changeVolume(newVol);
        toast(`Volume increased to ${Math.round(newVol * 100)}%`, { icon: "🔊" });
      } else if (transcriptText.includes("decrease volume") || transcriptText.includes("volume down")) {
        const newVol = Math.max(volume - 0.15, 0);
        changeVolume(newVol);
        toast(`Volume decreased to ${Math.round(newVol * 100)}%`, { icon: "🔉" });
      }
      // 5. Unhandled / Fallback Search
      else {
        // Fallback: search for whatever was spoken
        navigate(`/search?q=${encodeURIComponent(transcriptText)}`);
        toast(`Searching for: "${transcriptText}"`, { icon: "🔍" });
      }
    };

    recognition.start();
  };

  const playSongByQuery = async (query) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/music/autocomplete?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      const suggestions = data.suggestions || [];
      if (suggestions.length > 0) {
        const topSong = suggestions[0];
        toast.success(`Playing "${topSong.title}" by ${topSong.artist}`);
        playSong(topSong.song_id);
      } else {
        toast.error(`No song match found for "${query}"`);
      }
    } catch (error) {
      console.error("Voice search song query error:", error);
      toast.error("Failed to lookup song");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    startListening,
    stopListening
  };
};
