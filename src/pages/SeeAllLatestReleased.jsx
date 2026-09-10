import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicSections } from '../context/MusicSectionsContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { ListPlus, PlayCircle, ArrowLeft, Heart, Sparkles } from 'lucide-react';
import Navbar from '../../Components/Navbar';

const PLACEHOLDER = 'https://via.placeholder.com/220?text=No+Image';

const SeeAllLatestReleased = () => {
  const { sections, loading } = useMusicSections();
  const { addToQueue, playSong } = useMusicPlayer();
  const navigate = useNavigate();

  const latestSongs = sections.latestReleased || [];

  const handleAddToQueue = (e, song) => {
    e.stopPropagation();
    addToQueue(song.song_id || song.id || song._id);
  };

  const handlePlaySong = (song) => {
    const songId = song.song_id || song.id || song._id;
    if (songId) {
      playSong(songId, latestSongs);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-black text-slate-100 font-sans">
      <Navbar />
      
      <div className="pt-24 px-4 md:px-8 pb-20 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-6 font-medium text-sm"
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-12 bg-gradient-to-b from-rose-500 via-yellow-400 to-emerald-400 rounded-full shadow-lg shadow-rose-500/20" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles size={12} />
                <span>Fresh & New Hits</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Latest Released
              </h1>
            </div>
          </div>
          <p className="text-slate-400 mt-3 text-sm md:text-base max-w-xl">
            Explore the latest songs, fresh releases, and newest tracks uploaded across India.
          </p>
        </div>

        {/* Songs Grid */}
        {loading.latestReleased ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800"
              />
            ))}
          </div>
        ) : latestSongs.length === 0 ? (
          <div className="py-20 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
            <p className="text-lg font-semibold">No latest releases found.</p>
            <p className="text-sm text-slate-500 mt-1">Check back soon for fresh music updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {latestSongs.map((song, index) => {
              const songId = song.song_id || song.id || song._id;
              const likesCount = Array.isArray(song.likes)
                ? song.likes.length
                : typeof song.likes === "number"
                ? song.likes
                : 0;

              return (
                <div
                  key={songId || index}
                  onClick={() => handlePlaySong(song)}
                  className="group relative bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 transition-all duration-300 cursor-pointer border border-slate-800/80 hover:border-rose-500/40 shadow-xl hover:shadow-[0_10px_30px_rgba(244,63,94,0.15)] hover:-translate-y-1 overflow-hidden"
                >
                  {/* Thumbnail Container */}
                  <div className="relative mb-3 aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={song.image_url || song.image || PLACEHOLDER}
                      alt={song.title || 'Song'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER;
                      }}
                    />
                    
                    {/* Hover Overlay with Action Buttons */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaySong(song);
                        }}
                        className="p-3 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full hover:scale-110 transition-transform shadow-lg shadow-rose-500/40"
                        title="Play Song"
                      >
                        <PlayCircle size={24} fill="white" className="text-white ml-0.5" />
                      </button>
                      <button
                        onClick={(e) => handleAddToQueue(e, song)}
                        className="p-3 bg-slate-800/90 rounded-full hover:bg-slate-700 transition-colors border border-slate-700"
                        title="Add to Queue"
                      >
                        <ListPlus size={20} className="text-cyan-400" />
                      </button>
                    </div>
                  </div>

                  {/* Song Info */}
                  <div className="space-y-1">
                    <h3
                      className="font-bold text-white text-base truncate group-hover:text-rose-400 transition-colors"
                      title={song.title || 'Untitled Track'}
                    >
                      {song.title || 'Untitled Track'}
                    </h3>
                    <p className="text-xs text-slate-400 truncate" title={song.artist || 'Unknown Artist'}>
                      {song.artist || 'Unknown Artist'}
                    </p>
                    
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/60 mt-2">
                      <span className="inline-flex items-center gap-1 text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        <Heart size={10} fill="currentColor" />
                        {likesCount}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">New</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeeAllLatestReleased;
