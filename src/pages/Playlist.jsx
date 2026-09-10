import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { Share2, Bookmark, Play, Plus, Trash2, Globe, Lock, Music, Clock, Sparkles, X, Search, ListMusic } from "lucide-react";
import Navbar from "../../Components/Navbar";
import API_BASE_URL from '../config/api';
import { useMusicPlayer } from "../context/MusicPlayerContext";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";

const Playlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong } = useMusicPlayer();

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchsong, setSearchsong] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Add Song Modal States
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recLoading, setRecLoading] = useState(false);
  const [addSongLoading, setAddSongLoading] = useState(false);

  // Fetch Playlist and Songs
  useEffect(() => {
    const fetchPlaylistAndSongs = async () => {
      const token = localStorage.getItem("token");
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_BASE_URL}/playlist/${id}`, config);
        const pl = res.data.playlist;
        setPlaylist(pl);

        if (pl?.song_ids?.length) {
          const songResponses = await Promise.all(
            pl.song_ids.map((sid) => axios.get(`${API_BASE_URL}/song/${sid}`, config).catch(() => null))
          );
          const validSongs = songResponses
            .filter((r) => r?.data?.song)
            .map((r) => r.data.song);
          setSongs(validSongs);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load playlist details");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylistAndSongs();
  }, [id]);

  useEffect(() => {
    if (playlist) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentUid = payload.Uid || payload.uid;
          if (playlist.saved_by?.includes(currentUid)) {
            setIsSaved(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [playlist]);

  const fetchRecommendedSongs = async () => {
    setRecLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/music/allsongs`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const playlistSongIds = new Set((songs || []).map((s) => String(s.song_id)));
      const filtered = (res.data.songs || []).filter((s) => !playlistSongIds.has(String(s.song_id)));
      setRecommendedSongs(filtered);
    } catch {
      toast.error("Failed to load music library");
    } finally {
      setRecLoading(false);
    }
  };

  const handleAddSong = async (song) => {
    setAddSongLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/playlist/${id}/addsong`,
        { song_id: song.song_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSongs((prev) => [...prev, song]);
      setRecommendedSongs((prev) => prev.filter((s) => s.song_id !== song.song_id));
      toast.success(`Added "${song.title}"`);
    } catch {
      toast.error("Failed to add song");
    } finally {
      setAddSongLoading(false);
    }
  };

  const removeSong = async (songId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_BASE_URL}/playlist/${id}/remove-song`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { song_id: songId },
      });
      setSongs((prev) => prev.filter((s) => s.song_id !== songId));
      toast.success("Song removed");
    } catch {
      toast.error("Could not remove song");
    }
  };

  const handleSavePlaylistToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/playlist/${id}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsSaved(res.data?.is_saved);
      toast.success(res.data?.message || "Playlist save updated");
    } catch (err) {
      toast.error("Failed to save playlist");
    }
  };

  const handleSharePlaylist = () => {
    const shareUrl = `${window.location.origin}/playlist/${id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Playlist link copied to clipboard!");
    } else {
      toast.error("Clipboard access not supported");
    }
  };

  const deletePlaylist = async () => {
    if (!window.confirm("Delete this playlist permanently?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_BASE_URL}/playlist/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Playlist deleted");
      navigate("/myplaylists");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handlePlayEntirePlaylist = () => {
    if (songs.length > 0) {
      playSong(songs[0].song_id, songs);
    } else {
      toast.error("Playlist has no tracks to play");
    }
  };

  const filteredRecs = recommendedSongs.filter(s => 
    (s.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.artist || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSongs = songs.filter(s => 
    (s.title || "").toLowerCase().includes(searchsong.toLowerCase()) || 
    (s.artist || "").toLowerCase().includes(searchsong.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center text-cyan-400 font-bold uppercase tracking-widest animate-pulse">
      Loading Playlist Vault...
    </div>
  );

  if (!playlist) return (
    <div className="min-h-screen bg-[#0b0c10] text-white flex flex-col items-center justify-center">
      <Navbar />
      <p className="text-gray-400 text-lg">Playlist not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white font-sans selection:bg-cyan-500/30 pb-32">
      <Navbar />
      <Toaster position="bottom-right" />

      {/* Hero Header Banner */}
      <div className="relative min-h-[42vh] flex items-end pt-24 pb-10 px-4 md:px-12 overflow-hidden">
        {/* Background Ambient Blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundImage: `url(${playlist.cover_image || DEFAULT_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/60 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-8 w-full max-w-7xl mx-auto">
          {/* Cover Art Box */}
          <div className="relative group flex-shrink-0">
            <img
              src={playlist.cover_image || DEFAULT_IMAGE}
              alt={playlist.name} 
              className="w-52 h-52 md:w-64 md:h-64 object-cover rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-slate-700/60"
            />
          </div>

          {/* Details & Actions */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                {playlist.is_public !== false ? (
                  <>
                    <Globe size={13} className="text-cyan-400" /> Public Playlist
                  </>
                ) : (
                  <>
                    <Lock size={13} className="text-amber-400" /> Private Playlist
                  </>
                )}
              </span>
              <span className="text-xs font-bold text-gray-400">• {songs.length} Tracks</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              {playlist.name}
            </h1>
            
            <p className="text-gray-300 text-sm md:text-base font-medium max-w-2xl line-clamp-2">
              {playlist.description || "Custom curated music playlist on GeetHub."}
            </p>
            
            {/* Buttons Toolbar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
              <button 
                onClick={handlePlayEntirePlaylist}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
              >
                <Play size={18} fill="white" />
                <span>Play All ({songs.length})</span>
              </button>

              <button 
                onClick={() => { fetchRecommendedSongs(); setShowAddSongModal(true); }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-white font-bold text-sm transition-all hover:scale-105"
              >
                <Plus size={18} className="text-cyan-400" />
                <span>Add Songs</span>
              </button>

              <button 
                onClick={handleSavePlaylistToggle}
                className={`px-6 py-3.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 border ${
                  isSaved 
                    ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-500/20' 
                    : 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700'
                }`}
                title={isSaved ? "Saved to your Library" : "Save Playlist to Library"}
              >
                <Bookmark size={18} fill={isSaved ? "black" : "transparent"} />
                <span>{isSaved ? "Saved" : "Save Playlist"}</span>
              </button>

              <button 
                onClick={handleSharePlaylist}
                className="p-3.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-cyan-400 hover:text-white transition-all"
                title="Copy Share Link"
              >
                <Share2 size={18} />
              </button>

              <button 
                onClick={deletePlaylist}
                className="p-3.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
                title="Delete Playlist"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- TRACKLIST TABLE SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 mt-8">
        {/* Search Track Input */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tracks in playlist..."
              className="w-full bg-[#12141d]/90 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:border-cyan-400 outline-none transition-all"
              value={searchsong}
              onChange={(e) => setSearchsong(e.target.value)}
            />
          </div>
          <span className="text-xs font-mono text-cyan-400">{filteredSongs.length} tracks matched</span>
        </div>

        {/* Table Column Headers */}
        <div className="grid grid-cols-12 px-5 py-3 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800/80 mb-3">
          <div className="col-span-1">#</div>
          <div className="col-span-7 md:col-span-6">Track Title</div>
          <div className="hidden md:block col-span-4">Artist</div>
          <div className="col-span-4 md:col-span-1 text-right pr-2">Action</div>
        </div>

        {/* Track Rows */}
        {songs.length === 0 ? (
          <div className="text-center py-20 bg-[#12141d]/60 rounded-3xl border border-slate-800/80 p-8 space-y-3">
            <ListMusic size={48} className="mx-auto text-gray-600 mb-2" />
            <h3 className="text-lg font-bold text-white">This playlist is empty</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              Click the <strong className="text-cyan-400">Add Songs</strong> button above to search and add tracks to your playlist.
            </p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-20 bg-[#12141d]/60 rounded-3xl border border-slate-800/80 p-8">
            <p className="text-gray-400 text-sm">No tracks match "{searchsong}".</p>
          </div>
        ) : (
          filteredSongs.map((song, idx) => (
            <div 
              key={song.song_id || idx} 
              className="grid grid-cols-12 items-center px-5 py-3.5 rounded-2xl bg-[#12141d]/60 hover:bg-[#181a26] border border-transparent hover:border-cyan-500/30 transition-all duration-200 group mb-2"
            >
              <div className="col-span-1 text-gray-400 font-mono text-sm font-bold">{idx + 1}</div>
              
              <div className="col-span-7 md:col-span-6 flex items-center gap-4 min-w-0">
                <img 
                  src={song.image_url || DEFAULT_IMAGE} 
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700/60 shadow-md flex-shrink-0" 
                  alt={song.title} 
                />
                <div className="truncate min-w-0">
                  <p 
                    className="font-bold text-white group-hover:text-cyan-300 cursor-pointer transition-colors truncate text-sm"
                    onClick={() => playSong(song.song_id, songs)}
                  >
                    {song.title}
                  </p>
                  <p className="text-xs text-gray-400 md:hidden truncate mt-0.5">{song.artist}</p>
                </div>
              </div>

              <div className="hidden md:block col-span-4 text-gray-300 text-sm font-medium truncate">
                {song.artist}
              </div>

              <div className="col-span-4 md:col-span-1 text-right flex items-center justify-end gap-2">
                <button 
                  onClick={() => playSong(song.song_id, songs)}
                  className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all"
                  title="Play Song"
                >
                  <Play size={15} fill="currentColor" />
                </button>
                
                <button 
                  onClick={() => removeSong(song.song_id)}
                  className="p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                  title="Remove from playlist"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- ADD SONG MODAL --- */}
      <Modal
        isOpen={showAddSongModal}
        onRequestClose={() => setShowAddSongModal(false)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4 outline-none"
        overlayClassName="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999]"
      >
        <div className="bg-[#12141d] rounded-3xl border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white font-sans">
          <div className="p-6 border-b border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                Add Music to Playlist
                <Sparkles size={20} className="text-cyan-400" />
              </h2>
              <button 
                onClick={() => setShowAddSongModal(false)} 
                className="p-2 rounded-full hover:bg-slate-800 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search songs or artists by name..."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:border-cyan-400 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            {recLoading ? (
              <div className="py-20 text-center text-cyan-400 font-bold uppercase tracking-widest animate-pulse">
                Scouring music library...
              </div>
            ) : filteredRecs.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">No tracks found.</div>
            ) : (
              filteredRecs.map((song) => (
                <div key={song.song_id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition-all group">
                  <div className="flex items-center gap-4 min-w-0">
                    <img src={song.image_url || DEFAULT_IMAGE} className="w-12 h-12 rounded-xl object-cover border border-slate-700 flex-shrink-0" alt="" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-white group-hover:text-cyan-300 truncate">{song.title}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{song.artist}</p>
                    </div>
                  </div>
                  <button
                    disabled={addSongLoading}
                    onClick={() => handleAddSong(song)}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2 rounded-xl text-xs font-black uppercase transition-all shadow-md flex-shrink-0 ml-3"
                  >
                    + Add
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-slate-900/90 border-t border-slate-800 text-center">
            <button 
              onClick={() => setShowAddSongModal(false)}
              className="px-6 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-gray-300 hover:text-white tracking-wider uppercase transition"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Playlist;
