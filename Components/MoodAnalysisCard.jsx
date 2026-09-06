import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, RefreshCw, Music2, Brain, Compass, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API_BASE_URL from '../src/config/api';

const MoodAnalysisCard = ({ onVibeSelect }) => {
  const [moodData, setMoodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMoodAnalysis = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/ai/mood`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMoodData(response.data);
      if (isRefresh) {
        toast.success("AI Mood analysis updated!");
      }
    } catch (error) {
      console.error('Error fetching AI mood analysis:', error);
      if (isRefresh) {
        toast.error("Could not refresh mood analysis");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMoodAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-2xl flex items-center justify-center min-h-[160px]">
        <div className="flex items-center gap-3 text-purple-300">
          <Loader2 className="animate-spin" size={24} />
          <span className="font-semibold text-sm">Hugging Face AI analyzing listening history...</span>
        </div>
      </div>
    );
  }

  if (!moodData) return null;

  // Dynamic theme gradients based on mood vibe
  const getThemeGradient = (moodStr) => {
    const m = (moodStr || '').toLowerCase();
    if (m.includes('party') || m.includes('energy') || m.includes('hype')) {
      return 'from-amber-600/30 via-rose-600/30 to-purple-900/40 border-amber-500/40';
    }
    if (m.includes('chill') || m.includes('focus') || m.includes('relax')) {
      return 'from-cyan-600/30 via-emerald-600/30 to-blue-900/40 border-cyan-500/40';
    }
    return 'from-purple-900/50 via-indigo-900/50 to-blue-950/60 border-purple-500/30';
  };

  return (
    <div className={`w-full bg-gradient-to-r ${getThemeGradient(moodData.mood)} backdrop-blur-2xl border rounded-3xl p-6 shadow-2xl relative overflow-hidden transition-all duration-500 hover:shadow-purple-500/10`}>
      {/* Decorative background glow */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-2xl text-white shadow-lg shadow-purple-500/30">
              <Brain size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                  <Sparkles size={13} className="text-amber-400" /> Hugging Face AI Mood Analysis
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2 mt-0.5">
                <span>{moodData.emoji}</span>
                <span className="bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                  {moodData.mood}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold flex items-center gap-1 shadow-sm">
              <span>Match</span>
              <span className="text-amber-300 font-extrabold">{moodData.confidence || 90}%</span>
            </div>

            <button
              onClick={() => fetchMoodAnalysis(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 border border-white/10 flex items-center gap-2 text-xs font-bold disabled:opacity-50"
              title="Refresh Hugging Face AI Analysis"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* AI Insight Summary */}
        <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-5 font-normal">
          {moodData.summary}
        </p>

        {/* Recommended Vibe Tags */}
        {moodData.recommended_vibes && moodData.recommended_vibes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-1 mr-1">
              <Compass size={14} className="text-purple-400" /> Recommended Vibe Tags:
            </span>
            {moodData.recommended_vibes.map((vibe, idx) => (
              <button
                key={idx}
                onClick={() => onVibeSelect && onVibeSelect(vibe)}
                className="px-3 py-1.5 rounded-full bg-purple-500/15 hover:bg-purple-500/30 border border-purple-400/30 text-purple-200 hover:text-white text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm group"
              >
                <Music2 size={12} className="text-purple-400 group-hover:scale-110 transition-transform" />
                {vibe}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodAnalysisCard;
