import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
import Navbar from "../../Components/Navbar.jsx";
import { useUser } from "../context/UserContext.jsx";
import { usePlaylist } from "../context/PlaylistContext.jsx";
import { useHistory } from "../context/historyContext.jsx";
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

// Lazy load components for better performance
const Mostliked = lazy(() => import("../../Components/Mostliked.jsx"));
const Topcharts = lazy(() => import("../../Components/Topcharts.jsx"));
const Mostsaved = lazy(() => import("../../Components/MostSaved.jsx"));
const RandomSongs = lazy(() => import("../../Components/RandomSongs.jsx"));
const CompactGrid = lazy(() => import("../../Components/CompactGrid.jsx"));

// --- Helper Components ---

const SectionHeading = ({ emoji, title, subtitle }) => (
  <div className="group relative mb-8">
    <div className="flex items-center gap-4">
      {/* Neon Glow Accent Bar */}
      <div className="w-1.5 h-12 rounded-full bg-gradient-to-b from-blue-400 via-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/30 group-hover:scale-y-110 transition-transform duration-300" />
      <div>
        {subtitle && (
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">
            <span>{emoji}</span>
            <span>{subtitle}</span>
          </div>
        )}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-cyan-300 drop-shadow-md dark:drop-shadow-xl">
          {title}
        </h2>
      </div>
    </div>
    <div className="mt-3 h-[1px] w-full bg-gradient-to-r from-blue-500/40 via-cyan-500/20 to-transparent" />
  </div>
);

