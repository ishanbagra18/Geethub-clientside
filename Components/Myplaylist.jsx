import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ListMusic, Globe, Lock, Clock, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMusicSections } from '../src/context/MusicSectionsContext';

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
          const response = await axios.get('http://localhost:9000/playlist/myplaylists', {
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {showCommunity ? 'Community Playlists' : 'My Library'}
        </h1>
        {showCommunity && limitToHome && (
          <button 
            onClick={() => navigate('/communityplaylists')}
            className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition"
          >
            See All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayPlaylists.map((playlist) => (
          <div
            key={playlist.id || playlist._id}
            onClick={() => navigate(`/playlist/${playlist.id || playlist._id}`)}
            className="group bg-[#18181b] rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all cursor-pointer"
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
                <div className="p-3 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
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
                  <ListMusic size={15} className="text-purple-500" />
                  {playlist.song_ids?.length || 0} Songs
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {formatDate(playlist.created_at)}
                </span>
              </div>

              {/* Footer: Privacy and Tags */}
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-800">
                <div className="flex items-center gap-1.5">
                  {playlist.is_public ? (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                      <Globe size={12} /> Public
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1 uppercase tracking-wider">
                      <Lock size={12} /> Private
                    </span>
                  )}
                </div>

                {playlist.tags?.[0] && (
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-full border border-purple-500/20 font-medium">
                    #{playlist.tags[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Myplaylist;