// Mostsaved.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PLACEHOLDER = "https://via.placeholder.com/220?text=No+Image";

const Mostsaved = () => {
  const [mostsaved, setMostsaved] = useState([]);
  const navigate = useNavigate();
  const rowRef = useRef(null);

  useEffect(() => {
    const fetchMostSaved = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMostsaved([]);
          return;
        }

        const res = await axios.get("http://localhost:9000/music/saved", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMostsaved(res.data.songs || []);
      } catch (err) {
        console.error("❌ Error fetching saved songs:", err);
        setMostsaved([]);
      }
    };

    fetchMostSaved();
  }, []);

  const scrollByAmount = (dir) => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({
      left: dir === "left" ? -700 : 700,
      behavior: "smooth",
    });
  };

  const hasScroll = mostsaved.length > 6;

  /* ================= STYLES ================= */

  const containerStyle = {
    marginTop: 80,
    paddingLeft: 32,
    paddingRight: 32,
  };

  const headerRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  };

  const titleStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const accentBarStyle = {
    width: 4,
    height: 28,
    borderRadius: 999,
    background:
      "linear-gradient(180deg, #22c55e 0%, #38bdf8 50%, #a78bfa 100%)",
  };

  const seeAllButtonStyle = {
    color: "#38bdf8",
    fontSize: 14,
    fontWeight: 600,
    background: "rgba(15,23,42,0.7)",
    border: "1px solid rgba(56,189,248,0.4)",
    borderRadius: 999,
    padding: "6px 14px",
    cursor: "pointer",
  };

  const scrollerShellStyle = {
    position: "relative",
  };

  const scrollerStyle = {
    display: "flex",
    gap: 16,
    paddingTop: 10,
    paddingBottom: 10,
    overflowX: hasScroll ? "auto" : "visible",
  };

  const navBtnStyle = (side) => ({
    position: "absolute",
    top: "50%",
    [side]: -6,
    transform: "translateY(-50%)",
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    display: hasScroll ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 10% 20%, #22c55e, #38bdf8)",
    color: "#020617",
    zIndex: 10,
  });

  const cardStyle = {
    width: 220,
    flexShrink: 0,
    borderRadius: 18,
    padding: 10,
    cursor: "pointer",
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(6,78,59,0.8))",
    boxShadow: "0 18px 45px rgba(15,23,42,0.7)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    transition: "all 0.25s ease",
  };

  const imgBoxStyle = {
    width: "100%",
    height: 220,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    background: "#020617",
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.35s ease",
  };

  const overlayStyle = {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.3s ease",
  };

  const playBtnStyle = {
    width: 50,
    height: 50,
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 10% 20%, #22c55e, #38bdf8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 800,
  };

  const saveChipStyle = {
    marginTop: 10,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(15,23,42,0.9)",
    border: "1px solid rgba(34,197,94,0.6)",
    color: "#bbf7d0",
    fontSize: 11,
    fontWeight: 600,
  };

  return (
    <section style={containerStyle}>
      {/* HIDE SCROLLBAR CSS */}
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* HEADER */}
      <div style={headerRowStyle}>
        <div style={titleStyle}>
          <div style={accentBarStyle} />
          <div>
            <p style={{ fontSize: 11, letterSpacing: 2, color: "#6b7280" }}>
              Your collection
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 800 }}>
              Most Saved Songs
            </h2>
          </div>
        </div>

        <button
          style={seeAllButtonStyle}
          onClick={() => navigate("/saved")}
        >
          See All ↗
        </button>
      </div>

      {/* CAROUSEL */}
      <div style={scrollerShellStyle}>
        <button style={navBtnStyle("left")} onClick={() => scrollByAmount("left")}>
          ❮
        </button>
        <button
          style={navBtnStyle("right")}
          onClick={() => scrollByAmount("right")}
        >
          ❯
        </button>

        <div
          ref={rowRef}
          className={hasScroll ? "hide-scrollbar" : ""}
          style={scrollerStyle}
        >
          {mostsaved.map((song) => (
            <div
              key={song.song_id}
              style={cardStyle}
              onClick={() => navigate(`/playsong/${song.song_id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-4px) scale(1.02)";
                e.currentTarget.querySelector(".overlay").style.opacity = 1;
                e.currentTarget.querySelector("img").style.transform =
                  "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.querySelector(".overlay").style.opacity = 0;
                e.currentTarget.querySelector("img").style.transform =
                  "scale(1)";
              }}
            >
              <div style={imgBoxStyle}>
                <img
                  src={song.image_url || PLACEHOLDER}
                  alt={song.title}
                  style={imgStyle}
                />
                <div className="overlay" style={overlayStyle}>
                  <div style={playBtnStyle}>▶</div>
                </div>
              </div>

              <h3
                style={{
                  marginTop: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#e5e7eb",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {song.title}
              </h3>

              <p style={{ fontSize: 12, color: "#9ca3af" }}>
                Uploaded by{" "}
                <span style={{ color: "#38bdf8" }}>{song.artist}</span>
              </p>

              <div style={saveChipStyle}>
                💾{" "}
                {Array.isArray(song.saves)
                  ? song.saves.length
                  : song.saves || 0}{" "}
                saves
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Mostsaved;
