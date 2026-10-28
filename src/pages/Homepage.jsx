import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
import Navbar from "../../Components/Navbar.jsx";
import { useUser } from "../context/UserContext.jsx";
import { usePlaylist } from "../context/PlaylistContext.jsx";
import { useHistory } from "../context/historyContext.jsx";
import { useMusicPlayer } from "../context/MusicPlayerContext.jsx";
import { useMusicSections } from "../context/MusicSectionsContext.jsx";
import { Play, Sparkles, Flame, Radio, Music2, ArrowRight, TrendingUp, Headphones, Disc } from "lucide-react";
// Import the Myplaylist component
import Myplaylist from "../../Components/Myplaylist.jsx";
import Hindisongs from "../../Components/Hindisongs.jsx";
import Punjabisongs from "../../Components/Punjabisongs.jsx";
import Latestreleased from "../../Components/Latestreleased.jsx";
import Dashboard from "../../Components/Dashboard.jsx";
import Artists from "../../Components/Artists.jsx";
import PremiumBanner from "../../Components/PremiumBanner.jsx";
import InstagramFeed from "../../Components/InstagramFeed.jsx";
import MoodRadioBar from "../../Components/MoodRadioBar.jsx";
import HeadphoneScrollExperience from "../../Components/HeadphoneScrollExperience.jsx";
import RecommendationFeed from "../../Components/RecommendationFeed.jsx";

// Lazy load components for better performance
const Mostliked = lazy(() => import("../../Components/Mostliked.jsx"));
const Topcharts = lazy(() => import("../../Components/Topcharts.jsx"));
const Mostsaved = lazy(() => import("../../Components/MostSaved.jsx"));
const RandomSongs = lazy(() => import("../../Components/RandomSongs.jsx"));
const CompactGrid = lazy(() => import("../../Components/CompactGrid.jsx"));

// --- Helper Components ---

const SectionHeading = ({ emoji, title, subtitle, actionText, onAction }) => (
  <div className="flex items-end justify-between mb-6 pb-2.5 border-b border-slate-200 dark:border-white/[0.06]">
    <div>
      {subtitle && (
        <div className="flex items-center gap-1.5 mb-1">
          {emoji && <span className="text-xs">{emoji}</span>}
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-400">
            {subtitle}
          </span>
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
        {title}
      </h2>
    </div>

    {actionText && (
      <button
        onClick={onAction}
        className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors pb-0.5"
      >
        <span>{actionText}</span>
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </button>
    )}
  </div>
);

SectionHeading.propTypes = {
  emoji: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
};

/**
 * PlaylistCard Component - Used for Public Playlists
 */
const PlaylistCard = ({ playlist }) => (
  <Link
    to={`/playlist/${playlist.id}`}
    className="block group relative overflow-hidden rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 bg-black/30 border border-white/10"
    aria-label={`Go to playlist: ${playlist.name}`}
  >
    {/* Use coverImage from model */}
    <img
      src={playlist.cover_image || "https://via.placeholder.com/400x225/1f2937/9ca3af?text=Public+Playlist"}
      alt={playlist.name || "Unnamed Playlist"}
      className="w-full h-56 object-cover brightness-75 group-hover:brightness-90 transition-all duration-500"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
      {/* Use name from model */}
      <h3 className="text-xl font-heading4 font-semibold text-white truncate group-hover:text-blue-400 transition-colors duration-300">
        {playlist.name || "Playlist"}
      </h3>
      {/* Use songIDs (length) and playCount from model */}
      <p className="text-sm text-gray-400 mt-1">
        {playlist.song_ids?.length || 0} tracks | {playlist.play_count?.toLocaleString() || 0} plays
      </p>
    </div>
  </Link>
);

PlaylistCard.propTypes = {
  playlist: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    cover_image: PropTypes.string,
    song_ids: PropTypes.array,
    play_count: PropTypes.number
  }).isRequired
};

/**
 * PublicPlaylistsSection Component (Inline Logic)
 * @description Displays public playlists section - currently not used but kept for future implementation
 */
