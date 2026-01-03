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
      "linear-gradient(180deg, #fb7185 0%, #facc15 40%, #4ade80 100%)",
  };

  const seeAllButtonStyle = {
    color: "#f97373",
    fontSize: 14,
    fontWeight: 600,
    background: "transparent",
    border: "1px solid rgba(248, 113, 113, 0.4)",
    borderRadius: 999,
    padding: "6px 14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    backdropFilter: "blur(10px)",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
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
    borderRadius: "999px",
    border: "none",
    display: hasScroll ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background:
      "radial-gradient(circle at 10% 20%, rgba(248, 113, 113, 0.9), rgba(59, 130, 246, 0.9))",
    color: "#f9fafb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
    zIndex: 10,
  });

  const cardStyle = {
    width: 220,
    flexShrink: 0,
    borderRadius: 18,
    cursor: "pointer",
    padding: 10,
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.92) 60%, rgba(24,24,27,0.96) 100%)",
    boxShadow: "0 18px 45px rgba(15,23,42,0.7)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    position: "relative",
    overflow: "hidden",
    transition:
      "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease",
  };

  const imgBoxStyle = {
    width: "100%",
    height: 220,
    overflow: "hidden",
    borderRadius: 14,
    background:
      "radial-gradient(circle at top left, #0f172a, #020617 60%, #111827)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",     
    transition: "transform 0.35s ease",
  };

  const overlayStyle = {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(145deg, rgba(15,23,42,0.1), rgba(0,0,0,0.7))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.3s ease",
  };

  const playBtnStyle = {
    width: 50,
    height: 50,
    borderRadius: "999px",
    border: "1px solid rgba(248, 250, 252, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 10% 20%, #22c55e, #22d3ee)",
    color: "#0f172a",
    boxShadow: "0 12px 35px rgba(0,0,0,0.6)",
    fontSize: 18,
    fontWeight: 700,
  };

  const saveChipStyle = {
    display: "inline-flex",
    alignItems: "flex-end",
    gap: 6,
    padding: "4px 12px",
    borderRadius: 999,
    background: "linear-gradient(90deg, rgba(6,182,212,0.18) 0%, rgba(16,185,129,0.18) 100%)",
    border: "1px solid rgba(34,211,238,0.35)",
    color: "#67e8f9",
    fontSize: 12,
    fontWeight: 600,
    boxShadow: "0 6px 18px rgba(15,23,42,0.7)",
    marginTop: 6,
    marginBottom: 2,
    minHeight: 28,
  };

  const saveIconStyle = {
    width: 16,
    height: 16,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 10% 20%, #06b6d4, #10b981)",
    color: "#0f172a",
    fontSize: 13,
    marginRight: 4,
    marginTop: 4,
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

              <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>
                Uploaded by {" "}
                <span style={{ color: "#38bdf8" }}>{song.artist}</span>
              </p>

              <div style={saveChipStyle}>
                <span style={saveIconStyle}>
                  {/* Floppy disk SVG icon for save, improved contrast */}
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="14" height="14" rx="2.5" fill="#06b6d4" stroke="#fff" strokeWidth="1.2"/>
                    <rect x="6" y="6" width="8" height="5" rx="1" fill="#fff"/>
                    <rect x="8.5" y="13" width="3" height="2" rx="0.5" fill="#10b981"/>
                  </svg>
                </span>
                <span style={{ fontSize: 12, letterSpacing: 0.2 }}>
                  {Array.isArray(song.saves)
                    ? song.saves.length
                    : typeof song.saves === "number"
                    ? song.saves
                    : 0} {" "}
                  saves
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Mostsaved;
