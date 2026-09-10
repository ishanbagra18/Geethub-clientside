import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Play, Music, Flame, Award, BarChart2, Loader2, Sparkles } from 'lucide-react';
import API_BASE_URL from '../src/config/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('weekly'); // 'weekly' or 'monthly'

  useEffect(() => {
    fetchStats();
  }, [range]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/stats/my?range=${range}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.error || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="animate-spin text-cyan-400" size={36} />
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">
          Computing Your Listening Analytics...
        </p>
      </div>
    );
  }

  if (error || !localStorage.getItem('token')) {
    return null; // Silent fallback if not logged in
  }

  return (
    <section className="w-full max-w-7xl mx-auto my-16 px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c0f1a] via-[#101424] to-[#0d0f18] border border-cyan-500/20 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
        {/* Glow Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header & Range Toggle */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800/80 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider mb-2">
              <BarChart2 size={14} className="text-cyan-400" /> Personal Audio Insights
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Your Listening Stats
            </h2>
            <p className="text-gray-400 text-sm mt-1 font-medium">
              Track your music streaming trends, favorite artists & top tracks
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 shadow-lg self-start md:self-auto">
            <button
              onClick={() => setRange('weekly')}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                range === 'weekly'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setRange('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                range === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Stats Grid Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Minutes Listened */}
          <div className="group relative rounded-2xl p-6 bg-gradient-to-br from-slate-900/90 to-blue-950/40 border border-slate-800 hover:border-blue-500/40 transition-all duration-300 shadow-xl hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">
                Total Listening
              </span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-400/20">
                <Clock size={20} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {stats?.minutes_listened || 0}
              </h3>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                Minutes Played ({range === 'weekly' ? '7 Days' : '30 Days'})
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-xs text-blue-300 font-medium">
              <Sparkles size={14} className="text-cyan-400" />
              <span>Real-time playback analytics active</span>
            </div>
          </div>

          {/* Card 2: Top Song */}
          <div className="group relative rounded-2xl p-6 bg-gradient-to-br from-slate-900/90 to-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 shadow-xl hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
                Top Streamed Track
              </span>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                <Flame size={20} />
              </div>
            </div>
            
            {stats?.top_song ? (
              <div className="flex items-center gap-4">
                <img
                  src={stats.top_song.image || stats.top_song.image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
                  alt={stats.top_song.title}
                  className="w-16 h-16 rounded-xl object-cover border border-cyan-500/30 shadow-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-extrabold text-base truncate group-hover:text-cyan-300 transition-colors">
                    {stats.top_song.title}
                  </h4>
                  <p className="text-gray-400 text-xs truncate mt-0.5 font-medium">
                    {stats.top_song.artist}
                  </p>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold">
                    🔥 {stats.top_song.plays || 1} Plays
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-2 text-gray-500 text-xs">
                Play songs to unlock your top track insights
              </div>
            )}
          </div>

          {/* Card 3: Top Artist */}
          <div className="group relative rounded-2xl p-6 bg-gradient-to-br from-slate-900/90 to-purple-950/40 border border-slate-800 hover:border-purple-500/40 transition-all duration-300 shadow-xl hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">
                Top Creator
              </span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-400/20">
                <Award size={20} />
              </div>
            </div>

            {stats?.top_artist ? (
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-white truncate group-hover:text-purple-300 transition-colors">
                  {stats.top_artist.name}
                </h4>
                <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                  {stats.top_artist.plays || 1} Total Plays
                </p>
                <div className="pt-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-[10px] font-bold uppercase">
                    ⭐ Favorite Artist
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-2 text-gray-500 text-xs">
                Explore artist catalogs to track top creators
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Dashboard;