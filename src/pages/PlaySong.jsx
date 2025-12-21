import React from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../Components/Navbar";
import SongPlayer from "../../Components/SongPlayer";

const PlaySong = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
        <SongPlayer key={id} songId={id} />
    </div>
  );
};

export default PlaySong;
