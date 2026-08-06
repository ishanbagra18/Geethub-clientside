import { FaInstagram, FaHeart, FaComment, FaExternalLinkAlt } from "react-icons/fa";
import { Sparkles, CheckCircle2 } from "lucide-react";

const InstagramFeed = () => {
  const posts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
      caption: "GeetHub: Your localhost for global hits. 🎧 Create & publish your custom playlists on GeetHub today!",
      likes: "1.4k",
      comments: "184",
      tag: "#GeetHub #MusicStreaming #Playlists",
      date: "2 HOURS AGO",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80",
      caption: "Experience Spatial Lossless Audio with GeetHub VIP Premium. Turn your room into a live concert hall 👑✨",
      likes: "2.8k",
      comments: "312",
      tag: "#SpatialAudio #GeetHubVIP #Lossless",
      date: "YESTERDAY",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
      caption: "What song is on your repeat queue today? Share your top Bollywood & Punjabi picks with the GeetHub community 🎶🔥",
      likes: "3.1k",
      comments: "429",
      tag: "#TrendingHits #BollywoodSongs #PunjabiBeats",
      date: "3 DAYS AGO",
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
      caption: "Connect with fellow music creators & chat live while listening to shared beats on GeetHub Messages 💬🚀",
      likes: "1.9k",
      comments: "215",
      tag: "#MusicCommunity #GeetHub #Connect",
      date: "5 DAYS AGO",
    },
  ];

  return (
    <section className="my-16 px-4 md:px-10 lg:px-20 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20">
              <FaInstagram size={18} />
            </span>
            <span className="text-xs font-extrabold text-pink-400 uppercase tracking-widest flex items-center gap-1">
              Official Instagram Feed <Sparkles size={14} />
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            @geethub.music
            <CheckCircle2 size={22} className="text-blue-400 fill-blue-400/20" />
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
            "GeetHub: Your localhost for global hits." Stay connected for daily curated playlists, artist spotlights & exclusive releases.
          </p>
        </div>

        {/* Follow CTA Button */}
        <a
          href="https://www.instagram.com/geethub.music/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-extrabold text-xs tracking-wide shadow-xl shadow-pink-500/20 hover:scale-105 transition"
        >
          <FaInstagram size={16} />
          <span>Follow @geethub.music</span>
          <FaExternalLinkAlt size={11} className="opacity-80" />
        </a>
      </div>

      {/* 📸 Instagram Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <a
            key={post.id}
            href="https://www.instagram.com/geethub.music/"
            target="_blank"
            rel="noreferrer"
            className="group relative bg-[#0e1424] rounded-3xl overflow-hidden border border-white/10 hover:border-pink-500/50 shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
          >
            {/* Header profile bar inside card */}
            <div className="p-3 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/5 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-black text-white">
                    GH
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">geethub.music</p>
                  <p className="text-[9px] text-gray-400 leading-none mt-0.5">GeetHub Official</p>
                </div>
              </div>
              <FaInstagram size={14} className="text-pink-400" />
            </div>

            {/* Post Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-900">
              <img
                src={post.image}
                alt="GeetHub Instagram Post"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Hover Overlay with Likes & Comments */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white font-bold text-sm">
                <div className="flex items-center gap-1.5">
                  <FaHeart className="text-pink-500" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaComment className="text-cyan-400" />
                  <span>{post.comments}</span>
                </div>
              </div>
            </div>

            {/* Post Details & Caption */}
            <div className="p-4 space-y-2">
              <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                {post.caption}
              </p>
              <p className="text-[10px] font-semibold text-pink-400">
                {post.tag}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px] text-gray-500 font-bold uppercase">
                <span>{post.date}</span>
                <span className="text-blue-400 group-hover:underline flex items-center gap-1">
                  View Post →
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default InstagramFeed;
