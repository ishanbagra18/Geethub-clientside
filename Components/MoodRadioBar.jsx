import React, { useState } from 'react';
import { useMusicSections } from '../src/context/MusicSectionsContext';
import { useMusicPlayer } from '../src/context/MusicPlayerContext';
import { Radio, Play, Sparkles, Flame, Heart, Zap, Compass, Car } from 'lucide-react';
import toast from 'react-hot-toast';

const MOODS = [
  { id: 'all', label: 'All Moods', emoji: '✨', icon: Sparkles, color: 'from-blue-600 via-cyan-500 to-indigo-600' },
  { id: 'workout', label: 'Workout Dhol', emoji: '⚡', icon: Zap, color: 'from-amber-500 via-orange-500 to-red-600' },
  { id: 'party', label: 'Bolly-Party', emoji: '🎉', icon: Flame, color: 'from-pink-500 via-rose-500 to-purple-600' },
  { id: 'sad', label: 'Sad Punjabi', emoji: '💔', icon: Heart, color: 'from-cyan-500 via-blue-600 to-indigo-700' },
  { id: 'sufi', label: 'Sufi & Chill', emoji: '🧘', icon: Compass, color: 'from-emerald-500 via-teal-500 to-cyan-600' },
  { id: 'romantic', label: 'Romantic Beats', emoji: '💖', icon: Heart, color: 'from-rose-500 via-pink-500 to-purple-600' },
  { id: 'drive', label: 'Desi Long Drive', emoji: '🚗', icon: Car, color: 'from-violet-500 via-purple-600 to-indigo-600' },
];

const MoodRadioBar = () => {
  const [activeMood, setActiveMood] = useState('all');
  const { sections } = useMusicSections();
  const { playSong } = useMusicPlayer();

  // Combine available song pools
  const allPool = [
    ...(sections.topCharts || []),
    ...(sections.punjabiSongs || []),
    ...(sections.hindiSongs || []),
    ...(sections.latestReleased || []),
    ...(sections.mostLiked || []),
  ];

  // Remove duplicates by song_id
  const uniqueSongs = Array.from(
    new Map(allPool.map((s) => [s.song_id || s._id || s.id, s])).values()
  );

  const getFilteredSongs = (moodId) => {
    if (moodId === 'all') return uniqueSongs;
    
    // Heuristic matching for moods
    return uniqueSongs.filter((song) => {
      const title = (song.title || '').toLowerCase();
      const artist = (song.artist || '').toLowerCase();
      const language = (song.language || '').toLowerCase();

      if (moodId === 'workout') {
        return (
          language.includes('punjabi') ||
          title.includes('dhol') ||
          title.includes('jatt') ||
          title.includes('sidhu') ||
          artist.includes('sidhu') ||
          artist.includes('karan')
        );
      }
      if (moodId === 'party') {
        return (
          language.includes('hindi') ||
          title.includes('party') ||
          title.includes('dj') ||
          title.includes('mashup') ||
          artist.includes('badshah') ||
          artist.includes('yo yo')
        );
      }
      if (moodId === 'sad') {
        return (
          title.includes('sad') ||
          title.includes('yaad') ||
          title.includes('dil') ||
          artist.includes('b praak') ||
          artist.includes('arijit')
        );
      }
      if (moodId === 'sufi') {
        return (
          title.includes('sufi') ||
          title.includes('rooh') ||
          title.includes('tere') ||
          artist.includes('nusrat') ||
          artist.includes('rahul')
        );
      }
      if (moodId === 'romantic') {
        return (
          title.includes('pyaar') ||
          title.includes('love') ||
          title.includes('ishq') ||
          title.includes('suniye') ||
          artist.includes('arijit')
        );
      }
      if (moodId === 'drive') {
        return (
          title.includes('ride') ||
          title.includes('car') ||
          title.includes('speed') ||
          language.includes('punjabi') ||
          language.includes('hindi')
        );
      }
      return true;
    });
  };

  const handleMoodClick = (moodId) => {
    setActiveMood(moodId);
    const filtered = getFilteredSongs(moodId);
    const selectedMoodObj = MOODS.find((m) => m.id === moodId);
    
    if (filtered.length > 0 && moodId !== 'all') {
      toast.success(`Active Mood: ${selectedMoodObj.emoji} ${selectedMoodObj.label} (${filtered.length} tracks)`, {
        icon: '🎧',
        style: {
          borderRadius: '14px',
          background: '#090d16',
          color: '#38bdf8',
          border: '1px solid rgba(56,189,248,0.4)',
        },
      });
    }
  };

  const handlePlayMoodMix = (e) => {
    e.stopPropagation();
    const filtered = getFilteredSongs(activeMood);
    const poolToPlay = filtered.length > 0 ? filtered : uniqueSongs;
    
    if (poolToPlay.length > 0) {
      const firstSong = poolToPlay[0];
      const songId = firstSong.song_id || firstSong.id || firstSong._id;
      playSong(songId, poolToPlay);
      
      const moodObj = MOODS.find((m) => m.id === activeMood);
      toast.success(`Playing ${moodObj.emoji} ${moodObj.label} Instant Radio Mix!`, {
        icon: '📻',
        duration: 3500,
        style: {
          borderRadius: '16px',
          background: '#090d16',
          color: '#38bdf8',
          border: '1px solid rgba(56,189,248,0.4)',
        },
      });
    } else {
      toast.error('No tracks available for this mood mix right now.');
    }
  };

  const currentMoodObj = MOODS.find((m) => m.id === activeMood) || MOODS[0];

  return (
    <div className="w-full my-8 font-sans">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 dark:bg-slate-950/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        {/* Glow Accent Circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-cyan-500/20">
              <Radio size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-0.5">
                <Sparkles size={12} />
                <span>Smart Desi Radio</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white dark:text-white tracking-tight drop-shadow-md">
                Mood Radio Station
              </h2>
            </div>
          </div>

          {/* Instant Play Mood Radio Button */}
          <button
            onClick={handlePlayMoodMix}
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white text-xs font-black uppercase tracking-wider shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/45 hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Play size={14} fill="currentColor" />
              Play {currentMoodObj.label} Mix
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Mood Pills Selector */}
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar py-2 relative z-10">
          {MOODS.map((mood) => {
            const isActive = activeMood === mood.id;
            const count = getFilteredSongs(mood.id).length;

            return (
              <button
                key={mood.id}
                onClick={() => handleMoodClick(mood.id)}
                className={`flex-shrink-0 flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl text-xs font-black transition-all duration-300 border ${
                  isActive
                    ? `bg-gradient-to-r ${mood.color} text-white border-cyan-300 shadow-xl shadow-cyan-500/25 scale-105`
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700/80 hover:border-cyan-400/80 hover:scale-102'
                }`}
              >
                <span className="text-base">{mood.emoji}</span>
                <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-100'}`}>
                  {mood.label}
                </span>
                <span
                  className={`ml-1 text-[11px] px-2.5 py-0.5 rounded-full font-extrabold ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-slate-800 text-cyan-300 border border-slate-700/80'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MoodRadioBar;
