import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

const PLACEHOLDER = "https://via.placeholder.com/300?text=No+Cover";

const Playlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchsong, setSearchsong] = useState("");

  // Add Song Modal States
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [recLoading, setRecLoading] = useState(false);
  const [addSongLoading, setAddSongLoading] = useState(false);

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchPlaylistAndSongs = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`http://localhost:9000/playlist/${id}`, config);
        const pl = res.data.playlist;
        setPlaylist(pl);

        if (pl?.song_ids?.length) {
          const songResponses = await Promise.all(
            pl.song_ids.map((sid) => axios.get(`http://localhost:9000/song/${sid}`, config))
          );
          setSongs(songResponses.map((r) => r.data.song));
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylistAndSongs();
  }, [id]);

  const fetchRecommendedSongs = async () => {
    setRecLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:9000/music/allsongs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const playlistSongIds = new Set((songs || []).map((s) => String(s.song_id)));
      const filtered = (res.data.songs || []).filter((s) => !playlistSongIds.has(String(s.song_id)));
      setRecommendedSongs(filtered);
    } catch (err) {
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
        `http://localhost:9000/playlist/${id}/addsong`,
        { song_id: song.song_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSongs((prev) => [...prev, song]);
      setRecommendedSongs((prev) => prev.filter((s) => s.song_id !== song.song_id));
      toast.success(`Added ${song.title}`);
    } catch (err) {
      toast.error("Failed to add song");
    } finally {
      setAddSongLoading(false);
    }
  };

  const removeSong = async (songId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:9000/playlist/${id}/remove-song`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { song_id: songId },
      });
      setSongs((prev) => prev.filter((s) => s.song_id !== songId));
      toast.success("Song removed");
    } catch (err) {
      toast.error("Could not remove song");
    }
  };

  const deletePlaylist = async () => {
    if (!window.confirm("Delete this playlist permanently?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:9000/playlist/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Playlist deleted");
      navigate("/");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredRecs = recommendedSongs.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchsong.toLowerCase()) || 
    s.artist.toLowerCase().includes(searchsong.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-blue-500">Loading...</div>;
  if (!playlist) return <div className="text-white text-center mt-20">Playlist not found.</div>;

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans pb-32">
      <Toaster position="bottom-right" />

      {/* --- DYNAMIC HEADER --- */}
      <div className="relative h-[40vh] md:h-[50vh] flex items-end px-6 md:px-12 pb-8 overflow-hidden">
        {/* Background Blur Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-30"
          style={{ backgroundImage: `url(${playlist.cover_image || PLACEHOLDER})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/40 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-8 w-full max-w-7xl mx-auto">
          <img
            src={playlist.cover_image || PLACEHOLDER}
            alt={playlist.name} 
            className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          />
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Playlist</p>
            <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter">{playlist.name}</h1>
            <p className="text-gray-400 font-medium max-w-xl line-clamp-2">{playlist.description}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8">
              <button 
                onClick={() => { fetchRecommendedSongs(); setShowAddSongModal(true); }}
                className="bg-blue-500 hover:bg-blue-400 text-black px-8 py-3 rounded-full font-bold transition-transform hover:scale-105 active:scale-95"
              >
                Add Songs
              </button>
              <button 
                onClick={deletePlaylist}
                className="bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-white px-6 py-3 rounded-full font-bold transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- TRACKLIST --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8">
        {/* Search Input */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            <input 
              type="text" 
              placeholder="Search songs in playlist..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:bg-white/10 focus:border-blue-500 outline-none transition-all"
              value={searchsong}
              onChange={(e) => setSearchsong(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 px-4 py-2 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-white/5 mb-4">
          <div className="col-span-1">#</div>
          <div className="col-span-7 md:col-span-6">Title</div>
          <div className="hidden md:block col-span-4">Artist</div>
          <div className="col-span-4 md:col-span-1 text-right pr-4">Action</div>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <p className="text-gray-400 italic">This playlist is empty. Start adding some tracks!</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <p className="text-gray-400 italic">No songs match your search.</p>
          </div>
        ) : (
          filteredSongs.map((song, idx) => (
            <div 
              key={song.song_id} 
              className="grid grid-cols-12 items-center px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <div className="col-span-1 text-gray-500 font-medium">{idx + 1}</div>
              <div className="col-span-7 md:col-span-6 flex items-center gap-4">
                <img src={song.image_url || PLACEHOLDER} className="w-10 h-10 rounded object-cover shadow-lg" alt="" />
                <div className="truncate">
                  <p className="font-semibold text-white group-hover:text-blue-400 cursor-pointer transition-colors" onClick={() => navigate(`/playsong/${song.song_id}?playlist=${id}`)}>{song.title}</p>
                  <p className="text-xs text-gray-500 md:hidden">{song.artist}</p>
                </div>
              </div>
              <div className="hidden md:block col-span-4 text-gray-400 text-sm">{song.artist}</div>
              <div className="col-span-4 md:col-span-1 text-right">
                <button 
                  onClick={() => removeSong(song.song_id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-900 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- MODERN ADD SONG MODAL --- */}
      <Modal
        isOpen={showAddSongModal}
        onRequestClose={() => setShowAddSongModal(false)}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4 outline-none"
        overlayClassName="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
      >
        <div className="bg-[#18181b] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-6 border-b border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl  font-heading2 text-blue-500">Add Music</h2>
              <button onClick={() => setShowAddSongModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
              <input 
                type="text" 
                placeholder="Search songs or artists..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:bg-white/10 focus:border-emerald-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {recLoading ? (
              <div className="py-20 text-center animate-pulse text-blue-500 font-bold">Scouring the library...</div>
            ) : filteredRecs.length === 0 ? (
              <div className="py-20 text-center text-gray-500">No tracks found.</div>
            ) : (
              filteredRecs.map((song) => (
                <div key={song.song_id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 group transition-all">
                  <div className="flex items-center gap-4">
                    <img src={song.image_url || PLACEHOLDER} className="w-12 h-12 rounded-lg object-cover" alt="" />
                    <div>
                      <p className="font-bold text-sm leading-tight text-blue-500">{song.title}</p>
                      <p className="text-xs text-gray-400 tracking-wide uppercase mt-1">{song.artist}</p>
                    </div>
                  </div>
                  <button
                    disabled={addSongLoading}
                    onClick={() => handleAddSong(song)}
                    className="bg-white text-black hover:bg-emerald-500 hover:text-white px-6 py-2 rounded-full text-xs font-black uppercase transition-all"
                  >
                    Add
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-black/20 text-center">
            <button 
              onClick={() => setShowAddSongModal(false)}
              className="text-xs font-bold text-gray-500 hover:text-white tracking-widest uppercase"
            >
              Finish Selection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Playlist;


