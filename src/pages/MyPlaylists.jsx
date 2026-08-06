import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";
import { 
  PlayCircle, ListMusic, Plus, Trash2, Globe, Lock, 
  Tag, Upload, X, Music, Sparkles, Search, LayoutGrid, 
  List, Bookmark, BookmarkCheck, ArrowUpDown, Layers,
  Users, Eye, TrendingUp
} from "lucide-react";
import Navbar from "../../Components/Navbar";
import API_BASE_URL from "../config/api";
import { useMusicPlayer } from "../context/MusicPlayerContext";

Modal.setAppElement("#root");

const MyPlaylists = () => {
  const navigate = useNavigate();
  const { playSong } = useMusicPlayer();

  const [allUserPlaylists, setAllUserPlaylists] = useState([]);
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [communityPlaylists, setCommunityPlaylists] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [activeTab, setActiveTab] = useState("my"); // "my", "saved", "public", "private", "community"
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);

  // Modal State for New Playlist
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [allSongs, setAllSongs] = useState([]);
  const [songSearch, setSongSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    tags: "",
    is_public: true,
    cover_image: null,
    song_ids: [],
  });

  // Decode User ID from JWT Token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const uid = payload.Uid || payload.uid || payload.id;
        setCurrentUserId(uid);
      } catch (e) {
        console.error("Token decode error:", e);
      }
    }
  }, []);

  // Fetch All Playlists
  const fetchPlaylists = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      if (token) {
        // 1. Fetch user's playlists (created & saved)
        const myRes = await axios.get(`${API_BASE_URL}/playlist/myplaylists`, { headers }).catch(() => null);
        const myData = myRes?.data?.playlists || myRes?.data || [];
        setAllUserPlaylists(myData);

        // 2. Fetch explicitly saved playlists
        const savedRes = await axios.get(`${API_BASE_URL}/playlist/savedplaylists`, { headers }).catch(() => null);
        let savedData = savedRes?.data?.playlists || savedRes?.data || [];
        
        // Fallback: If savedplaylists array empty, filter from myData where saved_by includes user
        if (!savedData || savedData.length === 0) {
          const uid = currentUserId;
          if (uid) {
            savedData = myData.filter((p) => p.saved_by && p.saved_by.includes(uid));
          }
        }
        setSavedPlaylists(savedData);
      }

      // 3. Fetch community playlists
      const commRes = await axios.get(`${API_BASE_URL}/playlists`).catch(() => null);
      setCommunityPlaylists(commRes?.data?.playlists || commRes?.data || []);
    } catch (err) {
      console.error("Error fetching playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [currentUserId]);

  // Separate created playlists from all
  const myCreatedPlaylists = useMemo(() => {
    if (!currentUserId) return allUserPlaylists;
    return allUserPlaylists.filter((p) => p.creator_id === currentUserId || !p.creator_id);
  }, [allUserPlaylists, currentUserId]);

  // Analytics Metrics
  const totalCreatedCount = myCreatedPlaylists.length;
  
  // Total times user's playlists were saved by OTHER users
  const totalSavedByOthersCount = useMemo(() => {
    return myCreatedPlaylists.reduce((sum, p) => {
      const savedArr = p.saved_by || [];
      // Filter out user's own save if any
      const othersSaves = currentUserId ? savedArr.filter((uid) => uid !== currentUserId) : savedArr;
      return sum + othersSaves.length;
    }, 0);
  }, [myCreatedPlaylists, currentUserId]);

  // Total tracks across user playlists
  const totalSongsInPlaylists = useMemo(() => {
    return myCreatedPlaylists.reduce((sum, p) => sum + (p.song_ids?.length || 0), 0);
  }, [myCreatedPlaylists]);

  // Total plays across user playlists
  const totalPlayCount = useMemo(() => {
    return myCreatedPlaylists.reduce((sum, p) => sum + (p.play_count || 0), 0);
  }, [myCreatedPlaylists]);

  const publicCount = myCreatedPlaylists.filter((p) => p.is_public).length;
  const privateCount = myCreatedPlaylists.filter((p) => !p.is_public).length;

  // Toggle Save Playlist
  const handleToggleSavePlaylist = async (e, playlistId) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to save playlists");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/playlist/${playlistId}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPlaylists();
    } catch (err) {
      console.error("Error saving playlist:", err);
    }
  };

  // Open Create Modal
  const openModal = async (initialName = "") => {
    setShowModal(true);
    setModalError("");
    setSongSearch("");
    if (initialName) {
      setForm((prev) => ({ ...prev, name: initialName }));
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/music/allsongs`);
      setAllSongs(res.data.songs || []);
    } catch (err) {
      setModalError("Failed to load songs");
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSongToggle = (songId) => {
    setForm((prev) => ({
      ...prev,
      song_ids: prev.song_ids.includes(songId)
        ? prev.song_ids.filter((id) => id !== songId)
        : [...prev.song_ids, songId],
    }));
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setModalError("Please login to create a playlist");
        setModalLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("is_public", form.is_public);
      formData.append("type", "user");

      const tagsArray = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      formData.append("tags", JSON.stringify(tagsArray));

      form.song_ids.forEach((id) => formData.append("song_ids", id));

      if (form.cover_image) {
        formData.append("cover_image", form.cover_image);
      }

      await axios.post(`${API_BASE_URL}/playlist/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setShowModal(false);
      setForm({ name: "", description: "", tags: "", is_public: true, cover_image: null, song_ids: [] });
      fetchPlaylists();
    } catch (err) {
      setModalError(err.response?.data?.error || "Failed to create playlist");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeletePlaylist = async (e, playlistId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this playlist?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/playlist/delete/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlaylists();
    } catch (err) {
      alert("Failed to delete playlist");
    }
  };

  const handlePlayPlaylist = async (e, playlist) => {
    e.stopPropagation();
    try {
      const res = await axios.get(`${API_BASE_URL}/playlist/${playlist.id}`);
      const songs = res.data.songs || [];
      if (songs.length > 0) {
        playSong(songs[0].song_id, songs);
      } else {
        alert("This playlist has no songs yet.");
      }
    } catch (err) {
      console.error("Error playing playlist:", err);
    }
  };

  // Filter & Sort Logic
  const filteredPlaylists = useMemo(() => {
    let source = [];
    if (activeTab === "saved") {
      source = savedPlaylists;
    } else if (activeTab === "community") {
      source = communityPlaylists;
    } else if (activeTab === "public") {
      source = myCreatedPlaylists.filter((p) => p.is_public);
    } else if (activeTab === "private") {
      source = myCreatedPlaylists.filter((p) => !p.is_public);
    } else {
      source = myCreatedPlaylists;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      source = source.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    const sorted = [...source];
    if (sortBy === "name") {
      sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "songs") {
      sorted.sort((a, b) => (b.song_ids?.length || 0) - (a.song_ids?.length || 0));
    }

    return sorted;
  }, [myCreatedPlaylists, savedPlaylists, communityPlaylists, activeTab, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#050811] text-white pb-32">
      <Navbar />

      {/* Hero Header Section */}
      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Creator Dashboard & Analytics Banner */}
        <div className="relative z-10 bg-gradient-to-br from-blue-900/40 via-slate-900/60 to-indigo-950/50 p-6 sm:p-10 rounded-3xl border border-blue-500/30 shadow-2xl backdrop-blur-xl mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 flex-shrink-0">
                <ListMusic size={46} className="text-white" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-extrabold uppercase tracking-wider border border-blue-400/40">
                    Creator Analytics & Vault
                  </span>
                  <Sparkles size={18} className="text-cyan-400" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  My Playlists Dashboard
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  Detailed stats & overview of all playlists created by you & saved by others
                </p>
              </div>
            </div>

            {/* Header Action Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm transition shadow-xl shadow-blue-500/30 hover:scale-105"
              >
                <Plus size={20} />
                <span>+ Create New Playlist</span>
              </button>
            </div>
          </div>

          {/* 📊 Comprehensive Analytics Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mt-8 pt-6 border-t border-white/10 text-center sm:text-left">
            {/* Metric 1: Playlists Made */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase mb-1">
                <ListMusic size={14} className="text-blue-400" />
                <span>Playlists Made</span>
              </div>
              <p className="text-3xl font-black text-white">{totalCreatedCount}</p>
              <p className="text-[10px] text-gray-400 mt-1">Created by you</p>
            </div>

            {/* Metric 2: Saved by Other Users */}
            <div className="bg-white/5 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase mb-1">
                <Users size={14} />
                <span>Saved by Others</span>
              </div>
              <p className="text-3xl font-black text-amber-400">{totalSavedByOthersCount}</p>
              <p className="text-[10px] text-amber-300/80 mt-1">Other users saved your mix</p>
            </div>

            {/* Metric 3: Total Queued Tracks */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase mb-1">
                <Music size={14} />
                <span>Total Tracks</span>
              </div>
              <p className="text-3xl font-black text-cyan-400">{totalSongsInPlaylists}</p>
              <p className="text-[10px] text-gray-400 mt-1">Across your playlists</p>
            </div>

            {/* Metric 4: Total Plays */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase mb-1">
                <TrendingUp size={14} />
                <span>Total Plays</span>
              </div>
              <p className="text-3xl font-black text-emerald-400">{totalPlayCount}</p>
              <p className="text-[10px] text-gray-400 mt-1">Listens received</p>
            </div>

            {/* Metric 5: Public vs Private */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold uppercase mb-1">
                <Eye size={14} />
                <span>Public / Private</span>
              </div>
              <p className="text-3xl font-black text-indigo-300">
                {publicCount} <span className="text-xs text-gray-400 font-normal">/ {privateCount}</span>
              </p>
              <p className="text-[10px] text-gray-400 mt-1">{publicCount} public, {privateCount} private</p>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters, Sort, View Mode */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-[#0a0f1d]/90 p-4 rounded-2xl border border-white/10 shadow-lg">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: "my", label: `My Created (${totalCreatedCount})` },
              { id: "saved", label: `🔖 Saved Playlists (${savedPlaylists.length})`, highlight: true },
              { id: "public", label: `Public (${publicCount})` },
              { id: "private", label: `Private (${privateCount})` },
              { id: "community", label: `Community (${communityPlaylists.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                  activeTab === tab.id
                    ? tab.highlight
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black border-amber-400 shadow-lg shadow-amber-500/30"
                      : "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20"
                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search, Sort & View Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search playlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-400 outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1.5 rounded-xl text-xs font-medium text-gray-300">
              <ArrowUpDown size={14} className="text-blue-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none cursor-pointer text-white font-bold"
              >
                <option value="recent" className="bg-gray-900 text-white">Recent</option>
                <option value="name" className="bg-gray-900 text-white">Name</option>
                <option value="songs" className="bg-gray-900 text-white">Most Songs</option>
              </select>
            </div>

            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Section Label */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            {activeTab === "saved" ? (
              <>
                <Bookmark className="text-amber-400 fill-amber-400" size={22} />
                <span>Saved & Bookmarked Playlists</span>
              </>
            ) : activeTab === "community" ? (
              <>
                <Globe className="text-blue-400" size={22} />
                <span>Featured Community Playlists</span>
              </>
            ) : (
              <>
                <ListMusic className="text-cyan-400" size={22} />
                <span>Playlists Created By You</span>
              </>
            )}
          </h2>
          <span className="text-xs text-gray-400 font-semibold">{filteredPlaylists.length} Playlists</span>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm">Loading playlist information...</p>
          </div>
        ) : filteredPlaylists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center px-4">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
              <Layers size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No playlists found</h3>
            <p className="text-gray-400 text-sm max-w-md mb-6">
              {activeTab === "saved"
                ? "You haven't saved any playlists yet. Bookmark any community playlist to find it here anytime!"
                : searchQuery
                ? `No playlist matches "${searchQuery}".`
                : "You don't have any playlists in this section yet."}
            </p>

            {activeTab === "saved" ? (
              <button
                onClick={() => setActiveTab("community")}
                className="px-6 py-3 rounded-full bg-amber-500 text-black font-extrabold text-sm hover:bg-amber-400 transition"
              >
                Browse Community Playlists to Save
              </button>
            ) : (
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => openModal("🎉 High Energy Party")}
                  className="px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold text-xs hover:bg-blue-600 hover:text-white transition"
                >
                  + Party Mix Template
                </button>
                <button
                  onClick={() => openModal("🧘 Chill Acoustic Vibes")}
                  className="px-4 py-2 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs hover:bg-cyan-600 hover:text-white transition"
                >
                  + Chill Vibes Template
                </button>
              </div>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredPlaylists.map((playlist) => {
              const isSavedByMe = savedPlaylists.some((p) => p.id === playlist.id);
              const savedByCount = playlist.saved_by ? playlist.saved_by.length : 0;

              return (
                <div
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="group relative bg-[#0e1424] hover:bg-[#172036] p-4 rounded-3xl border border-white/5 hover:border-blue-500/40 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between"
                >
                  {/* Cover Art */}
                  <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl bg-gray-800 shadow-md">
                    {playlist.cover_image ? (
                      <img
                        src={playlist.cover_image}
                        alt={playlist.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center">
                        <Music size={44} className="text-white/80" />
                      </div>
                    )}

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300">
                      <button
                        onClick={(e) => handlePlayPlaylist(e, playlist)}
                        className="p-3.5 rounded-full bg-blue-600 text-white shadow-xl hover:scale-110 transition"
                        title="Play Playlist"
                      >
                        <PlayCircle size={34} className="fill-white" />
                      </button>
                    </div>

                    {/* Privacy & Save Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <div className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                        {playlist.is_public ? (
                          <>
                            <Globe size={11} className="text-blue-400" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <Lock size={11} className="text-amber-400" />
                            <span>Private</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bookmark Save Button */}
                    <button
                      onClick={(e) => handleToggleSavePlaylist(e, playlist.id)}
                      className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition border ${
                        isSavedByMe
                          ? "bg-amber-500 text-black border-amber-400 shadow-lg"
                          : "bg-black/60 text-white border-white/10 hover:bg-black/80"
                      }`}
                      title={isSavedByMe ? "Saved Playlist" : "Save Playlist"}
                    >
                      {isSavedByMe ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                    </button>
                  </div>

                  {/* Playlist Info & Detailed Metrics */}
                  <div>
                    <h3 className="font-bold text-base text-white truncate group-hover:text-blue-400 transition">
                      {playlist.name}
                    </h3>
                    
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                      <span>{playlist.song_ids?.length || 0} tracks</span>
                      {savedByCount > 0 && (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <Users size={11} /> {savedByCount} saves
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Controls */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-semibold truncate">
                      {playlist.tags?.length ? `#${playlist.tags[0]}` : "Custom Mix"}
                    </span>
                    {activeTab !== "community" && activeTab !== "saved" && (
                      <button
                        onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition"
                        title="Delete Playlist"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Compact List View */
          <div className="space-y-3">
            {filteredPlaylists.map((playlist) => {
              const isSavedByMe = savedPlaylists.some((p) => p.id === playlist.id);
              const savedByCount = playlist.saved_by ? playlist.saved_by.length : 0;

              return (
                <div
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0e1424] hover:bg-[#172036] border border-white/5 hover:border-blue-500/30 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {playlist.cover_image ? (
                      <img
                        src={playlist.cover_image}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <Music size={24} className="text-white" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-base truncate group-hover:text-blue-400 transition">
                        {playlist.name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {playlist.description || `${playlist.song_ids?.length || 0} songs`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs text-gray-400 hidden sm:inline">
                      {playlist.song_ids?.length || 0} tracks
                    </span>

                    {savedByCount > 0 && (
                      <span className="text-xs text-amber-400 font-semibold hidden md:flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                        <Users size={12} /> {savedByCount} users saved
                      </span>
                    )}

                    <button
                      onClick={(e) => handleToggleSavePlaylist(e, playlist.id)}
                      className={`p-2 rounded-full transition border ${
                        isSavedByMe
                          ? "bg-amber-500/20 text-amber-400 border-amber-400/40"
                          : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
                      }`}
                      title={isSavedByMe ? "Saved" : "Save"}
                    >
                      <Bookmark size={16} fill={isSavedByMe ? "currentColor" : "none"} />
                    </button>

                    <button
                      onClick={(e) => handlePlayPlaylist(e, playlist)}
                      className="p-2.5 rounded-full bg-blue-600 text-white shadow hover:scale-105 transition"
                      title="Play Playlist"
                    >
                      <PlayCircle size={20} className="fill-white" />
                    </button>

                    {activeTab !== "community" && activeTab !== "saved" && (
                      <button
                        onClick={(e) => handleDeletePlaylist(e, playlist.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for Creating Playlist */}
        <Modal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-2xl bg-[#0b1020] border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl outline-none max-h-[90vh] overflow-y-auto text-white"
          overlayClassName="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999]"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              Create New Playlist
              <Sparkles size={20} className="text-cyan-400" />
            </h2>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <X size={22} />
            </button>
          </div>

          {modalError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl text-xs">
              {modalError}
            </div>
          )}

          <form onSubmit={handleCreatePlaylist} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">
                  Playlist Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="My Awesome Party Mix"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="High energy party tracks..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">
                  Tags (comma separated)
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 text-gray-500" size={16} />
                  <input
                    name="tags"
                    value={form.tags}
                    onChange={handleFormChange}
                    placeholder="Party, Bollywood, Dance"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 text-xs font-medium">
                  {form.is_public ? (
                    <Globe size={18} className="text-blue-400" />
                  ) : (
                    <Lock size={18} className="text-amber-400" />
                  )}
                  <span>{form.is_public ? "Public Playlist" : "Private Playlist"}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={form.is_public}
                    onChange={handleFormChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">
                  Cover Image
                </label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-blue-500 bg-white/5 transition overflow-hidden">
                  {form.cover_image ? (
                    <img
                      src={URL.createObjectURL(form.cover_image)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-gray-400">
                      <Upload size={24} className="text-blue-400" />
                      <span className="text-xs font-semibold">Upload Image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    name="cover_image"
                    className="hidden"
                    onChange={handleFormChange}
                    accept="image/*"
                  />
                </label>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">
                  Select Songs ({form.song_ids.length} selected)
                </label>
                <input
                  type="text"
                  value={songSearch}
                  onChange={(e) => setSongSearch(e.target.value)}
                  placeholder="Search song title..."
                  className="w-full mb-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none"
                />
                <div className="bg-white/5 rounded-xl p-2 border border-white/10 max-h-36 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-700">
                  {allSongs
                    .filter(
                      (s) =>
                        s.title.toLowerCase().includes(songSearch.toLowerCase()) ||
                        s.artist.toLowerCase().includes(songSearch.toLowerCase())
                    )
                    .map((s) => (
                      <label
                        key={s.song_id}
                        className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-lg cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={form.song_ids.includes(s.song_id)}
                          onChange={() => handleSongToggle(s.song_id)}
                          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-0"
                        />
                        <img
                          src={s.image_url || "https://via.placeholder.com/30"}
                          alt=""
                          className="w-7 h-7 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white truncate">{s.title}</p>
                          <p className="text-[10px] text-gray-400 truncate">{s.artist}</p>
                        </div>
                      </label>
                    ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={modalLoading}
              className="md:col-span-2 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-sm shadow-lg hover:scale-105 transition disabled:opacity-50"
            >
              {modalLoading ? "Creating Playlist..." : "Create Playlist"}
            </button>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default MyPlaylists;