// eslint-disable-next-line no-unused-vars
const PublicPlaylistsSection = () => {
  const playlistContext = usePlaylist();
  const [dataFetched, setDataFetched] = useState(false);

  // Safely destructure with defaults
  const publicPlaylists = playlistContext?.publicPlaylists || [];
  const fetchPublicPlaylists = playlistContext?.fetchPublicPlaylists;
  const isLoadingPublic = playlistContext?.isLoadingPublic || false;

  useEffect(() => {
    // Only fetch if data hasn't been fetched and we have the function
    if (!dataFetched && fetchPublicPlaylists) {
      fetchPublicPlaylists();
      setDataFetched(true);
    }
  }, [fetchPublicPlaylists, dataFetched]);

  // Context Null Check
  if (!playlistContext) {
    return (
      <p className="text-center text-red-400 p-8 text-lg border border-red-500/20 rounded-xl bg-black/30">
        Error: Playlist data provider is missing. Please ensure Homepage is wrapped in PlaylistProvider.
      </p>
    );
  }

  // Loading state
  if (isLoadingPublic || !dataFetched) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-56 bg-indigo-900/40 rounded-2xl" />
        ))}
      </div>
    );
  }

  // No data state
  if (!publicPlaylists || publicPlaylists.length === 0) {
    return <p className="text-center text-gray-500 p-8 text-lg border border-white/10 rounded-xl bg-black/30">No featured public playlists available right now. Check back soon!</p>;
  }

  // Display a limited number of public playlists
  const playlistsToShow = publicPlaylists.slice(0, 6);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {playlistsToShow.map((playlist) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
        />
      ))}
    </div>
  );
};







// --- Main Homepage Component ---

