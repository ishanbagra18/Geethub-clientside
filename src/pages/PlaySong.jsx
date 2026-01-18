import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../../Components/Navbar";
import SongPlayer from "../../Components/SongPlayer";
import { useMusicPlayer } from "../context/MusicPlayerContext";
import API_BASE_URL from '../config/api';

const PlaySong = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const playlistId = searchParams.get("playlist");
  const { playSong, currentSong } = useMusicPlayer();
  const [playlistQueue, setPlaylistQueue] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPlaylistQueue = async () => {
      if (!playlistId) {
        // Not from a playlist, play normally
        if (!currentSong || currentSong.song_id !== id) {
          playSong(id);
        }
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Fetch the playlist
        const res = await axios.get(`${API_BASE_URL}/playlist/${playlistId}`, config);
        const playlist = res.data.playlist;

        if (playlist?.song_ids?.length) {
          // Fetch all songs in the playlist
          const songResponses = await Promise.all(
            playlist.song_ids.map((sid) => axios.get(`${API_BASE_URL}/song/${sid}`, config))
          );
          const playlistSongs = songResponses.map((r) => r.data.song);
          
          setPlaylistQueue(playlistSongs);
          
          // Play the song with the playlist queue
          if (!currentSong || currentSong.song_id !== id) {
            playSong(id, playlistSongs, "playlist", playlistId);
          }
        }
      } catch (err) {
        console.error("Error loading playlist queue:", err);
        // Fallback to normal play
        if (!currentSong || currentSong.song_id !== id) {
          playSong(id);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPlaylistQueue();
  }, [id, playlistId, currentSong, playSong]);

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <Navbar />
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center text-blue-500">
          Loading playlist...
        </div>
      ) : (
        <SongPlayer 
          key={id} 
          songId={id} 
          mode="playlist"
          contextId={playlistId}
          initialQueue={playlistQueue}
        />
      )}
    </div>
  );
};

export default PlaySong;
