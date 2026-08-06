/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Award, Lock, Loader2, Sparkles, CheckCircle2, Headphones, Music, FolderHeart, Calendar, Compass } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../src/config/api";

const UserBadges = () => {
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBadge, setActiveBadge] = useState(null);

  useEffect(() => {
    const fetchBadges = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/badges/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const badgeList = res.data.badges || [];
        setBadges(badgeList);
        setStats(res.data.stats || null);
        // Default select the first unlocked badge or first badge
        const firstUnlocked = badgeList.find((b) => b.earned) || badgeList[0];
        if (firstUnlocked) setActiveBadge(firstUnlocked);
      } catch (err) {
        console.error("Failed to fetch badges:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 mb-8 flex items-center justify-center py-10 gap-3">
        <Loader2 size={20} className="animate-spin text-amber-400" />
        <span className="text-zinc-400 text-sm font-medium tracking-wide">Syncing Achievements & Badges...</span>
      </div>
    );
  }

  if (!badges.length) return null;

  const earnedCount = badges.filter((b) => b.earned).length;
  const progressPct = Math.round((earnedCount / badges.length) * 100);

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-6 md:p-8 mb-8 hover:border-amber-500/30 transition-all duration-300 shadow-2xl relative overflow-hidden group">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Award size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black tracking-tight text-white">User Achievements</h3>
              <Sparkles size={16} className="text-amber-400 animate-pulse" />
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              {earnedCount} of {badges.length} badges unlocked
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-3 sm:min-w-[200px]">
          <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden p-0.5 border border-zinc-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-black text-amber-400 font-mono">{progressPct}%</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
        {badges.map((badge) => {
          const isEarned = badge.earned;
          const isSelected = activeBadge?.id === badge.id;

          return (
            <button
              key={badge.id}
              onClick={() => setActiveBadge(badge)}
              onMouseEnter={() => setActiveBadge(badge)}
              className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border text-left transition-all duration-300 ${
                isSelected
                  ? "bg-zinc-800/80 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-[1.03]"
                  : isEarned
                  ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 hover:scale-[1.01]"
                  : "bg-zinc-950/40 border-zinc-800/40 opacity-40 hover:opacity-60"
              }`}
            >
              {/* Badge Icon Disc */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2 transition-all duration-300 relative"
                style={{
                  background: isEarned
                    ? `radial-gradient(circle at center, ${badge.color}30 0%, ${badge.color}10 100%)`
                    : "rgba(255,255,255,0.03)",
                  border: isEarned ? `1px solid ${badge.color}40` : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {isEarned ? (
                  <span>{badge.icon}</span>
                ) : (
                  <Lock size={16} className="text-zinc-500" />
                )}
              </div>

              {/* Title */}
              <span
                className={`text-xs font-bold text-center truncate w-full ${
                  isSelected
                    ? "text-amber-400"
                    : isEarned
                    ? "text-zinc-200"
                    : "text-zinc-500"
                }`}
              >
                {badge.name}
              </span>

              {/* Status indicator */}
              <div className="mt-2">
                {isEarned ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 size={10} /> Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 font-semibold">
                    Locked
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Badge Active Detail Banner */}
      {activeBadge && (
        <div
          className="p-4 rounded-2xl border transition-all duration-500 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4"
          style={{
            background: `linear-gradient(135deg, ${activeBadge.color}15 0%, rgba(24, 24, 27, 0.6) 100%)`,
            borderColor: `${activeBadge.color}40`,
          }}
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${activeBadge.color}40, ${activeBadge.color}20)`,
                border: `1px solid ${activeBadge.color}60`,
              }}
            >
              {activeBadge.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h4 className="text-base font-extrabold text-white">{activeBadge.name}</h4>
                {activeBadge.earned ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                    UNLOCKED BADGE
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                    IN PROGRESS
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-300 font-medium mt-1">
                {activeBadge.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Quick Strip */}
      {stats && (
        <div className="mt-6 pt-4 border-t border-zinc-800/40 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2 bg-zinc-800/40 px-3 py-1.5 rounded-xl border border-zinc-700/40">
            <Headphones size={14} className="text-indigo-400" />
            <span><strong className="text-white">{stats.total_minutes}</strong> mins listened</span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-800/40 px-3 py-1.5 rounded-xl border border-zinc-700/40">
            <Music size={14} className="text-cyan-400" />
            <span><strong className="text-white">{stats.unique_songs}</strong> tracks explored</span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-800/40 px-3 py-1.5 rounded-xl border border-zinc-700/40">
            <FolderHeart size={14} className="text-violet-400" />
            <span><strong className="text-white">{stats.playlists}</strong> playlists</span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-800/40 px-3 py-1.5 rounded-xl border border-zinc-700/40">
            <Calendar size={14} className="text-pink-400" />
            <span><strong className="text-white">{stats.account_days}</strong> days active</span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-800/40 px-3 py-1.5 rounded-xl border border-zinc-700/40">
            <Compass size={14} className="text-emerald-400" />
            <span><strong className="text-white">{stats.uploads}</strong> uploads</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBadges;
