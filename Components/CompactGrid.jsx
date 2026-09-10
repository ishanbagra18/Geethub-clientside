import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import API_BASE_URL from "../src/config/api";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80";

const CompactGrid = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { playSong } = useMusicPlayer();

  useEffect(() => {
    const fetchHits = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_BASE_URL}/music/allsongs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const rawList = res.data?.songs || res.data || [];

        const mapped = rawList.slice(0, 20).map((s, index) => {
          const types = ["Song", "Album", "Playlist"];
          const type = types[index % types.length];
          const extraTracks = (index % 7) + 3;
          const extraLikes = (index % 12) + 1;

          let subtitle = `${type} • ${s.artist || "Unknown Artist"}`;

          if (type === "Album") {
            subtitle = `Album • ${s.artist || "Artist"} • ${extraTracks} tracks`;
          } else if (type === "Playlist") {
            subtitle = `Playlist • ${s.artist || "Curator"} • ${extraLikes} likes`;
          }

          return {
            id: s.song_id || s._id || s.id,
            title: s.title || "Untitled Track",
            artist: s.artist || "Artist",
            subtitle,
            image:
              s.image_url ||
              s.image ||
              s.cover_image ||
              DEFAULT_IMAGE,
            rawSong: s,
          };
        });

        setItems(mapped);
      } catch (err) {
        console.error("CompactGrid fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHits();
  }, []);

  const handleItemClick = (item) => {
    if (item.id) {
      if (item.rawSong) {
        playSong(
          item.rawSong.song_id,
          items.map((i) => i.rawSong || i)
        );
      } else {
        navigate(`/playsong/${item.id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#080b14] p-4 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-[#111522] animate-pulse border border-slate-800"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full font-sans bg-[#080b14] p-4 sm:p-5 rounded-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="
              group relative flex items-center gap-3.5 p-3
              rounded-2xl
              bg-[#111522]
              border border-slate-800
              hover:border-cyan-500/50
              shadow-md
              hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]
              transition-all duration-300
              hover:-translate-y-1
              cursor-pointer
              overflow-hidden
            "
          >
            {/* Thumbnail */}
            <div
              className="
                relative w-14 h-14 rounded-xl overflow-hidden
                bg-slate-900 flex-shrink-0
                border border-slate-700/60
                shadow-md
              "
            >
              <img
                src={item.image}
                alt={item.title}
                className="
                  w-full h-full object-cover
                  group-hover:scale-110
                  transition-transform duration-500
                "
                onError={(e) => {
                  e.target.src = DEFAULT_IMAGE;
                }}
              />

              <div
                className="
                  absolute inset-0
                  bg-black/30
                  group-hover:bg-black/10
                  transition-colors
                "
              />

              {/* Play Button */}
              <div
                className="
                  absolute inset-0
                  flex items-center justify-center
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                "
              >
                <div
                  className="
                    w-8 h-8 rounded-full
                    bg-cyan-400 text-black
                    flex items-center justify-center
                    shadow-lg
                  "
                >
                  <Play size={14} fill="black" className="ml-0.5" />
                </div>
              </div>
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0 pr-1">
              <h3
                className="
                  text-sm font-bold
                  text-white
                  group-hover:text-cyan-300
                  transition-colors
                  truncate
                "
              >
                {item.title}
              </h3>

              <p
                className="
                  text-xs
                  text-gray-400
                  font-medium
                  truncate
                  mt-0.5
                "
              >
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompactGrid;