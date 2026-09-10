import { FaInstagram, FaHeart, FaComment, FaExternalLinkAlt } from "react-icons/fa";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

const InstagramFeed = () => {
  const posts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
      caption: "GeetHub: Every Mood Has a Song. 🎧 Create & publish your custom playlists on GeetHub today!",
      likes: "2.4k",
      comments: "284",
      tag: "#GeetHub #MusicStreaming #Playlists",
      date: "2 HOURS AGO",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80",
      caption: "Experience Spatial Lossless Audio with GeetHub VIP Premium. Turn your room into a live concert hall 👑✨",
      likes: "3.8k",
      comments: "412",
      tag: "#SpatialAudio #GeetHubVIP #Lossless",
      date: "YESTERDAY",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
      caption: "What song is on your repeat queue today? Share your top Bollywood & Punjabi picks with the GeetHub community 🎶🔥",
      likes: "4.1k",
      comments: "529",
      tag: "#TrendingHits #BollywoodSongs #PunjabiBeats",
      date: "3 DAYS AGO",
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
      caption: "Connect with fellow music creators & chat live while listening to shared beats on GeetHub Messages 💬🚀",
      likes: "2.9k",
      comments: "315",
      tag: "#MusicCommunity #GeetHub #Connect",
      date: "5 DAYS AGO",
    },
  ];

  return (
    <section className="my-24 md:my-36 px-4 md:px-8 max-w-7xl mx-auto font-sans">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20">
              <FaInstagram size={20} />
            </span>
            <span className="text-xs font-black text-pink-400 uppercase tracking-widest flex items-center gap-1.5">
              Official Instagram Social <Sparkles size={14} className="text-pink-400 animate-pulse" />
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            @geethub.music
            <CheckCircle2 size={24} className="text-blue-400 fill-blue-400/20" />
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl font-medium">
            "Every Mood Has a Song." Stay connected for daily curated playlists, artist spotlights & exclusive releases.
          </p>
        </div>

        {/* Follow CTA Button */}
        <a
          href="https://www.instagram.com/geethub.music/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-pink-500/20 hover:scale-105 transition-all duration-300 self-start md:self-auto"
        >
          <FaInstagram size={18} />
          <span>Follow @geethub.music</span>
          <ArrowRight size={14} />
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
            className="group relative bg-[#101322]/90 rounded-3xl overflow-hidden border border-slate-800 hover:border-pink-500/50 shadow-xl hover:shadow-[0_0_30px_rgba(236,72,153,0.25)] transition-all duration-500 flex flex-col justify-between hover:-translate-y-1.5"
          >
            {/* Header profile bar inside card */}
            <div className="p-3.5 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-slate-800/60 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-black text-white">
                    GH
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-none">geethub.music</p>
                  <p className="text-[9px] text-gray-400 leading-none mt-0.5 font-mono">GeetHub Official</p>
                </div>
              </div>
              <FaInstagram size={16} className="text-pink-400" />
            </div>

            {/* Post Image Container */}
            <div className="relative aspect-square overflow-hidden bg-slate-900">
              <img
                src={post.image}
                alt="GeetHub Instagram Post"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Hover Overlay with Likes & Comments */}
              <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white font-bold text-sm">
                <div className="flex items-center gap-2">
                  <FaHeart className="text-pink-500" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaComment className="text-cyan-400" />
                  <span>{post.comments}</span>
                </div>
              </div>
            </div>

            {/* Post Details & Caption */}
            <div className="p-4 space-y-2">
              <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed font-medium">
                {post.caption}
              </p>
              <p className="text-[10px] font-bold text-pink-400">
                {post.tag}
              </p>
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60 text-[9px] text-gray-400 font-bold uppercase">
                <span>{post.date}</span>
                <span className="text-cyan-400 group-hover:underline flex items-center gap-1">
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
