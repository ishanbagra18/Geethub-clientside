import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useParty } from "../context/PartyContext";
import { useMusicPlayer } from "../context/MusicPlayerContext";
import API_BASE_URL from "../config/api";
import Navbar from "../../Components/Navbar";
import { 
  Users, MessageSquare, Send, LogOut, Copy, Disc,
  Play, Pause, SkipForward, SkipBack, Shield, Volume2, Mic, MicOff,
  Lock, Unlock, ListMusic, Plus, Trash2, Crown, AlertTriangle, Check
} from "lucide-react";
import toast from "react-hot-toast";

const PartyRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const { 
    roomId: activeRoomId,
    isHost,
    hostId,
    hostName,
    members,
    memberDetails,
    queue,
    isQueueLocked,
    chatMessages,
    hostStatus,
    sendChatMessage,
    leaveRoom,
    joinRoom,
    addToQueue,
    removeFromQueue,
    toggleQueueLock,
    playNextInQueue,
    clearQueue,
    transferHost,
  } = useParty();

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    playSong,
  } = useMusicPlayer();

  const [searchQuery, setSearchQuery] = useState("");
  const [songsList, setSongsList] = useState([]);
  const [activeTab, setActiveTab] = useState("queue"); // "queue" | "jukebox" | "members"
  const [messageInput, setMessageInput] = useState("");
  const [voiceChatActive, setVoiceChatActive] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch initial jukebox songs
  useEffect(() => {
    const fetchInitialSongs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/music/allsongs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setSongsList((data.songs || []).slice(0, 8));
      } catch (err) {
        console.error("Error fetching songs:", err);
      }
    };
    fetchInitialSongs();
  }, []);

  // Handle autocomplete search
  useEffect(() => {
    if (!searchQuery.trim()) {
      const fetchInitialSongs = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_BASE_URL}/music/allsongs`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await res.json();
          setSongsList((data.songs || []).slice(0, 8));
        } catch (err) {
          console.error(err);
        }
      };
      fetchInitialSongs();
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/music/autocomplete?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setSongsList(data.suggestions || []);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-join room on page refresh if roomId in URL doesn't match activeRoomId
  useEffect(() => {
    if (roomId && roomId !== activeRoomId) {
      joinRoom(roomId.toUpperCase());
    }
  }, [roomId, activeRoomId, joinRoom]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleCopyInvite = () => {
    const inviteLink = `${window.location.origin}/party/${roomId}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard!");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    sendChatMessage(messageInput.trim());
    setMessageInput("");
  };

  const handleLeaveParty = () => {
    leaveRoom();
    navigate("/party");
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  // Get current user id from localStorage
  const currentUserId = (() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return localStorage.getItem("geethub_guest_id") || "";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.Uid || payload.id || payload.user_id || "";
    } catch {
      return "";
    }
  })();

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between overflow-x-hidden relative">
      <div className="fixed inset-0 ambient-mesh-glow pointer-events-none -z-10" />
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        {/* Decorative background glows */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

        {/* Host Disconnection Recovery Banner */}
        {!hostStatus.connected && (
          <div className="lg:col-span-12 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 backdrop-blur-md animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-400" size={24} />
              <div>
                <p className="text-sm font-bold text-amber-300">
                  Host connection temporarily interrupted
                </p>
                <p className="text-xs text-amber-200/70">
                  Waiting for host reconnection. If the host does not return shortly, a new host will be elected automatically.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-300">
              Recovery Mode Active
            </span>
          </div>
        )}

        {/* Header Block across full width */}
        <div className="lg:col-span-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md relative z-10 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${hostStatus.connected ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
              <h2 className="text-xs font-black uppercase tracking-widest text-cyan-400">
                Listening Party Lobby
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight">{roomId}</h1>
              <button
                onClick={handleCopyInvite}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
                title="Copy Invite Link"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Voice Chat Toggle Option */}
            <button
              onClick={() => setVoiceChatActive((prev) => !prev)}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition ${
                voiceChatActive 
                  ? "bg-green-500/20 border-green-500 text-green-400" 
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
              }`}
            >
              {voiceChatActive ? <Mic size={15} /> : <MicOff size={15} />}
              <span>{voiceChatActive ? "Voice Active" : "Join Voice"}</span>
            </button>

            <button
              onClick={handleLeaveParty}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <LogOut size={15} />
              <span>{isHost ? "End Party" : "Leave"}</span>
            </button>
          </div>
        </div>

        {/* Left Side: Sync Audio Player Visualizer & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6 relative z-10">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl space-y-8 flex flex-col justify-center min-h-[460px]">
            {currentSong ? (
              <div className="space-y-8">
                {/* Vinyl Rotation & Visual Art */}
                <div className="flex justify-center relative">
                  <div className="relative group">
                    <div className={`absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-2xl opacity-40 ${isPlaying ? "animate-pulse" : ""}`} />
                    
                    <div className="relative w-52 h-52 md:w-60 md:h-60 rounded-full bg-black border-4 border-white/15 flex items-center justify-center overflow-hidden shadow-2xl">
                      {currentSong.image_url ? (
                        <img
                          src={currentSong.image_url}
                          alt={currentSong.title}
                          className="w-full h-full object-cover"
                          style={{
                            animation: isPlaying ? "spin 20s linear infinite" : "none",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        <Disc size={96} className={`text-cyan-400 ${isPlaying ? "animate-spin" : ""}`} />
                      )}
                      
                      {/* Vinyl center pin */}
                      <div className="absolute w-12 h-12 rounded-full bg-black border-2 border-white/10 flex items-center justify-center">
                        <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Track Details */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-black truncate max-w-md mx-auto">{currentSong.title}</h2>
                  <p className="text-sm font-semibold text-gray-400">{currentSong.artist}</p>
                  
                  {currentSong.genre && (
                    <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-wider mt-1">
                      {currentSong.genre}
                    </span>
                  )}
                </div>

                {/* Seek Slider and Time */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-400 px-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  
                  <div className="relative group/seek">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime || 0}
                      onChange={(e) => {
                        if (isHost) seekTo(Number(e.target.value));
                      }}
                      disabled={!isHost}
                      className="w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer focus:outline-none accent-cyan-500"
                    />
                    {!isHost && (
                      <div className="absolute inset-0 bg-transparent cursor-not-allowed" title="Playback synced with Host" />
                    )}
                  </div>
                </div>

                {/* Controller buttons */}
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={playPrevious}
                      disabled={!isHost}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                      title={isHost ? "Previous Track" : "Controls Locked to Host"}
                    >
                      <SkipBack size={20} />
                    </button>

                    <button
                      onClick={togglePlayPause}
                      disabled={!isHost}
                      className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      title={isHost ? "Play / Pause" : "Controls Locked to Host"}
                    >
                      {isPlaying ? (
                        <Pause size={28} fill="white" />
                      ) : (
                        <Play size={28} fill="white" className="ml-1" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (queue.length > 0) {
                          playNextInQueue();
                        } else {
                          playNext();
                        }
                      }}
                      disabled={!isHost}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                      title={isHost ? (queue.length > 0 ? "Next Track in Queue" : "Next Track") : "Controls Locked to Host"}
                    >
                      <SkipForward size={20} />
                    </button>
                  </div>

                  {/* Host status badge */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold bg-white/5 py-1.5 px-4 rounded-full border border-white/5">
                    {isHost ? (
                      <>
                        <Shield size={13} className="text-cyan-400" />
                        <span>You are the party host (Server-authoritative controls active)</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={13} className="text-purple-400 animate-pulse" />
                        <span>Synchronized with host playback</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-12 px-6">
                <Disc size={64} className="text-gray-600 animate-pulse mx-auto" />
                <h3 className="text-xl font-bold text-gray-300">
                  {isHost 
                    ? "Select a track or add to queue to start the party!" 
                    : "Waiting for the host to play music..."}
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {isHost 
                    ? "Use the Jukebox below to search tracks and play or add them to the shared queue." 
                    : "Add tracks to the shared queue below or chat with participants while waiting for the beat."}
                </p>
              </div>
            )}
          </div>

          {/* Interactive Shared Queue & Jukebox Hub */}
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl space-y-5">
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("queue")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === "queue"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <ListMusic size={14} />
                  <span>Shared Queue ({queue.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("jukebox")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === "jukebox"
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Plus size={14} />
                  <span>Jukebox & Add Tracks</span>
                </button>
              </div>

              {/* Host Queue Lock Controls */}
              <div className="flex items-center gap-2">
                {isHost ? (
                  <button
                    onClick={() => toggleQueueLock(!isQueueLocked)}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition ${
                      isQueueLocked
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                        : "bg-green-500/20 border-green-500/40 text-green-300 hover:bg-green-500/30"
                    }`}
                    title={isQueueLocked ? "Click to unlock queue for everyone" : "Click to lock queue (Host only adds)"}
                  >
                    {isQueueLocked ? <Lock size={12} /> : <Unlock size={12} />}
                    <span>{isQueueLocked ? "Queue Locked (Host Only)" : "Queue Unlocked"}</span>
                  </button>
                ) : (
                  <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 ${
                    isQueueLocked
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : "bg-green-500/10 border-green-500/20 text-green-400"
                  }`}>
                    {isQueueLocked ? <Lock size={11} /> : <Unlock size={11} />}
                    <span>{isQueueLocked ? "Queue Locked by Host" : "Queue Open"}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Tab 1: Shared Queue List */}
            {activeTab === "queue" && (
              <div className="space-y-3">
                {queue.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {queue.map((item, idx) => {
                      const canRemove = isHost || item.added_by_id === currentUserId;
                      return (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/[0.08] border border-white/5 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-mono font-bold text-gray-500 w-4">
                              {idx + 1}
                            </span>
                            <img
                              src={item.image_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&auto=format&fit=crop&q=60"}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{item.title}</p>
                              <p className="text-[10px] text-gray-400 truncate">
                                {item.artist} • <span className="text-cyan-400 font-semibold">Added by {item.added_by}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {canRemove && (
                              <button
                                onClick={() => removeFromQueue(item.id)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition"
                                title="Remove from queue"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-2 border border-dashed border-white/10 rounded-2xl">
                    <ListMusic size={32} className="text-gray-600 mx-auto" />
                    <p className="text-xs text-gray-400 font-semibold">The shared queue is currently empty</p>
                    <button
                      onClick={() => setActiveTab("jukebox")}
                      className="text-xs text-cyan-400 hover:underline font-bold"
                    >
                      Search songs in the Jukebox to add them
                    </button>
                  </div>
                )}

                {/* Queue Action Footer */}
                {queue.length > 0 && isHost && (
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <button
                      onClick={clearQueue}
                      className="text-[11px] text-gray-500 hover:text-red-400 transition"
                    >
                      Clear Queue
                    </button>
                    <button
                      onClick={playNextInQueue}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <SkipForward size={13} />
                      <span>Play Next in Queue</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Jukebox Search & Add */}
            {activeTab === "jukebox" && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tracks to add to the party room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {songsList.length > 0 ? (
                    songsList.map((song) => {
                      const songId = song.song_id || song.id;
                      const isLockedForMember = isQueueLocked && !isHost;
                      return (
                        <div
                          key={songId}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={song.image_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&auto=format&fit=crop&q=60"}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{song.title}</p>
                              <p className="text-[10px] text-gray-400 truncate">{song.artist}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isHost && (
                              <button
                                onClick={() => playSong(songId)}
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase transition"
                              >
                                Play Now
                              </button>
                            )}

                            <button
                              onClick={() => addToQueue(song)}
                              disabled={isLockedForMember}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1 ${
                                isLockedForMember
                                  ? "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
                                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md active:scale-95"
                              }`}
                              title={isLockedForMember ? "Queue is locked by host" : "Add track to shared queue"}
                            >
                              {isLockedForMember ? (
                                <>
                                  <Lock size={11} />
                                  <span>Locked</span>
                                </>
                              ) : (
                                <>
                                  <Plus size={11} />
                                  <span>Add to Queue</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-xs text-gray-500 py-6">No matching songs found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Members & Live Chat sidebar (5 cols) */}
        <div className="lg:col-span-5 grid grid-rows-[auto_1fr] gap-6 relative z-10 h-[520px] lg:h-auto">
          
          {/* Members list Card */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3 px-1.5">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-cyan-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-300">
                  Party Members ({members.length})
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-gray-400">
                Host: <strong className="text-cyan-400">{hostName || "Host"}</strong>
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
              {memberDetails.length > 0 ? (
                memberDetails.map((member) => (
                  <div 
                    key={member.id} 
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                      member.is_host 
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300" 
                        : "bg-white/5 border-white/5 text-gray-300"
                    }`}
                  >
                    {member.is_host && <Crown size={12} className="text-yellow-400" />}
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-[10px] font-black text-white">
                      {(member.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span>{member.name}</span>
                    
                    {/* Host ability to transfer host role */}
                    {isHost && !member.is_host && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Transfer host permissions to ${member.name}?`)) {
                            transferHost(member.id);
                          }
                        }}
                        className="ml-1 p-0.5 rounded text-gray-500 hover:text-yellow-400 transition"
                        title={`Make ${member.name} the Host`}
                      >
                        <Crown size={10} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                members.map((member, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs font-semibold"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-[10px] font-black text-white">
                      {member.charAt(0).toUpperCase()}
                    </div>
                    <span>{member}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Room chat panel */}
          <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-2xl h-full min-h-[360px]">
            {/* Header */}
            <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-4">
              <MessageSquare size={16} className="text-purple-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-300">Live Room Chat</h3>
            </div>

            {/* Chat message logs */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-4 scrollbar-thin">
              {chatMessages.length > 0 ? (
                chatMessages.map((msg, index) => {
                  const isSystem = msg.senderName === "System" || msg.senderId === "system";
                  if (isSystem) {
                    return (
                      <div key={index} className="text-center py-1">
                        <span className="text-[11px] font-semibold text-cyan-300/80 bg-white/5 px-3 py-1 rounded-full border border-white/5 inline-block">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div key={index} className="flex flex-col space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-cyan-400">{msg.senderName}</span>
                        <span className="text-[9px] text-gray-500 font-medium">
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <p className="text-xs text-gray-200 leading-relaxed bg-white/5 px-3 py-2 rounded-xl rounded-tl-none w-fit max-w-[85%] border border-white/5">
                        {msg.text}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-center text-xs text-gray-500 py-12">
                  No messages yet. Send a message to get the vibe started! 💬✨
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input field box */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-white/5">
              <input
                type="text"
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 placeholder-gray-500 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50 text-white"
              />
              <button
                type="submit"
                className="p-3 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-md hover:scale-105 transition active:scale-95 flex items-center justify-center"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

        </div>
      </main>

      {/* Dynamic Keyframes for Vinyl Rotation Spin */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default PartyRoom;
