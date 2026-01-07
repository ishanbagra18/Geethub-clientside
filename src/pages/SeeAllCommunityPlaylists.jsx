import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMusicSections } from '../context/MusicSectionsContext';
import { ListMusic, Globe, Lock, Clock, Play, ArrowLeft } from 'lucide-react';
import Navbar from '../../Components/Navbar';

const DEFAULT_IMAGE = 'https://i.pinimg.com/736x/26/5a/a4/265aa4c9bbd82ccde7ff7de3e8011fd0.jpg';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const SeeAllCommunityPlaylists = () => {
  const { sections, loading } = useMusicSections();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <Navbar />
      
      <div className="pt-24 px-8 pb-20">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-1 h-12 bg-gradient-to-b from-rose-500 via-yellow-400 to-green-400 rounded-full" />
            <h1 className="text-4xl font-bold text-white">Community Playlists</h1>
          </div>
          <p className="text-gray-400 mt-2 ml-8">Public playlists shared by the community</p>
        </div>

        {/* Playlists Grid */}
        {loading.communityPlaylists ? (
          <div className="text-center text-gray-400 py-20">Loading playlists...</div>
        ) : (sections.communityPlaylists || []).length === 0 ? (
          <div className="text-center text-gray-400 py-20">No playlists found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(sections.communityPlaylists || []).map((playlist) => (
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
                    onError={(e) => {
                      e.target.src = DEFAULT_IMAGE;
                    }}
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
                      {playlist.description || 'No description provided.'}
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
                          <Globe size={13} />
                          Public
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                          <Lock size={13} />
                          Private
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeeAllCommunityPlaylists;
