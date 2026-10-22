
import React, { useState, useEffect, useCallback } from 'react';
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
    CalendarDays,
    RefreshCw,
    AlertCircle,
    ArrowUpRight,
    Disc3,
    Radio,
    Play,
    CheckCircle2,
} from 'lucide-react';
import API_BASE_URL from '../src/config/api';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [range, setRange] = useState('weekly');
    const [refreshKey, setRefreshKey] = useState(0);

    const hasToken = Boolean(localStorage.getItem('token'));

    useEffect(() => {
        let cancelled = false;

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

                if (!cancelled) {
                    setStats(response.data);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);

                if (!cancelled) {
                    setError(
                        err.response?.data?.error ||
                        'Failed to load your listening statistics.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchStats();

        return () => {
            cancelled = true;
        };
    }, [range, refreshKey]);

    const handleRefresh = useCallback(() => {
        setRefreshKey((key) => key + 1);
    }, []);

    if (!hasToken) {
        return null;
    }

    const minutesListened =
        Math.max(0, Number(stats?.minutes_listened) || 0);

    const hoursListened = Math.floor(minutesListened / 60);
    const remainingMinutes = minutesListened % 60;

    const periodLabel =
        range === 'weekly' ? 'Last 7 days' : 'Last 30 days';

    const formatNumber = (value) =>
        (Number(value) || 0).toLocaleString();

    const cardBase =
        'group relative min-w-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111116] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.13] hover:bg-[#14141b] hover:shadow-[0_16px_40px_rgba(0,0,0,0.20)] sm:rounded-3xl sm:p-6';

    const iconBase =
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border';

    // Loading state
    if (loading) {
        return (
            <section className="relative mx-auto my-12 w-full max-w-7xl px-4 sm:px-6">
                <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0c0c11] p-5 sm:p-8">
                    <div className="mb-9 animate-pulse">
                        <div className="h-3 w-36 rounded bg-white/[0.07]" />
                        <div className="mt-5 h-9 w-64 max-w-full rounded-lg bg-white/[0.07]" />
                        <div className="mt-3 h-4 w-80 max-w-full rounded bg-white/[0.04]" />
                    </div>

                    <div className="mb-5 h-5 w-32 animate-pulse rounded bg-white/[0.06]" />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {[0, 1, 2].map((item) => (
                            <div
                                key={item}
                                className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="h-3 w-28 rounded bg-white/[0.07]" />
                                    <div className="h-11 w-11 rounded-xl bg-white/[0.06]" />
                                </div>
                                <div className="mt-8 h-10 w-32 rounded-lg bg-white/[0.07]" />
                                <div className="mt-4 h-3 w-40 rounded bg-white/[0.04]" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Loader2 size={15} className="animate-spin text-violet-400" />
                        Preparing your listening insights...
                    </div>
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="relative mx-auto my-12 w-full max-w-7xl px-4 sm:px-6">
                <div
                    role="alert"
                    className="relative overflow-hidden rounded-3xl border border-rose-400/15 bg-[#0e0d12] p-6 sm:p-10"
                >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-rose-500/[0.07] blur-[70px]" />

                    <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-rose-400/15 bg-rose-500/[0.08] text-rose-400">
                                <AlertCircle size={23} />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    Couldn't load your stats
                                </h2>
                                <p className="mt-2 max-w-lg text-sm leading-6 text-gray-400">
                                    {error}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
                        >
                            <RefreshCw size={15} />
                            Try again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    const topSong = stats?.top_song;
    const topArtist = stats?.top_artist;

    return (
        <section className="relative mx-auto my-10 w-full max-w-7xl px-4 font-sans sm:my-14 sm:px-6">

            {/* Ambient background */}
            <div className="pointer-events-none absolute -left-12 top-20 -z-10 h-64 w-64 rounded-full bg-blue-600/[0.07] blur-[110px]" />
            <div className="pointer-events-none absolute -right-10 bottom-10 -z-10 h-64 w-64 rounded-full bg-violet-600/[0.07] blur-[110px]" />

            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0c11] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">

                {/* Top accent */}
                <div className="h-[2px] w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />

                {/* Decorative background */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/[0.07] blur-[100px]" />
                    <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-500/[0.05] blur-[100px]" />

                    <div className="absolute right-8 top-8 hidden opacity-[0.035] sm:block">
                        <Disc3 size={180} strokeWidth={0.7} />
                    </div>
                </div>

                <div className="relative z-10 p-5 sm:p-8 lg:p-10">

                    {/* Header */}
                    <header className="mb-8 flex flex-col gap-6 border-b border-white/[0.07] pb-7 md:flex-row md:items-end md:justify-between">

                        <div className="min-w-0">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.07] px-3 py-1.5">
                                <BarChart2 size={14} className="text-violet-300" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200">
                                    Personal audio insights
                                </span>
                            </div>

                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                Your listening
                                <br className="sm:hidden" />{' '}
                                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                                    stats.
                                </span>
                            </h2>

                            <p className="mt-3 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
                                Every song tells a story. Discover your
                                listening habits, favorite tracks and
                                the artists behind your soundtrack.
                            </p>
                        </div>

                        {/* Period selector */}
                        <div className="w-full shrink-0 md:w-auto">
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                                Time period
                            </p>

                            <div
                                className="flex w-full items-center gap-1 rounded-xl border border-white/[0.08] bg-[#131319] p-1 sm:w-fit"
                                role="group"
                                aria-label="Listening statistics time range"
                            >
                                {[
                                    { id: 'weekly', label: '7 days' },
                                    { id: 'monthly', label: '30 days' },
                                ].map((option) => {
                                    const active = range === option.id;

                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() => setRange(option.id)}
                                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all duration-200 sm:flex-none ${
                                                active
                                                    ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/10'
                                                    : 'text-gray-400 hover:bg-white/[0.05] hover:text-white'
                                            }`}
                                        >
                                            <CalendarDays size={14} />
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </header>

                    {/* Overview heading */}
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/[0.08]">
                                <TrendingUp size={16} className="text-emerald-400" />
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-white sm:text-base">
                                    Your overview
                                </h3>
                                <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">
                                    A snapshot of your music activity
                                </p>
                            </div>
                        </div>

                        <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[10px] font-medium text-gray-400 sm:text-xs">
                            {periodLabel}
                        </span>
                    </div>

                    {/* Analytics cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                        {/* Listening time */}
                        <article className={cardBase}>
                            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/[0.08] blur-[60px] transition-opacity duration-300 group-hover:bg-blue-500/[0.13]" />

                            <div className="relative flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-gray-500 sm:text-xs">
                                        Total listening
                                    </p>
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        Time spent with music
                                    </p>
                                </div>

                                <div className={`${iconBase} border-blue-400/15 bg-blue-500/[0.09] text-blue-300`}>
                                    <Clock size={21} />
                                </div>
                            </div>

                            <div className="relative mt-8">
                                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                    <span className="text-5xl font-bold tracking-tight text-white tabular-nums sm:text-6xl">
                                        {formatNumber(minutesListened)}
                                    </span>
                                    <span className="text-sm font-medium text-gray-500">
                                        min
                                    </span>
                                </div>

                                <p className="mt-3 text-xs text-gray-400">
                                    {hoursListened > 0
                                        ? `${formatNumber(hoursListened)} hr ${remainingMinutes} min of listening`
                                        : `${formatNumber(minutesListened)} minutes of listening`}
                                </p>
                            </div>

                            <div className="relative mt-6 border-t border-white/[0.07] pt-4">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Sparkles size={14} className="text-blue-300" />
                                    Your listening activity
                                </div>
                            </div>
                        </article>

                        {/* Top song */}
                        <article className={cardBase}>
                            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500/[0.07] blur-[60px]" />

                            <div className="relative flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-gray-500 sm:text-xs">
                                        Top streamed track
                                    </p>
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        Your most-played song
                                    </p>
                                </div>

                                <div className={`${iconBase} border-orange-400/15 bg-orange-500/[0.08] text-orange-300`}>
                                    <Flame size={21} />
                                </div>
                            </div>

                            {topSong ? (
                                <div className="relative mt-7 flex min-w-0 items-center gap-4">
                                    <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                                        <img
                                            src={
                                                topSong.image ||
                                                topSong.image_url ||
                                                'https://placehold.co/200x200/171720/777777?text=Music'
                                            }
                                            alt={topSong.title || 'Top song artwork'}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src =
                                                    'https://placehold.co/200x200/171720/777777?text=Music';
                                            }}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <Music size={22} className="text-white/80 drop-shadow-lg" />
                                        </div>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h4
                                            title={topSong.title || 'Unknown Track'}
                                            className="line-clamp-2 text-base font-bold leading-snug text-white sm:text-lg"
                                        >
                                            {topSong.title || 'Unknown Track'}
                                        </h4>

                                        <p className="mt-1.5 truncate text-xs text-gray-400 sm:text-sm">
                                            {topSong.artist || 'Unknown Artist'}
                                        </p>

                                        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-orange-400/15 bg-orange-500/[0.07] px-2.5 py-1 text-[10px] font-semibold text-orange-300 sm:text-xs">
                                            <Play size={11} fill="currentColor" />
                                            {formatNumber(topSong.plays || 1)} plays
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative mt-7 flex min-h-[88px] items-center gap-4">
                                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-gray-500">
                                        <Music size={28} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-300">
                                            Your next favorite
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-gray-500">
                                            Keep listening to discover your top track.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="relative mt-6 border-t border-white/[0.07] pt-4">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Headphones size={14} className="text-orange-300" />
                                    Your soundtrack, ranked
                                </div>
                            </div>
                        </article>

                        {/* Top artist */}
                        <article className={cardBase}>
                            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/[0.08] blur-[60px]" />

                            <div className="relative flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-gray-500 sm:text-xs">
                                        Top creator
                                    </p>
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        Your favorite artist
                                    </p>
                                </div>

                                <div className={`${iconBase} border-violet-400/15 bg-violet-500/[0.09] text-violet-300`}>
                                    <Award size={21} />
                                </div>
                            </div>

                            {topArtist ? (
                                <div className="relative mt-8">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/15 bg-gradient-to-br from-violet-500/15 to-blue-500/10">
                                            <Award size={23} className="text-violet-300" />
                                        </div>

                                        <div className="min-w-0">
                                            <h4
                                                title={topArtist.name || 'Unknown Artist'}
                                                className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl"
                                            >
                                                {topArtist.name || 'Unknown Artist'}
                                            </h4>

                                            <p className="mt-1 text-xs text-gray-400">
                                                {formatNumber(topArtist.plays || 1)} total plays
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-500/[0.07] px-3 py-1.5 text-[10px] font-semibold text-violet-300 sm:text-xs">
                                        <Sparkles size={13} />
                                        Your top artist
                                    </div>
                                </div>
                            ) : (
                                <div className="relative mt-7 flex min-h-[88px] items-center gap-4">
                                    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-gray-500">
                                        <Award size={28} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-300">
                                            Discover your favorite
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-gray-500">
                                            Your listening will reveal your top artist.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="relative mt-6 border-t border-white/[0.07] pt-4">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Radio size={14} className="text-violet-300" />
                                    Your artist spotlight
                                </div>
                            </div>
                        </article>
                    </div>

                    {/* Bottom summary */}
                    <footer className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.06]">
                                <CheckCircle2 size={17} className="text-emerald-400" />
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-gray-200 sm:text-sm">
                                    Your music journey, at a glance
                                </p>
                                <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                                    Your personal listening overview
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                            <span className="text-[10px] text-gray-500 sm:text-xs">
                                {periodLabel}
                            </span>

                            <button
                                type="button"
                                onClick={handleRefresh}
                                aria-label="Refresh listening statistics"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-gray-400 transition-all duration-200 hover:border-violet-400/25 hover:bg-violet-500/[0.08] hover:text-violet-300"
                            >
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;
