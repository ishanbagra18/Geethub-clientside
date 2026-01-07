//see all topcharts.jsx page added 

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicSections } from '../context/MusicSectionsContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { ListPlus, PlayCircle, ArrowLeft } from 'lucide-react';
import Navbar from '../../Components/Navbar';

const PLACEHOLDER = 'https://via.placeholder.com/220?text=No+Image';

const SeeAllTopCharts = () => {
  const { sections, loading } = useMusicSections();
  const { addToQueue } = useMusicPlayer();
  const navigate = useNavigate();

  const handleAddToQueue = (song) => {
    addToQueue(song.song_id || song.id || song._id);
  };

  const handlePlaySong = (song) => {
    navigate(`/playsong/${song.song_id || song.id || song._id}`);
  };

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
            <h1 className="text-4xl font-bold text-white">Top Charts</h1>
          </div>
          <p className="text-gray-400 mt-2 ml-8">All trending songs</p>
        </div>

        {/* Songs Grid */}
        {loading.topCharts ? (
          <div className="text-center text-gray-400 py-20">Loading songs...</div>
        ) : (sections.topCharts || []).length === 0 ? (
          <div className="text-center text-gray-400 py-20">No songs found</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {(sections.topCharts || []).map((song) => (
              <div
                key={song.id || song._id}
                className="group bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 hover:bg-gray-700/60 transition-all duration-300 cursor-pointer border border-gray-700/30 hover:border-gray-600/50"
              >
                {/* Image Container */}
                <div className="relative mb-4 aspect-square rounded-lg overflow-hidden bg-gray-700">
                  <img
                    src={song.image_url || PLACEHOLDER}
                    alt={song.title || 'Song'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER;
                    }}
                  />
                  
                  {/* Overlay with Play Button */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePlaySong(song)}
                      className="p-2 bg-rose-500 rounded-full hover:bg-rose-600 transition-colors"
                      title="Play Song"
                    >
                      <PlayCircle size={24} className="text-white" />
                    </button>
                    <button
                      onClick={() => handleAddToQueue(song)}
                      className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                      title="Add to Queue"
                    >
                      <ListPlus size={24} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Song Info */}
                <div className="space-y-1">
                  <h3
                    className="font-semibold text-white text-sm truncate group-hover:text-rose-400 transition-colors"
                    title={song.title || 'Unknown Title'}
                  >
                    {song.title || 'Unknown Title'}
                  </h3>
                  <p className="text-xs text-gray-400 truncate" title={song.artist || 'Unknown Artist'}>
                    {song.artist || 'Unknown Artist'}
                  </p>
                  {song.album && (
                    <p className="text-xs text-gray-500 truncate" title={song.album}>
                      {song.album}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeeAllTopCharts;
