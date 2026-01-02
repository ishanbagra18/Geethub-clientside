import React from "react";

const UpdateProfileCard = ({ firstName, lastName, email, phone }) => {
  const getInitials = () => {
    return `${firstName?.[0]?.toUpperCase() || ""}${
      lastName?.[0]?.toUpperCase() || ""
    }`;
  };

  return (
    <div
      className="h-full w-full flex flex-col items-center justify-between py-8 space-y-6 relative overflow-hidden"
      style={{
        background: "#050509",                    // dark black-ish
        border: "1px solid #18181b",
        boxShadow: "0 30px 60px rgba(0,0,0,0.8)",
      }}
    >
      {/* Top badge */}
      <div className="w-full flex justify-center mt-2">
        <div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold tracking-[0.18em] uppercase"
          style={{
            background: "#111111",
            border: "1px solid #27272f",
            color: "#e5e7eb",
          }}
        >
          <span className="text-[12px]">🎧</span>
          <span>Music Mode</span>
        </div>
      </div>

      {/* Avatar */}
      <div className="mt-4 mb-2">
        <div
          className="relative flex items-center justify-center rounded-3xl w-32 h-40"
          style={{
            background: "#111111",
            boxShadow: "0 18px 40px rgba(0,0,0,0.7)",
            border: "1px solid #18181b",
          }}
        >
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-2xl"
            style={{
              background: "#111111",
              border: "1px solid #27272f",
            }}
          />

          <div className="flex flex-col items-center justify-center mt-4">
            <span
              className="font-extrabold tracking-[0.2em]"
              style={{
                fontSize: 22,
                color: "#3b82f6",        // blue initials
              }}
            >
              {getInitials() || "??"}
            </span>
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="mt-1 mb-4">
        <p
          className="text-lg font-semibold text-center"
          style={{
            color: "#f9fafb",
          }}
        >
          {firstName || lastName ? `${firstName} ${lastName}` : "Your Name"}
        </p>
      </div>

      {/* Contact cards */}
      <div className="w-full px-6 space-y-4">
        {/* Phone */}
        <div
          className="flex items-center gap-4 px-6 py-4 rounded-3xl"
          style={{
            background: "#111111",
            border: "1px solid #1d4ed8",         // blue border
            boxShadow: "0 18px 35px rgba(0,0,0,0.7)",
          }}
        >
          <div
            className="flex items-center justify-center w-11 h-11 rounded-2xl"
            style={{
              background: "#1d4ed8",             // solid blue icon bg
            }}
          >
            <span className="text-xl text-white">📞</span>
          </div>
          <span
            className="text-sm font-semibold truncate"
            style={{ color: "#e5e7eb" }}
          >
            {phone || "Not set"}
          </span>
        </div>

        {/* Email */}
        <div
          className="flex items-center gap-4 px-6 py-4 rounded-3xl"
          style={{
            background: "#111111",
            border: "1px solid #1d4ed8",
            boxShadow: "0 18px 35px rgba(0,0,0,0.7)",
          }}
        >
          <div
            className="flex items-center justify-center w-11 h-11 rounded-2xl"
            style={{
              background: "#1d4ed8",
            }}
          >
            <span className="text-xl text-white">✉️</span>
          </div>
          <span
            className="text-sm font-semibold truncate"
            style={{ color: "#e5e7eb" }}
          >
            {email || "Not set"}
          </span>
        </div>
      </div>

      {/* Bottom badges */}
      <div className="w-full px-4 pb-4 pt-2">
        <div className="flex items-center justify-between gap-3">
          {[
            { label: "Listener", icon: "🎵" },
            { label: "Beats", icon: "📲" },
            { label: "Active", icon: "🎧" },
          ].map((badge, idx) => (
            <div
              key={idx}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold"
              style={{
                background: "#111111",
                border: "1px solid #27272f",
                color: "#e5e7eb",
              }}
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <svg
        className="absolute bottom-0 left-0 right-0 opacity-70"
        viewBox="0 0 800 80"
        preserveAspectRatio="none"
        height="80"
      >
        <path
          d="M0 40 C150 80 350 0 500 40 C650 80 800 10 800 10 L800 80 L0 80 Z"
          fill="#050509"
        />
      </svg>
    </div>
  );
};

export default UpdateProfileCard;
