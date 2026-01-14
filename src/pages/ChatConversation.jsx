import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { Send, ArrowLeft, Image as ImageIcon, Loader2, MessageCircle, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:9000';

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

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
      fetchMessages();
    }
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
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(
        `${API_BASE}/messages/conversation/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                  {selectedUser.first_name?.charAt(0)?.toUpperCase() || 'U'}
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
                        className={`flex group ${
                          isCurrentUser ? 'justify-end' : 'justify-start'
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
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isCurrentUser
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
                          {msg.message_text && (
                            <p className="break-words">{msg.message_text}</p>
                          )}
                          <span
                            className={`text-xs mt-1 block ${
                              isCurrentUser ? 'text-blue-100' : 'text-gray-500'
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
                  className="px-3 text-gray-400 hover:text-white"
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
            <form onSubmit={sendMessage} className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="px-3 py-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <ImageIcon size={20} />
              </button>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                disabled={sendingMessage}
              />
              <button
                type="submit"
                disabled={sendingMessage || (!messageText.trim() && !selectedFile)}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

      <style jsx>{`
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
