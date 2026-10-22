
import React, { useMemo, useState } from 'react';
import { useMusicSections } from '../src/context/MusicSectionsContext';
import { useMusicPlayer } from '../src/context/MusicPlayerContext';
import {
    Radio,
    Play,
    Sparkles,
    Flame,
    Heart,
    Zap,
    Compass,
    Car,
    Headphones,
    Music2,
    ArrowUpRight,
    Disc3,
    Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MOODS = [
    {
        id: 'all',
        label: 'All Moods',
        subtitle: 'A little bit of everything',
        emoji: '✨',
        icon: Sparkles,
        color: 'from-blue-500 to-cyan-400',
        glow: 'rgba(56,189,248,0.14)',
        accent: '#38bdf8',
    },
    {
        id: 'workout',
        label: 'Workout Dhol',
        subtitle: 'Full power, full volume',
        emoji: '⚡',
        icon: Zap,
        color: 'from-amber-500 to-red-500',
        glow: 'rgba(249,115,22,0.15)',
        accent: '#fb923c',
    },
    {
        id: 'party',
        label: 'Bolly-Party',
        subtitle: 'Desi beats, nonstop energy',
        emoji: '🎉',
        icon: Flame,
        color: 'from-pink-500 to-purple-500',
        glow: 'rgba(236,72,153,0.15)',
        accent: '#f472b6',
    },
    {
        id: 'sad',
        label: 'Sad Punjabi',
        subtitle: 'For the feelings you cannot explain',
        emoji: '💔',
        icon: Heart,
        color: 'from-cyan-500 to-blue-600',
        glow: 'rgba(59,130,246,0.15)',
        accent: '#60a5fa',
    },
    {
        id: 'sufi',
        label: 'Sufi & Chill',
        subtitle: 'Slow down and breathe',
        emoji: '🧘',
        icon: Compass,
        color: 'from-emerald-500 to-teal-500',
        glow: 'rgba(16,185,129,0.15)',
        accent: '#34d399',
    },
    {
        id: 'romantic',
        label: 'Romantic Beats',
        subtitle: 'A soundtrack for two',
        emoji: '💖',
        icon: Heart,
        color: 'from-rose-500 to-pink-500',
        glow: 'rgba(244,63,94,0.15)',
        accent: '#fb7185',
    },
    {
        id: 'drive',
        label: 'Desi Long Drive',
        subtitle: 'Windows down, music up',
        emoji: '🚗',
        icon: Car,
        color: 'from-violet-500 to-indigo-600',
        glow: 'rgba(139,92,246,0.15)',
        accent: '#a78bfa',
    },
];

const MoodRadioBar = () => {
    const [activeMood, setActiveMood] = useState('all');

    const { sections } = useMusicSections();
    const { playSong } = useMusicPlayer();

    // Combine song pools and remove duplicates.
    const uniqueSongs = useMemo(() => {
        const pools = [
            ...(sections?.topCharts || []),
            ...(sections?.punjabiSongs || []),
            ...(sections?.hindiSongs || []),
            ...(sections?.latestReleased || []),
            ...(sections?.mostLiked || []),
        ];

        const songsById = new Map();

        pools.forEach((song, index) => {
            const id = song.song_id ?? song._id ?? song.id;

            if (id != null) {
                if (!songsById.has(String(id))) {
                    songsById.set(String(id), song);
                }
            } else {
                songsById.set(`unknown-${index}`, song);
            }
        });

        return Array.from(songsById.values());
    }, [sections]);

    // Filter tracks based on the selected mood.
    const moodSongPools = useMemo(() => {
        const includesAny = (value, terms) =>
            terms.some((term) => value.includes(term));

        const filterSongs = (moodId) => {
            if (moodId === 'all') return uniqueSongs;

            return uniqueSongs.filter((song) => {
                const title = (song.title || '').toLowerCase();
                const artist = (song.artist || '').toLowerCase();
                const language = (song.language || '').toLowerCase();

                switch (moodId) {
                    case 'workout':
                        return (
                            language.includes('punjabi') ||
                            includesAny(title, [
                                'dhol',
                                'jatt',
                                'sidhu',
                            ]) ||
                            includesAny(artist, ['sidhu', 'karan'])
                        );

                    case 'party':
                        return (
                            language.includes('hindi') ||
                            includesAny(title, [
                                'party',
                                'dj',
                                'mashup',
                            ]) ||
                            includesAny(artist, ['badshah', 'yo yo'])
                        );

                    case 'sad':
                        return (
                            includesAny(title, [
                                'sad',
                                'yaad',
                                'dil',
                            ]) ||
                            includesAny(artist, ['b praak', 'arijit'])
                        );

                    case 'sufi':
                        return (
                            includesAny(title, [
                                'sufi',
                                'rooh',
                                'tere',
                            ]) ||
                            includesAny(artist, ['nusrat', 'rahul'])
                        );

                    case 'romantic':
                        return (
                            includesAny(title, [
                                'pyaar',
                                'love',
                                'ishq',
                                'suniye',
                            ]) || artist.includes('arijit')
                        );

                    case 'drive':
                        return (
                            includesAny(title, [
                                'ride',
                                'car',
                                'speed',
                            ]) ||
                            language.includes('punjabi') ||
                            language.includes('hindi')
                        );

                    default:
                        return true;
                }
            });
        };

        return Object.fromEntries(
            MOODS.map((mood) => [
                mood.id,
                filterSongs(mood.id),
            ])
        );
    }, [uniqueSongs]);

    const currentMood =
        MOODS.find((mood) => mood.id === activeMood) || MOODS[0];

    const currentTracks = moodSongPools[activeMood] || [];

    const handleMoodClick = (mood) => {
        setActiveMood(mood.id);

        if (mood.id !== 'all') {
            const count = moodSongPools[mood.id]?.length || 0;

            if (count > 0) {
                toast.success(
                    `${mood.emoji} ${mood.label} · ${count} tracks`,
                    {
                        icon: '🎧',
                        duration: 2200,
                        style: {
                            borderRadius: '14px',
                            background: '#111116',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.08)',
                        },
                    }
                );
            } else {
                toast.error('No matching tracks for this mood right now.');
            }
        }
    };

    const handlePlayMoodMix = () => {
        const poolToPlay = currentTracks;

        if (!poolToPlay.length) {
            toast.error('No tracks available for this mood right now.');
            return;
        }

        const firstSong = poolToPlay[0];
        const songId =
            firstSong.song_id ?? firstSong.id ?? firstSong._id;

        if (songId == null) {
            toast.error('Unable to play this track right now.');
            return;
        }

        playSong(songId, poolToPlay);

        toast.success(
            `Playing ${currentMood.emoji} ${currentMood.label} Mix`,
            {
                icon: '📻',
                duration: 3000,
                style: {
                    borderRadius: '14px',
                    background: '#111116',
                    color: '#fff',
                    border: '1px solid rgba(139,92,246,0.3)',
                },
            }
        );
    };

    return (
        <section className="mood-radio relative my-8 w-full font-sans sm:my-10">

            {/* Ambient background */}
            <div className="pointer-events-none absolute -left-10 top-10 -z-10 h-52 w-52 rounded-full bg-violet-600/[0.07] blur-[100px]" />
            <div className="pointer-events-none absolute -right-10 bottom-0 -z-10 h-52 w-52 rounded-full bg-cyan-500/[0.06] blur-[100px]" />

            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d0d12] shadow-[0_20px_80px_rgba(0,0,0,0.2)]">

                {/* Subtle top accent */}
                <div
                    className={`h-[2px] w-full bg-gradient-to-r ${currentMood.color} opacity-80 transition-all duration-500`}
                />

                <div className="p-5 sm:p-7 lg:p-8">

                    {/* Header */}
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex min-w-0 items-center gap-3.5">
                            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.04] sm:h-14 sm:w-14">
                                <Radio
                                    size={25}
                                    className="text-violet-300"
                                />

                                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0d0d12] bg-emerald-400" />
                            </div>

                            <div className="min-w-0">
                                <div className="mb-1 flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300">
                                        GEETHUB RADIO
                                    </span>

                                    <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2 py-0.5 text-[9px] font-semibold text-emerald-300">
                                        READY TO PLAY
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    Mood Radio
                                    <span className="text-violet-400">.</span>
                                </h2>

                                <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                                    Pick your vibe. Let the music take over.
                                </p>
                            </div>
                        </div>

                        {/* Play button */}
                        <button
                            type="button"
                            onClick={handlePlayMoodMix}
                            disabled={currentTracks.length === 0}
                            className={`group relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r ${currentMood.color} px-5 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[190px]`}
                        >
                            <span className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/[0.08]" />

                            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                                <Play
                                    size={14}
                                    fill="currentColor"
                                />
                            </span>

                            <span className="relative text-left">
                                <span className="block text-sm">
                                    Play mood mix
                                </span>
                                <span className="mt-0.5 block text-[10px] font-medium text-white/75">
                                    {currentTracks.length} tracks available
                                </span>
                            </span>

                            <ArrowUpRight
                                size={16}
                                className="relative ml-auto opacity-70 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                        </button>
                    </div>

                    {/* Active mood feature */}
                    <div
                        className="relative mt-7 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#131319] transition-colors duration-500"
                        style={{
                            backgroundImage: `linear-gradient(110deg, ${currentMood.glow}, transparent 75%)`,
                        }}
                    >
                        <div className="relative flex items-center justify-between gap-4 p-4 sm:p-5">

                            <div className="flex min-w-0 items-center gap-3.5">
                                <div
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${currentMood.color} shadow-lg sm:h-14 sm:w-14`}
                                >
                                    <currentMood.icon
                                        size={24}
                                        className="text-white"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-500">
                                        CURRENTLY SELECTED
                                    </p>

                                    <h3 className="truncate text-base font-bold text-white sm:text-lg">
                                        {currentMood.emoji}{' '}
                                        {currentMood.label}
                                    </h3>

                                    <p className="mt-1 truncate text-xs text-gray-400">
                                        {currentMood.subtitle}
                                    </p>
                                </div>
                            </div>

                            <div className="hidden shrink-0 items-center gap-1 sm:flex">
                                {[0, 1, 2, 3, 4, 5, 6, 7].map(
                                    (bar) => (
                                        <div
                                            key={bar}
                                            className={`mood-equalizer h-5 w-[3px] origin-center rounded-full bg-gradient-to-t ${currentMood.color}`}
                                            style={{
                                                animationDelay: `${bar * 90}ms`,
                                                opacity: 0.4 + (bar % 3) * 0.2,
                                            }}
                                        />
                                    )
                                )}
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-1 sm:hidden">
                                <Disc3
                                    size={20}
                                    style={{ color: currentMood.accent }}
                                />
                                <span className="text-[10px] text-gray-500">
                                    {currentTracks.length} tracks
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mood selector heading */}
                    <div className="mb-3 mt-8 flex items-end justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-semibold text-white sm:text-base">
                                Explore moods
                            </h3>
                            <p className="mt-1 text-[11px] text-gray-500 sm:text-xs">
                                Find the soundtrack for your moment.
                            </p>
                        </div>

                        <span className="shrink-0 text-[10px] font-medium text-gray-600">
                            {MOODS.length} stations
                        </span>
                    </div>

                    {/* Mood cards */}
                    <div className="mood-scroll flex gap-3 overflow-x-auto pb-2 pt-1">
                        {MOODS.map((mood) => {
                            const isActive = activeMood === mood.id;
                            const MoodIcon = mood.icon;
                            const count =
                                moodSongPools[mood.id]?.length || 0;

                            return (
                                <button
                                    key={mood.id}
                                    type="button"
                                    onClick={() => handleMoodClick(mood)}
                                    aria-pressed={isActive}
                                    className={`group relative flex w-[148px] shrink-0 flex-col overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-300 sm:w-[165px] sm:p-4 ${
                                        isActive
                                            ? 'border-white/20 bg-white/[0.07] shadow-lg'
                                            : 'border-white/[0.07] bg-[#111116] hover:border-white/[0.15] hover:bg-[#18181f]'
                                    }`}
                                >
                                    {/* Selected mood background */}
                                    <div
                                        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-[45px] transition-opacity duration-300 ${
                                            isActive
                                                ? 'opacity-100'
                                                : 'opacity-0 group-hover:opacity-60'
                                        }`}
                                        style={{
                                            backgroundColor: mood.accent,
                                        }}
                                    />

                                    <div className="relative flex w-full items-start justify-between gap-2">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${mood.color} transition-transform duration-300 group-hover:scale-105`}
                                        >
                                            <MoodIcon
                                                size={19}
                                                className="text-white"
                                            />
                                        </div>

                                        {isActive ? (
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white">
                                                <Check size={13} />
                                            </span>
                                        ) : (
                                            <Sparkles
                                                size={14}
                                                className="mt-1 text-gray-600 transition-colors duration-300 group-hover:text-gray-300"
                                            />
                                        )}
                                    </div>

                                    <div className="relative mt-4 w-full">
                                        <span className="block truncate text-xs font-bold text-white sm:text-sm">
                                            {mood.label}
                                        </span>

                                        <span className="mt-1.5 block text-[10px] text-gray-500">
                                            {count}{' '}
                                            {count === 1 ? 'track' : 'tracks'}
                                        </span>
                                    </div>

                                    {/* Active underline */}
                                    <div
                                        className={`absolute bottom-0 left-3 right-3 h-[2px] rounded-full transition-opacity duration-300 ${
                                            isActive
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        }`}
                                        style={{
                                            backgroundColor: mood.accent,
                                        }}
                                    />
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 sm:text-xs">
                            <Headphones
                                size={14}
                                className="text-violet-400"
                            />
                            <span>
                                {currentTracks.length > 0
                                    ? `Ready to play ${currentMood.label}`
                                    : 'No matching tracks available'}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                            <Music2 size={12} />
                            <span>Powered by your library</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scoped animation styles */}
            <style>{`
                .mood-scroll {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                }

                .mood-scroll::-webkit-scrollbar {
                    display: none;
                }

                @keyframes moodEqualizer {
                    0%, 100% {
                        transform: scaleY(0.35);
                    }
                    50% {
                        transform: scaleY(1);
                    }
                }

                .mood-equalizer {
                    animation: moodEqualizer 850ms ease-in-out infinite;
                }

                @media (prefers-reduced-motion: reduce) {
                    .mood-equalizer {
                        animation: none;
                        transform: scaleY(0.65);
                    }

                    .mood-scroll {
                        scroll-behavior: auto;
                    }
                }
            `}</style>
        </section>
    );
};

export default MoodRadioBar;
