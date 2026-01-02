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
        `${API_BASE}/auth/updateprofile/${userId}`,
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
        background: "#000000",              // pure black page
        color: "#f9fafb",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Toaster position="top-right" />

      {/* Main Glass Container */}
      <div
        className="flex flex-col md:flex-row rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] max-w-5xl w-full overflow-hidden border border-[#18181b]"
        style={{
          background: "#050509",
        }}
      >
        {/* LEFT SIDE PROFILE SUMMARY CARD */}
        <div className="md:w-1/3 bg-gradient-to-b from-[#18181b] to-[#050509] p-10 flex flex-col items-center justify-center border-r border-[#18181b] relative min-h-[520px] md:min-h-[600px]">
          {/* Decorative background circle */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-56 h-56 bg-blue-900/30 blur-2xl rounded-full z-0" />
          {/* Avatar */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-blue-700 via-blue-400 to-blue-900 border-4 border-[#18181b] shadow-lg flex items-center justify-center mb-6">
              <span className="text-5xl text-white font-bold select-none">
                {(formData.firstName?formData.firstName.charAt(0).toUpperCase() : "U") + (formData.lastName?formData.lastName.charAt(0).toUpperCase() : "?")}
              </span>
            </div>
            <div className="text-2xl font-semibold text-white mb-2 text-center">
              {formData.firstName || "User"} {formData.lastName}
            </div>
            <div className="text-sm text-blue-300 mb-6 text-center">
              {formData.email || "No email"}
            </div>
            <div className="flex flex-col gap-3 w-full items-center">
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75v10.5A2.25 2.25 0 004.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25M2.25 6.75l9.72 7.29a2.25 2.25 0 002.58 0l9.72-7.29" />
                </svg>
                <span>{formData.email || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75v10.5A2.25 2.25 0 004.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25M2.25 6.75l9.72 7.29a2.25 2.25 0 002.58 0l9.72-7.29" />
                </svg>
                <span>{formData.phone || "-"}</span>
              </div>
            </div>
            <div className="mt-8 text-sm text-gray-400 text-center max-w-[220px]">
              You can update your profile details on the right. Changes will reflect instantly.
            </div>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="md:w-2/3 p-8 md:p-12 relative">
          {/* Subtle decor (no glow, just dark) */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-black/40 blur-[80px] rounded-full pointer-events-none" />

          <h1
            className="text-3xl font-bold mb-8 tracking-tight"
            style={{
              color: "#f9fafb",
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
                { key: "phone", label: "Phone Number" },
              ].map((field) => (
                <div key={field.key} className="group">
                  <label
                    className="block mb-2 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#a3a3a3" }}
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
                    className="w-full rounded-xl px-4 py-3 text-sm"
                    style={{
                      background: "#050509",
                      border: "1px solid #27272f",
                      color: "#f9fafb",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#3b82f6"; // blue focus
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#27272f";
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #1d4ed8 100%)", // blue button
                  boxShadow: "0 4px 18px rgba(0,0,0,0.8)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
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
                className={`p-4 rounded-xl text-sm text-center border ${
                  message.type === "error"
                    ? "bg-red-900/40 border-red-500/50 text-red-200"
                    : "bg-emerald-900/40 border-emerald-500/50 text-emerald-200"
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
