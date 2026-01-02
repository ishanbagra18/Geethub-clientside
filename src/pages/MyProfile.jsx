import React, { useEffect, useState } from "react";
import axios from "axios";
import { Music, Edit2, Play, Mail, Phone, Fingerprint, Lock, Settings,Book  } from "lucide-react";

const getUidFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.Uid;
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
};

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = getUidFromToken();
        if (!userId) return setLoading(false);
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:9000/auth/myprofile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-gray-400 animate-pulse font-medium tracking-widest uppercase text-xs">Syncing Database</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <p className="text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20 font-semibold">Failed to load profile</p>
    </div>
  );

  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-blue-500/30 font-sans antialiased overflow-hidden">
      
      {/* Background Ambient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 lg:py-20">
        
        {/* Profile Header Section */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
          {/* Avatar Disc */}
          <div className="relative group">
            <div className="w-48 h-48 rounded-full bg-zinc-900 flex items-center justify-center text-6xl font-black text-blue-500 shadow-2xl border border-zinc-800 relative overflow-hidden transition-transform duration-500 hover:scale-105">
              <span className="z-10 relative drop-shadow-2xl">{initials}</span>
              {/* Spinning Vinyl Effect */}
              <div className="absolute inset-0 border-[1px] border-white/5 rounded-full animate-[spin_10s_linear_infinite]" 
                   style={{ backgroundImage: 'repeating-radial-gradient(circle, transparent 0, transparent 5px, rgba(255,255,255,0.03) 6px)' }} />
            </div>
            {/* Animated Equalizer Overlay */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-1 px-3 py-2 bg-black/80 backdrop-blur-md rounded-full border border-zinc-700/50">
                {[0.6, 1.2, 0.9, 1.5, 0.7].map((h, i) => (
                    <div key={i} className="w-1 bg-blue-500 rounded-full animate-bounce" style={{ height: `${h}rem`, animationDelay: `${i * 0.1}s` }} />
                ))}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-zinc-500 uppercase tracking-[0.3em] text-xs font-bold mb-2">Verified Listener</h2>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              {user?.first_name?user.first_name.charAt(0).toUpperCase() + user.first_name.slice(1) : ""}

               {user.last_name?" " + user.last_name.charAt(0).toUpperCase() + user.last_name.slice(1) : ""}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <button className="flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-400 text-black font-bold rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Play fill="currentColor" size={18} /> Play Mix
              </button>






              <button 
                onClick={() => (window.location.href = "/updateprofile")}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-800/50 hover:bg-zinc-800 text-white font-semibold rounded-full border border-zinc-700/50 transition-all"
              >
                <Edit2 size={16} /> Edit Profile
              </button>







               <button 
                onClick={() => (window.location.href = "/mylibrary")}
                className="flex items-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-400 text-black font-bold rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <Book  size={16} /> My Library
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card: Account Details */}
          <div className="md:col-span-2 bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 hover:border-blue-500/30 transition-colors group">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Settings size={20} className="text-blue-500" /> Account Overview
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between group/item">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-zinc-800 text-zinc-400 group-hover/item:text-blue-400 transition-colors">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Email Address</p>
                    <p className="text-zinc-200 font-medium">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between group/item">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-zinc-800 text-zinc-400 group-hover/item:text-blue-400 transition-colors">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Phone Number</p>
                    <p className="text-zinc-200 font-medium">{user.phone || "Not linked"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between group/item">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-zinc-800 text-zinc-400 group-hover/item:text-emerald-400 transition-colors">
                    <Fingerprint size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">User ID</p>
                    <p className="text-zinc-500 text-sm font-mono truncate max-w-[200px] md:max-w-xs">{user.user_id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Quick Actions */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-4">Security</h3>
              <p className="text-zinc-500 text-sm mb-6">Keep your account secure by updating your credentials regularly.</p>
              
              <button 
                onClick={() => (window.location.href = "/forgotpassword")}
                className="w-full flex items-center justify-center gap-3 p-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-2xl transition-all font-bold"
              >
                <Lock size={18} /> Reset Password
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-800/50">
              <div className="flex items-center gap-3 text-zinc-500">
                <Music size={18} className="animate-pulse" />
                <span className="text-xs font-medium uppercase tracking-tighter">Powered by AudioStream v2.0</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.2); }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
          transform-origin: bottom;
        }
      `}</style>
    </div>
  );
}