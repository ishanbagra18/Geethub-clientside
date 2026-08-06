import { Link, useNavigate } from "react-router-dom";
import { 
  FaMusic, FaInstagram, FaTwitter, 
  FaYoutube, FaGithub, FaDiscord 
} from "react-icons/fa";
import { Sparkles, ListMusic, Shield, Heart } from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();

  const columns = [
    {
      title: "Discover",
      icon: Sparkles,
      iconColor: "text-blue-400",
      links: [
        { label: "Trending Hits", to: "/trending" },
        { label: "Most Liked", to: "/mostliked" },
        { label: "Hindi Bollywood", to: "/hindisongs" },
        { label: "Punjabi Beat Tracks", to: "/punjabisongs" },
        { label: "Industry Top Charts", to: "/topcharts" },
      ],
    },
    {
      title: "Community",
      icon: ListMusic,
      iconColor: "text-cyan-400",
      links: [
        { label: "My Playlists Hub", to: "/myplaylists" },
        { label: "Community Mixes", to: "/communityplaylists" },
        { label: "Messages & Chat", to: "/messages" },
        { label: "GeetHub VIP Premium", to: "/premium" },
        { label: "Your Library", to: "/mylibrary" },
      ],
    },
    {
      title: "Account & Legal",
      icon: Shield,
      iconColor: "text-indigo-400",
      links: [
        { label: "My Profile", to: "/myprofile" },
        { label: "Update Settings", to: "/updateprofile" },
        { label: "Create Free Account", to: "/signup" },
        { label: "Privacy Policy", to: "/privacy" },
      ],
    },
  ];

  const socials = [
    { icon: FaInstagram, href: "https://www.instagram.com/geethub.music/", label: "Instagram", color: "hover:bg-pink-600" },
    { icon: FaTwitter, href: "https://twitter.com", label: "Twitter", color: "hover:bg-cyan-500" },
    { icon: FaGithub, href: "https://github.com", label: "GitHub", color: "hover:bg-gray-700" },
    { icon: FaYoutube, href: "https://youtube.com", label: "YouTube", color: "hover:bg-red-600" },
    { icon: FaDiscord, href: "https://discord.com", label: "Discord", color: "hover:bg-indigo-600" },
  ];

  return (
    <footer className="w-full bg-[#050811] text-white border-t border-blue-500/20 pt-16 pb-36 px-6 md:px-12 lg:px-20 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Spread Flex Layout: Brand on Left, Link Columns Spread out on Right */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-16 xl:gap-24 pb-14 border-b border-white/10">

          {/* Left Section: Brand & Bio */}
          <div className="lg:w-5/12 space-y-4">
            <div
              className="flex items-center gap-3 cursor-pointer group w-fit"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition">
                <FaMusic className="text-white text-lg" />
              </div>
              <span className="text-3xl font-black tracking-tight text-white">
                Geet<span className="text-blue-400">Hub</span>
              </span>
            </div>

            {/* Official Tagline */}
            <p className="text-base font-extrabold bg-gradient-to-r from-blue-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              "Stream the beat, share the vibe."
            </p>

            <p className="text-xs text-gray-400 max-w-md leading-relaxed">
              GeetHub is a next-generation HD music streaming platform. Discover curated playlists, stream high-fidelity tracks, and connect with music creators worldwide.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {socials.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={`w-9 h-9 rounded-full bg-white/5 ${color} flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 shadow-md`}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Right Section: 3 Link Columns Spread Across Width */}
          <div className="lg:w-7/12 w-full grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
            {columns.map((col) => {
              const ColumnIcon = col.icon;
              return (
                <div key={col.title} className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-200 flex items-center gap-2 border-b border-white/10 pb-2.5">
                    <ColumnIcon size={15} className={col.iconColor} />
                    <span>{col.title}</span>
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          className="text-xs text-gray-400 hover:text-cyan-300 transition-colors duration-200 font-medium block hover:translate-x-1 transform"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
          <div>
            © {new Date().getFullYear()} GeetHub Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-1.5 text-gray-400 font-semibold">
            <span>Crafted with</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>for music lovers worldwide.</span>
          </div>

          <div className="text-blue-400 font-extrabold tracking-wide">
            Stream the beat, share the vibe.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;