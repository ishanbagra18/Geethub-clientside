
import { useNavigate } from 'react-router-dom';
import {
    Crown,
    Zap,
    Sparkles,
    ShieldCheck,
    ArrowRight,
    Music2,
    Download,
    Headphones,
    Check,
    Star,
} from 'lucide-react';

const PREMIUM_FEATURES = [
    {
        icon: Zap,
        title: 'Ad-free listening',
        description: 'Music without interruptions',
        color: 'text-amber-300',
        bg: 'bg-amber-400/10',
    },
    {
        icon: Music2,
        title: 'High-quality audio',
        description: 'Up to 320 kbps',
        color: 'text-cyan-300',
        bg: 'bg-cyan-400/10',
    },
    {
        icon: Download,
        title: 'Offline downloads',
        description: 'Listen on the go',
        color: 'text-violet-300',
        bg: 'bg-violet-400/10',
    },
    {
        icon: ShieldCheck,
        title: 'Exclusive VIP badge',
        description: 'Stand out from the crowd',
        color: 'text-emerald-300',
        bg: 'bg-emerald-400/10',
    },
];

const PremiumBanner = () => {
    const navigate = useNavigate();

    const isPremium =
        localStorage.getItem('user_is_premium') === 'true';

    return (
        <section className="premium-banner relative my-10 w-full font-sans sm:my-14">

            {/* Ambient background */}
            <div className="pointer-events-none absolute -left-10 top-10 -z-10 h-56 w-56 rounded-full bg-blue-500/[0.08] blur-[100px]" />
            <div className="pointer-events-none absolute -right-10 bottom-0 -z-10 h-56 w-56 rounded-full bg-violet-500/[0.08] blur-[100px]" />

            <div className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0c0c12] shadow-[0_24px_80px_rgba(0,0,0,0.24)]">

                {/* Top accent */}
                <div className="h-[2px] w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />

                {/* Background decoration */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-blue-500/[0.09] blur-[100px] transition-opacity duration-700" />
                    <div className="absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-violet-600/[0.08] blur-[100px]" />

                    <div className="absolute right-8 top-8 hidden h-40 w-40 items-center justify-center rounded-full border border-white/[0.035] sm:flex lg:right-20 lg:top-12 lg:h-64 lg:w-64">
                        <div className="flex h-[75%] w-[75%] items-center justify-center rounded-full border border-white/[0.04]">
                            <Crown className="h-12 w-12 text-white/[0.035] lg:h-20 lg:w-20" />
                        </div>
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 gap-9 p-5 sm:p-8 lg:grid-cols-[1fr_320px] lg:items-center lg:gap-12 lg:p-12 xl:grid-cols-[1fr_350px]">

                    {/* Left: Premium introduction */}
                    <div className="min-w-0">

                        {/* VIP label */}
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3.5 py-2">
                            <Crown className="h-4 w-4 text-amber-300" />

                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200 sm:text-[11px]">
                                {isPremium
                                    ? 'GEETHUB VIP MEMBER'
                                    : 'INTRODUCING GEETHUB VIP'}
                            </span>

                            <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.7)]" />
                        </div>

                        {/* Heading */}
                        <h2 className="max-w-2xl text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Your music.
                            <br />
                            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                                Your rules.
                            </span>
                        </h2>

                        <p className="mt-5 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
                            Make every listen count. Enjoy an elevated
                            music experience with fewer interruptions,
                            high-quality audio and exclusive VIP perks.
                        </p>

                        {/* Benefits */}
                        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                            {PREMIUM_FEATURES.map((feature) => {
                                const FeatureIcon = feature.icon;

                                return (
                                    <div
                                        key={feature.title}
                                        className="group/feature flex min-w-0 items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.045] sm:p-4"
                                    >
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${feature.bg} ${feature.color} transition-transform duration-300 group-hover/feature:scale-105`}
                                        >
                                            <FeatureIcon size={19} />
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="truncate text-xs font-semibold text-gray-100 sm:text-sm">
                                                {feature.title}
                                            </h3>

                                            <p className="mt-1 truncate text-[10px] text-gray-500 sm:text-xs">
                                                {feature.description}
                                            </p>
                                        </div>

                                        <Check className="ml-auto h-4 w-4 shrink-0 text-gray-600 transition-colors duration-300 group-hover/feature:text-emerald-400" />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Trust line */}
                        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-gray-500 sm:text-xs">
                            <span className="inline-flex items-center gap-2">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                Premium membership
                            </span>

                            <span className="inline-flex items-center gap-2">
                                <Headphones className="h-3.5 w-3.5 text-cyan-400" />
                                Made for music lovers
                            </span>
                        </div>
                    </div>

                    {/* Right: Pricing card */}
                    <aside className="relative min-w-0 overflow-hidden rounded-2xl border border-white/[0.10] bg-[#13131b]/95 p-5 shadow-2xl backdrop-blur-xl sm:p-7 lg:rounded-3xl">

                        {/* Pricing glow */}
                        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/[0.13] blur-[65px]" />
                        <div className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-violet-500/[0.10] blur-[65px]" />

                        <div className="relative">

                            {/* Plan heading */}
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                                        YOUR UPGRADE
                                    </p>

                                    <h3 className="mt-2 text-xl font-bold text-white">
                                        VIP Premium
                                    </h3>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/15 to-violet-500/15">
                                    <Sparkles className="h-6 w-6 text-blue-300" />
                                </div>
                            </div>

                            {/* Rating-style decoration */}
                            <div className="mt-5 flex items-center gap-1.5">
                                {[0, 1, 2, 3, 4].map((star) => (
                                    <Star
                                        key={star}
                                        size={13}
                                        className="fill-amber-300 text-amber-300"
                                    />
                                ))}

                                <span className="ml-1 text-[10px] text-gray-500">
                                    Your music, upgraded
                                </span>
                            </div>

                            {/* Price */}
                            <div className="mt-6 border-b border-white/[0.07] pb-6">
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                        $4.99
                                    </span>

                                    <span className="text-sm text-gray-500">
                                        / month
                                    </span>
                                </div>

                                <p className="mt-2 text-xs leading-5 text-gray-500">
                                    Everything you need for a better
                                    listening experience.
                                </p>
                            </div>

                            {/* Plan perks */}
                            <div className="my-5 space-y-3">
                                {[
                                    'Ad-free music listening',
                                    'High-quality audio',
                                    'Offline listening benefits',
                                ].map((perk) => (
                                    <div
                                        key={perk}
                                        className="flex items-center gap-2.5 text-xs text-gray-300"
                                    >
                                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                                            <Check
                                                size={10}
                                                className="text-emerald-400"
                                            />
                                        </span>

                                        {perk}
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <button
                                type="button"
                                onClick={() => navigate('/premium')}
                                className="group/cta relative flex min-h-[50px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_25px_rgba(79,70,229,0.2)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_10px_35px_rgba(79,70,229,0.32)] active:scale-[0.98]"
                            >
                                <span className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover/cta:bg-white/[0.07]" />

                                <span className="relative">
                                    {isPremium
                                        ? 'View VIP Dashboard'
                                        : 'Explore VIP Premium'}
                                </span>

                                <ArrowRight
                                    size={17}
                                    className="relative transition-transform duration-300 group-hover/cta:translate-x-1"
                                />
                            </button>

                            <p className="mt-4 text-center text-[10px] leading-5 text-gray-500">
                                {isPremium
                                    ? 'Thanks for being part of GeetHub VIP.'
                                    : 'View available plans and membership details.'}
                            </p>
                        </div>
                    </aside>
                </div>
            </div>

            <style>{`
                @media (prefers-reduced-motion: reduce) {
                    .premium-banner *,
                    .premium-banner *::before,
                    .premium-banner *::after {
                        scroll-behavior: auto !important;
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default PremiumBanner;
