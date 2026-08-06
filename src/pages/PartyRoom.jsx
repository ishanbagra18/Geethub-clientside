import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useParty } from "../context/PartyContext";
import { useMusicPlayer } from "../context/MusicPlayerContext";
import API_BASE_URL from "../config/api";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { 
  Users, MessageSquare, Send, LogOut, Copy, Disc,
  Play, Pause, SkipForward, SkipBack, Shield, Volume2, Mic, MicOff
} from "lucide-react";
import toast from "react-hot-toast";

const PartyRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const { 
    roomId: activeRoomId,
    isHost,
    members,
    chatMessages,
    sendChatMessage,
    leaveRoom,
    joinRoom
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

  const [hostSearchQuery, setHostSearchQuery] = useState("");
  const [hostSongs, setHostSongs] = useState([]);

  // Fetch initial jukebox songs
  useEffect(() => {
    const fetchInitialSongs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/music/allsongs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setHostSongs((data.songs || []).slice(0, 5));
      } catch (err) {
        console.error("Error fetching initial party songs:", err);
      }
    };
    if (isHost) {
      fetchInitialSongs();
    }
  }, [isHost]);

  // Handle autocomplete search
  useEffect(() => {
    if (!isHost) return;
    if (!hostSearchQuery.trim()) {
      // Revert to initial songs list
      const fetchInitialSongs = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_BASE_URL}/music/allsongs`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await res.json();
          setHostSongs((data.songs || []).slice(0, 5));
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
          `${API_BASE_URL}/music/autocomplete?q=${encodeURIComponent(hostSearchQuery)}`
        );
        const data = await res.json();
        setHostSongs(data.suggestions || []);
      } catch (err) {
        console.error("Error fetching party suggestions:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [hostSearchQuery, isHost]);

  const [messageInput, setMessageInput] = useState("");
  const [voiceChatActive, setVoiceChatActive] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-join room on page refresh if roomId in URL doesn't match activeRoomId
  useEffect(() => {
    if (roomId && roomId !== activeRoomId) {
      joinRoom(roomId.toUpperCase());
    }
  }, [roomId, activeRoomId]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-black to-[#0f172a] text-white flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        {/* Decorative background glows */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

        {/* Header Block across full width */}
        <div className="lg:col-span-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
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
              onClick={() => {
                setVoiceChatActive(prev => !prev);
              }}
              className={`flex-1 sm:flex-none px-5 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition ${
                voiceChatActive 
                  ? "bg-green-500/20 border-green-500 text-green-400" 
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300"
              }`}
            >
              {voiceChatActive ? <Mic size={15} /> : <MicOff size={15} />}
              <span>{voiceChatActive ? "Voice Chat Joined" : "Join Voice"}</span>
            </button>

            <button
              onClick={handleLeaveParty}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <LogOut size={15} />
              <span>Leave Party</span>
            </button>
          </div>
        </div>

        {/* Left Side: Sync Audio Player Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-6 relative z-10">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl space-y-8 flex flex-col justify-center min-h-[500px]">
            {currentSong ? (
              <div className="space-y-8">
                {/* Vinyl Rotation & Visual Art */}
                <div className="flex justify-center relative">
                  <div className="relative group">
                    {/* Glowing outer shadow ring */}
                    <div className={`absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-2xl opacity-40 ${isPlaying ? "animate-pulse" : ""}`} />
                    
                    <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full bg-black border-4 border-white/15 flex items-center justify-center overflow-hidden shadow-2xl">
                      {currentSong.image_url ? (
                        <img
                          src={currentSong.image_url}
                          alt={currentSong.title}
                          className={`w-full h-full object-cover transition-transform duration-[10s] ease-linear ${
                            isPlaying ? "rotate-360-loop" : "brightness-75"
                          }`}
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

                {/* Sync Controller buttons (only active for Host) */}
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
                      onClick={playNext}
                      disabled={!isHost}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                      title={isHost ? "Next Track" : "Controls Locked to Host"}
                    >
                      <SkipForward size={20} />
                    </button>
                  </div>

                  {/* Host status badge */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold bg-white/5 py-1.5 px-4 rounded-full border border-white/5">
                    {isHost ? (
                      <>
                        <Shield size={13} className="text-cyan-400" />
                        <span>You are the party host (Controls active)</span>
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
                    ? "Select a track to start the listening party!" 
                    : "Waiting for the host to play music..."}
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {isHost 
                    ? "Go to home or search, select a playlist or track, and press play. Everyone in this room will sync instantly." 
                    : "Vibe in chat and join voice while waiting for the beats to drop."}
                </p>
              </div>
            )}
          </div>

          {/* Host Jukebox Music Selector */}
          {isHost && (
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-cyan-400">
                  Playlists & Tracks Jukebox
                </h3>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Host controls</span>
              </div>

              {/* Search Box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search and play songs directly in the party room..."
                  value={hostSearchQuery}
                  onChange={(e) => setHostSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>

              {/* Songs List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {hostSongs.length > 0 ? (
                  hostSongs.map((song) => (
                    <div
                      key={song.song_id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={song.image_url || "https://via.placeholder.com/40"}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{song.title}</p>
                          <p className="text-[10px] text-gray-400 truncate">{song.artist}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          playSong(song.song_id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[10px] font-bold uppercase tracking-wider transition active:scale-95"
                      >
                        Play Now
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-gray-500 py-6">No songs found matching query</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Chat & User Presence sidebar (5 cols) */}
        <div className="lg:col-span-5 grid grid-rows-[auto_1fr] gap-6 relative z-10 h-[500px] lg:h-auto">
          
          {/* Members list (Card top) */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3 px-1.5">
              <Users size={16} className="text-cyan-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-300">
                Party Members ({members.length})
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
              {members.map((member, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs font-semibold"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-[10px] font-black text-white">
                    {member.charAt(0).toUpperCase()}
                  </div>
                  <span>{member}</span>
                  {voiceChatActive && (
                    <div className="flex items-end gap-[2px] h-2.5 ml-1">
                      <div className="w-[2px] bg-green-400 rounded-full animate-[pulse_0.5s_infinite_alternate]" style={{ height: "40%" }} />
                      <div className="w-[2px] bg-green-400 rounded-full animate-[pulse_0.7s_infinite_alternate]" style={{ height: "100%" }} />
                      <div className="w-[2px] bg-green-400 rounded-full animate-[pulse_0.6s_infinite_alternate]" style={{ height: "60%" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Room chat panel (Card bottom) */}
          <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-2xl h-full min-h-[350px]">
            
            {/* Header */}
            <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-4">
              <MessageSquare size={16} className="text-purple-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-300">Room Chat</h3>
            </div>

            {/* Chat message logs */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-4 scrollbar-thin">
              {chatMessages.length > 0 ? (
                chatMessages.map((msg, index) => (
                  <div key={index} className="flex flex-col space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-cyan-400">{msg.senderName}</span>
                      <span className="text-[9px] text-gray-500 font-medium">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed bg-white/5 px-3 py-2 rounded-xl rounded-tl-none w-fit max-w-[85%] border border-white/5">
                      {msg.text}
                    </p>
                  </div>
                ))
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
