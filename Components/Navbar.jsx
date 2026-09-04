import { LogOut, Menu, X, Mic, MicOff, Users } from "lucide-react";
import { useVoiceSearch } from "../src/hooks/useVoiceSearch";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FaMusic, FaFire } from "react-icons/fa";
import { BiSolidLike } from "react-icons/bi";
import { CiViewTimeline } from "react-icons/ci";
import { PiChatsTeardropThin } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";
import { IoMdSearch } from "react-icons/io";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import API_BASE_URL from '../src/config/api';

const getSeenMessageIds = (userId) => {
  try {
    const storageKey = userId ? `seen_message_ids_${userId}` : "seen_message_ids";
    const data = localStorage.getItem(storageKey) || localStorage.getItem("seen_message_ids");
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch (e) {
    return new Set();
  }
};

const saveSeenMessageIds = (userId, setObj) => {
  try {
    const arr = Array.from(setObj);
    localStorage.setItem("seen_message_ids", JSON.stringify(arr));
    if (userId) {
      localStorage.setItem(`seen_message_ids_${userId}`, JSON.stringify(arr));
    }
  } catch (e) {
    console.error(e);
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const { isListening, startListening, stopListening } = useVoiceSearch();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const isInitialCheckRef = useRef(true);
  const sessionStartTimeRef = useRef(Date.now());
  const seenIdsRef = useRef(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Message notifications polling
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let currentUserId = null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId = payload.Uid;
    } catch (e) {
      console.error("Token decode error:", e);
    }

    // Reset initial check ref, record session start time & load seen message IDs
    isInitialCheckRef.current = true;
    sessionStartTimeRef.current = Date.now();
    seenIdsRef.current = getSeenMessageIds(currentUserId);

    const checkNotifications = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/messagingusers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const users = res.data || [];
        
        // Refresh seen IDs from storage
        const storedSeen = getSeenMessageIds(currentUserId);
        storedSeen.forEach(id => seenIdsRef.current.add(id));

        for (const user of users) {
          if (user.user_id === currentUserId) continue;
          try {
            const convRes = await axios.get(`${API_BASE_URL}/messages/conversation/${user.user_id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const msgs = convRes.data?.messages || [];
            const incoming = msgs.filter(m => m.sender_id !== currentUserId);

            const lastReadTimeStr = localStorage.getItem(`last_read_${user.user_id}`);
            const lastReadTime = lastReadTimeStr ? parseInt(lastReadTimeStr, 10) : 0;
            const isCurrentlyChattingWithUser = window.location.pathname === `/messages/${user.user_id}`;

            for (const msg of incoming) {
              const msgId = msg.id || msg._id;
              if (msgId && !seenIdsRef.current.has(msgId)) {
                const msgTime = msg.timestamp ? new Date(msg.timestamp).getTime() : 0;
                
                // ONLY show toast for real-time messages received AFTER login / session start
                // and ONLY if user is not currently viewing that conversation
                if (
                  !isInitialCheckRef.current && 
                  msgTime >= sessionStartTimeRef.current - 2000 && 
                  msgTime > lastReadTime &&
                  !isCurrentlyChattingWithUser
                ) {
                  toast((t) => (
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => {
                        toast.dismiss(t.id);
                        navigate(`/messages/${user.user_id}`);
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                        {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{user.first_name} sent a message</p>
                        <p className="text-xs text-gray-300 truncate max-w-[200px]">
                          {msg.message_text || "Sent an image"}
                        </p>
                      </div>
                    </div>
                  ), {
                    duration: 4000,
                    style: { background: '#121216', border: '1px solid #3b82f6', color: '#fff' }
                  });
                }
                
                // Immediately add to seen IDs set so it will never toast again
                seenIdsRef.current.add(msgId);
              }
            }
          } catch (e) {
            // Ignore individual conversation errors
          }
        }

        saveSeenMessageIds(currentUserId, seenIdsRef.current);
        isInitialCheckRef.current = false;
      } catch (error) {
        console.error("Error fetching message notifications:", error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 5000);

    const handleMessagesRead = () => {
      checkNotifications();
    };

    window.addEventListener("messages_read", handleMessagesRead);
    return () => {
      clearInterval(interval);
      window.removeEventListener("messages_read", handleMessagesRead);
    };
  }, [navigate]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    const delayTimer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/music/autocomplete?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
        setLoading(false);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayTimer);
  }, [searchQuery]);

  const handleMyProfile = () => navigate("/myprofile");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("seen_message_ids");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleSuggestionClick = (song) => {
    navigate(`/playsong/${song.song_id}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const highlightMatch = (text, query) => {
    if (!text || !query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ?
        <span key={index} className="font-bold text-blue-400">{part}</span> :
        part
    );
  };

  return (
    <nav className="w-full bg-[#111] dark:bg-white pt-4 px-6 py-4 flex items-center justify-between shadow-lg text-white dark:text-black relative">
      <Toaster position="top-right" />
      <div
        className="flex flex-col cursor-pointer group"
        onClick={() => navigate("/")}
        title="GeetHub: Your localhost for global hits."
      >
        <div className="flex items-center gap-1">
          <FaMusic className="text-blue-400 dark:text-blue-600 group-hover:scale-110 transition" />
          <span className="text-3xl font-black">Geet</span>
          <span className="text-blue-400 dark:text-blue-600 font-black text-3xl">
            Hub
          </span>
        </div>
        <span className="text-[11px] font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
          Your localhost for global hits.
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <div
          className="flex items-center cursor-pointer hover:opacity-80 hover:text-blue-400 transition-colors"
          onClick={() => navigate('/trending')}
        >
          <FaFire className="mr-2" />
          <button>Trending</button>
        </div>

        <div
          className="flex items-center cursor-pointer hover:opacity-80 hover:text-blue-400 transition-colors"
          onClick={() => navigate('/mostliked')}
        >
          <BiSolidLike className="mr-2" />
          <button>Most Liked</button>
        </div>

        <div
          className="flex items-center cursor-pointer hover:opacity-80 hover:text-blue-400 transition-colors"
          onClick={() => navigate('/mylibrary', { state: { scrollToRecent: true } })}
        >
          <CiViewTimeline className="mr-2" />
          <button>Recently</button>
        </div>

        <div
          className="flex items-center cursor-pointer hover:opacity-80 hover:text-blue-400 transition-colors"
          onClick={() => navigate('/mymostplayed')}
        >
          <PiChatsTeardropThin className="mr-2" />
          <button>Most Played</button>
        </div>


        {/* Live Sync Party Link */}
        <div
          className="flex items-center cursor-pointer hover:opacity-80 hover:text-cyan-400 transition-colors text-400 font-bold"
          onClick={() => navigate('/party')}
          title="Live Sync Listening Party"
        >
          <Users className="mr-1.5" size={18} />
          <button>Party</button>
        </div>
      </div>

      <div className="relative" ref={searchRef}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowSuggestions(false);
            navigate(searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery.trim())}` : "/search");
          }}
          className="flex items-center"
        >
          <IoMdSearch
            onClick={() => {
              setShowSuggestions(false);
              navigate(searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery.trim())}` : "/search");
            }}
            className="absolute left-3 text-gray-400 w-5 h-5 cursor-pointer hover:text-blue-400 transition"
          />
          <input
            type="text"
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (!searchQuery.trim()) {
                navigate("/search");
              } else {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setShowSuggestions(false);
                navigate(searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery.trim())}` : "/search");
              }
            }}
            className="pl-10 pr-10 py-2 rounded-lg bg-[#222] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-28 focus:w-36 sm:w-60 md:w-80 sm:focus:w-72"
          />
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className="absolute right-3 text-gray-400 hover:text-cyan-400 transition"
            title="Search with your voice"
          >
            {isListening ? (
              <Mic className="text-red-500 animate-pulse" size={18} />
            ) : (
              <MicOff size={18} />
            )}
          </button>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a] dark:bg-white 
                          rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50 border border-gray-700 dark:border-gray-300">
            {loading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((song) => (
                <div
                  key={song.song_id}
                  onClick={() => handleSuggestionClick(song)}
                  className="flex items-center gap-3 p-3 hover:bg-[#2a2a2a] dark:hover:bg-gray-100 
                             cursor-pointer transition border-b border-gray-800 dark:border-gray-200 last:border-0"
                >
                  <img
                    src={song.image_url || "/default-album.png"}
                    alt={song.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white dark:text-black font-medium truncate">
                      {highlightMatch(song.title, searchQuery)}
                    </p>
                    <p className="text-gray-400 dark:text-gray-600 text-sm truncate">
                      {highlightMatch(song.artist, searchQuery)}
                    </p>
                    {song.album && (
                      <p className="text-gray-500 dark:text-gray-500 text-xs truncate">
                        {highlightMatch(song.album, searchQuery)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">
                No songs found for {searchQuery}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center ml-2 sm:ml-6 gap-3">
        <button
          onClick={handleMyProfile}
          className="relative flex items-center justify-center p-1 rounded-full 
                     hover:bg-gray-800 dark:hover:bg-gray-200 transition group"
        >
          {isLoggedIn && (
            <>
              <div className="absolute inset-0 rounded-full bg-purple-400/80 backdrop-blur-sm animate-ping"></div>
              <div className="absolute inset-0 rounded-full 
                              bg-gradient-to-r from-purple-500/40 via-blue-500/30 to-cyan-400/40 
                              shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-pulse"></div>
            </>
          )}
          {isLoggedIn && localStorage.getItem("user_emoji") ? (
            <span className="text-2xl relative z-10 p-1">{localStorage.getItem("user_emoji")}</span>
          ) : (
            <CgProfile className="w-7 h-7 relative z-10 drop-shadow-sm" />
          )}
        </button>

        <button
          onClick={handleLogout}
          className="hidden md:flex items-center gap-2 bg-blue-600 dark:bg-blue-500 
                     hover:bg-blue-500 dark:hover:bg-blue-400 
                     px-4 py-2 rounded-full text-sm font-semibold transition text-white"
        >
          Logout
          <LogOut size={18} />
        </button>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition text-white dark:text-black focus:outline-none"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 text-white flex flex-col p-6 z-[9999] md:hidden overflow-y-auto"
          style={{ backgroundColor: '#111111' }}
        >
          {/* Header inside drawer */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-800 mb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <FaMusic className="text-blue-400" />
                <span className="text-2xl font-black">Geet</span>
                <span className="text-blue-400 font-black text-2xl">
                  Hub
                </span>
              </div>
              <span className="text-[10px] font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Your localhost for global hits.
              </span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-800 transition text-white"
            >
              <X size={28} />
            </button>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-5 flex-1">
            <div
              className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-xl cursor-pointer transition-colors"
              onClick={() => { setMenuOpen(false); navigate('/trending'); }}
            >
              <FaFire className="text-blue-400 w-6 h-6" />
              <span className="font-bold text-lg">Trending</span>
            </div>

            <div
              className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-xl cursor-pointer transition-colors"
              onClick={() => { setMenuOpen(false); navigate('/mostliked'); }}
            >
              <BiSolidLike className="text-blue-400 w-6 h-6" />
              <span className="font-bold text-lg">Most Liked</span>
            </div>

            <div
              className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-xl cursor-pointer transition-colors"
              onClick={() => { setMenuOpen(false); navigate('/mylibrary', { state: { scrollToRecent: true } }); }}
            >
              <CiViewTimeline className="text-blue-400 w-6 h-6" />
              <span className="font-bold text-lg">Recently</span>
            </div>

            <div
              className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-xl cursor-pointer transition-colors"
              onClick={() => { setMenuOpen(false); navigate('/mymostplayed'); }}
            >
              <PiChatsTeardropThin className="text-blue-400 w-6 h-6" />
              <span className="font-bold text-lg">Most Played</span>
            </div>


            <div
              className="flex items-center gap-4 p-3 hover:bg-gray-800 rounded-xl cursor-pointer transition-colors w-full"
              onClick={() => { setMenuOpen(false); navigate('/party'); }}
            >
              <Users className="text-blue-400 w-6 h-6" />
              <span className="font-bold text-lg">Sync Party</span>
            </div>
          </div>

          {/* Footer inside drawer */}
          {isLoggedIn && (
            <div className="pt-6 border-t border-gray-800 mt-auto">
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="flex items-center gap-4 p-3 text-red-500 hover:bg-red-500/10 rounded-xl w-full text-left font-bold text-lg transition-colors"
              >
                <LogOut size={22} />
                <span className="font-sans">Logout</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;


