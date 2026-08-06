import React, { useState } from "react";
import Navbar from "../../Components/Navbar";
import { 
  Crown, Sparkles, Zap, ShieldCheck, Music, Radio, Check, 
  Volume2, Lock, Flame, Award, ArrowRight 
} from "lucide-react";
import toast from "react-hot-toast";

const PRIVILEGES = [
  {
    icon: <Volume2 className="w-6 h-6 text-cyan-400" />,
    title: "Ultra HD Lossless Sound",
    desc: "Stream every track in studio master 320kbps high-definition audio quality.",
  },
  {
    icon: <Zap className="w-6 h-6 text-cyan-400" />,
    title: "Zero Ads & Unlimited Skips",
    desc: "Enjoy non-stop continuous music playback without any interruptions.",
  },
  {
    icon: <Lock className="w-6 h-6 text-cyan-400" />,
    title: "Unlimited Private Playlists",
    desc: "Create and share unlisted private playlists with custom artwork & tags.",
  },
  {
    icon: <Crown className="w-6 h-6 text-cyan-400" />,
    title: "VIP Crown Badge & Emoji Perks",
    desc: "Stand out with an exclusive blue VIP crown ring on your avatar and chats.",
  },
  {
    icon: <Radio className="w-6 h-6 text-cyan-400" />,
    title: "Priority Music Sharing",
    desc: "Send direct playable music & playlist preview cards inside chat messages.",
  },
  {
    icon: <Award className="w-6 h-6 text-cyan-400" />,
    title: "Advanced Replay Analytics",
    desc: "Unlock personal listening stats, top artists data, and monthly recaps.",
  },
];

const PLANS = [
  {
    id: "student",
    name: "Student VIP",
    price: "₹49",
    period: "/ month",
    discount: "50% Student Discount",
    features: [
      "Ultra HD 320kbps audio",
      "Ad-free listening",
      "Unlimited skips",
      "VIP Profile Badge",
    ],
    popular: false,
    color: "from-blue-900/30 to-indigo-900/30 border-blue-500/30",
  },
  {
    id: "individual",
    name: "GeetHub VIP Pass",
    price: "₹119",
    period: "/ month",
    discount: "Includes 30-Day Free Trial",
    features: [
      "All Student VIP features",
      "Unlimited Private Playlists",
      "Direct Link Music Sharing in Chat",
      "Cyan Crown Avatar Ring",
      "Advanced Listening Analytics",
    ],
    popular: true,
    color: "from-blue-600/20 via-cyan-500/20 to-indigo-600/20 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)]",
  },
  {
    id: "annual",
    name: "Annual VIP Pass",
    price: "₹999",
    period: "/ year",
    discount: "Save 30% Yearly",
    features: [
      "12 Months of Full Premium Access",
      "All VIP Features Included",
      "Priority Customer Support",
      "Exclusive Beta Feature Previews",
    ],
    popular: false,
    color: "from-indigo-600/30 to-purple-600/30 border-indigo-500/40",
  },
];

const COMPARISON = [
  { feature: "Audio Bitrate & Sound Quality", free: "128kbps Standard", premium: "320kbps HD Lossless" },
  { feature: "Ad Disruptions", free: "Ad Supported", premium: "Zero Ads (100% Ad-Free)" },
  { feature: "Song Skips", free: "Limited Skips", premium: "Unlimited Skips" },
  { feature: "Private Playlists Creation", free: "Max 2 Playlists", premium: "Unlimited Private Playlists" },
  { feature: "Direct Music Link Sharing in Chat", free: "Basic Text Links", premium: "Interactive Playable Cards" },
  { feature: "Profile Crown Badge", free: "Standard", premium: "Cyan VIP Crown Ring 👑" },
  { feature: "Listening Analytics & Insights", free: "Basic", premium: "Deep Monthly Recaps" },
];

const PremiumPage = () => {
  const [isPremium, setIsPremium] = useState(localStorage.getItem("user_is_premium") === "true");

  const handleUpgrade = (planName) => {
    localStorage.setItem("user_is_premium", "true");
    setIsPremium(true);
    window.dispatchEvent(new Event("user_profile_updated"));
    toast.success(`🎉 Congratulations! You are now a GeetHub VIP (${planName})!`, {
      duration: 5000,
      icon: "👑",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#081026] via-[#040817] to-[#02040a] text-white font-sans selection:bg-cyan-500/30">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-28 pb-32">
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs uppercase tracking-widest mb-4 shadow-lg">
            <Crown size={14} className="fill-cyan-300" />
            <span>GeetHub VIP Membership</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-cyan-200 via-sky-400 to-blue-500 bg-clip-text text-transparent">
            Experience Music Without Limits
          </h1>

          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Upgrade to GeetHub Premium for HD 320kbps studio sound, unlimited private playlists, ad-free listening, and exclusive VIP profile privileges.
          </p>

          {isPremium && (
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-sm shadow-xl animate-pulse">
              <Crown size={18} className="fill-cyan-300" /> You are an active GeetHub VIP Member!
            </div>
          )}
        </div>

        {/* PRIVILEGES GRID */}
        <div className="mb-20">
          <h2 className="text-2xl font-black text-center mb-8 text-white flex items-center justify-center gap-2">
            <Sparkles size={22} className="text-cyan-400" />
            <span>Why Upgrade to Premium?</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRIVILEGES.map((p, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#0d1630]/80 border border-white/10 hover:border-cyan-400/40 transition-all duration-300 shadow-xl group hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  {p.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PRICING PLANS */}
        <div className="mb-20">
          <h2 className="text-2xl font-black text-center mb-10 text-white">Choose Your VIP Plan</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 bg-[#0d1630]/90 border ${plan.color} relative flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-2xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-black text-[11px] uppercase tracking-wider shadow-lg">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block mb-4">
                    {plan.discount}
                  </span>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                        <Check size={14} className="text-cyan-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.name)}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white shadow-blue-500/30"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
                  }`}
                >
                  <span>{isPremium ? "Renew VIP Plan" : "Upgrade to VIP"}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* COMPARISON TABLE */}
        <div className="bg-[#0d1630]/80 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-2xl font-black text-center mb-8 text-white">Compare Plans</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
                  <th className="pb-4 font-bold">Privilege Feature</th>
                  <th className="pb-4 font-bold text-slate-400">Free Plan</th>
                  <th className="pb-4 font-bold text-cyan-400 flex items-center gap-1">
                    <Crown size={14} className="fill-cyan-400" /> GeetHub VIP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {COMPARISON.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition">
                    <td className="py-4 font-semibold text-white">{row.feature}</td>
                    <td className="py-4 text-slate-400">{row.free}</td>
                    <td className="py-4 font-bold text-cyan-300">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PremiumPage;