import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { User, Mail, Phone, Smile, Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from '../config/api';

const API_BASE = API_BASE_URL;

const PROFILE_EMOJIS = [
  "", "🎧", "🎸", "⚡", "🔥", "🎵", "🚀", "👑", "👽",
  "🦊", "💎", "🌊", "🎹", "🎙️", "🌟", "🦄", "👾"
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
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const userId = getUidFromToken();
        if (!token || !userId) throw new Error("Not authenticated");

        const { data } = await axios.get(`${API_BASE}/auth/myprofile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = data.user || data;

        setFormData({
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          email: user.email || "",
          phone: user.phone || "",
        });
        const currentEmoji = user.emoji !== undefined ? user.emoji : (localStorage.getItem("user_emoji") || "");
        setSelectedEmoji(currentEmoji);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile details");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const userId = getUidFromToken();
      if (!token || !userId) throw new Error("Not authenticated");

      const { data } = await axios.put(
        `${API_BASE}/auth/updateprofile/${userId}`,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          emoji: selectedEmoji,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.setItem("user_emoji", selectedEmoji);
      toast.success("Profile & Avatar updated successfully!");
      setTimeout(() => navigate("/myprofile"), 1000);
    } catch (err) {
      const text = err.response?.data?.message || err.message;
      toast.error(text);
    } finally {
      setSaving(false);
    }
  };

  const initials = `${formData.firstName?.[0] || ""}${formData.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#050509] text-white flex justify-center items-center px-4 py-8 md:py-12 font-sans relative overflow-hidden">
      <Toaster position="top-right" />

      {/* Subtle Glow backdrop */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="flex flex-col md:flex-row rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden border border-white/10 bg-[#0d0e17]/90 backdrop-blur-2xl z-10">

        {/* LEFT SIDE PROFILE SUMMARY */}
        <div className="md:w-1/3 bg-gradient-to-b from-[#161826] to-[#0d0e17] p-8 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/10 relative">
          <div className="w-full">
            <button
              onClick={() => navigate("/myprofile")}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition mb-6"
            >
              <ArrowLeft size={16} /> Back to Profile
            </button>
          </div>

          <div className="flex flex-col items-center text-center my-6">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-1 shadow-2xl mb-4 relative group">
              <div className="w-full h-full rounded-[22px] bg-[#0d0e17] flex items-center justify-center text-5xl font-black text-blue-400 relative overflow-hidden">
                {selectedEmoji ? (
                  <span>{selectedEmoji}</span>
                ) : (
                  <span>{initials || "👤"}</span>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              {formData.firstName || "User"} {formData.lastName}
            </h3>
            <p className="text-xs text-blue-400 font-medium mb-4">{formData.email || "No email"}</p>

            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold">
              {selectedEmoji ? `Avatar: ${selectedEmoji}` : "No Emoji (Default Initials)"}
            </span>
          </div>

          <div className="text-center text-xs text-slate-500 pt-4 border-t border-white/5 w-full">
            Updates will reflect across all playlists and active chat conversations.
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="md:w-2/3 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Update Account</h1>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">Modify your profile info and avatar emoji below</p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* EMOJI SELECTOR WITH NONE OPTION */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                  <span>Profile Emoji Avatar</span>
                  <span className="text-[11px] text-blue-400 font-normal">
                    {selectedEmoji ? `Selected: ${selectedEmoji}` : "No Emoji Selected"}
                  </span>
                </label>

                <div className="p-3 rounded-2xl bg-[#131522] border border-white/10 grid grid-cols-6 sm:grid-cols-9 gap-2">
                  {/* None Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedEmoji("")}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${selectedEmoji === ""
                        ? 'bg-blue-600 text-white border-2 border-blue-400 scale-105 shadow-lg shadow-blue-500/40'
                        : 'bg-white/5 hover:bg-white/15 text-slate-400 border border-transparent'
                      }`}
                    title="No Emoji Avatar (Use Default Initials)"
                  >
                    <span>🚫</span>
                    <span className="text-[8px] uppercase">None</span>
                  </button>

                  {/* Emoji List */}
                  {PROFILE_EMOJIS.filter(e => e !== "").map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xl flex items-center justify-center transition-all ${selectedEmoji === emoji
                          ? 'bg-blue-600 border-2 border-blue-400 scale-110 shadow-lg shadow-blue-500/40'
                          : 'bg-white/5 hover:bg-white/15 border border-transparent hover:scale-105'
                        }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* FIRST & LAST NAME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full pl-4 pr-4 py-2.5 rounded-xl bg-[#131522] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full pl-4 pr-4 py-2.5 rounded-xl bg-[#131522] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-4 pr-4 py-2.5 rounded-xl bg-[#131522] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-4 pr-4 py-2.5 rounded-xl bg-[#131522] border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? "Saving Changes..." : "Save Profile Changes"}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UpdateProfile;
