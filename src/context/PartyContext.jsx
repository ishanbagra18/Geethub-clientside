import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
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
  const [hostId, setHostId] = useState(null);
  const [hostName, setHostName] = useState("");
  const [members, setMembers] = useState([]);
  const [memberDetails, setMemberDetails] = useState([]);
  const [queue, setQueue] = useState([]);
  const [isQueueLocked, setIsQueueLocked] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [hostStatus, setHostStatus] = useState({ connected: true, graceDuration: 15 });
  const [isConnected, setIsConnected] = useState(false);

  const ws = useRef(null);
  const isIncomingSync = useRef(false);
  const lastAppliedVersion = useRef(0);
  const intentionalLeaveRef = useRef(false);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const serverOffsetMs = useRef(0); // Clock offset between client and server

  // Helper to generate unique event ID for duplicate-event prevention
  const generateEventId = () => `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Helper to get user info from localStorage/token
  const getUserInfo = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        let guestId = localStorage.getItem("geethub_guest_id");
        if (!guestId) {
          guestId = "guest_" + Math.random().toString(36).substring(2, 7);
          localStorage.setItem("geethub_guest_id", guestId);
        }
        return { id: guestId, name: "Guest" };
      }
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.Uid || payload.id || payload.user_id,
        name: payload.first_name || payload.name || "User",
      };
    } catch {
      return { id: "guest_" + Math.random().toString(36).substring(2, 7), name: "Guest" };
    }
  }, []);

  // Convert HTTP API base to WS base url
  const getWSUrl = () => {
    return API_BASE_URL.replace("http://", "ws://").replace("https://", "wss://");
  };

  // REST: Create room
  const createRoom = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to create a listening party");
        return null;
      }

      const res = await axios.post(`${API_BASE_URL}/api/party/create`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { room_code, host_id, host_name } = res.data;
      setRoomId(room_code);
      setIsHost(true);
      setHostId(host_id);
      setHostName(host_name || "Host");
      intentionalLeaveRef.current = false;

      connectWebSocket(room_code, host_id, true);
      return room_code;
    } catch (err) {
      console.error(err);
      toast.error("Failed to create listening room");
      return null;
    }
  };

  // REST: Check and join room
  const joinRoom = async (code) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/party/check/${code}`);
      const { room_code, host_id, host_name, queue_locked } = res.data;

      const userInfo = getUserInfo();
      const hostIsMe = userInfo.id === host_id;

      setRoomId(room_code);
      setIsHost(hostIsMe);
      setHostId(host_id);
      setHostName(host_name || "Host");
      setIsQueueLocked(!!queue_locked);
      intentionalLeaveRef.current = false;

      connectWebSocket(room_code, host_id, hostIsMe);
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Listening room not found or active");
      return false;
    }
  };

  // Member-side authoritative playback synchronization
  const handleIncomingPlaybackSync = async (state) => {
    const { song_id, track_id, is_playing, playback_position_ms, progress_ms, server_timestamp, state_version } = state;
    const targetSongID = song_id || track_id;
    if (!targetSongID) return;

    // Check version to prevent out-of-order execution
    if (state_version && state_version < lastAppliedVersion.current) {
      return;
    }
    if (state_version) {
      lastAppliedVersion.current = state_version;
    }

    const audio = audioRef.current;
    if (!audio) return;

    // Calculate server-authoritative progress:
    // progress + elapsed server time since timestamp
    const basePos = playback_position_ms !== undefined ? playback_position_ms : (progress_ms || 0);
    const nowServerEstimate = Date.now() + serverOffsetMs.current;
    const elapsedMs = is_playing && server_timestamp ? Math.max(0, nowServerEstimate - server_timestamp) : 0;
    const expectedTimeSec = (basePos + elapsedMs) / 1000;

    // 1. Sync Song Track
    if (!currentSong || currentSong.song_id !== targetSongID) {
      await playSong(targetSongID);
      // After initiating song load, seek to authoritative expected position
      seekTo(expectedTimeSec);
    } else {
      // 2. Drift correction: only adjust if drift > 0.8s to maintain smooth audio
      const drift = Math.abs(audio.currentTime - expectedTimeSec);
      if (drift > 0.8) {
        seekTo(expectedTimeSec);
      }
    }

    // 3. Sync Play / Pause state
    if (is_playing && audio.paused) {
      audio.play().catch((e) => console.warn("Sync play failed:", e));
    } else if (!is_playing && !audio.paused) {
      audio.pause();
    }
  };

  // Initialize WebSocket connection
  const connectWebSocket = useCallback((roomCode, rHostId, hostIsMe) => {
    if (ws.current) {
      ws.current.close();
    }

    const userInfo = getUserInfo();
    const wsUrl = `${getWSUrl()}/ws/party/${roomCode}?user_id=${userInfo.id}&user_name=${encodeURIComponent(userInfo.name)}`;

    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log("🔌 Connected to party room WebSocket");
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Start periodic ping to calibrate latency & server clock offset
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: "ping",
            client_time: Date.now(),
          }));
        }
      }, 10000);
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case "playback_state":
            // Host does not apply its own updates unless reconnecting / late joiner
            if (!hostIsMe || !currentSong) {
              isIncomingSync.current = true;
              handleIncomingPlaybackSync(msg);
              setTimeout(() => {
                isIncomingSync.current = false;
              }, 400);
            }
            break;

          case "queue_updated":
            setQueue(msg.queue || []);
            setIsQueueLocked(!!msg.queue_locked);
            break;

          case "member_list":
            setMembers(msg.members || []);
            setMemberDetails(msg.member_details || []);
            if (msg.host_id) {
              setHostId(msg.host_id);
              const amHost = userInfo.id === msg.host_id;
              setIsHost(amHost);
            }
            if (msg.host_name) {
              setHostName(msg.host_name);
            }
            if (msg.host_connected !== undefined) {
              setHostStatus((prev) => ({ ...prev, connected: msg.host_connected }));
            }
            break;

          case "host_status":
            setHostStatus({
              connected: msg.connected,
              graceDuration: msg.grace_duration || 15,
            });
            if (msg.connected) {
              toast.success("Host reconnected to the party room!", { id: "host_status" });
            } else {
              toast("⚠️ Host disconnected. Waiting for reconnect or host election...", {
                icon: "⏳",
                id: "host_status",
                duration: 6000,
              });
            }
            break;

          case "host_transferred":
            setHostId(msg.new_host_id);
            setHostName(msg.new_host_name);
            {
              const amIHost = userInfo.id === msg.new_host_id;
              setIsHost(amIHost);
              if (amIHost) {
                toast.success("👑 You have been elected as the new party host!", { duration: 5000 });
              } else {
                toast(`👑 ${msg.new_host_name} is now the party host.`, { icon: "👑", duration: 5000 });
              }
            }
            break;

          case "chat_message":
            setChatMessages((prev) => [
              ...prev,
              {
                senderName: msg.sender_name,
                senderId: msg.sender_id,
                text: msg.text,
                timestamp: new Date(msg.timestamp),
              },
            ]);
            break;

          case "pong":
            if (msg.client_time && msg.server_timestamp) {
              const rtt = Date.now() - msg.client_time;
              const estimatedServerNow = msg.server_timestamp + rtt / 2;
              serverOffsetMs.current = estimatedServerNow - Date.now();
            }
            break;

          case "error":
            toast.error(msg.message || "Action not allowed");
            break;

          case "room_ended":
            toast(msg.reason || "The host ended the listening party.", { icon: "👋" });
            intentionalLeaveRef.current = true;
            leaveRoom();
            navigate("/party");
            break;

          default:
            break;
        }
      } catch (e) {
        console.error("Error processing websocket message:", e);
      }
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket connection closed");
      setIsConnected(false);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

      // Reconnect recovery with exponential backoff on accidental disconnects
      if (!intentionalLeaveRef.current && roomCode) {
        if (reconnectAttempts.current < 5) {
          reconnectAttempts.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current - 1), 8000);
          console.log(`⏳ Reconnecting to party room in ${delay}ms (attempt ${reconnectAttempts.current})...`);
          
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket(roomCode, rHostId, hostIsMe);
          }, delay);
        } else {
          toast.error("Lost connection to party room.");
        }
      }
    };
  }, [getUserInfo, currentSong, navigate]);

  // Host state broadcasting
  useEffect(() => {
    if (!isHost || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    if (isIncomingSync.current) return;

    const syncState = () => {
      if (!currentSong) return;
      ws.current.send(JSON.stringify({
        type: "sync_playback",
        song_id: currentSong.song_id || "",
        track_id: currentSong.song_id || "",
        is_playing: isPlaying,
        playback_position_ms: Math.floor(currentTime * 1000),
        progress_ms: Math.floor(currentTime * 1000),
        duration_ms: Math.floor((currentSong.duration || 0) * 1000),
        event_id: generateEventId(),
      }));
    };

    syncState();
  }, [isPlaying, currentSong?.song_id, isHost]);

  // Periodic authoritative pulse from host to avoid drift
  useEffect(() => {
    if (!isHost || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const interval = setInterval(() => {
      if (!currentSong) return;
      ws.current.send(JSON.stringify({
        type: "sync_playback",
        song_id: currentSong.song_id || "",
        track_id: currentSong.song_id || "",
        is_playing: isPlaying,
        playback_position_ms: Math.floor(currentTime * 1000),
        progress_ms: Math.floor(currentTime * 1000),
        duration_ms: Math.floor((currentSong.duration || 0) * 1000),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [isHost, currentSong?.song_id, isPlaying, currentTime]);

  // Queue actions
  const addToQueue = (song) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      toast.error("Not connected to party room");
      return;
    }
    if (isQueueLocked && !isHost) {
      toast.error("Queue is locked by the host");
      return;
    }

    ws.current.send(JSON.stringify({
      type: "add_to_queue",
      song: {
        song_id: song.song_id || song.id,
        title: song.title,
        artist: song.artist,
        duration: song.duration || 0,
        image_url: song.image_url || song.album_art || "",
      },
      event_id: generateEventId(),
    }));
    toast.success(`Added "${song.title}" to shared queue!`);
  };

  const removeFromQueue = (queueItemId) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({
      type: "remove_from_queue",
      queue_item_id: queueItemId,
      event_id: generateEventId(),
    }));
  };

  const toggleQueueLock = (locked) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    if (!isHost) {
      toast.error("Only the room host can lock/unlock the queue");
      return;
    }
    ws.current.send(JSON.stringify({
      type: "toggle_queue_lock",
      locked: locked !== undefined ? locked : !isQueueLocked,
      event_id: generateEventId(),
    }));
  };

  const playNextInQueue = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    if (!isHost) {
      toast.error("Only the room host can advance tracks");
      return;
    }
    ws.current.send(JSON.stringify({
      type: "next_track",
      event_id: generateEventId(),
    }));
  };

  const clearQueue = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    if (!isHost) {
      toast.error("Only the room host can clear the queue");
      return;
    }
    ws.current.send(JSON.stringify({
      type: "clear_queue",
      event_id: generateEventId(),
    }));
  };

  const transferHost = (targetUserId) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    if (!isHost) {
      toast.error("Only the room host can transfer host permissions");
      return;
    }
    ws.current.send(JSON.stringify({
      type: "transfer_host",
      target_user_id: targetUserId,
      event_id: generateEventId(),
    }));
  };

  // Chat message
  const sendChatMessage = (text) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      toast.error("Not connected to party room");
      return;
    }
    ws.current.send(JSON.stringify({
      type: "chat_message",
      text: text,
      event_id: generateEventId(),
    }));
  };

  // Leave room
  const leaveRoom = () => {
    intentionalLeaveRef.current = true;
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      if (isHost) {
        ws.current.send(JSON.stringify({ type: "host_leave" }));
      }
      ws.current.close();
    }

    setRoomId(null);
    setIsHost(false);
    setHostId(null);
    setMembers([]);
    setMemberDetails([]);
    setQueue([]);
    setChatMessages([]);
    setIsConnected(false);
  };

  return (
    <PartyContext.Provider
      value={{
        roomId,
        isHost,
        hostId,
        hostName,
        members,
        memberDetails,
        queue,
        isQueueLocked,
        chatMessages,
        hostStatus,
        isConnected,
        createRoom,
        joinRoom,
        leaveRoom,
        sendChatMessage,
        addToQueue,
        removeFromQueue,
        toggleQueueLock,
        playNextInQueue,
        clearQueue,
        transferHost,
      }}
    >
      {children}
    </PartyContext.Provider>
  );
};
