import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import SongPlayer from "../../Components/SongPlayer";
import { useMusicPlayer } from "../context/MusicPlayerContext";

const PlaySong = () => {
  const { id } = useParams();
  const { playSong, currentSong } = useMusicPlayer();

  useEffect(() => {
    // If the song in URL is different from current playing song, load it
    if (!currentSong || currentSong.song_id !== id) {
      playSong(id);
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      <Navbar />
      <SongPlayer key={id} songId={id} />
    </div>
  );
};

export default PlaySong;
