// src/components/UpdateProfileCard.jsx
import React from "react";

const UpdateProfileCard = ({ firstName, lastName, email, phone }) => {
  const getInitials = () => {
    return `${firstName?.[0]?.toUpperCase() || ""}${lastName?.[0]?.toUpperCase() || ""}`;
  };

  return (
    <div
      className="w-1/3 flex flex-col items-center py-12 space-y-6 relative"
      style={{
        background: "linear-gradient(180deg, rgba(88,24,163,0.95), rgba(58,12,138,0.85))",
        boxShadow: "inset 0 6px 30px rgba(0,0,0,0.45)",
      }}
    >
      {/* Music top tag */}
      <div
        className="absolute top-4 left-4 text-xs px-3 py-1 rounded-full font-medium tracking-tight"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(6px)",
        }}
      >
        🎧 Music Mode
      </div>

      {/* Profile initials icon */}
      <div
        className="rounded-full  w-36 h-36 flex items-center justify-center text-6xl font-extrabold text-white"
        style={{
          borderColor: "rgba(6,182,212,0.95)",
          background: "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(255,255,255,0.02))",
          boxShadow: "0 8px 30px rgba(6,182,212,0.12)",
        }}
      >
        <div className="flex flex-col items-center justify-center">
          <div style={{ fontSize: 18, opacity: 0.9 }}>🎶</div>
          <div style={{ marginTop: 6 }}>{getInitials()}</div>
        </div>
      </div>

      {/* Name */}
      <h2
        className="text-2xl font-semibold capitalize text-center tracking-tight"
        style={{ color: "#FFFFFF" }}
      >
        {firstName} {lastName}
      </h2>

      {/* Contact Details */}
      <div className="space-y-3 text-sm w-full px-6">
        <p
          className="flex items-center space-x-3 rounded-full px-6 py-3"
          style={{
            background: "linear-gradient(90deg, rgba(6,182,212,0.12), rgba(124,58,237,0.06))",
            color: "#E6F9FF",
          }}
        >
          <span style={{ fontSize: 18 }}>📞</span>
          <span>{phone || "Not set"}</span>
        </p>

        <p
          className="flex items-center space-x-3 rounded-full px-6 py-3"
          style={{
            background: "linear-gradient(90deg, rgba(124,58,237,0.10), rgba(236,72,153,0.04))",
            color: "#FFEAF6",
          }}
        >
          <span style={{ fontSize: 18 }}>✉️</span>
          <span>{email || "Not set"}</span>
        </p>

        {/* Music badges */}
        <div className="flex justify-center gap-3 mt-2">
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            🎵 Listener
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.03)",
            }}
          >
            🎚️ Beats
          </div>
        </div>
      </div>

      {/* Wave bottom decoration */}
      <svg
        className="absolute bottom-0 left-0 right-0"
        viewBox="0 0 800 80"
        preserveAspectRatio="none"
        height="80"
      >
        <path
          d="M0 40 C150 80 350 0 500 40 C650 80 800 10 800 10 L800 80 L0 80 Z"
          fill="rgba(0,0,0,0.12)"
        />
      </svg>
    </div>
  );
};

export default UpdateProfileCard;
