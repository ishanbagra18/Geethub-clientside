import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParty } from "../context/PartyContext";
import Navbar from "../../Components/Navbar";
import { Sparkles, Play, Users, PlusCircle, LogIn } from "lucide-react";
import toast from "react-hot-toast";

const PartyLobby = () => {
  const navigate = useNavigate();
  const { createRoom, joinRoom } = useParty();
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const code = await createRoom();
    setLoading(false);
    if (code) {
      navigate(`/party/${code}`);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) {
      toast.error("Please enter a room code");
      return;
    }

    setLoading(true);
    const success = await joinRoom(roomCodeInput.toUpperCase().trim());
    setLoading(false);
    
    if (success) {
      navigate(`/party/${roomCodeInput.toUpperCase().trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-black to-[#0f172a] text-white flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          
          {/* Left Column: Greeting and Info */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
                <Users size={22} />
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                Live Listening Party
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Listen with friends. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Synced in Real-time.
              </span>
            </h1>

            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md">
              Create a synced party room. Invite your friends, play your favorite tracks, and chat live while everyone listens to the exact same beat at the same second.
            </p>

            <div className="space-y-4 pt-2">
              {[
                "Host controls: Play, Pause, Seek, and Queue updates.",
                "Members' global players stay perfectly in sync automatically.",
                "Real-time text chat to vibe together in real-time."
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[10px] text-cyan-400 font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-semibold text-gray-300">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Join/Create Lobby Panel */}
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-8">
            
            {/* Create Room Box */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <PlusCircle size={20} className="text-cyan-400" />
                Start a New Party
              </h2>
              <p className="text-xs text-gray-400">
                Generate a unique room code. You'll be designated as the host and control music playback for all members who join.
              </p>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold tracking-wider text-sm shadow-xl shadow-cyan-500/20 hover:scale-[1.02] transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "CREATING ROOM..." : (
                  <>
                    <Play size={16} fill="white" />
                    CREATE PARTY ROOM
                  </>
                )}
              </button>
            </div>

            {/* Separator */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-gray-500 uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            {/* Join Room Box */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <LogIn size={20} className="text-purple-400" />
                Join an Existing Party
              </h2>
              <p className="text-xs text-gray-400">
                Enter the room code shared by your friend to sync your player and join the room chat.
              </p>
              
              <form onSubmit={handleJoin} className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g. GH-2819"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value)}
                  disabled={loading}
                  className="flex-1 px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 placeholder-gray-500 text-center font-bold text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500/50 uppercase text-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 font-bold text-xs uppercase tracking-wider hover:text-cyan-300 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  Join
                </button>
              </form>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default PartyLobby;
