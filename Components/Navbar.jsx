import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaMusic, FaFire } from "react-icons/fa";
import { BiSolidLike } from "react-icons/bi";
import { CiViewTimeline } from "react-icons/ci";
import { PiChatsTeardropThin } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleMyProfile = () => navigate("/myprofile");

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };


  // some frontend chages like userprofile has been done

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
          className="flex items-center cursor-pointer hover:opacity-80 hover:text-cyan-400 transition-colors"
          onClick={() => navigate('/trending')}
        >
          <FaFire className="mr-2" />
          <button>Trending</button>
        </div>

        <div 
          className="flex items-center cursor-pointer hover:opacity-80 hover:text-cyan-400 transition-colors"
          onClick={() => navigate('/mostliked')}
        >
          <BiSolidLike className="mr-2" />
          <button>Most Liked</button>
        </div>

        <div 
          className="flex items-center cursor-pointer hover:opacity-80 hover:text-cyan-400 transition-colors" 
          onClick={() => navigate('/mylibrary', { state: { scrollToRecent: true } })}
        >
          <CiViewTimeline className="mr-2" />
          <button>Recently</button>
        </div>

        <div 
          className="flex items-center cursor-pointer hover:opacity-80 hover:text-cyan-400 transition-colors"
          onClick={() => navigate('/topcharts')}
        >
          <PiChatsTeardropThin className="mr-2" />
          <button>Top Charts</button>
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search for songs, artists, albums..."
          className="pr-4 py-2 rounded-lg bg-[#222] dark:bg-gray-200 
                     text-black dark:text-black placeholder-gray-400 
                     dark:placeholder-gray-600 focus:outline-none 
                     focus:ring-2 focus:ring-purple-500 transition w-80 p-3"
        />
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