SectionHeading.propTypes = {
  emoji: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string
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

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-black to-[#1a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:via-black dark:to-[#1a0a1a] text-slate-900 dark:text-white font-body overflow-x-clip">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION - Improved with better mobile experience */}
      <section className="relative h-[80vh] md:h-[85vh] flex flex-col lg:flex-row px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto items-center justify-center gap-6 lg:gap-12 pt-12 pb-16">
        {/* Enhanced Background Elements with Intersection Observer ready */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-16 left-8 w-32 h-32 md:w-48 md:h-48 bg-blue-400/5 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: '0s' }}
          />
          <div
            className="absolute bottom-16 right-16 w-48 h-48 md:w-64 md:h-64 bg-indigo-500/5 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-grid-slate-700/20 [background-size:100px_100px]"></div>
        </div>

        {/* LEFT CONTENT - Better mobile stacking, improved focus states */}
        <article className="relative z-0 w-full lg:w-3/5 space-y-4 backdrop-blur-xl bg-white/80 dark:bg-black/20 border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] focus-within:ring-4 ring-blue-400/30">
          {/* Enhanced glow effect */}
          <div
            className="absolute -inset-1 bg-gradient-to-r from-blue-400/15 via-transparent to-cyan-500/15 rounded-2xl blur opacity-75 animate-pulse-slow"
            style={{ animationDuration: '4s' }}
          />

          <header>
            <h1
              className="text-xl md:text-3xl lg:text-4xl font-heading font-black bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 bg-clip-text text-transparent tracking-wide drop-shadow-lg"
              role="banner"
            >
              Welcome {user?.first_name
                ? `${user.first_name.charAt(0).toUpperCase()}${user.first_name.slice(1).toLowerCase()}`
                : "Guest"} 👋
            </h1>
            <p className="text-xs lg:text-sm tracking-[0.2em] font-heading2 font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-amber-500 bg-clip-text text-transparent uppercase pt-1">
              Every Mood Has a Song. 🇮🇳🎧
            </p>
          </header>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black leading-tight bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight">
            Highly curated <br className="hidden md:block" /> music & sound effects.
          </h2>

          <p className="text-base md:text-lg text-slate-600 dark:text-gray-300 max-w-xl leading-relaxed backdrop-blur-sm pt-2">
            Trusted by filmmakers worldwide. Premium cinematic music and SFX collection.
          </p>

          {/* Improved Buttons with better focus states and keyboard navigation */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleCTA}
              className="group relative bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 !text-white px-8 md:px-10 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg tracking-wide shadow-2xl hover:shadow-3xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-400 overflow-hidden border border-transparent font-heading2"
              aria-label="Create free account"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              <span className="relative z-10 !text-white">CREATE FREE ACCOUNT</span>
            </button>
            <button
              onClick={handlePlayLastSong}
              disabled={historyLoading || !history || history.length === 0}
              className="border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-8 md:px-10 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg tracking-wide hover:bg-blue-500 hover:!text-white dark:hover:bg-blue-400 dark:hover:text-black backdrop-blur-sm transition-all duration-400 hover:scale-105 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50 disabled:opacity-50"
              aria-label="Play Last Song"
            >
              ▶ Play Last Song
            </button>
          </div>

          <p className="text-slate-500 dark:text-gray-400 text-sm md:text-base pt-3 font-medium">
            No credit card required. Start creating today.
          </p>
        </article>

        {/* RIGHT IMAGE - Better responsive sizing and loading */}
        <div className="hidden lg:flex w-2/5 justify-center items-center relative group">
          <div className="absolute w-full h-full bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl -z-10" />
          <img
            src="https://i.pinimg.com/originals/dc/c9/ce/dcc9cea8525b59b91d1a6ed0e27fff59.gif"
            alt="Creative professional wearing headphones visualizing music"
            className="w-[320px] h-[320px] md:w-[340px] md:h-[340px] object-cover rounded-2xl border-3 border-white/15 shadow-2xl group-hover:shadow-3xl group-hover:scale-105 transition-all duration-500 hover:brightness-110 cursor-pointer loading='lazy'"
            loading="lazy"
          />
        </div>
      </section>

      {/* VIDEO BANNER - Optimized with loading states */}
      <section data-preserve-dark className="video-hero relative h-[60vh] md:h-[65vh] w-full max-w-[1600px] mx-auto overflow-hidden my-12 px-4 sm:px-6 lg:px-12">
        <div className="relative w-full h-full rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md border border-white/5">
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
              alt="Music licensing video preview"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-0' : 'opacity-100'}`}
            />
          </video>

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80" />

          <article className="relative z-20 h-full flex flex-col justify-center p-6 md:p-10 lg:p-14">
            <div className="flex flex-col lg:flex-row items-start justify-between w-full gap-8 lg:gap-12">
              <div className="w-full lg:w-[60%] flex flex-col space-y-5 lg:space-y-6">
                <h3 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-black leading-tight bg-gradient-to-br from-white via-blue-50 to-cyan-100/50 bg-clip-text text-transparent drop-shadow-3xl tracking-tight">
                  Amplify the emotion <br /> in every scene.
                </h3>
                <p className="text-lg font-heading3 md:text-xl text-gray-200 max-w-xl leading-relaxed backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10 shadow-xl">
                  Emotional scores to atmospheric sound design — crafted to elevate storytelling.
                </p>
              </div>

              <aside className="w-full lg:w-[35%] flex flex-col gap-5 lg:gap-6">
                <div className="backdrop-blur-xl bg-black/30 border border-blue-400/20 rounded-2xl p-5 shadow-2xl hover:shadow-3xl transition-all duration-400">
                  <p className="text-3xl md:text-4xl lg:text-5xl font-heading font-black bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                    70,000+
                  </p>
                  <p className="text-lg font-semibold text-gray-200">curated songs</p>
                </div>

                <div className="backdrop-blur-xl bg-black/30 border border-cyan-500/20 rounded-2xl p-5 shadow-2xl hover:shadow-3xl transition-all duration-400">
                  <p className="text-3xl md:text-4xl lg:text-5xl font-heading font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                    150,000+
                  </p>
                  <p className="text-lg font-semibold text-gray-200">sound effects</p>
                </div>

                <button
                  onClick={handleCTA}
                  className="group relative bg-gradient-to-r from-transparent via-white/15 to-transparent border-2 border-white/40 text-white px-8 py-3 rounded-xl font-bold text-lg tracking-wide hover:bg-white/20 hover:border-white hover:shadow-2xl hover:scale-105 backdrop-blur-xl transition-all duration-400 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/50"
                  aria-label="Explore music library"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">
                    Explore the Library →
                  </span>
                </button>
              </aside>
            </div>
          </article>
        </div>
      </section>



      {/* CONTENT SECTIONS - Better loading states and spacious vertical margins */}
      <main className="px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto pt-16 md:pt-24 pb-48 space-y-32 lg:space-y-44">

        {/* 🚀 NEW SECTION: User's Private Playlists */}
        {user && (
          <section aria-labelledby="my-playlists">
            <SectionHeading emoji="🎧" title={`${user?.first_name ? `${user.first_name.charAt(0).toUpperCase()}${user.first_name.slice(1).toLowerCase()}` : "User"}'s Playlists`} subtitle="Your Library" />
            {/* Myplaylist handles its own fetching and rendering logic, but we want to show only 4 playlists */}
            <Myplaylist maxToShow={4} />
            <div className="mt-8 text-center">
              <Link 
                to="/myplaylists" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600/30 to-cyan-500/30 border border-blue-400/40 text-blue-300 font-bold hover:bg-blue-600 hover:text-white hover:border-blue-400 transition-all shadow-lg shadow-blue-500/20 hover:scale-105"
              >
                <span>View All Your Playlists</span>
                <span>→</span>
              </Link>
            </div>
          </section>
        )}
        {/* 🚀 END NEW SECTION */}

      

        <section aria-labelledby="quick-hits">
          <SectionHeading emoji="⚡" title="Quick Hits & Collection" subtitle="Featured Mix" />
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

        <section aria-labelledby="curators-spotlight">
          <SectionHeading emoji="✨" title="Curator's Spotlight" subtitle="Staff Picks" />
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

        <section aria-labelledby="top-charts">
          <SectionHeading emoji="🚀" title="The Industry's Hottest" subtitle="Top Charts" />
          <Suspense fallback={<div className="h-4 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full w-48 animate-pulse mx-auto" />}>
            <Topcharts limitToHome={true} />
          </Suspense>
        </section>

        <section aria-labelledby="most-liked">
          <SectionHeading emoji="💖" title="Filmmaker Favorites" subtitle="Most Liked" />
          <Suspense fallback={<div className="h-4 bg-gradient-to-r from-pink-400/30 to-blue-400/30 rounded-full w-48 animate-pulse mx-auto" />}>
            <Mostliked limitToHome={true} />
          </Suspense>
        </section>

        <section aria-labelledby="most-saved">
          <SectionHeading emoji="🎬" title="Essential Soundtracks" subtitle="Most Saved" />
          <Suspense fallback={<div className="h-4 bg-gradient-to-r from-green-400/30 to-cyan-400/30 rounded-full w-48 animate-pulse mx-auto" />}>
            <Mostsaved limitToHome={true} />
          </Suspense>
        </section>

        {/* Community Playlists (Original Public Section) */}
        <section aria-labelledby="public-playlists">
          <SectionHeading emoji="🌐" title="Community Playlists" subtitle="Featured Public Playlists" />
          <Myplaylist showCommunity={true} limitToHome={true} />
        </section>


        <Latestreleased />
        <Hindisongs limitToHome={true} />
        <Punjabisongs limitToHome={true} />


          {/* 📻 DESI SMART MOOD RADIO BAR */}
        <MoodRadioBar />

        

        {/* 🎤 Featured Artists Showcase */}
        <section aria-labelledby="featured-artists">
          <SectionHeading emoji="🌟" title="Featured Artists" subtitle="Discover Top Music Creators" />
          <Artists />
        </section>

        {/* Messages Section - Extra spacious top/bottom and downside margin */}

<section
  aria-labelledby="community-chat-heading"
  className="relative my-28 mb-36 px-4 sm:my-36 sm:mb-44 md:px-6"
>
  <div className="mx-auto max-w-7xl">
    <SectionHeading
      emoji="💬"
      title="Desi Community Chat"
      subtitle="Your people. Your music. Your conversations."
    />

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