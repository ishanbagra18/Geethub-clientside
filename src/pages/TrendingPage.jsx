import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicSections } from '../context/MusicSectionsContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { Play, ListPlus, TrendingUp, Flame, ArrowLeft, Music } from 'lucide-react';
import Navbar from '../../Components/Navbar';

const PLACEHOLDER = 'https://via.placeholder.com/300?text=No+Image';

const TrendingPage = () => {
  const { sections, loading } = useMusicSections();
  const { addToQueue } = useMusicPlayer();
  const navigate = useNavigate();

  const trendingSongs = (sections.trendingSongs || []).slice(0, 10);

  const handleAddToQueue = (song) => {
    addToQueue(song.song_id || song.id || song._id);
  };

  const handlePlaySong = (song) => {
    navigate(`/playsong/${song.song_id || song.id || song._id}`);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="pt-24 px-8 pb-20">
        {/* Hero Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>
          
          <div className="relative">
            {/* Animated background effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-600/10 blur-3xl" />
            
            <div className="relative bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/20 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Animated Fire Icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 blur-2xl opacity-40" />
                    <div className="relative bg-gradient-to-br from-blue-600 to-cyan-500 p-5 rounded-2xl shadow-lg">
                      <TrendingUp size={48} className="text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp size={24} className="text-blue-400" />
                      <span className="text-sm font-semibold text-blue-400 uppercase tracking-widest">
                        Hot Right Now
                      </span>
                    </div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 mb-2">
                      Trending Songs
                    </h1>
                    <p className="text-gray-400 text-lg">
                      🔥 {trendingSongs.length} songs setting the internet on fire
                    </p>
                  </div>
                </div>
                
                {/* Stats Card */}
                <div className="hidden lg:flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 text-center">
                    <Music size={24} className="text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{trendingSongs.length}</div>
                    <div className="text-xs text-gray-400 uppercase">Tracks</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Songs Grid */}
        {loading.trendingSongs ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <TrendingUp className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={32} />
            </div>
            <p className="text-gray-400 mt-6 text-lg">Loading trending hits...</p>
          </div>
        ) : trendingSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-black/80 p-8 rounded-3xl border border-gray-800">
              <TrendingUp size={64} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-xl mb-2">No trending songs found</p>
              <p className="text-gray-500 text-sm">Check back later for hot tracks!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {trendingSongs.map((song, index) => (
              <div
                key={song.song_id || song.id || song._id}
                className="group relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 hover:bg-black/80 transition-all duration-300 border border-gray-800/50 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                {/* Rank Badge */}
                <div className="absolute -left-3 -top-3 z-10">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-lg
                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white animate-pulse' : 
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
                      'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300'}
                  `}>
                    #{index + 1}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Album Art */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg group-hover:shadow-blue-500/20 transition-shadow">
                      <img
                        src={song.image_url || PLACEHOLDER}
                        alt={song.title || 'Song'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = PLACEHOLDER;
                        }}
                      />
                    </div>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                      <button
                        onClick={() => handlePlaySong(song)}
                        className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full hover:scale-110 transition-transform shadow-lg"
                      >
                        <Play size={20} className="text-white fill-white" />
                      </button>
                    </div>
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-1 truncate group-hover:text-blue-400 transition-colors">
                      {song.title || 'Unknown Title'}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2 truncate">
                      {song.artist || 'Unknown Artist'}
                    </p>
                    {song.album && (
                      <div className="inline-flex items-center gap-2 bg-gray-700/30 rounded-full px-3 py-1 text-xs text-gray-400">
                        <Music size={12} />
                        <span className="truncate max-w-xs">{song.album}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {/* Trending Indicator */}
                    <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full px-4 py-2">
                      <TrendingUp size={16} className="text-blue-400" />
                      <span className="text-sm font-semibold text-blue-400">Trending</span>
                    </div>

                    {/* Action Buttons */}
                    <button
                      onClick={() => handlePlaySong(song)}
                      className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-full hover:scale-110 transition-transform shadow-lg hover:shadow-blue-500/50"
                      title="Play Song"
                    >
                      <Play size={20} className="text-white fill-white" />
                    </button>
                    <button
                      onClick={() => handleAddToQueue(song)}
                      className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 hover:scale-110 transition-all shadow-lg"
                      title="Add to Queue"
                    >
                      <ListPlus size={20} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Hover Effect Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;
