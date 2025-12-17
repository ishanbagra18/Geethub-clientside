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
        background:
          "linear-gradient(135deg, #06021a 0%, #1b0f3a 40%, #0b1b2b 100%)",
        color: "#E6EEF6",
        fontFamily:
          "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      <Toaster position="top-right" />

      <div className="flex rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden">
        
        {/* LEFT SIDE CARD — imported component */}
        <UpdateProfileCard
          firstName={formData.firstName}
          lastName={formData.lastName}
          phone={formData.phone}
          email={formData.email}
        />

        {/* RIGHT SIDE FORM */}
        <div
          className="w-2/3 p-12"
          style={{
            background: "linear-gradient(180deg, rgba(8,10,20,0.6), rgba(6,7,18,0.8))",
            borderLeft: "1px solid rgba(255,255,255,0.03)",
          }}
        >
          <h1
            className="text-4xl font-extrabold mb-6"
            style={{
              background: "linear-gradient(90deg,#00D2FF,#A100FF)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            🎼 Edit Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {["firstName", "lastName", "email", "phone"].map((key) => (
                <div key={key}>
                  <label
                    className="block mb-3 text-sm font-medium capitalize"
                    style={{ color: "#CFEFFF" }}
                  >
                    {key.replace(/([A-Z])/, " $1")}
                  </label>

                  <input
                    type={key === "email" ? "email" : "text"}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-xl px-5 py-3 text-gray-100"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full font-semibold text-white transition disabled:opacity-50"
              style={{
                background: "linear-gradient(90deg,#FF4DAB,#00D2FF)",
              }}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>

            {message.text && (
              <p
                className="mt-6 text-center font-medium"
                style={{
                  color: message.type === "error" ? "#FF8A8A" : "#AEEFFF",
                }}
              >
                {message.type === "error" ? "⚠️" : "✅"} {message.text}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