const Homepage = () => {
  const navigate = useNavigate();
  const { user } = useUser(); // Get user object from context
  const { history, loading: historyLoading } = useHistory();
  const { currentSong, isPlaying, togglePlayPause, playSong } = useMusicPlayer();
  const { sections } = useMusicSections();

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [mounted, setMounted] = useState(false);

  // Ensure SSR compatibility
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCTA = useCallback(() => {
    navigate("/signup");
  }, [navigate]);

  const handleVideoLoad = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  // Play last song handler
  const handlePlayLastSong = useCallback(() => {
    if (history && history.length > 0) {
      const lastSong = history[0];
      const songId = lastSong.song_id || lastSong.id;
      if (songId) {
        navigate(`/playsong/${songId}`);
      }
    }
  }, [history, navigate]);

  const scrollToSection = (sectionId, categoryKey) => {
    setActiveCategory(categoryKey);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-black to-[#1a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-transparent text-slate-900 dark:text-white font-body relative overflow-x-clip selection:bg-blue-500 selection:text-white">
      {/* 🌌 DYNAMIC AMBIENT AURORA LIGHTING (Obsidian / Indigo / Cyan) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Top-Left Blue Pulsar */}
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-blue-600/15 rounded-full blur-[130px] animate-aurora" />
        {/* Center-Right Cyan Glow */}
        <div className="absolute top-[25%] -right-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px]" />
        {/* Mid-Left Purple Acoustic Echo */}
        <div className="absolute top-[55%] -left-40 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[120px] animate-aurora" style={{ animationDelay: '4s' }} />
        {/* Bottom-Right Violet Ambient */}
        <div className="absolute -bottom-40 right-[15%] w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[150px]" />
        {/* Tactile Texture Mesh */}
        <div className="ambient-mesh-glow" />
      </div>

      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION - Preserved Original Structure with Senior Designer Polish */}
      <section className="relative min-h-[75vh] md:min-h-[80vh] flex flex-col lg:flex-row px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto items-center justify-center gap-8 lg:gap-14 pt-8 pb-10">
        {/* Subtle Background Glow Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-12 right-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* LEFT CONTENT - Polished Glassmorphism Console Card */}
        <article className="relative z-10 w-full lg:w-3/5 space-y-5 backdrop-blur-2xl bg-white/[0.03] dark:bg-[#0c101d]/85 border border-white/10 dark:border-white/[0.08] rounded-[2rem] p-6 sm:p-10 lg:p-12 shadow-2xl shadow-blue-500/5 hover:border-cyan-500/30 transition-all duration-500 hover:scale-[1.005]">
          {/* Subtle Ambient Backlight Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-600/10 rounded-[2rem] blur-xl opacity-60 pointer-events-none" />

          <header className="relative z-10">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
              Welcome {user?.first_name ? `${user.first_name.charAt(0).toUpperCase()}${user.first_name.slice(1).toLowerCase()}` : "Guest"} 👋
            </h1>
            <p className="text-xs sm:text-sm tracking-[0.2em] font-bold text-cyan-400/90 uppercase pt-1">
              Every Mood Has a Song. 🇮🇳🎧
            </p>
          </header>

          <h2 className="relative z-10 text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-white tracking-tight">
            Highly curated <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200">
              music & sound effects.
            </span>
          </h2>

          <p className="relative z-10 text-sm sm:text-base md:text-lg text-slate-300 max-w-xl leading-relaxed pt-1">
            Trusted by creators and listeners worldwide. Premium HD audio, curated regional anthems, and cinematic sound design.
          </p>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-3.5 pt-3">
            <button
              onClick={handleCTA}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all overflow-hidden"
              aria-label="Create free account"
            >
              <span className="relative z-10">{user ? "EXPLORE MUSIC" : "CREATE FREE ACCOUNT"}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handlePlayLastSong}
              disabled={historyLoading || !history || history.length === 0}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-500/40 text-cyan-300 hover:text-white font-semibold text-sm sm:text-base backdrop-blur-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Play Last Song"
            >
              <Play size={16} fill="currentColor" />
              <span>Play Last Song</span>
            </button>
          </div>

          <p className="relative z-10 text-slate-400 text-xs sm:text-sm pt-2 font-medium">
            No credit card required. Start listening in HD today.
          </p>
        </article>

        {/* RIGHT VISUAL - Polished Visual Frame */}
        <div className="hidden lg:flex w-2/5 justify-center items-center relative group">
          <div className="absolute w-72 h-72 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-full blur-[80px] -z-10 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative rounded-3xl p-2.5 bg-gradient-to-b from-white/15 via-white/5 to-white/10 backdrop-blur-xl border border-white/15 shadow-2xl group-hover:border-cyan-500/40 transition-all duration-500 group-hover:scale-105">
            <img
              src="https://i.pinimg.com/originals/dc/c9/ce/dcc9cea8525b59b91d1a6ed0e27fff59.gif"
              alt="Creative listener wearing headphones visualizing sound"
              className="w-[300px] h-[300px] xl:w-[340px] xl:h-[340px] object-cover rounded-2xl shadow-inner group-hover:brightness-105 transition-all duration-500"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* VIDEO BANNER - Restored with Senior Glassmorphism Polish */}
      <section data-preserve-dark className="video-hero relative h-[60vh] md:h-[65vh] w-full max-w-[1600px] mx-auto overflow-hidden my-10 px-4 sm:px-6 lg:px-12">
        <div className="relative w-full h-full rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-md border border-white/10 group">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onLoadedData={handleVideoLoad}
            className="absolute top-0 left-0 w-full h-full object-cover brightness-75 saturate-150 transition-opacity duration-1000"
            poster="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
          >
            <source src="video.mp4" type="video/mp4" />
            <img
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjIyIi8+PHRleHQgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNDQ0IiB4PSI1MCUiIHk9IjUwJSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcgVmlkZW88L3RleHQ+PC9zdmc+"
              alt="Music video preview"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-0' : 'opacity-100'}`}
            />
          </video>

          {/* Cinematic Multi-Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90" />

          <article className="relative z-20 h-full flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-8 lg:gap-12">
              <div className="w-full lg:w-[60%] flex flex-col space-y-4 sm:space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-widest w-fit">
                  <Sparkles size={12} className="text-cyan-400" />
                  <span>Atmospheric Audio Experience</span>
                </div>

                <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight bg-gradient-to-br from-white via-blue-50 to-cyan-100/70 bg-clip-text text-transparent drop-shadow-2xl tracking-tight">
                  Amplify the emotion <br /> in every scene.
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-slate-200 max-w-xl leading-relaxed backdrop-blur-md bg-black/40 p-4 rounded-2xl border border-white/10 shadow-xl">
                  Emotional scores to atmospheric sound design — crafted to elevate your audio journey and storytelling.
                </p>
              </div>

              <aside className="w-full lg:w-[35%] flex flex-col gap-4">
                <div className="backdrop-blur-xl bg-black/40 border border-blue-400/25 rounded-2xl p-4 sm:p-5 shadow-2xl hover:border-blue-400/50 hover:scale-[1.02] transition-all">
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    70,000+
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-slate-200 mt-1">curated songs</p>
                </div>

                <div className="backdrop-blur-xl bg-black/40 border border-cyan-500/25 rounded-2xl p-4 sm:p-5 shadow-2xl hover:border-cyan-400/50 hover:scale-[1.02] transition-all">
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                    150,000+
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-slate-200 mt-1">sound effects</p>
                </div>

                <button
                  onClick={handleCTA}
                  className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold text-base tracking-wide hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all shadow-xl"
                  aria-label="Explore music library"
                >
                  <span>Explore the Library</span>
                  <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                </button>
              </aside>
            </div>
          </article>
        </div>
      </section>

      {/* 🚀 QUICK CATEGORY FILTER BAR */}
      <div className="px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { label: "All Mixes", id: "quick-hits", key: "all", icon: "🔥" },
          { label: "Made For You", id: "recommendations-heading", key: "foryou", icon: "✨" },
          { label: "Top Charts", id: "top-charts", key: "charts", icon: "🚀" },
          { label: "Bollywood", id: "hindi-hits", key: "hindi", icon: "🎬" },
          { label: "Punjabi Beats", id: "punjabi-hits", key: "punjabi", icon: "💥" },
          { label: "Mood Radio", id: "mood-radio", key: "mood", icon: "📻" },
          { label: "Artists", id: "featured-artists", key: "artists", icon: "🌟" },
          { label: "Community", id: "community-chat-heading", key: "community", icon: "💬" },
        ].map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => scrollToSection(cat.id, cat.key)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/25 scale-105"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08]"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>



      {/* CONTENT SECTIONS - Cohesive vertical rhythm and direct navigation links */}
      <main className="px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto pt-6 pb-36 space-y-16 md:space-y-20">

        {/* 🌟 AI HYBRID RECOMMENDATION FEED */}
        <div id="section-foryou">
          <RecommendationFeed />
        </div>

        {/* 🚀 User's Private Playlists (if logged in) */}
        {user && (
          <section id="my-playlists" aria-labelledby="my-playlists">
            <SectionHeading
              emoji="🎧"
              title={`${user?.first_name ? `${user.first_name.charAt(0).toUpperCase()}${user.first_name.slice(1).toLowerCase()}` : "User"}'s Playlists`}
              subtitle="Your Library"
              actionText="View All"
              onAction={() => navigate("/myplaylists")}
            />
            <Myplaylist maxToShow={4} />
          </section>
        )}

        {/* Quick Hits Collection */}
        <section id="quick-hits" aria-labelledby="quick-hits">
          <SectionHeading
            emoji="⚡"
            title="Quick Hits & Collection"
            subtitle="Trending Mixes"
            actionText="Browse Hits"
            onAction={() => navigate("/trending")}
          />
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              ))}
            </div>
          }>
            <CompactGrid />
          </Suspense>
        </section>

        {/* Top Charts (Clean: native header only, no duplicate banner) */}
        <section id="top-charts" aria-labelledby="top-charts">
          <Suspense fallback={<div className="h-4 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full w-48 animate-pulse mx-auto" />}>
            <Topcharts limitToHome={true} />
          </Suspense>
        </section>

        {/* Curator's Spotlight */}
        <section id="curators-spotlight" aria-labelledby="curators-spotlight">
          <SectionHeading
            emoji="✨"
            title="Curator's Spotlight"
            subtitle="Staff Picks"
            actionText="Trending Hits"
            onAction={() => navigate("/trending")}
          />
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-72 bg-black/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          }>
            <RandomSongs maxToShow={4} />
          </Suspense>
        </section>

        {/* Hindi Songs */}
        <div id="hindi-hits">
          <Hindisongs limitToHome={true} />
        </div>

        {/* Punjabi Songs */}
        <div id="punjabi-hits">
          <Punjabisongs limitToHome={true} />
        </div>

        {/* 📻 DESI SMART MOOD RADIO BAR - Positioned higher for quick discovery */}
        <div id="mood-radio">
          <MoodRadioBar />
        </div>

        {/* Most Liked (Clean: native header only) */}
        <section id="most-liked" aria-labelledby="most-liked">
          <Suspense fallback={<div className="h-4 bg-gradient-to-r from-pink-400/30 to-blue-400/30 rounded-full w-48 animate-pulse mx-auto" />}>
            <Mostliked limitToHome={true} />
          </Suspense>
        </section>

        {/* Most Saved (Clean: native header only) */}
        <section id="most-saved" aria-labelledby="most-saved">
          <Suspense fallback={<div className="h-4 bg-gradient-to-r from-green-400/30 to-cyan-400/30 rounded-full w-48 animate-pulse mx-auto" />}>
            <Mostsaved limitToHome={true} />
          </Suspense>
        </section>

        {/* Community Playlists */}
        <section id="public-playlists" aria-labelledby="public-playlists">
          <SectionHeading
            emoji="🌐"
            title="Community Playlists"
            subtitle="Featured Public Playlists"
            actionText="Explore All"
            onAction={() => navigate("/seeallcommunityplaylists")}
          />
          <Myplaylist showCommunity={true} limitToHome={true} />
        </section>

        <div id="latest-released">
          <Latestreleased />
        </div>

        {/* 🎤 Featured Artists Showcase */}
        <section id="featured-artists" aria-labelledby="featured-artists">
          <SectionHeading
            emoji="🌟"
            title="Featured Artists"
            subtitle="Discover Top Music Creators"
            actionText="Explore Artists"
            onAction={() => navigate("/artists")}
          />
          <Artists />
        </section>

        {/* Messages Section - Extra spacious top/bottom and downside margin  inhanced the message component*/}
        

