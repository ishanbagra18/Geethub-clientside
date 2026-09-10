import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { Send, ArrowLeft, Image as ImageIcon, Loader2, MessageCircle, X, Trash2, Music, ListMusic, Play, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config/api';

const API_BASE = API_BASE_URL;

const getToken = () => localStorage.getItem('token');

const getUserIdFromToken = () => {
  try {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.Uid;
  } catch (err) {
    console.error('Token decode error:', err);
    return null;
  }
};

const SongPreviewCard = ({ songId, navigate, isCurrentUser }) => {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSong = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_BASE}/song/${songId}`, config);
        if (isMounted && res.data?.song) {
          setSong(res.data.song);
        }
      } catch (err) {
        console.error("Error fetching preview song:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (songId) fetchSong();
    return () => { isMounted = false; };
  }, [songId]);

  return (
    <div
      onClick={() => navigate(`/playsong/${songId}`)}
      className={`my-2 p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 shadow-lg group ${isCurrentUser
          ? 'bg-blue-950/70 border-blue-400/40 hover:border-cyan-300'
          : 'bg-slate-900/90 border-blue-500/40 hover:border-blue-400'
        }`}
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-blue-500/20 flex-shrink-0 flex items-center justify-center border border-blue-500/30">
        {loading ? (
          <Loader2 className="animate-spin text-cyan-400" size={20} />
        ) : song?.image_url ? (
          <img src={song.image_url} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition" />
        ) : (
          <Music className="w-6 h-6 text-cyan-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
          <Music size={11} /> Shared Track
        </div>
        <h4 className="text-sm font-bold text-white truncate">{song?.title || "Listen to Song"}</h4>
        <p className="text-xs text-gray-300 truncate">{song?.artist || `Track ID: ${songId}`}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/playsong/${songId}`);
        }}
        className="px-3 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1 shadow group-hover:scale-105 transition flex-shrink-0"
      >
        <Play size={12} fill="black" />
        Play
      </button>
    </div>
  );
};

