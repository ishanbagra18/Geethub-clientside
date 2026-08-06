import { useNavigate } from 'react-router-dom';
import { Crown, Zap, Sparkles, ShieldCheck, ArrowRight, Music, Download } from 'lucide-react';

const PremiumBanner = () => {
  const navigate = useNavigate();
  const isPremium = localStorage.getItem("user_is_premium") === "true";

  return (
    <section className="relative w-full overflow-hidden rounded-3xl my-12 p-8 md:p-12 border border-blue-500/30 bg-gradient-to-br from-[#081326] via-[#090d1a] to-[#120a2a] shadow-[0_20px_60px_rgba(59,130,246,0.15)] group transition-all duration-500 hover:shadow-[0_25px_70px_rgba(59,130,246,0.25)]">
      {/* Decorative Glow Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-600/20 transition-all duration-700"></div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Column: Heading & Perks */}
        <div className="space-y-5 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border border-blue-500/40 backdrop-blur-md">
            <Crown className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">
              {isPremium ? "GEETHUB VIP ACTIVE" : "GEETHUB VIP MEMBERSHIP"}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Elevate Your Music Experience <br />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-blue-500 bg-clip-text text-transparent">
              With GeetHub VIP Premium
            </span>
          </h2>

          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            Unlock uninterrupted high-fidelity audio, ad-free listening, unlimited offline downloads, and exclusive creator badges today.
          </p>

          {/* Perks Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-200 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Ad-Free Music</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-200 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
              <Music className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>Ultra HD 320kbps</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-200 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
              <Download className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>Offline Downloads</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-200 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>VIP Crown Badge</span>
            </div>
          </div>
        </div>

        {/* Right Column: CTA Box */}
        <div className="w-full lg:w-auto flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl bg-white/5 border border-blue-500/20 backdrop-blur-xl shadow-2xl text-center min-w-[280px]">
          <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/40">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <p className="text-xs uppercase font-bold tracking-widest text-cyan-400 mb-1">
            UNLIMITED ACCESS
          </p>
          <div className="text-3xl font-black text-white mb-4">
            $4.99 <span className="text-sm font-normal text-gray-400">/ month</span>
          </div>

          <button
            onClick={() => navigate("/premium")}
            className="w-full group/btn relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-400 shadow-xl shadow-blue-500/30 hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isPremium ? "View VIP Dashboard" : "Upgrade to VIP Now"}
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
          </button>

          <p className="text-gray-400 text-xs mt-3">
            Cancel anytime • Instant activation
          </p>
        </div>

      </div>
    </section>
  );
};

export default PremiumBanner;