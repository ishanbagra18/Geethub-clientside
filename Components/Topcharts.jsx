import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER = "https://via.placeholder.com/220?text=No+Image";

const Topcharts = () => {
  const [recentSongs, setRecentSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const rowRef = useRef(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("[Topcharts] no token found in localStorage");
          setRecentSongs([]);
          return;
        }

        const response = await axios.get("http://localhost:9000/music/allsongs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("[Topcharts] fetch response:", response?.data);
        setRecentSongs(response.data.songs || []);
      } catch (err) {
        console.error("❌ Error fetching songs:", err);
        setRecentSongs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Inline styles - these hard-force equal sizes
  const cardStyle = {
    width: 220,
    flexShrink: 0, // important so it doesn't shrink in a flex row
    borderRadius: 12,
    cursor: "pointer",
    padding: 12,
    transition: "transform 0.2s ease",
  };

  const imgContainerStyle = {
    width: 220,
    height: 220,
    overflow: "hidden",
    borderRadius: 8,
    background: "#2a2a2a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  return (
    <div style={{ marginTop: 80, paddingLeft: 40, paddingRight: 40 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: 0.6 }}>Top Charts</h2>

        <button
          onClick={() => navigate("/allsongs")}
          style={{ color: "#f87171", fontSize: 14, fontWeight: 600, background: "transparent", border: "none", cursor: "pointer" }}
        >
          See All
        </button>
      </div>

      {/* Song List */}
      {loading ? (
        <div style={{ textAlign: "center", color: "#9ca3af" }}>Loading songs...</div>
      ) : recentSongs.length === 0 ? (
        <div style={{ textAlign: "center", color: "#9ca3af" }}>No songs found</div>
      ) : (
        <div
          ref={rowRef}
          className={recentSongs.length > 6 ? "hide-scrollbar" : ""}
          style={{
            display: "flex",
            gap: 16,
            paddingTop: 8,
            paddingBottom: 8,
            overflowX: recentSongs.length > 6 ? "auto" : "visible",
            WebkitOverflowScrolling: "touch",
            paddingLeft: 4,
            paddingRight: 4,
          }}
        >
          {recentSongs.map((song) => (
            <div
              key={song.song_id}
              onClick={() => {
                console.log("[Topcharts] navigate to:", `/playsong/${song.song_id}`);
                navigate(`/playsong/${song.song_id}`);
              }}
              style={cardStyle}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {/* FIXED SIZE IMAGE CONTAINER */}
              <div style={imgContainerStyle}>
                <img
                  src={song.image_url || PLACEHOLDER}
                  alt={song.title || "cover"}
                  style={imgStyle}
                  onError={(e) => {
                    if (e.target.src !== PLACEHOLDER) {
                      e.target.src = PLACEHOLDER;
                    }
                  }}
                />
              </div>

              <h3 style={{ marginTop: 12, fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {song.title || "Untitled"}
              </h3>

              <p style={{ color: "#9ca3af", fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Uploaded by: <span style={{ color: "#60a5fa" }}>{song.artist || "Unknown"}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Topcharts;
