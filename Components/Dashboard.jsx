
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clock,
  Music,
  Flame,
  Award,
  BarChart2,
  Loader2,
  Sparkles,
  TrendingUp,
  Headphones,
} from 'lucide-react';
import API_BASE_URL from '../src/config/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('weekly');

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setStats(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

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
        setError(
          err.response?.data?.error || 'Failed to load your listening stats.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [range]);

  if (!localStorage.getItem('token')) {
    return null;
  }

  if (loading) {
    return (
      <section className="w-full max-w-7xl mx-auto my-16 px-4 sm:px-6">
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#151922]">
          <Loader2 className="animate-spin text-[#3B82F6]" size={36} />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Computing Your Listening Analytics...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full max-w-7xl mx-auto my-16 px-4 sm:px-6">
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-white p-6 text-sm text-red-600 dark:border-red-900/60 dark:bg-[#151922] dark:text-red-400"
        >
          {error}
          <button
            onClick={() => setRange((current) => current)}
            className="ml-3 font-bold underline underline-offset-4"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const minutesListened = Number(stats?.minutes_listened) || 0;
  const periodLabel = range === 'weekly' ? 'Last 7 days' : 'Last 30 days';

  const cardStyle =
    'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-300 dark:border-slate-700/80 dark:bg-[#1A1F2B] dark:hover:border-blue-500/60 dark:hover:shadow-black/20';

  const iconStyle =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border';

  return (
    <section className="my-16 w-full max-w-7xl mx-auto px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-xl shadow-slate-200/40 sm:p-8 md:p-10 dark:border-slate-700/80 dark:bg-[#151922] dark:shadow-black/20">

        {/* Header */}
        <div className="relative z-10 mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 dark:border-slate-700/80 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:border-blue-400/25 dark:bg-blue-500/10 dark:text-blue-400">
              <BarChart2 size={15} />
              Personal Audio Insights
            </div>

            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
              Your Listening Stats
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              Discover your listening habits, favorite artists, and most-played tracks.
            </p>
          </div>

          {/* Time Range Selector */}
          <div
            className="flex w-full items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 dark:border-slate-700 dark:bg-[#10141D] sm:w-fit"
            role="group"
            aria-label="Listening statistics time range"
          >
            <button
              type="button"
              aria-pressed={range === 'weekly'}
              onClick={() => setRange('weekly')}
              className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-xs font-bold transition-colors duration-200 sm:flex-none ${
                range === 'weekly'
                  ? 'bg-[#3B82F6] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              This Week
            </button>

            <button
              type="button"
              aria-pressed={range === 'monthly'}
              onClick={() => setRange('monthly')}
              className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-xs font-bold transition-colors duration-200 sm:flex-none ${
                range === 'monthly'
                  ? 'bg-[#3B82F6] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Overview Label */}
        <div className="relative z-10 mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#3B82F6]" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">
              Your Overview
            </h3>
          </div>

          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-[#1A1F2B] dark:text-slate-400">
            {periodLabel}
          </span>
        </div>

        {/* Statistics Cards */}
        <div className="relative z-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

          {/* Total Listening */}
          <article className={cardStyle}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Listening
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                  Your listening time
                </p>
              </div>

              <div className={`${iconStyle} border-blue-200 bg-blue-50 text-[#3B82F6] dark:border-blue-400/20 dark:bg-blue-500/10`}>
                <Clock size={21} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                {minutesListened.toLocaleString()}
              </h3>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                min
              </span>
            </div>

            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600 dark:border-slate-700/70 dark:text-slate-400">
              <Sparkles size={15} className="shrink-0 text-[#3B82F6]" />
              <span>Playback analytics</span>
            </div>
          </article>

          {/* Top Song */}
          <article className={cardStyle}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Top Streamed Track
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                  Your most-played song
                </p>
              </div>

              <div className={`${iconStyle} border-orange-200 bg-orange-50 text-orange-500 dark:border-orange-400/20 dark:bg-orange-500/10`}>
                <Flame size={21} />
              </div>
            </div>

            {stats?.top_song ? (
              <>
                <div className="flex min-w-0 items-center gap-4">
                  <img
                    src={
                      stats.top_song.image ||
                      stats.top_song.image_url ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'
                    }
                    alt={stats.top_song.title || 'Top song artwork'}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                  />

                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-base font-bold text-slate-900 dark:text-white">
                      {stats.top_song.title || 'Unknown Track'}
                    </h4>

                    <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                      {stats.top_song.artist || 'Unknown Artist'}
                    </p>

                    <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700 dark:border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-400">
                      <PlayIcon />
                      {stats.top_song.plays || 1} Plays
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-20 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                  <Music size={23} />
                </div>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Play some songs to discover your top track.
                </p>
              </div>
            )}

            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600 dark:border-slate-700/70 dark:text-slate-400">
              <Headphones size={15} className="shrink-0 text-orange-500" />
              <span>Your most-listened track</span>
            </div>
          </article>

          {/* Top Artist */}
          <article className={cardStyle}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Top Creator
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                  Your favorite artist
                </p>
              </div>

              <div className={`${iconStyle} border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-400/20 dark:bg-purple-500/10 dark:text-purple-400`}>
                <Award size={21} />
              </div>
            </div>

            {stats?.top_artist ? (
              <>
                <h4 className="truncate text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {stats.top_artist.name || 'Unknown Artist'}
                </h4>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {stats.top_artist.plays || 1} total plays
                </p>

                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 dark:border-purple-400/20 dark:bg-purple-500/10 dark:text-purple-300">
                    <Award size={13} />
                    Favorite Artist
                  </span>
                </div>
              </>
            ) : (
              <div className="flex min-h-20 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                  <Award size={23} />
                </div>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Explore music to discover your favorite artist.
                </p>
              </div>
            )}

            <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600 dark:border-slate-700/70 dark:text-slate-400">
              <Sparkles size={15} className="shrink-0 text-purple-500" />
              <span>Your top artist for this period</span>
            </div>
          </article>

        </div>

        {/* Footer */}
        <div className="relative z-10 mt-6 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/80 dark:bg-[#1A1F2B]">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Your music journey, at a glance
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing insights for {periodLabel.toLowerCase()}
          </p>
        </div>
      </div>
    </section>
  );
};

const PlayIcon = () => (
  <Music size={12} />
);

export default Dashboard;
