import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FaMusic, FaFire } from "react-icons/fa";
import { BiSolidLike } from "react-icons/bi";
import { CiViewTimeline } from "react-icons/ci";
import { PiChatsTeardropThin } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";
import { IoMdSearch } from "react-icons/io";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

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
          `http://localhost:9000/music/autocomplete?q=${encodeURIComponent(searchQuery)}`
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
    }, 300); // 300ms debounce

    return () => clearTimeout(delayTimer);
  }, [searchQuery]);

  const handleMyProfile = () => navigate("/myprofile");

  const handleLogout = () => {
    localStorage.removeItem("token");
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
    <nav className="w-full bg-[#111] dark:bg-white pt-4 px-6 py-4 flex items-center justify-between shadow-lg text-white dark:text-black">
      <div
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <FaMusic className="text-white-500 dark:text-white-700" />
        <span className="text-3xl font-bold">Geet</span>
        <span className="text-blue-400 dark:text-blue-600 font-bold text-3xl">
          Hub
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
      </div>

      <div className="relative" ref={searchRef}>
        <div className="flex items-center">
          <IoMdSearch className="absolute left-3 text-gray-400 dark:text-gray-600 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for songs, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            className="pl-10 pr-4 py-2 rounded-lg bg-[#222] dark:bg-gray-200 
                       text-white dark:text-black placeholder-gray-400 
                       dark:placeholder-gray-600 focus:outline-none 
                       focus:ring-2 focus:ring-purple-500 transition w-80"
          />
        </div>

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
                No songs found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>


      

      <div className="flex items-center ml-6 gap-3">
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
          <CgProfile className="w-7 h-7 relative z-10 drop-shadow-sm" />
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-purple-600 dark:bg-purple-500 
                     hover:bg-purple-500 dark:hover:bg-purple-400 
                     px-4 py-2 rounded-full text-sm font-semibold transition text-white"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;