<section
  aria-labelledby="community-chat-heading"
  className="relative my-28 mb-36 px-4 sm:my-36 sm:mb-44 md:px-6"
>
  <div className="mx-auto max-w-7xl">
    <div className="flex items-end justify-between mb-6 pb-2.5 border-b border-slate-200 dark:border-white/[0.06]">
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs">💬</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-500 dark:text-cyan-400">
            Your people. Your music. Your conversations.
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Desi Community Chat
        </h2>
      </div>
    </div>

    <div className="group relative mt-10 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0b0d14] shadow-2xl shadow-black/20">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-600/[0.15] blur-[100px] transition-all duration-700 group-hover:bg-blue-500/[0.22]" />

        <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-violet-600/[0.12] blur-[100px]" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_55%)]" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:36px_36px]" />
      </div>

      <div className="relative grid items-center gap-12 p-6 sm:p-9 md:grid-cols-[1.1fr_0.9fr] md:gap-10 md:p-12 lg:p-16">
        {/* Left content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3.5 py-2 text-xs font-semibold tracking-wide text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            YOUR MUSIC COMMUNITY
          </div>

          <h3
            id="community-chat-heading"
            className="mt-6 max-w-xl text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Good music sounds
            <span className="mt-1 block bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text pb-1 text-transparent">
              even better together.
            </span>
          </h3>

          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
            Discover people who get your vibe. Share tracks, exchange
            recommendations, and turn your favorite songs into conversations.
          </p>

          {/* Feature chips */}
          <div className="mt-7 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-2.5 text-xs font-medium text-slate-300 sm:text-sm">
              <svg
                className="h-4 w-4 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.4-4 8-9 8a10 10 0 0 1-4.3-.95L3 20l1.4-3.7A7.4 7.4 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8Z"
                />
              </svg>
              Direct messages
            </span>

            <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-2.5 text-xs font-medium text-slate-300 sm:text-sm">
              <svg
                className="h-4 w-4 text-violet-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 18V5l12-2v13M9 10l12-2M5 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12-3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                />
              </svg>
              Share your vibe
            </span>

            <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-2.5 text-xs font-medium text-slate-300 sm:text-sm">
              <svg
                className="h-4 w-4 text-pink-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
                />
              </svg>
              Find your people
            </span>
          </div>

          {/* CTA */}
          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate("/messages")}
              className="group/button inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-400 hover:shadow-xl hover:shadow-blue-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0d14] active:translate-y-0 sm:w-auto sm:px-7 sm:text-base"
            >
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover/button:scale-110"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01"
                />
              </svg>

              Enter the Chat

              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14m-6-6 6 6-6 6"
                />
              </svg>
            </button>

            <p className="text-xs leading-5 text-slate-500">
              Made for music lovers, by music lovers.
            </p>
          </div>
        </div>

        {/* Right visual: chat preview */}
        <div className="relative mx-auto w-full max-w-md md:ml-auto">
          {/* Floating decoration */}
          <div
            aria-hidden="true"
            className="absolute -right-3 -top-5 h-20 w-20 rounded-full border border-blue-400/10 bg-blue-400/[0.04] blur-[1px] sm:-right-5 sm:-top-7"
          />

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#11141d]/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
            {/* Preview header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-300 ring-1 ring-white/10">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.4-4 8-9 8a10 10 0 0 1-4.3-.95L3 20l1.4-3.7A7.4 7.4 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8Z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    The Listening Room
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    A little music, a lot of connection
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                COMMUNITY
              </span>
            </div>

            {/* Illustrative messages */}
            <div className="space-y-4 py-5">
              <div className="flex items-end gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-[10px] font-bold text-white">
                  A
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.045] px-3.5 py-3">
                  <p className="mb-1 text-[10px] font-semibold text-pink-300">
                    A music lover
                  </p>
                  <p className="text-sm leading-5 text-slate-300">
                    Anyone got a playlist for late-night drives? 🌙
                  </p>
                </div>
              </div>

              <div className="flex items-end justify-end gap-2.5">
                <div className="max-w-[85%] rounded-2xl rounded-br-md border border-blue-400/15 bg-blue-500/10 px-3.5 py-3">
                  <p className="mb-1 text-[10px] font-semibold text-blue-300">
                    Your next music buddy
                  </p>
                  <p className="text-sm leading-5 text-slate-300">
                    Lo-fi, indie, and a little Arijit Singh. 🎧
                  </p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-[10px] font-bold text-white">
                  M
                </div>
              </div>

              <div className="flex items-end gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-[10px] font-bold text-white">
                  R
                </div>
                <div className="rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.045] px-3.5 py-3">
                  <p className="mb-1 text-[10px] font-semibold text-amber-300">
                    Another listener
                  </p>
                  <p className="text-sm text-slate-300">
                    Okay, that playlist sounds like a vibe ✨
                  </p>
                </div>
              </div>
            </div>

            {/* Message input visual */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0b0d14] px-4 py-3">
              <span className="flex-1 text-sm text-slate-600">
                Your next conversation starts here...
              </span>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"
                  />
                </svg>
              </div>
            </div>

            <p className="mt-3 text-center text-[10px] tracking-wide text-slate-600">
              A PREVIEW OF THE COMMUNITY EXPERIENCE
            </p>
          </div>

          {/* Bottom accent */}
          <div
            aria-hidden="true"
            className="absolute -bottom-2 left-[12%] right-[12%] -z-10 h-12 rounded-full bg-blue-500/20 blur-2xl"
          />
        </div>
      </div>
    </div>
  </div>
</section>






        {/* 📸 Official Instagram Feed Posts - Spacious wrapper */}
        <div className="my-36 md:my-52">
          <InstagramFeed />
        </div>

           {/* 👑 GEETHUB VIP PREMIUM BANNER - Spacious vertical wrapper */}
        <div className="my-28 md:my-44">
          <PremiumBanner />
        </div>

        <Dashboard />

      </main>

      {/* 🎧 Immersive 3D Headphone Scroll Experience - Just before Footer */}
      <div id="headphone-scroll-section" data-preserve-dark className="relative">
        <HeadphoneScrollExperience />
      </div>

    </div>
  );
};

export default Homepage;
