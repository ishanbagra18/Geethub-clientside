import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ListMusic, Globe, Lock, Clock, Play, Share2 } from 'lucide-react';
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
const DEFAULT_IMAGE = 'https://i.pinimg.com/736x/26/5a/a4/265aa4c9bbd82ccde7ff7de3e8011fd0.jpg';

const Myplaylist = ({ showCommunity = false, limitToHome = false }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
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

  // Use community playlists from context when showCommunity is true
  const displayPlaylists = showCommunity 
    ? (limitToHome ? (sections.communityPlaylists || []).slice(0, 10) : (sections.communityPlaylists || []))
    : playlists;

  const isLoading = showCommunity ? contextLoading.communityPlaylists : loading;

  if (isLoading) return <div className="p-10 text-center text-purple-300">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-400">{error}</div>;

  return (
    <div className="p-6 bg-gray-900 text-white">
      <Toaster position="bottom-right" />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {showCommunity ? 'Community Playlists' : 'My Library'}
        </h1>
        {showCommunity && limitToHome && (
          <button 
            onClick={() => navigate('/communityplaylists')}
            className="text-sm font-semibold text-blue-400 hover:text-purple-300 transition"
          >
            More Playlists
          </button>
        )}
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory hide-scrollbar">
        {displayPlaylists.map((playlist) => (
          <div
            key={playlist.id || playlist._id}
            onClick={() => navigate(`/playlist/${playlist.id || playlist._id}`)}
            className="group bg-[#18181b] rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all cursor-pointer flex-shrink-0 w-64 sm:w-72 snap-start"
          >
            {/* Aspect Ratio Container for Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={playlist.cover_image || DEFAULT_IMAGE}
                alt={playlist.name}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="p-3 bg-blue-500 hover:bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg shadow-blue-500/30">
                  <Play size={24} fill="white" stroke="white" />
                </div>
              </div>
            </div>

            {/* Content Area with Improved Padding */}
            <div className="p-5 flex flex-col gap-3">
              <div>
                <h3 className="text-lg font-bold leading-tight truncate mb-1">{playlist.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-1 italic">
                  {playlist.description || "No description provided."}
                </p>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <ListMusic size={15} className="text-blue-500" />
                  {playlist.song_ids?.length || 0} Songs
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {formatDate(playlist.created_at)}
                </span>
              </div>

              {/* Footer: Privacy, Tags, and Share */}
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-800">
                <div className="flex items-center gap-1.5">
                  {playlist.is_public ? (
                    <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1 uppercase tracking-wider">
                      <Globe size={12} /> Public
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1 uppercase tracking-wider">
                      <Lock size={12} /> Private
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* {playlist.tags?.[0] && (
                    <span className="text-[10px] bg-purple-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-purple-500/20 font-medium">
                      {playlist.tags[0]}
                    </span>
                  )} */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const shareUrl = `${window.location.origin}/playlist/${playlist.id || playlist._id}`;
                      navigator.clipboard.writeText(shareUrl);
                      toast.success("Playlist link copied!");
                    }}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-purple-600/30 text-gray-300 hover:text-purple-300 transition"
                    title="Copy Playlist Link"
                  >
                    <Share2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Myplaylist;