const PlaylistPreviewCard = ({ playlistId, navigate, isCurrentUser }) => {
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const currentUserId = getUserIdFromToken();

  useEffect(() => {
    let isMounted = true;
    const fetchPlaylist = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_BASE}/playlist/${playlistId}`, config);
        if (isMounted && res.data?.playlist) {
          const pl = res.data.playlist;
          setPlaylist(pl);
          if (currentUserId && pl.saved_by?.includes(currentUserId)) {
            setIsSaved(true);
          }
        }
      } catch (err) {
        console.error("Error fetching preview playlist:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (playlistId) fetchPlaylist();
    return () => { isMounted = false; };
  }, [playlistId, currentUserId]);

  const handleSavePlaylist = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE}/playlist/${playlistId}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsSaved(res.data?.is_saved);
      toast.success(res.data?.message || "Playlist updated");
    } catch (err) {
      toast.error("Failed to save playlist");
    }
  };

  return (
    <div
      onClick={() => navigate(`/playlist/${playlistId}`)}
      className={`my-2 p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 shadow-lg group ${isCurrentUser
          ? 'bg-purple-950/70 border-purple-400/40 hover:border-purple-300'
          : 'bg-slate-900/90 border-purple-500/40 hover:border-purple-400'
        }`}
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-purple-500/20 flex-shrink-0 flex items-center justify-center border border-purple-500/30">
        {loading ? (
          <Loader2 className="animate-spin text-purple-400" size={20} />
        ) : playlist?.cover_image ? (
          <img src={playlist.cover_image} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-110 transition" />
        ) : (
          <ListMusic className="w-6 h-6 text-purple-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-purple-400 tracking-wider">
          <ListMusic size={11} /> Shared Playlist {playlist?.is_public === false && "(Private)"}
        </div>
        <h4 className="text-sm font-bold text-white truncate">{playlist?.name || "View Playlist"}</h4>
        <p className="text-xs text-gray-300 truncate">{playlist?.description || `${playlist?.song_ids?.length || 0} songs`}</p>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={handleSavePlaylist}
          className={`p-1.5 rounded-full border transition flex items-center gap-1 text-xs font-bold ${isSaved
              ? 'bg-amber-500 text-black border-amber-400'
              : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
          title={isSaved ? "Saved to Library" : "Save Playlist"}
        >
          <Bookmark size={13} fill={isSaved ? "black" : "transparent"} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/playlist/${playlistId}`);
          }}
          className="px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 shadow group-hover:scale-105 transition"
        >
          <ListMusic size={12} />
          Open
        </button>
      </div>
    </div>
  );
};

const renderFormattedMessage = (text, navigate, isCurrentUser) => {
  if (!text) return null;

  const songRegex = /(?:https?:\/\/[^\s]+)?\/playsong\/([a-zA-Z0-9_-]+)/gi;
  const playlistRegex = /(?:https?:\/\/[^\s]+)?\/playlist\/([a-zA-Z0-9_-]+)/gi;

  const songMatches = [...text.matchAll(songRegex)];
  const playlistMatches = [...text.matchAll(playlistRegex)];

  if (songMatches.length > 0 || playlistMatches.length > 0) {
    const cards = [];
    const songIdsFound = new Set();
    const playlistIdsFound = new Set();

    songMatches.forEach(m => {
      const songId = m[1];
      if (songId && !songIdsFound.has(songId)) {
        songIdsFound.add(songId);
        cards.push(<SongPreviewCard key={`song-${songId}`} songId={songId} navigate={navigate} isCurrentUser={isCurrentUser} />);
      }
    });

    playlistMatches.forEach(m => {
      const playlistId = m[1];
      if (playlistId && !playlistIdsFound.has(playlistId)) {
        playlistIdsFound.add(playlistId);
        cards.push(<PlaylistPreviewCard key={`pl-${playlistId}`} playlistId={playlistId} navigate={navigate} isCurrentUser={isCurrentUser} />);
      }
    });

    const cleanText = text
      .replace(songRegex, '')
      .replace(playlistRegex, '')
      .trim();

    return (
      <div className="space-y-1">
        {cleanText && <p className="break-words whitespace-pre-wrap leading-relaxed">{cleanText}</p>}
        {cards}
      </div>
    );
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <p className="break-words whitespace-pre-wrap leading-relaxed">
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline ${isCurrentUser ? 'text-cyan-200 hover:text-white' : 'text-cyan-400 hover:text-cyan-300'}`}
              onClick={(e) => {
                if (part.includes(window.location.origin)) {
                  e.preventDefault();
                  const path = part.replace(window.location.origin, '');
                  navigate(path);
                }
              }}
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </p>
  );
};

