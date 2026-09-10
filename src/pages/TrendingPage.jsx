import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicSections } from '../context/MusicSectionsContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { 
  Play, 
  Pause, 
  ListPlus, 
  TrendingUp, 
  Flame, 
  ArrowLeft, 
  Music, 
  Sparkles, 
  Search, 
  LayoutGrid, 
  LayoutList, 
  Trophy, 
  Crown, 
  Share2, 
  Heart,
  Shuffle
} from 'lucide-react';
import Navbar from '../../Components/Navbar';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://via.placeholder.com/300?text=No+Image';

const TrendingPage = () => {
  const { sections, loading } = useMusicSections();
  const { currentSong, isPlaying, togglePlayPause, playSong, addToQueue, setQueueAndPlay } = useMusicPlayer();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  const trendingSongs = useMemo(() => {
    return sections.trendingSongs || [];
  }, [sections.trendingSongs]);

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return trendingSongs;
    const q = searchQuery.toLowerCase();
    return trendingSongs.filter(
      (song) =>
        song.title?.toLowerCase().includes(q) ||
        song.artist?.toLowerCase().includes(q) ||
        song.album?.toLowerCase().includes(q) ||
        song.genre?.toLowerCase().includes(q)
    );
  }, [trendingSongs, searchQuery]);

  const handlePlaySong = (song, queue = filteredSongs) => {
    const songId = song.song_id || song.id || song._id;
    if (currentSong && (currentSong.song_id === songId || currentSong._id === songId)) {
      togglePlayPause();
    } else {
      const queueIds = queue.map(s => s.song_id || s.id || s._id);
      const index = queue.findIndex(s => (s.song_id || s.id || s._id) === songId);
      if (setQueueAndPlay && index !== -1) {
        setQueueAndPlay(queueIds, index);
      } else {
        navigate(`/playsong/${songId}`);
      }
    }
  };

  const handlePlayAll = () => {
    if (filteredSongs.length === 0) return;
    const firstSong = filteredSongs[0];
    handlePlaySong(firstSong, filteredSongs);
  };

  const handleShufflePlay = () => {
    if (filteredSongs.length === 0) return;
    const shuffled = [...filteredSongs].sort(() => Math.random() - 0.5);
    handlePlaySong(shuffled[0], shuffled);
  };

  const handleAddToQueue = (e, song) => {
    e.stopPropagation();
    addToQueue(song.song_id || song.id || song._id);
    toast.success(`Added "${song.title}" to queue`);
  };

  const handleShare = (e, song) => {
    e.stopPropagation();
    const songId = song.song_id || song.id || song._id;
    const shareUrl = `${window.location.origin}/playsong/${songId}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Song link copied to clipboard!");
    }
  };

  const formatPlays = (count) => {
    if (!count) return '0 plays';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M plays`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K plays`;
    return `${count} plays`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-black to-slate-950 text-white font-sans overflow-x-hidden">
      <Navbar />

      <div className="pt-24 px-4 sm:px-6 lg:px-12 pb-32 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-6 group text-sm font-semibold"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Explore</span>
        </button>

        {/* Hero Banner Section */}
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-blue-500/20 shadow-2xl bg-gradient-to-r from-blue-950/60 via-black/80 to-purple-950/40 backdrop-blur-2xl p-6 sm:p-10">
          {/* Neon Glow Accents */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              {/* Animated Trophy Banner Icon */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 rounded-3xl blur-xl opacity-60 animate-pulse" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-2xl border border-cyan-300/30">
                  <Flame size={44} className="text-white animate-bounce" style={{ animationDuration: '3s' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={12} className="text-cyan-400" /> Live Global Charts
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-400">
                  Trending Top Hits
                </h1>
                <p className="text-gray-300 text-base sm:text-lg mt-2 font-medium">
                  The most played, liked, and shared anthems across GeetHub right now.
                </p>
              </div>
            </div>

            {/* Quick Play Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={handlePlayAll}
                disabled={filteredSongs.length === 0}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-blue-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                <Play size={18} fill="currentColor" />
                <span>PLAY ALL</span>
              </button>
              <button
                onClick={handleShufflePlay}
                disabled={filteredSongs.length === 0}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-sm backdrop-blur-md hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                <Shuffle size={18} />
                <span>SHUFFLE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar: Search + View Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Search bar inside Trending */}
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search trending songs or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/80 border border-gray-800 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-all"
            />
          </div>

          {/* Controls: Count & View Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {filteredSongs.length} {filteredSongs.length === 1 ? 'Track' : 'Tracks'}
            </span>

            <div className="flex items-center bg-gray-900/90 border border-gray-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="List View"
              >
                <LayoutList size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading.trendingSongs ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
              <TrendingUp className="absolute inset-0 m-auto text-cyan-400 animate-pulse" size={24} />
            </div>
            <p className="text-gray-400 mt-5 text-sm font-semibold tracking-wide">Syncing chart rankings...</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-950/60 rounded-3xl border border-gray-800">
            <Music size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-1">No songs match your search</h3>
            <p className="text-gray-400 text-sm">Try clearing your search query to see full trending charts.</p>
          </div>
        ) : viewMode === 'list' ? (
          /* List / Table View */
          <div className="bg-gray-950/70 border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-[50px_1fr_120px] md:grid-cols-[60px_1fr_200px_120px_140px] items-center px-4 py-3 border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="text-center">#</div>
              <div>Title</div>
              <div className="hidden md:block">Album</div>
              <div className="hidden md:block text-right">Plays</div>
              <div className="text-right pr-2">Actions</div>
            </div>

            <div className="divide-y divide-gray-800/40">
              {filteredSongs.map((song, index) => {
                const songId = song.song_id || song.id || song._id;
                const isCurrentPlaying = currentSong && (currentSong.song_id === songId || currentSong._id === songId) && isPlaying;
                const isCurrentTrack = currentSong && (currentSong.song_id === songId || currentSong._id === songId);

                return (
                  <div
                    key={songId}
                    onClick={() => handlePlaySong(song)}
                    className={`group grid grid-cols-[50px_1fr_120px] md:grid-cols-[60px_1fr_200px_120px_140px] items-center px-4 py-3.5 hover:bg-blue-600/10 cursor-pointer transition-all duration-200 ${
                      isCurrentTrack ? 'bg-blue-900/20 border-l-4 border-cyan-400' : ''
                    }`}
                  >
                    {/* Rank Number / Trophy */}
                    <div className="flex items-center justify-center font-black text-sm">
                      {index === 0 ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-black flex items-center justify-center shadow-lg shadow-yellow-500/20">
                          <Crown size={18} fill="black" />
                        </div>
                      ) : index === 1 ? (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-black flex items-center justify-center font-bold text-xs shadow">
                          2
                        </div>
                      ) : index === 2 ? (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 flex items-center justify-center font-bold text-xs shadow">
                          3
                        </div>
                      ) : (
                        <span className="text-gray-400 group-hover:text-cyan-400">{index + 1}</span>
                      )}
                    </div>

                    {/* Song Info */}
                    <div className="flex items-center gap-3.5 min-w-0 pr-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-900 border border-gray-800">
                        <img
                          src={song.image_url || PLACEHOLDER}
                          alt={song.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER;
                          }}
                        />
                        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                          {isCurrentPlaying ? (
                            <Pause size={18} className="text-cyan-400 fill-cyan-400" />
                          ) : (
                            <Play size={18} className="text-white fill-white ml-0.5" />
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h4 className={`text-sm font-bold truncate transition-colors ${isCurrentTrack ? 'text-cyan-400' : 'text-white group-hover:text-cyan-300'}`}>
                          {song.title || 'Untitled Track'}
                        </h4>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {song.artist || 'Unknown Artist'}
                        </p>
                      </div>
                    </div>

                    {/* Album */}
                    <div className="hidden md:block min-w-0 text-xs text-gray-400 truncate pr-4">
                      {song.album || 'Single'}
                    </div>

                    {/* Plays Count */}
                    <div className="hidden md:block text-right text-xs text-gray-400 font-semibold pr-2">
                      {formatPlays(song.play_count)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleAddToQueue(e, song)}
                        className="p-2 rounded-lg bg-gray-900/80 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 border border-gray-800 transition-all"
                        title="Add to Queue"
                      >
                        <ListPlus size={16} />
                      </button>
                      <button
                        onClick={(e) => handleShare(e, song)}
                        className="p-2 rounded-lg bg-gray-900/80 hover:bg-blue-500/20 text-gray-300 hover:text-blue-300 border border-gray-800 transition-all"
                        title="Share Song"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredSongs.map((song, index) => {
              const songId = song.song_id || song.id || song._id;
              const isCurrentPlaying = currentSong && (currentSong.song_id === songId || currentSong._id === songId) && isPlaying;
              const isCurrentTrack = currentSong && (currentSong.song_id === songId || currentSong._id === songId);

              return (
                <div
                  key={songId}
                  onClick={() => handlePlaySong(song)}
                  className={`group relative bg-gray-950/70 border border-gray-800/80 rounded-2xl p-3.5 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer ${
                    isCurrentTrack ? 'ring-2 ring-cyan-400 bg-blue-950/30' : ''
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="absolute top-5 left-5 z-20">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black shadow-lg ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black' :
                      index === 1 ? 'bg-slate-300 text-black' :
                      index === 2 ? 'bg-amber-800 text-amber-100' :
                      'bg-black/80 backdrop-blur-md text-gray-300 border border-white/10'
                    }`}>
                      #{index + 1}
                    </span>
                  </div>

                  {/* Artwork */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-900 mb-3 border border-gray-800">
                    <img
                      src={song.image_url || PLACEHOLDER}
                      alt={song.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER;
                      }}
                    />

                    {/* Play Overlay */}
                    <div className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity flex items-center justify-center ${isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                        {isCurrentPlaying ? (
                          <Pause size={22} fill="white" />
                        ) : (
                          <Play size={22} fill="white" className="ml-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Add to Queue Button */}
                    <button
                      onClick={(e) => handleAddToQueue(e, song)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-black/80 border border-gray-700 text-gray-300 hover:text-white hover:bg-cyan-600 transition-all opacity-0 group-hover:opacity-100"
                      title="Add to Queue"
                    >
                      <ListPlus size={16} />
                    </button>
                  </div>

                  {/* Info */}
                  <div>
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                      {song.title || 'Untitled'}
                    </h4>
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {song.artist || 'Unknown Artist'}
                    </p>
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

export default TrendingPage;
