import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useMusicPlayer } from "./MusicPlayerContext";
import API_BASE_URL from "../config/api";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PartyContext = createContext();

export const useParty = () => {
  const context = useContext(PartyContext);
  if (!context) {
    throw new Error("useParty must be used within a PartyProvider");
  }
  return context;
};

export const PartyProvider = ({ children }) => {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    currentTime,
    playSong,
    seekTo,
    audioRef,
  } = useMusicPlayer();

  const [roomId, setRoomId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [members, setMembers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [hostId, setHostId] = useState(null);

  const ws = useRef(null);
  const isIncomingSync = useRef(false);

  // Helper to get user info from localStorage/token
  const getUserInfo = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return { id: "guest_" + Math.random().toString(36).substr(2, 5), name: "Guest" };
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.Uid || payload.id,
        name: payload.first_name || "User",
      };
    } catch {
      return { id: "guest_" + Math.random().toString(36).substr(2, 5), name: "Guest" };
    }
  };

  // Convert HTTP API base to WS base url
  const getWSUrl = () => {
    const base = API_BASE_URL.replace("http://", "ws://").replace("https://", "wss://");
    return base;
  };

  // Create room endpoint call
  const createRoom = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to create a listening party");
        return null;
      }

      const res = await axios.post(`${API_BASE_URL}/api/party/create`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { room_code, host_id } = res.data;
      setRoomId(room_code);
      setIsHost(true);
      setHostId(host_id);
      
      connectWebSocket(room_code, host_id, true);
      return room_code;
    } catch (err) {
      console.error(err);
      toast.error("Failed to create listening room");
      return null;
    }
  };

  // Join room validation and handshake
  const joinRoom = async (code) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/party/check/${code}`);
      const { room_code, host_id } = res.data;
      
      const userInfo = getUserInfo();
      const hostIsMe = userInfo.id === host_id;

      setRoomId(room_code);
      setIsHost(hostIsMe);
      setHostId(host_id);

      connectWebSocket(room_code, host_id, hostIsMe);
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Listening room not found or active");
      return false;
    }
  };

  // Initialize Websocket connection
  const connectWebSocket = (roomCode, rHostId, hostIsMe) => {
    if (ws.current) {
      ws.current.close();
    }

    const userInfo = getUserInfo();
    const wsUrl = `${getWSUrl()}/ws/party/${roomCode}?user_id=${userInfo.id}&user_name=${userInfo.name}`;
    
    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log("🔌 Connected to party room WebSocket");
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "playback_state":
          if (hostIsMe) break; // Host ignores playback state messages
          
          isIncomingSync.current = true;
          handleIncomingPlaybackSync(msg);
          setTimeout(() => {
            isIncomingSync.current = false;
          }, 300);
          break;

        case "chat_message":
          setChatMessages((prev) => [...prev, {
            senderName: msg.sender_name,
            text: msg.text,
            timestamp: new Date(msg.timestamp)
          }]);
          break;

        case "member_list":
          setMembers(msg.members || []);
          break;

        case "room_ended":
          toast("The host ended the listening party.", { icon: "👋" });
          leaveRoom();
          navigate("/party");
          break;

        default:
          break;
      }
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket connection closed");
      setRoomId(null);
      setIsHost(false);
      setMembers([]);
      setChatMessages([]);
    };
  };

  // Member-side syncing implementation
  const handleIncomingPlaybackSync = async (state) => {
    const { song_id, is_playing, progress_ms } = state;
    if (!song_id) return;

    const audio = audioRef.current;
    if (!audio) return;

    // 1. Sync Song
    if (!currentSong || currentSong.song_id !== song_id) {
      await playSong(song_id);
    }

    // 2. Sync Progress (if drift > 1.5s)
    const hostTime = progress_ms / 1000;
    const diff = Math.abs(audio.currentTime - hostTime);
    if (diff > 1.5) {
      seekTo(hostTime);
    }

    // 3. Sync Play/Pause status
    if (is_playing && audio.paused) {
      audio.play().catch(e => console.warn("Sync play failed:", e));
    } else if (!is_playing && !audio.paused) {
      audio.pause();
    }
  };

  // Host state broadcasting
  useEffect(() => {
    if (!isHost || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    if (isIncomingSync.current) return; // Ignore updates caused by syncing

    const syncState = () => {
      ws.current.send(JSON.stringify({
        type: "sync_playback",
        song_id: currentSong?.song_id || "",
        is_playing: isPlaying,
        progress_ms: Math.floor(currentTime * 1000)
      }));
    };

    // Send state on status changes
    syncState();

  }, [isPlaying, currentSong, isHost]);

  // Periodic drift check from host to ensure members don't drift away
  useEffect(() => {
    if (!isHost || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const interval = setInterval(() => {
      ws.current.send(JSON.stringify({
        type: "sync_playback",
        song_id: currentSong?.song_id || "",
        is_playing: isPlaying,
        progress_ms: Math.floor(currentTime * 1000)
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [isHost, currentSong, isPlaying, currentTime]);

  // Send a chat message to the room
  const sendChatMessage = (text) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      toast.error("Not connected to party room");
      return;
    }
    ws.current.send(JSON.stringify({
      type: "chat_message",
      text: text
    }));
  };

  // Leave room disconnect
  const leaveRoom = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      // If the host is intentionally leaving, tell the server to skip the grace period
      if (isHost) {
        ws.current.send(JSON.stringify({ type: "host_leave" }));
      }
      ws.current.close();
    }
  };

  return (
    <PartyContext.Provider value={{
      roomId,
      isHost,
      members,
      chatMessages,
      hostId,
      createRoom,
      joinRoom,
      sendChatMessage,
      leaveRoom
    }}>
      {children}
    </PartyContext.Provider>
  );
};
