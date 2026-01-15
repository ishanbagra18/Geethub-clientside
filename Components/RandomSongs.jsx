import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import API_BASE_URL from "../src/config/api";

const PLACEHOLDER = "https://via.placeholder.com/600x300?text=No+Image";

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const RandomSongs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const pickRandom = (songs) => shuffle(songs).slice(0, 4);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_BASE_URL}/music/allsongs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const mapped = (res.data?.songs || []).map((s) => ({
          title: s.title || "Unknown Title",
          artist: s.artist || "Unknown Artist",
          img: s.image_url || PLACEHOLDER,
          genre: s.genre || "Music",
          lang: s.language || "Hindi",
          song_id: s.song_id,
        }));

        setItems(pickRandom(mapped));
      } catch (err) {
        console.error("RandomSongs fetch error:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  return (
    <div className="px-6 md:px-20 mt-40 mb-24 ">
      <h2 className="text-3xl  font-extrabold mb-4 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent tracking-wide">
        Fresh Picks For You
      </h2>

      {/* Skeleton Loader */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[280px] rounded-xl bg-gray-800 overflow-hidden animate-pulse"
            >
              <div className="h-full w-full bg-gradient-to-br from-gray-700 to-gray-900"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {items.map((s, i) => (
            <div
              key={s.song_id}
              className="
              relative group cursor-pointer overflow-hidden rounded-2xl shadow-xl
              bg-black/20 backdrop-blur-xl
              transition-all duration-500 
              hover:scale-[1.03] hover:shadow-2xl hover:-rotate-[0.5deg]
              opacity-0 animate-fadeIn 
            "
              style={{ height: 290, animationDelay: `${i * 0.12}s` }}
            >
              <div
                onClick={() => navigate(`/playsong/${s.song_id}`)}
                className="w-full h-full"
              >
                <img
                  src={s.img}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  onError={(e) => (e.target.src = PLACEHOLDER)}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                <span className="absolute top-3 right-3 bg-yellow-400/90 text-black px-3 py-1 text-xs font-semibold rounded-full shadow">
                  {s.lang}
                </span>

                <div
                  className="
                  absolute inset-0 flex items-center justify-center 
                  opacity-0 group-hover:opacity-100 
                  transition-all duration-500
                "
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/90 shadow-lg">
                    <Play size={28} className="text-black ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 text-white drop-shadow-lg">
                  <p className="text-gray-300 text-sm mt-1">{s.artist}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>
        {`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s ease forwards;
        }
      `}
      </style>
    </div>
  );
};

export default RandomSongs;
