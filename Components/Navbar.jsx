import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaMusic, FaFire } from "react-icons/fa";
import { BiSolidLike } from "react-icons/bi";
import { CiViewTimeline } from "react-icons/ci";
import { PiChatsTeardropThin } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";


const Navbar = () => {
  const navigate = useNavigate();

  const handleMyProfile = () => navigate("/myprofile");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-[#111] dark:bg-white pt-4 px-6 py-4 flex items-center justify-between shadow-lg text-white dark:text-black">
      <div
        className="flex items-center gap-1 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <FaMusic className="text-purple-500 dark:text-purple-700" />
        <span className="text-3xl font-bold">Geet</span>
        <span className="text-blue-400 dark:text-blue-600 font-bold text-3xl">
          Hub
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <div className="flex items-center cursor-pointer hover:opacity-80">
          <FaFire className="mr-2" />
          <button>Trending</button>
        </div>

        <div className="flex items-center cursor-pointer hover:opacity-80">
          <BiSolidLike className="mr-2" />
          <button>Most Liked</button>
        </div>

        <div className="flex items-center cursor-pointer hover:opacity-80">
          <CiViewTimeline className="mr-2" />
          <button>Recently</button>
        </div>

        <div className="flex items-center cursor-pointer hover:opacity-80">
          <PiChatsTeardropThin className="mr-2" />
          <button>Top Charts</button>
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="   Search for songs, artists, albums..."
          className="pr-4 py-2 rounded-lg bg-[#222] dark:bg-gray-200 
                     text-white dark:text-black placeholder-gray-400 
                     dark:placeholder-gray-600 focus:outline-none 
                     focus:ring-2 focus:ring-purple-500 transition w-80"
        />
      </div>

      <div className="flex items-center ml-6 gap-3">
        

        <button
          onClick={handleMyProfile}
          className="flex items-center justify-center p-1 rounded-full 
                     hover:bg-gray-800 dark:hover:bg-gray-200 transition"
        >
          <CgProfile className="w-7 h-7" />
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
