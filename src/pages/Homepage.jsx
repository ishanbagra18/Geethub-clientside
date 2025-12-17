import React, { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import Navbar from "../../Components/Navbar.jsx";
import { useUser } from "../context/UserContext.jsx";
import { usePlaylist } from "../context/PlaylistContext.jsx"; 
// Import the Myplaylist component
import Myplaylist from "../../Components/Myplaylist.jsx";

// Lazy load components for better performance
const Mostliked = lazy(() => import("../../Components/Mostliked.jsx"));
const Topcharts = lazy(() => import("../../Components/Topcharts.jsx"));
const Mostsaved = lazy(() => import("../../Components/MostSaved.jsx"));
const RandomSongs = lazy(() => import("../../Components/RandomSongs.jsx"));

// --- Helper Components ---

/**
 * SectionHeading Component
 */
const SectionHeading = ({ emoji, title, subtitle }) => (
  <div className="group mb-8 border-b-2 border-transparent bg-gradient-to-r from-blue-400/20 to-cyan-500/20 bg-[length:0%_2px] pb-3 pl-1 pr-3 backdrop-blur-sm border-b-blue-400/50 hover:bg-[length:100%_2px] transition-all duration-500 inline-block rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5">
    <h2 
      className="text-sm font-heading3 tracking-[.25em] text-blue-400/80 uppercase font-semibold opacity-90 group-hover:opacity-100 transition-all"
      role="subtitle"
    >
      {subtitle}
    </h2>
    <h1 
      className="text-3xl md:text-4xl lg:text-5xl font-heading3 leading-[0.9] bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mt-1 drop-shadow-xl"
      role="heading"
      aria-level="2"
    >
      {emoji} {title}
    </h1>
  </div>
);

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


/**
 * PublicPlaylistsSection Component (Inline Logic)
 */
const PublicPlaylistsSection = () => {
  const playlistContext = usePlaylist(); 

  // 1. Context Null Check
  if (!playlistContext) {
    return (
        <p className="text-center text-red-400 p-8 text-lg border border-red-500/20 rounded-xl bg-black/30">
          Error: Playlist data provider is missing. Please ensure Homepage is wrapped in PlaylistProvider.
        </p>
    );
  }

  // Destructure safely now using the new state names from the updated context
  const { publicPlaylists, fetchPublicPlaylists, isLoadingPublic } = playlistContext;
  
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    // Only fetch if data hasn't been fetched and we have the function
    if (!dataFetched && fetchPublicPlaylists) {
      fetchPublicPlaylists();
      setDataFetched(true);
    }
  }, [fetchPublicPlaylists, dataFetched]);

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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-black to-[#1a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-black to-[#1a0a1a] text-white font-body overflow-x-hidden">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION - Improved with better mobile experience */}
      <section className="relative h-[80vh] md:h-[85vh] flex flex-col lg:flex-row px-4 md:px-10 lg:px-20 xl:px-28 items-center justify-center gap-6 lg:gap-12 pt-12 pb-16">
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
        <article className="relative z-10 w-full lg:w-3/5 space-y-4 backdrop-blur-xl bg-black/20 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.01] focus-within:ring-4 ring-blue-400/30">
          {/* Enhanced glow effect */}
          <div 
            className="absolute -inset-1 bg-gradient-to-r from-blue-400/15 via-transparent to-cyan-500/15 rounded-2xl blur opacity-75 animate-pulse-slow"
            style={{ animationDuration: '4s' }}
          />
          
          <header>
            <h1 
              className="text-xl md:text-3xl lg:text-4xl font-heading font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent tracking-wide drop-shadow-lg"
              role="banner"
            >
              Welcome {user?.first_name || "Guest"} 👋
            </h1>
            <p className="text-xs lg:text-sm tracking-[0.3em] font-heading2 font-semibold bg-gradient-to-r from-blue-400/90 to-cyan-400/90 bg-clip-text text-transparent uppercase pt-1">
              MUSIC LICENSING FOR FILM
            </p>
          </header>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black leading-tight bg-gradient-to-br from-white via-gray-100 to-gray-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight">
            Highly curated <br className="hidden md:block" /> music & sound effects.
          </h2>

          <p className="text-base md:text-lg text-gray-300 max-w-xl leading-relaxed backdrop-blur-sm pt-2">
            Trusted by filmmakers worldwide. Premium cinematic music and SFX collection.
          </p>

          {/* Improved Buttons with better focus states and keyboard navigation */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleCTA}
              className="group relative bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500 text-black px-8 md:px-10 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg tracking-wide shadow-2xl hover:shadow-3xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all duration-400 overflow-hidden border border-transparent font-heading2"
              aria-label="Create free account"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
              <span className="relative z-10">CREATE FREE ACCOUNT</span>
            </button>
            <button 
              className="border-2 border-white/30 text-white px-8 md:px-10 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg tracking-wide hover:bg-white/10 hover:border-white/60 backdrop-blur-sm transition-all duration-400 hover:scale-105 shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-400/50"
              aria-label="Browse music library"
            >
              Browse Library
            </button>
          </div>

          <p className="text-gray-400 text-sm md:text-base pt-3 font-medium">
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
      <section className="relative h-[60vh] md:h-[65vh] w-full overflow-hidden my-12 px-4 md:px-10 lg:px-20 xl:px-28">
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

      {/* CONTENT SECTIONS - Better loading states */}
      <main className="px-4 md:px-10 lg:px-20 xl:px-28 max-w-7xl mx-auto mb-20 space-y-24 lg:space-y-32">
        
        {/* 🚀 NEW SECTION: User's Private Playlists */}
        {user && (
          <section aria-labelledby="my-playlists">
            <SectionHeading  emoji="🎧" title={`${user.first_name}'s Playlists`} subtitle="Your Library" />
            {/* Myplaylist handles its own fetching and rendering logic */}
            <Myplaylist />
            <div className="mt-8 text-center">
              <Link 
                to="/my-library/playlists" 
                className="text-blue-400 hover:text-cyan-400 transition-colors font-semibold"
              >
                View All Your Playlists →
              </Link>
            </div>
          </section>
        )}
        {/* 🚀 END NEW SECTION */}

        <section aria-labelledby="curators-spotlight">
          <SectionHeading emoji="✨" title="Curator's Spotlight" subtitle="Staff Picks" />
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-72 bg-black/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          }>
            <RandomSongs />
          </Suspense>
        </section>

        <section aria-labelledby="top-charts">
          <SectionHeading emoji="🚀" title="The Industry's Hottest" subtitle="Top Charts" />
          <Suspense fallback={<div className="h-4 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full w-48 animate-pulse mx-auto" />}>
            <Topcharts />
          </Suspense>
        </section>

        <section aria-labelledby="most-liked">
          <SectionHeading emoji="💖" title="Filmmaker Favorites" subtitle="Most Liked" />
          <Suspense fallback={<div className="h-4 bg-gradient-to-r from-pink-400/30 to-blue-400/30 rounded-full w-48 animate-pulse mx-auto" />}>
            <Mostliked />
          </Suspense>
        </section>

        <section aria-labelledby="most-saved">
          <SectionHeading emoji="🎬" title="Essential Soundtracks" subtitle="Most Saved" />
          <Suspense fallback={<div className="h-4 bg-gradient-to-r from-green-400/30 to-cyan-400/30 rounded-full w-48 animate-pulse mx-auto" />}>
            <Mostsaved />
          </Suspense>
        </section>

        {/* Community Playlists (Original Public Section) */}
        <section aria-labelledby="public-playlists">
          <SectionHeading emoji="🌐" title="Community Playlists" subtitle="Featured Public Playlists" />
          <PublicPlaylistsSection />
        </section>
        
      </main>







    </div>
  );
};

export default Homepage;