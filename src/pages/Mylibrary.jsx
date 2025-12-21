import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from "react-modal";
import axios from 'axios';
import { 
    PlayCircle, Heart, Clock, Bookmark, Music, 
    X, Upload, Tag, Globe, Lock, Trash2 
} from 'lucide-react';
import { useHistory } from '../context/historyContext';
import { useNavigate } from 'react-router-dom';

Modal.setAppElement('#root'); 

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

    // Modal States
    const [showAddPlaylistModal, setShowAddPlaylistModal] = useState(false);
    const [playlistForm, setPlaylistForm] = useState({
        name: "",
        description: "",
        type: "user",
        tags: "", 
        is_public: true,
        cover_image: null, 
        song_ids: [],
    });
    
    const [recommendedSongs, setRecommendedSongs] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState("");
    const [songSearch, setSongSearch] = useState("");

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

    useEffect(() => {
        setCurrentCounts({
            history: history?.length || 0,
            liked: likedSongs.length,
            saved: savedSongs.length
        });
    }, [history, likedSongs, savedSongs]);

    const songLookup = useMemo(() => {
        const map = {};
        allSongs.forEach(song => { map[song.song_id] = song; });
        return map;
    }, [allSongs]);

    const getDisplayList = useCallback(() => {
        if (activeTab === 'history') return history || [];
        if (activeTab === 'liked') return likedSongs;
        return savedSongs;
    }, [activeTab, history, likedSongs, savedSongs]);

    // --- NEW: Handle Clear History ---
    const handleClearHistory = async () => {
        if (!window.confirm("Are you sure you want to clear your entire listening history?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete('http://localhost:9000/history/clear', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh to update UI (or you can call a refresh function from context if available)
            window.location.reload();
        } catch (err) {
            console.error("Error clearing history:", err);
            alert("Failed to clear history. Please try again.");
        }
    };

    const openAddPlaylistModal = async () => {
        setShowAddPlaylistModal(true);
        setModalLoading(true);
        setSongSearch("");
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:9000/music/allsongs", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecommendedSongs(res.data.songs || []);
        } catch (err) {
            setModalError("Failed to fetch songs");
        } finally {
            setModalLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === "file") {
            setPlaylistForm(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setPlaylistForm(prev => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    const handleSongToggle = (songId) => {
        setPlaylistForm(prev => ({
            ...prev,
            song_ids: prev.song_ids.includes(songId)
                ? prev.song_ids.filter(id => id !== songId)
                : [...prev.song_ids, songId],
        }));
    }; 

    // model for creating the playlist 

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError("");
        
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("name", playlistForm.name);
            formData.append("description", playlistForm.description);
            formData.append("type", playlistForm.type);
            formData.append("is_public", playlistForm.is_public);
            
            const tagsArray = playlistForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
            formData.append("tags", JSON.stringify(tagsArray));
            
            playlistForm.song_ids.forEach(id => formData.append("song_ids", id));

            if (playlistForm.cover_image) {
                formData.append("cover_image", playlistForm.cover_image);
            }

            await axios.post("http://localhost:9000/playlist/create", formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });

            setShowAddPlaylistModal(false);
            setPlaylistForm({ name: "", description: "", type: "user", tags: "", is_public: true, cover_image: null, song_ids: [] });
            window.location.reload(); // Refresh to show new playlist if needed
        } catch (err) {
            setModalError(err.response?.data?.error || "Failed to create playlist");
        } finally {
            setModalLoading(false);
        }
    };

    // Ref for scrolling to the first song
    const firstSongRef = React.useRef(null);

    // Scroll to first song if navigated from Navbar 'Recently'
    useEffect(() => {
        const state = window.history.state && window.history.state.usr;
        if (state && state.scrollToRecent && activeTab === 'history' && history && history.length > 0) {
            setTimeout(() => {
                if (firstSongRef.current) {
                    firstSongRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        }
    }, [activeTab, history]);

    const renderContent = () => {
        if (loading || historyLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-24 h-24 bg-blue-500/10 rounded-2xl flex items-center justify-center animate-pulse">
                        <Music className="w-12 h-12 text-blue-400" />
                    </div>
                </div>
            );
        }

        const displayList = getDisplayList();
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">{activeTab.toUpperCase()}</h2>
                        {/* Clear History Button UI */}
                        {activeTab === 'history' && displayList.length > 0 && (
                            <button 
                                onClick={handleClearHistory}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all text-xs font-bold"
                            >
                                <Trash2 size={14} />
                                CLEAR HISTORY
                            </button>
                        )}
                    </div>
                    <span className="text-sm text-gray-400 px-3 py-1 bg-gray-900/50 rounded-full">{displayList.length} songs</span>
                </div>

                {displayList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-[#121212] rounded-3xl border border-dashed border-gray-800">
                        <p className="text-gray-500">No songs found in your {activeTab}.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayList.map((song, index) => (
                            <SongCard 
                                key={song.id || song.song_id || index}
                                song={activeTab === 'history' ? songLookup[song.song_id] || song : song}
                                isHovered={hoveredSong === (song.id || song.song_id)}
                                onHover={() => setHoveredSong(song.id || song.song_id)}
                                onLeave={() => setHoveredSong(null)}
                                onClick={() => navigate(`/playsong/${song.song_id || song.id}`)}
                                ref={activeTab === 'history' && index === 0 ? firstSongRef : undefined}
                                highlight={activeTab === 'history' && index === 0}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };


    // recetly played border added 

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <div className="pt-6 pb-12 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl lg:text-6xl font-black mb-6">Your Library</h1>
                        <nav className="flex flex-wrap gap-3">
                            <Tab active={activeTab === 'history'} label="Recent" count={currentCounts.history} icon={<Clock size={18}/>} onClick={() => setActiveTab('history')} />
                            <Tab active={activeTab === 'liked'} label="Liked" count={currentCounts.liked} icon={<Heart size={18}/>} onClick={() => setActiveTab('liked')} />
                            <Tab active={activeTab === 'saved'} label="Saved" count={currentCounts.saved} icon={<Bookmark size={18}/>} onClick={() => setActiveTab('saved')} />
                        </nav>
                    </div>
                    <button onClick={openAddPlaylistModal} className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 font-bold transition-all shadow-xl shadow-blue-600/20">
                        + Create Playlist
                    </button>
                </header>

                <main>{renderContent()}</main>

                <Modal
                    isOpen={showAddPlaylistModal}
                    onRequestClose={() => setShowAddPlaylistModal(false)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl bg-[#121212] border border-gray-800 rounded-3xl p-6 lg:p-10 shadow-2xl outline-none max-h-[90vh] overflow-y-auto custom-scrollbar"
                    overlayClassName="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999]"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold">New Playlist</h2>
                        <button onClick={() => setShowAddPlaylistModal(false)} className="text-gray-400 hover:text-white p-2">
                            <X size={28} />
                        </button>
                    </div>

                    {modalError && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl text-sm">{modalError}</div>}

                    <form onSubmit={handleCreatePlaylist} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Name</label>
                                <input name="name" value={playlistForm.name} onChange={handleFormChange} placeholder="My Awesome Mix" required 
                                       className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition" />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Description</label>
                                <textarea name="description" value={playlistForm.description} onChange={handleFormChange} placeholder="What's this vibe about?" required
                                          className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl px-4 py-3 h-28 resize-none outline-none focus:border-blue-500" />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Tags (comma separated)</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-3.5 text-gray-500" size={16} />
                                        <input name="tags" value={playlistForm.tags} onChange={handleFormChange} placeholder="Rock, 80s, Chill" 
                                               className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl pl-10 pr-4 py-3 focus:border-blue-500 outline-none transition text-sm" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[#1e1e1e] rounded-xl border border-gray-700">
                                <div className="flex items-center gap-3">
                                    {playlistForm.is_public ? <Globe size={20} className="text-blue-400" /> : <Lock size={20} className="text-gray-400" />}
                                    <span className="text-sm font-medium">{playlistForm.is_public ? "Public Playlist" : "Private Playlist"}</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="is_public" checked={playlistForm.is_public} onChange={handleFormChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Cover Image</label>
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-700 rounded-2xl cursor-pointer hover:border-blue-500 bg-[#1e1e1e] transition-all group overflow-hidden">
                                    {playlistForm.cover_image ? (
                                        <img src={URL.createObjectURL(playlistForm.cover_image)} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Upload className="text-gray-500 group-hover:text-blue-400 mb-2" size={32} />
                                            <span className="text-xs text-gray-500">Upload Image</span>
                                        </div>
                                    )}
                                    <input type="file" name="cover_image" className="hidden" onChange={handleFormChange} accept="image/*" />
                                </label>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Add Songs ({playlistForm.song_ids.length})</label>
                                <input
                                    type="text"
                                    value={songSearch}
                                    onChange={e => setSongSearch(e.target.value)}
                                    placeholder="Search songs by title..."
                                    className="w-full mb-2 px-3 py-2 rounded-lg bg-[#181818] border border-gray-700 text-sm text-white focus:border-blue-500 outline-none"
                                />
                                <div className="bg-[#1e1e1e] rounded-xl p-2 border border-gray-700 h-[180px] overflow-y-auto custom-scrollbar">
                                    {recommendedSongs.filter(song =>
                                        song.title.toLowerCase().includes(songSearch.toLowerCase()) ||
                                        song.artist.toLowerCase().includes(songSearch.toLowerCase())
                                    ).map(song => (
                                        <label key={song.song_id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer group">
                                            <input type="checkbox" checked={playlistForm.song_ids.includes(song.song_id)} onChange={() => handleSongToggle(song.song_id)} 
                                                   className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-0" />
                                            <img src={song.image_url || "/api/placeholder/40/40"} alt={song.title} className="w-10 h-10 object-cover rounded-lg border border-gray-800" />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-medium truncate group-hover:text-blue-400 transition">{song.title}</span>
                                                <span className="text-[10px] text-gray-500 truncate">{song.artist}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={modalLoading} className="md:col-span-2 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-600/30 text-lg">
                            {modalLoading ? "Creating..." : "Create Playlist"}
                        </button>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

const Tab = ({ active, label, count, icon, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${active ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-gray-400 hover:bg-white/5'}`}>
        {icon} <span className="font-bold text-sm tracking-wide">{label}</span>
        {count > 0 && <span className={`text-xs ml-1 px-2 py-0.5 rounded-full ${active ? 'bg-black/10 text-black' : 'bg-white/10 text-gray-400'}`}>{count}</span>}
    </button>
);


const SongCard = React.forwardRef(({ song, isHovered, onHover, onLeave, onClick, highlight }, ref) => (
    <div
        ref={ref}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={onClick}
        className={`group relative bg-[#181818] p-4 rounded-3xl border transition-all duration-300 cursor-pointer
            ${highlight ? 'border-4 border-yellow-400 shadow-yellow-400/40 shadow-xl animate-pulse' : 'border-transparent hover:border-gray-800 hover:bg-[#222]'}`}
    >
        <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl shadow-2xl">
            <img src={song?.image_url || "/api/placeholder/400/400"} alt={song?.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
            <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <div className="bg-blue-600 p-4 rounded-full shadow-xl">
                    <PlayCircle size={32} className="text-white fill-white" />
                </div>
            </div>
        </div>
        <h3 className="font-bold truncate text-lg mb-1">{song?.title}</h3>
        <p className="text-sm text-gray-500 truncate font-medium">{song?.artist}</p>
        {highlight && (
            <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow">Last Played</span>
        )}
    </div>
));

export default Mylibrary;
