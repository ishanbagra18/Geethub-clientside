
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import {
    Users,
    BadgeCheck,
    UserMinus,
    Heart,
    Search,
    ArrowUpRight,
    Music2,
    Disc3,
    X,
    Sparkles,
    Headphones,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import API_BASE_URL from '../config/api';

const FALLBACK_IMAGE =
    'https://placehold.co/500x500/15151c/777777?text=Artist';

const Myfollowing = () => {
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unfollowLoading, setUnfollowLoading] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(
                    `${API_BASE_URL}/artists/followed/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setFollowing(response.data.artists || []);
            } catch (error) {
                console.error('Error fetching following:', error);
                toast.error('Could not load your artists.');
            } finally {
                setLoading(false);
            }
        };

        fetchFollowing();
    }, [navigate]);

    const filteredArtists = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return following;

        return following.filter((artist) => {
            const name = (artist.name || '').toLowerCase();
            const genres = Array.isArray(artist.genre)
                ? artist.genre.join(' ').toLowerCase()
                : String(artist.genre || '').toLowerCase();

            return name.includes(query) || genres.includes(query);
        });
    }, [following, searchQuery]);

    const handleUnfollow = async (artistId) => {
        if (unfollowLoading[artistId]) return;

        setUnfollowLoading((prev) => ({
            ...prev,
            [artistId]: true,
        }));

        try {
            const token = localStorage.getItem('token');

            await axios.post(
                `${API_BASE_URL}/artists/unfollow/${artistId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setFollowing((prev) =>
                prev.filter((artist) => artist.artist_id !== artistId)
            );

            toast.success('Artist unfollowed successfully.');
        } catch (error) {
            console.error('Error unfollowing artist:', error);
            toast.error(
                error.response?.data?.message || 'Failed to unfollow artist.'
            );
        } finally {
            setUnfollowLoading((prev) => ({
                ...prev,
                [artistId]: false,
            }));
        }
    };

    const handleArtistClick = (artistId) => {
        navigate(`/artist/${artistId}`);
    };

    const formatFollowers = (count) => {
        const value = Number(count) || 0;

        return new Intl.NumberFormat('en', {
            notation: value >= 1000 ? 'compact' : 'standard',
            maximumFractionDigits: 1,
        }).format(value);
    };

    if (loading) {
        return (
            <div className="min-h-screen overflow-hidden bg-[#08080b] text-white">
                <Navbar />

                <main className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
                    <div className="mb-10 animate-pulse">
                        <div className="h-3 w-28 rounded bg-white/[0.07]" />
                        <div className="mt-5 h-10 w-64 max-w-full rounded-lg bg-white/[0.07]" />
                        <div className="mt-3 h-4 w-80 max-w-full rounded bg-white/[0.05]" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <div
                                key={index}
                                className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3 sm:p-4"
                            >
                                <div className="aspect-square rounded-xl bg-white/[0.06]" />
                                <div className="mt-4 h-4 w-3/4 rounded bg-white/[0.07]" />
                                <div className="mt-2 h-3 w-1/2 rounded bg-white/[0.05]" />
                                <div className="mt-5 h-9 rounded-lg bg-white/[0.05]" />
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#08080b] pb-20 text-white selection:bg-violet-500/30">
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#18181f',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.08)',
                    },
                }}
            />

            <Navbar />

            {/* Ambient background */}
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[520px] overflow-hidden">
                <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-blue-600/[0.12] blur-[140px]" />
                <div className="absolute -right-32 top-8 h-[380px] w-[380px] rounded-full bg-violet-600/[0.12] blur-[130px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#08080b]/50 to-[#08080b]" />
            </div>

            <main className="relative mx-auto max-w-[1440px] px-5 pt-8 sm:px-8 sm:pt-12 lg:px-12 lg:pt-14">
                {/* Header */}
                <section className="mb-9 sm:mb-12">
                    <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10">
                            <Headphones className="h-3.5 w-3.5 text-violet-300" />
                        </span>
                        Your music space
                    </div>

                    <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[58px]">
                                Your artists<span className="text-violet-400">.</span>
                            </h1>

                            <p className="mt-4 max-w-lg text-sm leading-7 text-gray-400 sm:text-base">
                                The voices you love, all in one place.
                                Explore your favorite artists and keep your
                                music world close.
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3.5 py-2">
                                    <Users className="h-4 w-4 text-violet-300" />
                                    <span className="text-sm font-semibold text-white">
                                        {following.length}
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        {following.length === 1
                                            ? 'artist followed'
                                            : 'artists followed'}
                                    </span>
                                </div>

                                <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3.5 py-2">
                                    <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
                                    <span className="text-sm text-gray-400">
                                        Your personal collection
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        {following.length > 0 && (
                            <div className="w-full lg:max-w-sm">
                                <label
                                    htmlFor="artist-search"
                                    className="mb-2 block text-xs font-medium text-gray-500"
                                >
                                    FIND YOUR ARTISTS
                                </label>

                                <div className="group flex h-12 items-center gap-3 rounded-xl border border-white/[0.09] bg-[#111116]/90 px-4 transition-all duration-300 focus-within:border-violet-400/50 focus-within:ring-4 focus-within:ring-violet-500/[0.08]">
                                    <Search className="h-4 w-4 shrink-0 text-gray-500 transition-colors group-focus-within:text-violet-300" />

                                    <input
                                        id="artist-search"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        placeholder="Search name or genre..."
                                        className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                                    />

                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            aria-label="Clear search"
                                            className="rounded-md p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Section heading */}
                {following.length > 0 && (
                    <div className="mb-5 flex items-center justify-between border-b border-white/[0.07] pb-4">
                        <div>
                            <h2 className="text-base font-semibold text-white sm:text-lg">
                                {searchQuery
                                    ? 'Search results'
                                    : 'Your collection'}
                            </h2>
                            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                {searchQuery
                                    ? `${filteredArtists.length} matching ${
                                          filteredArtists.length === 1
                                              ? 'artist'
                                              : 'artists'
                                      }`
                                    : 'Artists you keep coming back to'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Disc3 className="h-4 w-4 text-violet-400" />
                            {filteredArtists.length} shown
                        </div>
                    </div>
                )}

                {/* Empty collection */}
                {following.length === 0 ? (
                    <section className="relative flex min-h-[390px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.015] px-6 py-16 text-center">
                        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.09] blur-[90px]" />

                        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-500/[0.08]">
                            <Music2 className="h-9 w-9 text-violet-300" />
                            <Sparkles className="absolute -right-2 -top-2 h-5 w-5 text-blue-300" />
                        </div>

                        <h2 className="text-2xl font-semibold tracking-tight text-white">
                            Your collection starts here
                        </h2>

                        <p className="mt-3 max-w-sm text-sm leading-7 text-gray-400">
                            You haven't followed any artists yet. Find the
                            musicians you love and build your own little
                            corner of music.
                        </p>

                        <button
                            onClick={() => navigate('/')}
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-violet-400 active:scale-[0.98]"
                        >
                            <Music2 className="h-4 w-4" />
                            Discover artists
                            <ArrowUpRight className="h-4 w-4" />
                        </button>
                    </section>
                ) : filteredArtists.length === 0 ? (
                    /* No search matches */
                    <section className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] px-5 py-20 text-center">
                        <div className="mb-4 rounded-2xl bg-white/[0.04] p-4">
                            <Search className="h-7 w-7 text-gray-500" />
                        </div>

                        <h3 className="text-lg font-semibold text-white">
                            No artists found
                        </h3>

                        <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                            Nothing matches "{searchQuery}". Try a different
                            artist name or genre.
                        </p>

                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-5 rounded-lg px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/10 hover:text-violet-200"
                        >
                            Clear search
                        </button>
                    </section>
                ) : (
                    /* Artist cards */
                    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                        {filteredArtists.map((artist, index) => {
                            const genres = Array.isArray(artist.genre)
                                ? artist.genre
                                : artist.genre
                                  ? [artist.genre]
                                  : [];

                            const isUnfollowing =
                                !!unfollowLoading[artist.artist_id];

                            return (
                                <article
                                    key={artist.artist_id}
                                    className="artist-card group min-w-0 animate-card-in rounded-2xl border border-white/[0.07] bg-[#101015]/90 p-2.5 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-[#15151d] sm:p-3.5"
                                    style={{
                                        animationDelay: `${Math.min(index, 12) * 45}ms`,
                                    }}
                                >
                                    {/* Artwork */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleArtistClick(artist.artist_id)
                                        }
                                        aria-label={`View ${artist.name}'s profile`}
                                        className="relative block w-full overflow-hidden rounded-xl bg-[#1a1a23] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101015]"
                                    >
                                        <div className="aspect-square overflow-hidden">
                                            <img
                                                src={
                                                    artist.image_url ||
                                                    FALLBACK_IMAGE
                                                }
                                                alt={artist.name || 'Artist'}
                                                loading="lazy"
                                                onError={(e) => {
                                                    if (
                                                        e.currentTarget.src !==
                                                        FALLBACK_IMAGE
                                                    ) {
                                                        e.currentTarget.src =
                                                            FALLBACK_IMAGE;
                                                    }
                                                }}
                                                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                            />
                                        </div>

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/20 opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

                                        {artist.verified && (
                                            <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-blue-300/20 bg-black/60 px-2 py-1 text-[10px] font-semibold text-blue-200 backdrop-blur-md sm:text-xs">
                                                <BadgeCheck className="h-3.5 w-3.5 fill-blue-400/20" />
                                                Verified
                                            </div>
                                        )}

                                        <div className="absolute bottom-2.5 right-2.5 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-violet-500 text-white opacity-0 shadow-lg shadow-violet-950/30 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </div>
                                    </button>

                                    {/* Artist details */}
                                    <div className="px-0.5 pt-3 sm:px-0">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleArtistClick(
                                                    artist.artist_id
                                                )
                                            }
                                            className="flex max-w-full items-center gap-1.5 text-left focus-visible:outline-none focus-visible:underline focus-visible:decoration-violet-400"
                                        >
                                            <span className="truncate text-sm font-semibold text-gray-100 transition-colors duration-200 group-hover:text-violet-200 sm:text-base">
                                                {artist.name || 'Unknown artist'}
                                            </span>

                                            {artist.verified && (
                                                <BadgeCheck
                                                    className="h-4 w-4 shrink-0 text-blue-400"
                                                    aria-label="Verified artist"
                                                />
                                            )}
                                        </button>

                                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                                            <Users className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">
                                                {formatFollowers(
                                                    artist.follower_count
                                                )}{' '}
                                                followers
                                            </span>
                                        </div>

                                        {/* Genres */}
                                        <div className="mt-3 flex min-h-[24px] flex-wrap gap-1.5">
                                            {genres.slice(0, 2).map((genre, i) => (
                                                <span
                                                    key={`${genre}-${i}`}
                                                    className="max-w-full truncate rounded-md border border-white/[0.07] bg-white/[0.035] px-2 py-1 text-[10px] font-medium text-gray-400 sm:text-[11px]"
                                                >
                                                    {genre}
                                                </span>
                                            ))}

                                            {genres.length > 2 && (
                                                <span className="rounded-md border border-white/[0.07] px-2 py-1 text-[10px] text-gray-500">
                                                    +{genres.length - 2}
                                                </span>
                                            )}
                                        </div>

                                        {/* Unfollow */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleUnfollow(
                                                    artist.artist_id
                                                )
                                            }
                                            disabled={isUnfollowing}
                                            aria-label={`Unfollow ${artist.name}`}
                                            className="mt-3.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2 text-xs font-medium text-gray-400 transition-all duration-200 hover:border-rose-400/25 hover:bg-rose-500/[0.08] hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:gap-2 sm:text-sm"
                                        >
                                            {isUnfollowing ? (
                                                <>
                                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
                                                    <span>Removing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UserMinus className="h-3.5 w-3.5" />
                                                    <span>Unfollow</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}

                {/* Footer note */}
                {following.length > 0 && (
                    <div className="mt-10 flex flex-col items-center justify-center gap-2 border-t border-white/[0.06] pt-7 text-center">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                            <Heart className="h-3.5 w-3.5 text-violet-400" />
                            Your taste, your collection.
                        </div>
                        <p className="text-xs text-gray-600">
                            {searchQuery
                                ? 'Search your collection by artist or genre.'
                                : 'Keep discovering the music you love.'}
                        </p>
                    </div>
                )}
            </main>

            {/* Local animation styles */}
            <style>{`
                @keyframes artistCardIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-card-in {
                    animation: artistCardIn 420ms ease-out both;
                }

                @media (prefers-reduced-motion: reduce) {
                    .animate-card-in {
                        animation: none;
                    }

                    .artist-card,
                    .artist-card img,
                    .artist-card button {
                        transition: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Myfollowing;
