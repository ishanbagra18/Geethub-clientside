
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Check,
  ArrowLeft,
  Music2,
  ShieldCheck,
  Sparkles,
  Save,
  Loader2,
  RotateCcw,
  ChevronRight,
  Headphones,
  AudioLines,
  CircleUserRound,
  BadgeCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
import Navbar from "../../Components/Navbar";

const API_BASE = API_BASE_URL;

const PROFILE_EMOJIS = [
  "",
  "🎧", "🎸", "⚡", "🔥", "🎵", "🚀", "👑", "👽",
  "🦊", "💎", "🌊", "🎹", "🎙️", "🌟", "🦄", "👾",
];

const getUidFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.Uid || payload.uid;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const UpdateProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = getUidFromToken();

        if (!token || !userId) {
          throw new Error("Not authenticated");
        }

        const { data } = await axios.get(
          `${API_BASE}/auth/myprofile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!active) return;

        const user = data.user || data;

        setFormData({
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          email: user.email || "",
          phone: user.phone || "",
        });

        const currentEmoji =
          user.emoji !== undefined
            ? user.emoji
            : localStorage.getItem("user_emoji") || "";

        setSelectedEmoji(currentEmoji);
      } catch (error) {
        console.error("Error loading profile:", error);

        if (active) {
          toast.error("Failed to load profile details");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const userId = getUidFromToken();

      if (!token || !userId) {
        throw new Error("Not authenticated");
      }

      await axios.put(
        `${API_BASE}/auth/updateprofile/${userId}`,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          emoji: selectedEmoji,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem("user_emoji", selectedEmoji);

      toast.success("Profile updated successfully!");

      setTimeout(() => {
        navigate("/myprofile");
      }, 900);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Unable to update profile";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const initials =
    `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`
      .toUpperCase() || "U";

  const displayName =
    `${formData.firstName} ${formData.lastName}`.trim() ||
    "Your Name";

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-[#101722] dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-blue-500";

  const labelClass =
    "mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300";

  const panelClass =
    "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:bg-[#171D29]";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0D121B]">
        <Navbar />
        <Toaster position="top-right" />

        <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
            <Loader2
              size={30}
              className="animate-spin text-[#3B82F6]"
            />
          </div>

          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Preparing your profile
          </p>

          <p className="text-xs text-slate-400">
            Getting everything ready for you...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F6F8FC] font-sans text-slate-900 selection:bg-blue-500/20 dark:bg-[#0D121B] dark:text-white">

      <Navbar />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "14px",
            fontSize: "13px",
          },
        }}
      />

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-32 h-96 w-96 rounded-full bg-blue-500/[0.07] blur-[100px] dark:bg-blue-500/[0.09]" />
        <div className="absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-indigo-500/[0.05] blur-[110px] dark:bg-indigo-500/[0.07]" />
        <div className="absolute bottom-0 left-[35%] h-72 w-72 rounded-full bg-cyan-500/[0.04] blur-[100px] dark:bg-cyan-500/[0.04]" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-7 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="transition hover:text-blue-500"
          >
            Home
          </button>

          <ChevronRight size={13} />

          <button
            type="button"
            onClick={() => navigate("/myprofile")}
            className="transition hover:text-blue-500"
          >
            My Profile
          </button>

          <ChevronRight size={13} />

          <span className="font-semibold text-[#3B82F6]">
            Edit Profile
          </span>
        </div>

        {/* Page heading */}
        <header className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.17em] text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-400">
              <Sparkles size={13} />
              Personalize your experience
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-[46px]">
              Make it <span className="text-[#3B82F6]">yours.</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              A little about you goes a long way. Update your details,
              pick your vibe, and make your GeetHub profile feel like you.
            </p>
          </div>

          <div className="flex w-fit shrink-0 items-center gap-2.5 rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 shadow-sm dark:border-emerald-500/20 dark:bg-[#171D29]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ShieldCheck size={17} />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Your account
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                Profile settings
              </p>
            </div>
          </div>
        </header>

        {/* Main layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">

          {/* LEFT: Profile preview */}
          <aside className="space-y-5 lg:col-span-4">

            <section className={`${panelClass} overflow-hidden`}>

              {/* Cover */}
              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#172D53] via-[#244B87] to-[#3B82F6] sm:h-40">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.18),transparent_35%)]" />

                <div className="absolute -right-7 -top-16 h-52 w-52 rounded-full border border-white/10" />
                <div className="absolute -right-1 -top-10 h-40 w-40 rounded-full border border-white/10" />
                <div className="absolute -bottom-24 left-12 h-48 w-48 rounded-full border border-white/[0.08]" />

                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-50">
                  <AudioLines size={14} />
                  Your sound. Your style.
                </div>

                <Music2
                  size={85}
                  strokeWidth={0.8}
                  className="absolute bottom-2 right-5 rotate-[-12deg] text-white/[0.10]"
                />
              </div>

              {/* Profile details */}
              <div className="px-5 pb-6 sm:px-6">

                <div className="-mt-12 mb-4 flex items-end justify-between">
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-[25px] border-[5px] border-white bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl shadow-xl shadow-blue-900/10 dark:border-[#171D29]">
                    <div className="flex h-full w-full items-center justify-center rounded-[19px] bg-white/10">
                      {selectedEmoji || initials}
                    </div>

                    <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-emerald-500 text-white dark:border-[#171D29]">
                      <Check size={13} strokeWidth={3} />
                    </div>
                  </div>

                  <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-400">
                    <BadgeCheck size={13} />
                    PREVIEW
                  </span>
                </div>

                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  YOUR PROFILE
                </p>

                <h2 className="break-words text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {displayName}
                </h2>

                <p className="mt-1.5 break-all text-sm text-slate-500 dark:text-slate-400">
                  {formData.email || "Add your email address"}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-[#101722] dark:text-slate-300">
                    <Headphones size={14} className="text-[#3B82F6]" />
                    Music Lover
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-[#101722] dark:text-slate-300">
                    <Sparkles size={13} className="text-indigo-500" />
                    GeetHub
                  </span>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-700/70">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Avatar preview
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Updates live
                    </span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700/70 dark:bg-[#101722]">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-500/10">
                      {selectedEmoji || initials}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {selectedEmoji ? "Custom avatar" : "Initials avatar"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {selectedEmoji
                          ? `Using ${selectedEmoji} as your avatar`
                          : `Using ${initials} as your avatar`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tip card */}
            <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 dark:border-blue-400/15 dark:from-[#17243A] dark:to-[#151D2A]">
              <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-blue-500/[0.07] blur-2xl" />

              <div className="relative flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#3B82F6] dark:bg-blue-500/15">
                  <Sparkles size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Make it memorable
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    Choose an avatar that represents your personality.
                    Your updated profile details will be saved to your account.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT: Editing form */}
          <section className="lg:col-span-8">
            <div className={`${panelClass} overflow-hidden`}>

              {/* Form header */}
              <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6 dark:border-slate-700/70">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-[#3B82F6] dark:border-blue-400/20 dark:bg-blue-500/10">
                  <CircleUserRound size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">
                    Personal information
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
                    Keep your details accurate and up to date.
                  </p>
                </div>

                <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 dark:bg-[#101722] sm:flex">
                  <User size={17} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5 sm:p-7">

                {/* Avatar section */}
                <div className="mb-8">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Choose your avatar
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Pick an emoji or use your initials.
                      </p>
                    </div>

                    <span className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-400">
                      {selectedEmoji || "Initials"}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-[#F8FAFD] p-3 sm:p-4 dark:border-slate-700/80 dark:bg-[#101722]">
                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-9">

                      {PROFILE_EMOJIS.map((emoji, index) => {
                        const active = selectedEmoji === emoji;

                        return (
                          <button
                            key={emoji || "none"}
                            type="button"
                            onClick={() => setSelectedEmoji(emoji)}
                            aria-label={
                              emoji
                                ? `Select ${emoji} avatar`
                                : "Use initials as avatar"
                            }
                            aria-pressed={active}
                            className={`group relative flex aspect-square items-center justify-center rounded-xl border text-xl transition-all duration-200 sm:text-2xl ${
                              active
                                ? "border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-500/20 dark:bg-blue-500/15"
                                : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-[#171D29] dark:hover:border-blue-500/50 dark:hover:bg-blue-500/[0.06]"
                            }`}
                          >
                            {emoji || (
                              <span className="flex flex-col items-center gap-0.5">
                                <User size={17} className="text-slate-500" />
                                <span className="text-[8px] font-extrabold uppercase text-slate-400">
                                  None
                                </span>
                              </span>
                            )}

                            {active && (
                              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#3B82F6] text-white shadow-sm">
                                <Check size={10} strokeWidth={3} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Section divider */}
                <div className="mb-7 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700/70" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
                    Account details
                  </span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700/70" />
                </div>

                {/* Name fields */}
                <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className={labelClass}>
                      First name
                    </label>

                    <div className="relative">
                      <User
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Your first name"
                        autoComplete="given-name"
                        required
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className={labelClass}>
                      Last name
                    </label>

                    <div className="relative">
                      <User
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Your last name"
                        autoComplete="family-name"
                        required
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="mb-5">
                  <label htmlFor="email" className={labelClass}>
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="mb-7">
                  <label htmlFor="phone" className={labelClass}>
                    Phone number
                  </label>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Your phone number"
                      autoComplete="tel"
                      required
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                {/* Save section */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-slate-700/70 dark:bg-[#101722]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <ShieldCheck size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          All set?
                        </p>
                        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">
                          Save your changes to update your GeetHub profile.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => navigate("/myprofile")}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-[#171D29] dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <RotateCcw size={15} />
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 py-6 sm:flex-row dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-[#3B82F6]">
              <Music2 size={17} />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-slate-700 dark:text-slate-300">
              GeetHub
            </span>
            <span className="text-xs text-slate-400">
              · Every mood has a song.
            </span>
          </div>

          <p className="text-center text-xs text-slate-400">
            Your profile. Your music. Your identity.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default UpdateProfile;
