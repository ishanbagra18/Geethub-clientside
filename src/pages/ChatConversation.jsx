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
          ? 'bg-blue-950/60 border-blue-300/40 hover:border-blue-200'
          : 'bg-gray-900/90 border-blue-500/40 hover:border-blue-400'
        }`}
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-blue-500/20 flex-shrink-0 flex items-center justify-center border border-blue-500/30">
        {loading ? (
          <Loader2 className="animate-spin text-blue-400" size={20} />
        ) : song?.image_url ? (
          <img src={song.image_url} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition" />
        ) : (
          <Music className="w-6 h-6 text-blue-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-400 tracking-wider">
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
        className="px-3 py-1.5 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs flex items-center gap-1 shadow group-hover:scale-105 transition flex-shrink-0"
      >
        <Play size={12} fill="white" />
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
          ? 'bg-purple-950/60 border-purple-300/40 hover:border-purple-200'
          : 'bg-gray-900/90 border-purple-500/40 hover:border-purple-400'
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
        {cleanText && <p className="break-words whitespace-pre-wrap">{cleanText}</p>}
        {cards}
      </div>
    );
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <p className="break-words whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline ${isCurrentUser ? 'text-blue-200 hover:text-white' : 'text-blue-400 hover:text-blue-300'}`}
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
      const seenData = localStorage.getItem("seen_message_ids");
      const seenSet = seenData ? new Set(JSON.parse(seenData)) : new Set();
      if (msgs && msgs.length > 0) {
        msgs.forEach(m => { if (m.id) seenSet.add(m.id); });
        localStorage.setItem("seen_message_ids", JSON.stringify(Array.from(seenSet)));
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
      toast.success('Message deleted successfully');
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
    <div className="h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 bg-gradient-to-br from-gray-900 via-black to-gray-900 border-x border-blue-500/20 shadow-2xl overflow-hidden flex flex-col">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-gray-700 flex items-center gap-4">
            <button
              onClick={() => navigate('/messages')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="text-white" size={24} />
            </button>

            {selectedUser ? (
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {selectedUser.emoji || selectedUser.first_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <p className="text-xs text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="w-24 h-3 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-blue-400" size={32} />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle size={64} className="mb-4 opacity-30" />
                <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isCurrentUser = msg.sender_id === currentUserId;
                  const showDate =
                    index === 0 ||
                    formatDate(msg.timestamp) !==
                    formatDate(messages[index - 1]?.timestamp);

                  return (
                    <React.Fragment key={msg.id || index}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">
                            {formatDate(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex group ${isCurrentUser ? 'justify-end' : 'justify-start'
                          }`}
                      >
                        <div className="flex items-end gap-2">
                          {isCurrentUser && (
                            <button
                              onClick={() => deleteMessage(msg.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-red-500/80 hover:bg-red-600 text-white"
                              title="Delete message"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          <div
                            className={`max-w-[80%] min-w-[100px] rounded-2xl px-4 py-2 ${isCurrentUser
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                                : 'bg-gray-800 text-gray-100'
                              }`}
                          >
                            {msg.photo_url && (
                              <img
                                src={msg.photo_url}
                                alt="Shared"
                                className="rounded-lg mb-2 max-w-full h-auto"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            {msg.message_text && renderFormattedMessage(msg.message_text, navigate, isCurrentUser)}
                            <span
                              className={`text-xs mt-1 block ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'
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

          {/* Message Input */}
          <div className="p-4 bg-gray-900/50 border-t border-gray-700">
            {showImageInput && (
              <div className="mb-2 flex gap-2 items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer"
                />
                <button
                  onClick={() => {
                    setShowImageInput(false);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-3 text-gray-400 hover:text-white flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            {selectedFile && (
              <div className="mb-2 px-3 py-2 bg-gray-800 rounded-lg text-sm text-gray-300">
                Selected: {selectedFile.name}
              </div>
            )}
            <form onSubmit={sendMessage} className="flex gap-2 items-center w-full">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="flex-shrink-0 p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <ImageIcon size={20} />
              </button>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 min-w-0 px-4 py-2.5 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 whitespace-nowrap overflow-x-auto"
                disabled={sendingMessage}
              />
              <button
                type="submit"
                disabled={sendingMessage || (!messageText.trim() && !selectedFile)}
                className="flex-shrink-0 p-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
};

export default ChatConversation;
