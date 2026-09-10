import { Link, useNavigate } from "react-router-dom";
import {
  FaMusic,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaGithub,
  FaDiscord,
} from "react-icons/fa";
import { Sparkles, Send, ShieldCheck, Heart, Radio, Headphones } from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-black text-white border-t border-white/10 pt-16 pb-28 px-6 md:px-12 lg:px-20 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="absolute -top-40 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">

        {/* Main Footer Links & Branding Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div
              className="flex items-center gap-3 cursor-pointer group w-fit"
              onClick={() => navigate("/")}
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
                <FaMusic className="text-white text-xl" />
              </div>
              <span className="text-3xl font-black tracking-tight text-white">
                Geet<span className="text-cyan-400">Hub</span>
              </span>
            </div>

            <p className="text-xs font-black uppercase tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
              Desi vibes, global beats — Your ultimate Indian music destination 🇮🇳🎧
            </p>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              An immersive HD music streaming experience built for audiophiles and creators worldwide. Discover, stream, and share without limits.
            </p>

            {/* Platform Stats Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-300">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                <Headphones size={14} className="text-cyan-400" />
                <span>Lossless Audio</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                <Radio size={14} className="text-purple-400" />
                <span>24/7 Live Radio</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-2">
              {[
                { icon: FaInstagram, href: "https://www.instagram.com/geethub.music/", label: "Instagram" },
                { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
                { icon: FaGithub, href: "https://github.com", label: "GitHub" },
                { icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
                { icon: FaDiscord, href: "https://discord.com", label: "Discord" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Navigation Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1 */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Explore
              </p>
              <ul className="space-y-2.5 text-xs font-medium text-gray-400">
                <li><Link to="/trending" className="hover:text-white transition">Trending Hits</Link></li>
                <li><Link to="/mostliked" className="hover:text-white transition">Most Liked</Link></li>
                <li><Link to="/hindisongs" className="hover:text-white transition">Hindi Bollywood</Link></li>
                <li><Link to="/punjabisongs" className="hover:text-white transition">Punjabi Beats</Link></li>
                <li><Link to="/topcharts" className="hover:text-white transition">Global Top Charts</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Library
              </p>
              <ul className="space-y-2.5 text-xs font-medium text-gray-400">
                <li><Link to="/myplaylists" className="hover:text-white transition">Playlists Hub</Link></li>
                <li><Link to="/communityplaylists" className="hover:text-white transition">Community Mixes</Link></li>
                <li><Link to="/messages" className="hover:text-white transition">Chat & Messages</Link></li>
                <li><Link to="/premium" className="hover:text-white transition">GeetHub VIP</Link></li>
                <li><Link to="/mylibrary" className="hover:text-white transition">Your Collection</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="space-y-4 col-span-2 sm:col-span-1">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Account
              </p>
              <ul className="space-y-2.5 text-xs font-medium text-gray-400">
                <li><Link to="/myprofile" className="hover:text-white transition">My Profile</Link></li>
                <li><Link to="/updateprofile" className="hover:text-white transition">Account Settings</Link></li>
                <li><Link to="/signup" className="hover:text-white transition">Create Free Account</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy & Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
          <p>© {new Date().getFullYear()} GeetHub Music Inc. All rights reserved.</p>

          <div className="flex items-center gap-1.5 text-gray-400">
            <span>Crafted with</span>
            <Heart size={13} className="text-red-500 fill-red-500 animate-pulse" />
            <span>for music lovers worldwide</span>
          </div>

          <div className="flex items-center gap-2 text-cyan-400/80 font-medium">
            <ShieldCheck size={14} />
            <span>Secure Audio Streaming</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;