import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { PlayCircle, Heart, Clock, Bookmark, Music, ChevronLeft, ChevronRight, MoreHorizontal, PauseCircle } from 'lucide-react';
import { useHistory } from '../context/historyContext';
import { useNavigate } from 'react-router-dom';

const Mylibrary = () => {
    const { history, loading: historyLoading } = useHistory();
    const navigate = useNavigate();
    const [allSongs, setAllSongs] = useState([]);
    const [likedSongs, setLikedSongs] = useState([]);
    const [savedSongs, setSavedSongs] = useState([]);
    const [activeTab, setActiveTab] = useState('history');
    const [loading, setLoading] = useState(true);
    const [hoveredSong, setHoveredSong] = useState(null);
    const [currentCounts, setCurrentCounts] = useState({});

    useEffect(() => {
        const fetchLibraryData = async () => {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            
            try {
                const [likedRes, savedRes, allRes] = await Promise.all([
                    axios.get('http://localhost:9000/music/mylikedsongs', { headers }),
                    axios.get('http://localhost:9000/music/mysavedsongs', { headers }),
                    axios.get('http://localhost:9000/music/allsongs')
                ]);

                setLikedSongs(likedRes.data.songs || []);
                setSavedSongs(savedRes.data.songs || []);
                setAllSongs(allRes.data.songs || []);
            } catch (err) {
                console.error("Error fetching library data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLibraryData();
    }, []);

    // Update counts when data changes
    useEffect(() => {
        setCurrentCounts({
            history: history?.length || 0,
            liked: likedSongs.length,
            saved: savedSongs.length
        });
    }, [history, likedSongs, savedSongs]);

    const songLookup = useMemo(() => {
        const map = {};
        allSongs.forEach(song => {
            map[song.song_id] = song;
        });
        return map;
    }, [allSongs]);

    const getDisplayList = useCallback(() => {
        if (activeTab === 'history') return history;
        if (activeTab === 'liked') return likedSongs;
        return savedSongs;
    }, [activeTab, history, likedSongs, savedSongs]);

    const renderContent = () => {
        if (loading || historyLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-24 h-24 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center animate-spin-slow">
                        <Music className="w-12 h-12 text-green-400" />
                    </div>
                    <p className="mt-6 text-xl text-gray-400 font-medium animate-pulse">Loading your music library...</p>
                </div>
            );
        }

        const displayList = getDisplayList();
        
        if (displayList.length === 0) {
            const messages = {
                history: "No recent plays yet",
                liked: "No liked songs yet",
                saved: "No saved songs yet"
            };
            
            return (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-28 h-28 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm border border-gray-700">
                        <Music className="w-14 h-14 text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-300 mb-2">{messages[activeTab]}</h3>
                    <p className="text-gray-500 max-w-md">
                        {activeTab === 'history' ? "Your recently played songs will appear here." : 
                         `Start ${activeTab === 'liked' ? 'liking' : 'saving'} songs to see them here.`}
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h2>
                    <span className="text-sm text-gray-400 font-medium px-3 py-1 bg-gray-900/50 rounded-full">
                        {displayList.length} songs
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {displayList.map((song, index) => (
                        <SongCard 
                            key={song.id || song.song_id || index}
                            song={activeTab === 'history' ? songLookup[song.song_id] || song : song}
                            time={activeTab === 'history' ? song.played_at : null}
                            isHovered={hoveredSong === (song.id || song.song_id)}
                            onHover={() => setHoveredSong(song.id || song.song_id)}
                            onLeave={() => setHoveredSong(null)}
                            onClick={() => navigate(`/playsong/${song.song_id || song.id}`)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#090909] to-[#0f0f0f] text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 pt-6 pb-12 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                <header className="mb-12 lg:mb-16">
                    <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4 lg:mb-6 leading-tight">
                        Your Library
                    </h1>
                    
                    <div className="w-full border-b border-gray-900/50">
                        <nav className="flex overflow-x-auto pb-6 -mb-px scrollbar-hide">
                            <Tab 
                                active={activeTab === 'history'}
                                label="Recent"
                                count={currentCounts.history}
                                icon={<Clock size={20} />}
                                onClick={() => setActiveTab('history')}
                            />
                            <Tab 
                                active={activeTab === 'liked'}
                                label="Liked Songs"
                                count={currentCounts.liked}
                                icon={<Heart size={20} fill={activeTab === 'liked' ? '#10b981' : 'none'} />}
                                onClick={() => setActiveTab('liked')}
                            />
                            <Tab 
                                active={activeTab === 'saved'}
                                label="Saved"
                                count={currentCounts.saved}
                                icon={<Bookmark size={20} />}
                                onClick={() => setActiveTab('saved')}
                            />
                        </nav>
                    </div>
                </header>

                <main>{renderContent()}</main>
            </div>
        </div>
    );
};

// Enhanced Tab Component
const Tab = ({ active, label, count, icon, onClick }) => (
    <button 
        onClick={onClick}
        className={`
            flex items-center gap-3 px-4 py-3 rounded-2xl relative group transition-all duration-300 whitespace-nowrap
            ${active 
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-2 border-green-500/30 backdrop-blur-sm shadow-xl shadow-green-500/10' 
                : 'text-gray-400 hover:text-white hover:bg-gray-900/50 border border-transparent hover:border-gray-700'
            }
        `}
    >
        <div className="relative">
            {icon}
            {active && (
                <div className="absolute -inset-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur opacity-75 animate-ping"></div>
            )}
        </div>
        <span className="font-bold text-sm">{label}</span>
        {count > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                active 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-gray-800/50 text-gray-400 group-hover:bg-gray-700/50 group-hover:text-gray-300'
            }`}>
                {count}
            </span>
        )}
    </button>
);

// Premium SongCard Component
const SongCard = ({ song, time, isHovered, onHover, onLeave, onClick }) => {
    return (
        <div 
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            onClick={onClick}
            className="group relative bg-gradient-to-b from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-5 lg:p-6 rounded-3xl border border-transparent hover:border-green-500/30 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 cursor-pointer overflow-hidden hover:scale-[1.02] transform-gpu"
        >
            {/* Premium Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            
            {/* Album Art Container */}
            <div className="relative mb-4">
                <div className="relative h-20 w-20 lg:h-24 lg:w-24 mx-auto group-hover:grayscale-0">
                    <img 
                        src={song.image_url} 
                        alt={song.title}
                        className="h-full w-full object-cover rounded-2xl shadow-2xl border-4 border-gray-900/50 group-hover:border-green-500/40 transition-all duration-500"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <PlayCircle 
                            size={32} 
                            className="text-green-400 drop-shadow-lg hover:scale-110 transition-transform duration-200 fill-green-500/20" 
                        />
                    </div>
                </div>

                {/* Metadata Badge */}
                <div className="absolute -top-2 -right-2 bg-green-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-black shadow-lg border-2 border-white/20">
                    {isHovered ? 'PLAY' : ''}
                </div>
            </div>

            {/* Song Info */}
            <div className="text-center space-y-2">
                <h3 className="font-bold text-white text-sm lg:text-base leading-tight line-clamp-2 group-hover:text-green-400 transition-colors duration-300 px-2">
                    {song.title}
                </h3>
                <p className="text-xs text-gray-400 font-medium tracking-wide">{song.artist}</p>
                
                {time && (
                    <div className="flex items-center justify-center gap-1 text-[11px] text-gray-500 uppercase tracking-wider font-mono bg-gray-900/50 px-2 py-1 rounded-full">
                        <Clock size={12} />
                        <span>{new Date(time).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                        })}</span>
                    </div>
                )}

                {/* Premium Action Bar */}
                {isHovered && (
                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md rounded-2xl p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Heart size={18} className="text-gray-400 hover:text-red-400 transition-colors" fill="currentColor" />
                        <div className="flex gap-1">
                            <Bookmark size={18} className="text-gray-400 hover:text-yellow-400 transition-colors" />
                            <MoreHorizontal size={18} className="text-gray-400 hover:text-white transition-colors" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Mylibrary;
