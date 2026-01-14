// des about the artist 


import React from 'react'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Music2, Users, Verified, Instagram, Twitter, Facebook, Globe, Play } from 'lucide-react'
import Navbar from '../../Components/Navbar'
import toast, { Toaster } from 'react-hot-toast'

const Artistdes = () => {
    const { id: artistId } = useParams();
    const navigate = useNavigate();
    const [artist, setArtist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        const fetchArtistData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                // Fetch artist details
                const artistResponse = await axios.get(`http://localhost:9000/artists/${artistId}`, config);
                setArtist(artistResponse.data);

                // Fetch artist songs
                const songsResponse = await axios.get(`http://localhost:9000/artists/${artistId}/songs`, config);
                setSongs(songsResponse.data.songs || []);

                // Check if following
                try {
                    const followResponse = await axios.get(`http://localhost:9000/artists/check-following/${artistId}`, config);
                    setIsFollowing(followResponse.data.is_following);
                } catch (err) {
                    console.log("Follow check failed:", err);
                }
            }
            catch (error) {
                console.error("Error fetching artist:", error);
                toast.error("Failed to load artist details");
            } finally {
                setLoading(false);
            }
        };
        
        if (artistId) {
            fetchArtistData();
        }
    }, [artistId]);

    const handleFollowToggle = async () => {
        setFollowLoading(true);
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const endpoint = isFollowing 
                ? `http://localhost:9000/artists/unfollow/${artistId}`
                : `http://localhost:9000/artists/follow/${artistId}`;

            await axios.post(endpoint, {}, config);
            setIsFollowing(!isFollowing);
            toast.success(isFollowing ? "Unfollowed artist" : "Following artist");
            
            // Update follower count
            if (artist) {
                setArtist({
                    ...artist,
                    follower_count: isFollowing 
                        ? artist.follower_count - 1 
                        : artist.follower_count + 1
                });
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
            toast.error("Failed to update follow status");
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050507] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="min-h-screen bg-[#050507] flex items-center justify-center">
                <div className="text-center">
                    <Music2 className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-xl">Artist not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050507] text-white pb-32">
            <Navbar />
            <Toaster position="bottom-right" />

            {/* Hero Section with Gradient Background */}
            <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
                {/* Blurred Background */}
                <div 
                    className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-30"
                    style={{ backgroundImage: `url(${artist.image_url || 'https://via.placeholder.com/1200x400'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050507]/40 to-[#050507]" />

                {/* Artist Info */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 h-full flex items-end pb-12">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-8 w-full">
                        {/* Artist Image */}
                        <div className="relative group">
                            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl group-hover:border-blue-500/50 transition-all duration-300">
                                <img
                                    src={artist.image_url || 'https://via.placeholder.com/256'}
                                    alt={artist.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {artist.verified && (
                                <div className="absolute top-2 right-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-2 shadow-lg ring-4 ring-white/20">
                                    <Verified className="w-6 h-6 text-white" fill="currentColor" />
                                </div>
                            )}
                        </div>

                        {/* Artist Details */}
                        <div className="flex-1 text-center md:text-left">
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Artist</p>
                            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter">{artist.name}</h1>
                            
                            {/* Stats */}
                            <div className="flex items-center justify-center md:justify-start gap-6 mb-6 text-sm">
                                {artist.follower_count > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-400" />
                                        <span className="font-bold">
                                            {artist.follower_count >= 1000 
                                                ? `${(artist.follower_count / 1000).toFixed(1)}K` 
                                                : artist.follower_count} followers
                                        </span>
                                    </div>
                                )}
                                {songs.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Music2 className="w-4 h-4 text-blue-400" />
                                        <span className="font-bold">{songs.length} songs</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={followLoading}
                                    className={`${
                                        isFollowing 
                                            ? 'bg-white/10 hover:bg-white/20 border border-white/20' 
                                            : 'bg-blue-500 hover:bg-blue-400'
                                    } px-8 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8">
                {/* Bio Section */}
                {artist.bio && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-black mb-4">About</h2>
                        <p className="text-gray-300 leading-relaxed max-w-3xl">{artist.bio}</p>
                    </div>
                )}

                {/* Genres */}
                {artist.genre && artist.genre.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-black mb-4">Genres</h2>
                        <div className="flex flex-wrap gap-3">
                            {artist.genre.map((genre, idx) => (
                                <span 
                                    key={idx}
                                    className="bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-full text-sm font-semibold text-blue-300"
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Social Links */}
                {artist.social_links && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-black mb-4">Connect</h2>
                        <div className="flex flex-wrap gap-3">
                            {artist.social_links.instagram && (
                                <a 
                                    href={artist.social_links.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/50 px-4 py-2 rounded-full transition-all"
                                >
                                    <Instagram className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Instagram</span>
                                </a>
                            )}
                            {artist.social_links.twitter && (
                                <a 
                                    href={artist.social_links.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/50 px-4 py-2 rounded-full transition-all"
                                >
                                    <Twitter className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Twitter</span>
                                </a>
                            )}
                            {artist.social_links.facebook && (
                                <a 
                                    href={artist.social_links.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-600/50 px-4 py-2 rounded-full transition-all"
                                >
                                    <Facebook className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Facebook</span>
                                </a>
                            )}
                            {artist.social_links.website && (
                                <a 
                                    href={artist.social_links.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/50 px-4 py-2 rounded-full transition-all"
                                >
                                    <Globe className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Website</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Popular Songs */}
                <div className="mb-12">
                    <h2 className="text-2xl font-black mb-6">Popular Songs</h2>
                    
                    {songs.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <Music2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">No songs available</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {songs.map((song, idx) => (
                                <div 
                                    key={song.song_id}
                                    onClick={() => navigate(`/playsong/${song.song_id}`)}
                                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <span className="text-gray-500 font-bold w-6 text-center group-hover:text-blue-400 transition-colors">
                                            {idx + 1}
                                        </span>
                                        <img 
                                            src={song.image_url || 'https://via.placeholder.com/48'}
                                            alt={song.title}
                                            className="w-12 h-12 rounded object-cover shadow-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                                                {song.title}
                                            </p>
                                            <p className="text-sm text-gray-400 truncate">
                                                {song.artist}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 bg-blue-500 hover:bg-blue-400 p-3 rounded-full transition-all transform hover:scale-110">
                                        <Play className="w-4 h-4 text-white" fill="currentColor" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Artistdes
