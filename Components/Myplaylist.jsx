import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ListMusic, Globe, Lock, Clock, Play, Share2, ChevronLeft, ChevronRight, Music } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useMusicSections } from '../src/context/MusicSectionsContext';
import API_BASE_URL from '../src/config/api';

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getToken = () => localStorage.getItem("token");
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

const Myplaylist = ({ showCommunity = false, limitToHome = false, maxToShow = null }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const rowRef = React.useRef(null);
  const { sections, loading: contextLoading } = useMusicSections();

  useEffect(() => {
    if (!showCommunity) {
      const fetchPlaylists = async () => {
        const token = getToken();
        if (!token) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }
        try {
          const response = await axios.get(`${API_BASE_URL}/playlist/myplaylists`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPlaylists(response.data?.playlists || []);
          setLoading(false);
        } catch (err) {
          setError("Failed to load playlists.");
          setLoading(false);
        }
      };
      fetchPlaylists();
    } else {
      setLoading(false);
    }
  }, [showCommunity]);

  const rawPlaylists = showCommunity 
    ? (limitToHome ? (sections.communityPlaylists || []).slice(0, 10) : (sections.communityPlaylists || []))
    : playlists;

  const displayPlaylists = maxToShow ? rawPlaylists.slice(0, maxToShow) : rawPlaylists;
  const isLoading = showCommunity ? contextLoading.communityPlaylists : loading;

  const scrollByAmount = (direction) => {
    if (!rowRef.current) return;
    const amount = 340;
    rowRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (isLoading) return (
    <div className="p-8 text-center text-cyan-400 font-bold uppercase tracking-wider animate-pulse">
      Loading playlists...
    </div>
  );
  
  if (error) return (
    <div className="p-8 text-center text-red-400 font-semibold bg-red-500/10 rounded-2xl border border-red-500/20">
      {error}
    </div>
  );
  
  if (displayPlaylists.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 bg-[#101322]/80 rounded-3xl border border-slate-800/80">
        No playlists found. Create one to get started!
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      <Toaster position="bottom-right" />
      
      <div className="relative group">
        {/* Navigation Arrows */}
        <button
          onClick={() => scrollByAmount("left")}
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-950/90 border border-cyan-500/40 text-cyan-300 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-cyan-500 hover:text-black hover:scale-110 shadow-2xl backdrop-blur-md"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => scrollByAmount("right")}
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-950/90 border border-cyan-500/40 text-cyan-300 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-cyan-500 hover:text-black hover:scale-110 shadow-2xl backdrop-blur-md"
        >
          <ChevronRight size={20} />
        </button>

        {/* Playlists Scroller */}
        <div
          ref={rowRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide hide-scrollbar no-scrollbar snap-x snap-mandatory pb-6 pt-2 transform-gpu"
        >
          {displayPlaylists.map((playlist) => (
            <div
              key={playlist.id || playlist._id}
              onClick={() => navigate(`/playlist/${playlist.id || playlist._id}`)}
              className="group/card bg-gradient-to-br from-[#121629] via-[#0f1222] to-[#161a32] rounded-3xl overflow-hidden border border-slate-800/80 hover:border-cyan-500/50 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_35px_rgba(6,182,212,0.25)] cursor-pointer flex-shrink-0 w-64 sm:w-72 snap-start flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-900 border-b border-slate-800/80">
                <img
                  src={playlist.cover_image || DEFAULT_IMAGE}
                  alt={playlist.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                  onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {/* Privacy Badge Pill */}
                <div className="absolute top-3 left-3 z-10">
                  {playlist.is_public ? (
                    <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 backdrop-blur-md text-cyan-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Globe size={11} className="text-cyan-400" /> Public
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-400/50 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Lock size={11} className="text-amber-400" /> Private
                    </span>
                  )}
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-cyan-500/50 transform scale-75 group-hover/card:scale-100 transition-transform border border-white/20">
                    <Play size={24} fill="currentColor" className="ml-1" />
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <h3 className="text-lg font-black text-white leading-tight truncate group-hover/card:text-cyan-300 transition-colors">
                    {playlist.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-1 italic mt-1 font-medium">
                    {playlist.description || "Custom curated playlist"}
                  </p>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                  <span className="flex items-center gap-1.5 font-bold text-cyan-400">
                    <ListMusic size={15} />
                    {playlist.song_ids?.length || 0} Tracks
                  </span>
                  <span className="flex items-center gap-1 font-medium text-gray-400">
                    <Clock size={13} />
                    {formatDate(playlist.created_at)}
                  </span>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                    {showCommunity ? "Community Mix" : "Personal Library"}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const shareUrl = `${window.location.origin}/playlist/${playlist.id || playlist._id}`;
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success("Playlist link copied to clipboard!");
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-400 hover:bg-cyan-500/10 text-gray-400 hover:text-cyan-300 transition-all"
                    title="Copy Playlist Link"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Myplaylist;