// Latestreleased.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMusicPlayer } from "../src/context/MusicPlayerContext";
import { useMusicSections } from "../src/context/MusicSectionsContext";
import { ListPlus } from "lucide-react";

const PLACEHOLDER = "https://via.placeholder.com/220?text=No+Image";

const Latestreleased = () => {
  const { sections, loading } = useMusicSections();
  const navigate = useNavigate();
  const rowRef = useRef(null);
  const { addToQueue } = useMusicPlayer();

  // Get all latest released songs from context
  const latestReleased = sections.latestReleased || [];

  const scrollByAmount = (direction) => {
    if (!rowRef.current) return;
    const cardWidth = 236; // 220 + gap
    const amount = cardWidth * 3;
    rowRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const hasScroll = latestReleased.length > 6;

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
    gap: 16,
  };

  const titleStyle = {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: 0.6,
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
    display: "none",
    alignItems: "center",
    gap: 6,
    backdropFilter: "blur(10px)",
    backgroundColor: "rgba(15, 23, 42, 0.7)",
  };

  const scrollerShellStyle = {
    position: "relative",
    marginTop: 4,
  };

  const scrollerStyle = {
    display: "flex",
    gap: 16,
    paddingTop: 10,
    paddingBottom: 10,
    overflowX: hasScroll ? "auto" : "visible",
    WebkitOverflowScrolling: "touch",
    scrollBehavior: "smooth",
  };

  const navBtnBase = {
    position: "absolute",
    top: "50%",
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
  };

  const leftBtnStyle = {
    ...navBtnBase,
    left: -6,
  };

  const rightBtnStyle = {
    ...navBtnBase,
    right: -6,
  };

  const cardStyle = {
    width: 220,
    flexShrink: 0,
    borderRadius: 18,
    cursor: "pointer",
    padding: 10,
    background:
      "linear-gradient(135deg, rgba(6,182,212,0.10) 0%, rgba(16,185,129,0.10) 100%, rgba(24,24,27,0.96) 100%)",
    boxShadow: "0 18px 45px rgba(15,23,42,0.7)",
    border: "1px solid rgba(34,211,238,0.18)",
    position: "relative",
    overflow: "hidden",
    transition:
      "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease",
  };

  const imgContainerStyle = {
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

  const playCircleStyle = {
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

  const titleTextStyle = {
    marginTop: 12,
    fontWeight: 700,
    fontSize: 15,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "#e5e7eb",
  };

  const uploaderTextStyle = {
    color: "#9ca3af",
    fontSize: 12,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginTop: 2,
  };

  const uploaderNameStyle = {
    color: "#60a5fa",
    fontWeight: 500,
  };

  const likeRowStyle = {
    marginTop: 10,
    display: "flex",
    justifyContent: "flex-start",
  };

  const likeChipStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 999,
    background: "rgba(15, 23, 42, 0.9)",
    border: "1px solid rgba(248, 113, 113, 0.55)",
    color: "#fecaca",
    fontSize: 11,
    fontWeight: 600,
    boxShadow: "0 6px 18px rgba(15,23,42,0.8)",
  };

  const heartIconStyle = {
    width: 16,
    height: 16,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ef4444",
    color: "#fff",
    fontSize: 11,
  };

  const noDataStyle = {
    marginTop: 18,
    fontSize: 13,
    color: "#6b7280",
  };

  return (
    <section style={containerStyle}>
      {/* HEADER */}
      <div style={headerRowStyle}>
        <div style={titleStyle}>
          <div style={accentBarStyle} />
          <div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#6b7280",
                marginBottom: 2,
              }}
            >
              Fresh & New
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <h2>Latest Released</h2>
              <span
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  fontWeight: 400,
                }}
              >
                {latestReleased.length > 0
                  ? `${latestReleased.length} tracks`
                  : "No tracks yet"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            style={seeAllButtonStyle}
            onClick={() => navigate("/latestreleased")}
          >
            See All
            <span style={{ fontSize: 16 }}>↗</span>
          </button>
        </div>
      </div>

      {/* CAROUSEL */}
      <div style={scrollerShellStyle}>
        <button
          type="button"
          style={leftBtnStyle}
          onClick={() => scrollByAmount("left")}
        >
          ❮
        </button>
        <button
          type="button"
          style={rightBtnStyle}
          onClick={() => scrollByAmount("right")}
        >
          ❯
        </button>

        <div
          ref={rowRef}
          className={hasScroll ? "hide-scrollbar" : ""}
          style={scrollerStyle}
        >
          {latestReleased.map((song) => (
            <div
              key={song.song_id}
              style={cardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 26px 55px rgba(15,23,42,0.9)";
                const overlay =
                  e.currentTarget.querySelector(".lr-overlay");
                const img = e.currentTarget.querySelector(".lr-cover-img");
                if (overlay) overlay.style.opacity = 1;
                if (img) img.style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 18px 45px rgba(15,23,42,0.7)";
                const overlay =
                  e.currentTarget.querySelector(".lr-overlay");
                const img = e.currentTarget.querySelector(".lr-cover-img");
                if (overlay) overlay.style.opacity = 0;
                if (img) img.style.transform = "scale(1)";
              }}
            >
              <div 
                style={{...imgContainerStyle, position: 'relative', cursor: 'pointer'}}
                onClick={() => {
                  console.log(
                    "[Latestreleased] navigate to:",
                    `/playsong/${song.song_id}`
                  );
                  navigate(`/playsong/${song.song_id}`);
                }}
              >
                <img
                  className="lr-cover-img"
                  src={song.image_url || PLACEHOLDER}
                  alt={song.title || "cover"}
                  style={imgStyle}
                  onError={(e) => {
                    if (e.target.src !== PLACEHOLDER) {
                      e.target.src = PLACEHOLDER;
                    }
                  }}
                />
                <div className="lr-overlay" style={overlayStyle}>
                  <div style={playCircleStyle}>▶</div>
                </div>
                
                {/* Queue Button Overlay */}
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  gap: 6,
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(song.song_id);
                    }}
                    style={{
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      borderRadius: 8,
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.8)';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.75)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Add to Queue (Play Next)"
                  >
                    <ListPlus size={18} color="#3b82f6" />
                  </button>
                </div>
              </div>

              <h3 style={titleTextStyle}>{song.title || "Untitled"}</h3>

              <p style={uploaderTextStyle}>
                Uploaded by:{" "}
                <span style={uploaderNameStyle}>
                  {song.artist || "Unknown"}
                </span>
              </p>

              {/* Like chip row */}
              <div style={likeRowStyle}>
                <div style={likeChipStyle}>
                  <span style={heartIconStyle}>♥</span>
                  <span>
                    {Array.isArray(song.likes)
                      ? song.likes.length
                      : typeof song.likes === "number"
                      ? song.likes
                      : 0}{" "}
                    likes
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {latestReleased.length === 0 && (
          <p style={noDataStyle}>
            No latest releases to display yet. Check back later for new tracks.
          </p>
        )}
      </div>
    </section>
  );
};

export default Latestreleased;