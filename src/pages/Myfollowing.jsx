//my following list

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar';
import { Users, Verified, UserMinus, Heart, TrendingUp, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import API_BASE_URL from '../config/api';

const Myfollowing = () => {
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unfollowLoading, setUnfollowLoading] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate('/login');
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                const response = await axios.get(`${API_BASE_URL}/artists/followed/me`, config);
                console.log("Following data:", response.data);
                setFollowing(response.data.artists || []);
            } catch (error) {
                console.error("Error fetching following data:", error);
                toast.error("Failed to load followed artists");
            } finally {
                setLoading(false);
            }
        };

        fetchFollowing();
    }, [navigate]);

    const handleUnfollow = async (artistId) => {
        setUnfollowLoading(prev => ({ ...prev, [artistId]: true }));
        
        try {
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.post(`${API_BASE_URL}/artists/unfollow/${artistId}`, {}, config);
            
            // Remove artist from the list
            setFollowing(prev => prev.filter(artist => artist.artist_id !== artistId));
            toast.success("Unfollowed successfully");
        } catch (error) {
            console.error("Error unfollowing artist:", error);
            toast.error("Failed to unfollow artist");
        } finally {
            setUnfollowLoading(prev => ({ ...prev, [artistId]: false }));
        }
    };

    const handleArtistClick = (artistId) => {
        navigate(`/artist/${artistId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050507]">
                <Navbar />
                <div className="flex items-center justify-center py-32">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050507] text-white pb-32">
            <Navbar />
            <Toaster position="bottom-right" />

            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-xl">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                                Following
                            </h1>
                            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                {following.length} {following.length === 1 ? 'Artist' : 'Artists'} you follow
                            </p>
                        </div>
                    </div>
                    <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                </div>

                {/* Empty State */}
                {following.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 rounded-full mb-6 border border-white/5">
                            <Users className="w-20 h-20 text-gray-500" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-300">No Artists Yet</h2>
                        <p className="text-gray-400 text-center max-w-md mb-8">
                            Start following your favorite artists to see their latest releases and updates here.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 
                                text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 
                                flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            Discover Artists
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    /* Artists Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {following.map((artist) => (
                            <div
                                key={artist.artist_id}
                                className="group relative bg-gradient-to-br from-gray-900/50 to-black/30 
                                    border border-white/5 rounded-2xl p-6 
                                    hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10
                                    transition-all duration-300 hover:-translate-y-2"
                            >
                                {/* Artist Image */}
                                <div 
                                    onClick={() => handleArtistClick(artist.artist_id)}
                                    className="relative mb-4 cursor-pointer"
                                >
                                    <div className="w-full aspect-square rounded-xl overflow-hidden 
                                        bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                                        border-2 border-white/10 group-hover:border-blue-500/50 
                                        transition-all duration-300 shadow-lg">
                                        <img
                                            src={artist.image_url || 'https://via.placeholder.com/300'}
                                            alt={artist.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300';
                                            }}
                                        />
                                    </div>

                                    {/* Verified Badge */}
                                    {artist.verified && (
                                        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-blue-500 to-blue-600 
                                            rounded-full p-2 shadow-lg ring-4 ring-black/50">
                                            <Verified className="w-5 h-5 text-white" fill="currentColor" />
                                        </div>
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                                        transition-opacity duration-300 rounded-xl flex items-center justify-center">
                                        <button className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold 
                                            flex items-center gap-2 hover:bg-blue-600 transition-colors">
                                            View Profile
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Artist Info */}
                                <div className="mb-4">
                                    <h3 
                                        onClick={() => handleArtistClick(artist.artist_id)}
                                        className="font-bold text-lg text-white mb-1 truncate cursor-pointer 
                                            hover:text-blue-400 transition-colors"
                                    >
                                        {artist.name}
                                    </h3>
                                    
                                    {/* Genre Tags */}
                                    {artist.genre?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {artist.genre.slice(0, 2).map((genre, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 
                                                        rounded-full border border-blue-500/20"
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            <span>{(artist.follower_count || 0).toLocaleString()} followers</span>
                                        </div>
                                        {artist.verified && (
                                            <div className="flex items-center gap-1 text-blue-400">
                                                <TrendingUp className="w-3.5 h-3.5" />
                                                <span>Verified</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Unfollow Button */}
                                <button
                                    onClick={() => handleUnfollow(artist.artist_id)}
                                    disabled={unfollowLoading[artist.artist_id]}
                                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 
                                        border border-red-500/30 hover:border-red-500/50
                                        px-4 py-2.5 rounded-lg font-semibold text-sm
                                        transition-all duration-300 flex items-center justify-center gap-2
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        hover:shadow-lg hover:shadow-red-500/10"
                                >
                                    {unfollowLoading[artist.artist_id] ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                                            <span>Unfollowing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserMinus className="w-4 h-4" />
                                            <span>Unfollow</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Myfollowing;
