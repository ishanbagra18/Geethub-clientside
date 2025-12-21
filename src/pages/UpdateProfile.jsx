import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import UpdateProfileCard from "../../Components/UpdateProfileCard";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:9000";

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
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const userId = getUidFromToken();
        if (!token || !userId) throw new Error("Not authenticated");

        const { data } = await axios.get(`${API_BASE}/myprofile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = data.user || data;

        setFormData({
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      } catch (err) {
        console.error(err);
        const text = err.response?.data?.message || err.message;
        setMessage({ type: "error", text });
        toast.error(text);
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
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const userId = getUidFromToken();
      if (!token || !userId) throw new Error("Not authenticated");

      const { data } = await axios.put(
        `${API_BASE}/updateprofile/${userId}`,
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Profile updated!");
      const updated = data.user || data;
      setFormData({
        firstName: updated.first_name || "",
        lastName: updated.last_name || "",
        email: updated.email || "",
        phone: updated.phone || "",
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      const text = err.response?.data?.message || err.message;
      setMessage({ type: "error", text });
      toast.error(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center px-6 py-12"
      style={{
        background: "radial-gradient(circle at top right, #0a192f, #020617)",
        color: "#F0F9FF",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Toaster position="top-right" />

      {/* Main Glass Container */}
      <div 
        className="flex flex-col md:flex-row rounded-3xl shadow-[0_0_50px_rgba(0,210,255,0.1)] max-w-5xl w-full overflow-hidden border border-blue-500/10"
        style={{ backdropFilter: "blur(10px)", background: "rgba(15, 23, 42, 0.4)" }}
      >
        
        {/* LEFT SIDE CARD */}
        <div className="md:w-1/3 bg-blue-600/5 p-4 flex items-center justify-center border-r border-white/5">
          <UpdateProfileCard
            firstName={formData.firstName}
            lastName={formData.lastName}
            phone={formData.phone}
            email={formData.email}
          />
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="md:w-2/3 p-8 md:p-12 relative">
          {/* Subtle Glow Decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px] rounded-full"></div>
          
          <h1
            className="text-3xl font-bold mb-8 tracking-tight"
            style={{
              background: "linear-gradient(to right, #38bdf8, #818cf8)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Account Settings
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: "firstName", label: "First Name" },
                { key: "lastName", label: "Last Name" },
                { key: "email", label: "Email Address" },
                { key: "phone", label: "Phone Number" }
              ].map((field) => (
                <div key={field.key} className="group">
                  <label
                    className="block mb-2 text-xs font-semibold uppercase tracking-widest text-blue-300/70"
                  >
                    {field.label}
                  </label>

                  <input
                    type={field.key === "email" ? "email" : "text"}
                    name={field.key}
                    value={formData[field.key]}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className="w-full rounded-xl px-4 py-3 bg-blue-950/30 border border-blue-500/20 text-blue-50 placeholder-blue-700/50 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all duration-300 shadow-inner"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(0,210,255,0.3)]"
                style={{
                  background: "linear-gradient(135deg, #007cf0 0%, #00dfd8 100%)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

            {message.text && (
              <div
                className={`p-4 rounded-xl text-sm text-center border animate-pulse ${
                  message.type === "error" 
                    ? "bg-red-500/10 border-red-500/20 text-red-400" 
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}
              >
                {message.type === "error" ? "✕" : "✓"} {message.text}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;