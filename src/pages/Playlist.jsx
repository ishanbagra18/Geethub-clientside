import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

const PLACEHOLDER = "https://via.placeholder.com/220?text=No+Image";

const Playlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH PLAYLIST + SONGS =================
  useEffect(() => {
    const fetchPlaylistAndSongs = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const playlistRes = await axios.get(
          `http://localhost:9000/playlist/${id}`,
          config
        );

        const pl = playlistRes.data.playlist;
        setPlaylist(pl);

        if (pl?.song_ids?.length) {
          const songResponses = await Promise.all(
            pl.song_ids.map((sid) =>
              axios.get(`http://localhost:9000/song/${sid}`, config)
            )
          );
          setSongs(songResponses.map((r) => r.data.song));
        } else {
          setSongs([]);
        }
      } catch (err) {
        console.error("Playlist fetch error:", err);
        setPlaylist(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistAndSongs();
  }, [id]);

  // ================= REMOVE SONG =================
  const removeSongFromPlaylist = async (songId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(
        `http://localhost:9000/playlist/${id}/remove-song`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { song_id: songId },
        }
      );

      setSongs((prev) => prev.filter((s) => s.song_id !== songId));
    } catch (err) {
      console.error("Remove song error:", err.response || err);
      alert("Could not remove song");
    }
  };











  // ================= DELETE PLAYLIST =================
const deletePlaylist = async () => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this playlist?"
  );
  if (!confirmDelete) return;

  const token = localStorage.getItem("token");
  const toastId = toast.loading("Deleting playlist...");

  try {
    await axios.delete(
      `http://localhost:9000/playlist/delete/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Playlist deleted successfully 🎉", { id: toastId });
    navigate(-1);
  } catch (err) {
    toast.error("Failed to delete playlist ❌", { id: toastId });
  }
};



  // ================= UI STATES =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050507] text-white">
        <div className="animate-pulse text-lg">Loading playlist...</div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050507] text-white">
        <h2 className="text-3xl font-bold text-red-400">Playlist not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-emerald-400 underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  // ================= MAIN UI =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050507] via-[#0b0f1a] to-[#0a0d14] text-white">
      <div className="px-6 md:px-14 py-12 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          <img
            src={playlist.cover_image || PLACEHOLDER}
            onError={(e) => (e.target.src = PLACEHOLDER)}
            alt={playlist.name}
            className="w-36 h-36 rounded-2xl object-cover shadow-xl"
          />

          <div className="flex-1">
            <p className="uppercase text-xs tracking-widest text-emerald-400 mb-2">
              {playlist.type === "system"
                ? "Featured Playlist"
                : "Your Playlist"}
            </p>

            <h1 className="text-4xl md:text-6xl font-extrabold">
              {playlist.name}
            </h1>

            <p className="text-gray-400 mt-4 max-w-2xl">
              {playlist.description || "No description available"}
            </p>

            <div className="flex items-center gap-4 mt-6 text-sm text-gray-400">
              <span className="text-emerald-400 font-semibold">
                {songs.length} Tracks
              </span>
              • <span>Created by you</span>
            </div>

            {/* DELETE PLAYLIST BUTTON */}
            <button
              onClick={deletePlaylist}
              className="mt-6 px-5 py-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition"
            >
              🗑️ Delete Playlist
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-14 pb-20 max-w-7xl mx-auto">
        {songs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No songs added yet 🎵
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {songs.map((song, index) => (
              <SongCard
                key={song.song_id || index}
                song={song}
                onPlay={() => navigate(`/playsong/${song.song_id}`)}
                onRemove={() => removeSongFromPlaylist(song.song_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ================= SONG CARD =================
const SongCard = ({ song, onPlay, onRemove }) => {
  return (
    <div
      onClick={onPlay}
      className="group cursor-pointer rounded-2xl p-5 bg-[#111827] border border-white/5 hover:scale-[1.02] transition"
    >
      <div className="relative rounded-xl overflow-hidden h-44 mb-4">
        <img
          src={song.image_url || PLACEHOLDER}
          alt={song.title}
          className="w-full h-full object-cover"
        />
      </div>

      <h3 className="font-semibold truncate">{song.title}</h3>
      <p className="text-xs text-gray-400 truncate">{song.artist}</p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-xs">
        <span className="text-pink-400">
          ❤️ {Array.isArray(song.likes) ? song.likes.length : 0}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-red-400 hover:text-red-500"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default Playlist;
