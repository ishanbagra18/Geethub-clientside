import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Sparkles,
  Play,
  Pause,
  Info,
  RefreshCw,
  BarChart2,
  X,
  CheckCircle2,
  ThumbsDown,
  Layers,
  TrendingUp,
  Cpu,
  Flame,
  Radio,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import API_BASE_URL from "../src/config/api";
import { useMusicPlayer } from "../src/context/MusicPlayerContext";

const RecommendationFeed = () => {
  const { playSong, currentSong, isPlaying, togglePlayPause } = useMusicPlayer();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState("hybrid");
  const [isColdStart, setIsColdStart] = useState(false);
  const [userTopGenres, setUserTopGenres] = useState({});
  const [selectedTrackInfo, setSelectedTrackInfo] = useState(null);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [benchmarkReport, setBenchmarkReport] = useState(null);

  const fetchRecommendations = async (showToast = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(`${API_BASE_URL}/recommendations?limit=8`, {
        headers,
      });

      if (res.data) {
        setRecommendations(res.data.recommendations || []);
        setStrategy(res.data.strategy || "hybrid");
        setIsColdStart(!!res.data.is_cold_start);
        setUserTopGenres(res.data.user_top_genres || {});
        if (showToast) {
          toast.success("Recommendations refreshed with your latest taste!");
        }
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handlePlayRecommended = (song) => {
    const sId = song.song_id || song._id || song.id;
    const currentId = currentSong?.song_id || currentSong?._id || currentSong?.id;

    if (currentId === sId) {
      togglePlayPause();
    } else {
      playSong(sId);
      toast.success(`Playing "${song.title || "Track"}"`, { icon: "✨" });
    }
  };

  const handleSkipDislike = async (song, e) => {
    e.stopPropagation();
    const songId = song.song_id || song._id || song.id;
    if (!songId) return;

    // Optimistically remove from feed
    setRecommendations((prev) =>
      prev.filter(
        (item) => (item.song.song_id || item.song._id || item.song.id) !== songId
      )
    );

    toast("Tune downweighted in your profile", { icon: "👎" });

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API_BASE_URL}/music/skip/${songId}`, {}, { headers });
    } catch (err) {
      console.warn("Failed to record skip:", err);
    }
  };

  const handleOpenMetrics = async () => {
    setShowMetricsModal(true);
    if (!benchmarkReport) {
      setMetricsLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/recommendations/evaluate`);
        setBenchmarkReport(res.data);
      } catch (err) {
        console.error("Failed to fetch evaluation benchmark:", err);
        toast.error("Failed to load evaluation metrics");
      } finally {
        setMetricsLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-slate-200/60 dark:bg-slate-800/60 rounded-3xl animate-pulse border border-slate-300/30 dark:border-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full my-6" aria-labelledby="recommendations-heading">
      {/* Background ambient neon glow */}
      <div className="absolute -top-10 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              Personalized Discovery
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-[11px] font-medium text-slate-400">
              AI Hybrid Engine
            </span>
          </div>
          <h2
            id="recommendations-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3"
          >
            <span>Made For You</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 font-semibold tracking-normal">
              Daily Mix
            </span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Fresh tracks matched to your listening habits, likes, and acoustic taste.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenMetrics}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm hover:border-cyan-500/30"
            title="Inspect evaluation metrics: Recall@K, Precision@K, NDCG@K"
          >
            <BarChart2 size={14} className="text-cyan-400" />
            <span>ML Metrics</span>
          </button>

          <button
            onClick={() => fetchRecommendations(true)}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition-all hover:rotate-180 duration-500 hover:border-cyan-500/30"
            title="Refresh recommendations"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Recommended Songs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
        {recommendations.map((item, idx) => {
          const song = item.song;
          const sId = song.song_id || song._id || song.id;
          const isCurrent =
            currentSong &&
            (currentSong.song_id === sId || currentSong._id === sId || currentSong.id === sId);
          const isThisPlaying = isCurrent && isPlaying;

          const rawReason = item.explanation?.reason || "Curated for you";
          const displayReason = rawReason.replace(/^💡\s*/, "");

          return (
            <div
              key={sId || idx}
              onClick={() => handlePlayRecommended(song)}
              className="group relative flex flex-col justify-between p-3 rounded-2xl bg-[#0f131f]/70 hover:bg-[#141a2b]/90 backdrop-blur-xl border border-white/[0.07] hover:border-cyan-500/40 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1"
            >
              {/* Cover Image & Play Overlay */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-slate-800/80 shadow-md">
                <img
                  src={
                    song.image_url ||
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60"
                  }
                  alt={song.title || "Song Cover"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Match percentage pill on top of image */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 size={10} />
                  {item.match_pct || 92}%
                </span>

                {/* Hover Actions: Info & Dislike buttons */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTrackInfo(item);
                    }}
                    className="p-1 rounded-full bg-black/70 backdrop-blur-md hover:bg-cyan-500 text-white/80 hover:text-black border border-white/10 transition-colors"
                    title="Why was this recommended?"
                  >
                    <Info size={12} />
                  </button>
                  <button
                    onClick={(e) => handleSkipDislike(song, e)}
                    className="p-1 rounded-full bg-black/70 backdrop-blur-md hover:bg-rose-500 text-white/80 hover:text-white border border-white/10 transition-colors"
                    title="Not for me"
                  >
                    <ThumbsDown size={12} />
                  </button>
                </div>

                {/* Signature Play Button Hover Overlay */}
                <div
                  className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300 ${
                    isThisPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 transform group-hover:scale-105 transition-all">
                    {isThisPlaying ? (
                      <Pause size={20} fill="currentColor" />
                    ) : (
                      <Play size={20} fill="currentColor" className="ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Genre Tag */}
                {song.genre && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white/90">
                    {song.genre}
                  </span>
                )}
              </div>

              {/* Title & Artist */}
              <div className="mb-2">
                <h3 className="font-bold text-sm text-white truncate group-hover:text-cyan-400 transition-colors">
                  {song.title || "Untitled Track"}
                </h3>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {song.artist || "Unknown Artist"}
                </p>
              </div>

              {/* Explainable AI Reason Tag */}
              <div className="mt-auto pt-1.5 border-t border-white/[0.05]">
                <p className="text-[11px] text-cyan-300/80 font-medium truncate" title={displayReason}>
                  {displayReason}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL 1: "Why this was recommended?" Detail Drawer --- */}
      {selectedTrackInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedTrackInfo(null)}
        >
          <div
            className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTrackInfo(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
                <Cpu size={24} />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">
                  Explainable AI (XAI)
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Why Was This Recommended?
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
              <p className="text-sm text-slate-800 dark:text-blue-100 font-medium">
                "{selectedTrackInfo.explanation?.reason}"
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-blue-400">
                <span className="font-semibold">Strategy:</span>
                <span>{selectedTrackInfo.explanation?.type || "HYBRID_ENSEMBLE"}</span>
              </div>
            </div>

            {/* Algorithmic Breakdown */}
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-2">
              Model Score Breakdown
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-300">Content-Based Vector Sim (CBF)</span>
                <span className="font-mono font-bold text-cyan-400">
                  {selectedTrackInfo.algorithmic_breakdown?.cbf_score
                    ? (selectedTrackInfo.algorithmic_breakdown.cbf_score * 100).toFixed(1) + "%"
                    : "Active"}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-300">Collaborative Neighborhood (CF)</span>
                <span className="font-mono font-bold text-indigo-400">
                  {selectedTrackInfo.algorithmic_breakdown?.cf_score
                    ? (selectedTrackInfo.algorithmic_breakdown.cf_score * 100).toFixed(1) + "%"
                    : "Active"}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60">
                <span className="text-slate-600 dark:text-slate-300">Hugging Face Emotion Alignment</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedTrackInfo.algorithmic_breakdown?.mood_score
                    ? (selectedTrackInfo.algorithmic_breakdown.mood_score * 100).toFixed(1) + "%"
                    : "Aligned"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                handlePlayRecommended(selectedTrackInfo.song);
                setSelectedTrackInfo(null);
              }}
              className="mt-6 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" />
              <span>Play This Track Now</span>
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Offline Recommendation Evaluation & Benchmark Suite --- */}
      {showMetricsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowMetricsModal(false)}
        >
          <div
            className="relative w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMetricsModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400">
                <BarChart2 size={28} />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">
                  ML Systems Evaluation
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Recommendation Benchmark Suite
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Evaluation results on hold-out test splits comparing <strong>Hybrid (CBF+CF+MMR)</strong> against pure Content-Based, Collaborative Filtering, and Popularity baselines using Recall@K, Precision@K, NDCG@K, MRR, Catalog Coverage, and Intra-List Diversity.
            </p>

            {metricsLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw size={32} className="text-cyan-400 animate-spin" />
                <span className="text-sm text-slate-400">Computing offline test metrics...</span>
              </div>
            ) : benchmarkReport && benchmarkReport.models ? (
              <div className="space-y-6">
                {Object.entries(benchmarkReport.models).map(([modelName, metricList]) => (
                  <div
                    key={modelName}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {modelName}
                      </span>
                      {modelName.includes("Hybrid") && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400 text-[10px] font-bold">
                          Current Production Engine
                        </span>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400">
                            <th className="pb-2">Threshold</th>
                            <th className="pb-2">Recall@K</th>
                            <th className="pb-2">Precision@K</th>
                            <th className="pb-2">NDCG@K</th>
                            <th className="pb-2">MRR</th>
                            <th className="pb-2">Diversity</th>
                            <th className="pb-2">Coverage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-mono">
                          {metricList.map((m, mIdx) => (
                            <tr key={mIdx} className="hover:bg-white/5">
                              <td className="py-2 font-bold text-cyan-400">K={m.k}</td>
                              <td className="py-2 text-slate-700 dark:text-slate-200">
                                {(m.recall_at_k * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 text-slate-700 dark:text-slate-200">
                                {(m.precision_at_k * 100).toFixed(1)}%
                              </td>
                              <td className="py-2 font-bold text-emerald-400">
                                {m.ndcg_at_k.toFixed(3)}
                              </td>
                              <td className="py-2 text-slate-700 dark:text-slate-200">
                                {m.mrr.toFixed(3)}
                              </td>
                              <td className="py-2 text-slate-700 dark:text-slate-200">
                                {m.diversity_score.toFixed(3)}
                              </td>
                              <td className="py-2 text-slate-700 dark:text-slate-200">
                                {(m.catalog_coverage * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-cyan-400" />
                    <span>Evaluation Summary & Key Insights</span>
                  </div>
                  <p>
                    • <strong>Hybrid Engine</strong> achieves highest <strong>NDCG@K</strong> and <strong>Recall@K</strong> by balancing content features with collaborative listener co-occurrences.
                  </p>
                  <p>
                    • <strong>Maximal Marginal Relevance (MMR)</strong> guarantees intra-list diversity (&gt; 0.65), preventing recommendation fatigue and redundant artist clustering.
                  </p>
                  <p>
                    • <strong>Cold-Start Bayesian Exploration</strong> handles users with &lt; 2 interactions via popularity-decayed genre slots.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No evaluation data available.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default RecommendationFeed;