const ChatConversation = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentUserId = getUserIdFromToken();

  const markAsRead = (msgs) => {
    if (!userId) return;
    localStorage.setItem(`last_read_${userId}`, Date.now().toString());
    try {
      const storageKey = currentUserId ? `seen_message_ids_${currentUserId}` : "seen_message_ids";
      const seenData = localStorage.getItem(storageKey) || localStorage.getItem("seen_message_ids");
      const seenSet = seenData ? new Set(JSON.parse(seenData)) : new Set();
      if (msgs && msgs.length > 0) {
        msgs.forEach(m => {
          if (m.id) seenSet.add(m.id);
          if (m._id) seenSet.add(m._id);
        });
        const arr = Array.from(seenSet);
        localStorage.setItem("seen_message_ids", JSON.stringify(arr));
        if (currentUserId) {
          localStorage.setItem(`seen_message_ids_${currentUserId}`, JSON.stringify(arr));
        }
      }
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new Event("messages_read"));
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserDetails = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(`${API_BASE}/auth/messagingusers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = response.data.find((u) => u.user_id === userId);
      setSelectedUser(user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const fetchMessages = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(
        `${API_BASE}/messages/conversation/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const fetchedMsgs = response.data.messages || [];
      setMessages(fetchedMsgs);
      markAsRead(fetchedMsgs);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() && !selectedFile) {
      toast.error('Please enter a message or select an image');
      return;
    }

    setSendingMessage(true);
    try {
      const token = getToken();
      if (!token) return;

      const formData = new FormData();
      if (messageText.trim()) {
        formData.append('message_text', messageText.trim());
      }
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      const response = await axios.post(
        `${API_BASE}/messages/send/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.data) {
        setMessages([...messages, response.data.data]);
      }

      setMessageText('');
      setSelectedFile(null);
      setShowImageInput(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) return;

      await axios.delete(`${API_BASE}/messages/delete/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove message from local state
      setMessages(messages.filter((msg) => msg.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <div className="h-screen bg-[#0b0c10] text-white flex flex-col overflow-hidden font-sans selection:bg-cyan-500/30">
      <Navbar />
      
      <div className="flex-1 flex flex-col overflow-hidden max-w-5xl w-full mx-auto sm:p-4 pb-20 sm:pb-24">
        <div className="flex-1 bg-[#12141d]/90 backdrop-blur-2xl sm:rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col">
          
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/messages')}
                className="p-2 hover:bg-slate-800/80 rounded-xl transition text-gray-300 hover:text-white"
                title="Back to messaging directory"
              >
                <ArrowLeft size={22} />
              </button>

              {selectedUser ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-500 p-0.5 shadow-md">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
                        {selectedUser.emoji || selectedUser.first_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base leading-tight">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </h3>
                    <p className="text-xs text-cyan-400 font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Online • {selectedUser.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-800 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-slate-800 rounded animate-pulse"></div>
                    <div className="w-24 h-3 bg-slate-800 rounded animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-cyan-400 text-xs font-semibold">
              Live Messaging
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-radial from-slate-900/50 to-slate-950/80">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3">
                <Loader2 className="animate-spin text-cyan-400" size={36} />
                <p className="text-xs text-gray-400 font-medium">Decrypting conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-cyan-400 mb-1">
                  <MessageCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">No messages yet</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Say hi to {selectedUser?.first_name || 'this user'} and start sharing songs & playlists!
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isCurrentUser = msg.sender_id === currentUserId;
                  const showDate =
                    index === 0 ||
                    formatDate(msg.timestamp) !== formatDate(messages[index - 1]?.timestamp);

                  return (
                    <React.Fragment key={msg.id || index}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="px-4 py-1 bg-slate-800/80 border border-slate-700/50 text-gray-400 text-xs font-semibold rounded-full shadow-sm">
                            {formatDate(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      <div className={`flex group ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                          {isCurrentUser && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-200"
                              title="Delete message"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          
                          <div
                            className={`rounded-2xl p-4 shadow-xl border ${isCurrentUser
                                ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 text-white border-blue-400/30 rounded-tr-xs'
                                : 'bg-[#1b1e2e] text-slate-100 border-slate-700/70 rounded-tl-xs'
                              }`}
                          >
                            {msg.photo_url && (
                              <img
                                src={msg.photo_url}
                                alt="Shared image"
                                className="rounded-xl mb-3 max-w-full h-auto max-h-72 object-cover border border-white/10"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            {msg.message_text && renderFormattedMessage(msg.message_text, navigate, isCurrentUser)}
                            <span
                              className={`text-[10px] font-mono mt-1.5 block text-right ${isCurrentUser ? 'text-cyan-200' : 'text-gray-400'
                                }`}
                            >
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input Box */}
          <div className="p-4 bg-slate-900/90 border-t border-slate-800/90">
            {showImageInput && (
              <div className="mb-3 flex gap-2 items-center bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="flex-1 text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-black hover:file:bg-cyan-400 file:cursor-pointer"
                />
                <button
                  onClick={() => {
                    setShowImageInput(false);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            
            {selectedFile && (
              <div className="mb-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-400/30 rounded-lg text-xs text-cyan-300 font-medium">
                Attachment ready: {selectedFile.name}
              </div>
            )}

            <form onSubmit={sendMessage} className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`p-3 rounded-xl transition border ${showImageInput
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white border-slate-700'
                  }`}
                title="Attach Image"
              >
                <ImageIcon size={20} />
              </button>

              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message or paste a song/playlist URL..."
                className="flex-1 px-4 py-3 bg-slate-800/90 text-white placeholder-gray-500 rounded-xl border border-slate-700/80 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 text-sm transition"
                disabled={sendingMessage}
              />

              <button
                type="submit"
                disabled={sendingMessage || (!messageText.trim() && !selectedFile)}
                className="p-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {sendingMessage ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </form>
          </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.6);
        }
      `}</style>
    </div>
  );
};

export default ChatConversation;
