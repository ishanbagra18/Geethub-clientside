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
        background:
          "radial-gradient(circle at top, rgba(30,64,175,0.45), rgba(15,23,42,0.9))",
        border: "1px solid rgba(56,189,248,0.25)",
        boxShadow:
          "0 30px 80px rgba(15,23,42,0.9), inset 0 0 0 1px rgba(15,23,42,0.9)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Top badge */}
      <div className="w-full flex justify-center mt-2">
        <div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold tracking-[0.18em] uppercase"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,64,175,0.6))",
            border: "1px solid rgba(148,163,184,0.3)",
            boxShadow: "0 0 24px rgba(56,189,248,0.45)",
            color: "#E5F2FF",
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
            background:
              "radial-gradient(circle at 20% 0%, rgba(56,189,248,0.28), transparent 60%), radial-gradient(circle at 80% 100%, rgba(37,99,235,0.3), rgba(15,23,42,1))",
            boxShadow:
              "0 18px 45px rgba(15,23,42,0.9), 0 0 40px rgba(56,189,248,0.55)",
            border: "1px solid rgba(59,130,246,0.5)",
          }}
        >
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-2xl"
            style={{
              background:
                "linear-gradient(145deg, rgba(15,23,42,0.8), rgba(56,189,248,0.35))",
              boxShadow: "0 10px 35px rgba(56,189,248,0.7)",
              border: "1px solid rgba(148,163,184,0.6)",
            }}
          >
            
          </div>

          <div className="flex flex-col items-center justify-center mt-4">
            <span
              className="font-extrabold tracking-[0.2em]"
              style={{
                fontSize: 22,
                color: "#E5F2FF",
                textShadow: "0 0 20px rgba(15,23,42,0.9)",
              }}
            >
              {getInitials() || "??"}
            </span>
          </div>
        </div>
      </div>

      {/* Name (subtle blurred) */}
      <div className="mt-1 mb-4">
        <p
          className="text-lg font-semibold text-center"
          style={{
            color: "#E5F2FF",
            textShadow: "0 0 12px rgba(15,23,42,1)",
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
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.85))",
            border: "1px solid rgba(37,99,235,0.5)",
            boxShadow: "0 18px 35px rgba(15,23,42,0.9)",
          }}
        >
          <div
            className="flex items-center justify-center w-11 h-11 rounded-2xl"
            style={{
              background:
                "radial-gradient(circle at 0% 0%, rgba(56,189,248,0.75), rgba(37,99,235,0.7))",
              boxShadow: "0 0 20px rgba(56,189,248,0.85)",
            }}
          >
            <span className="text-xl text-white">📞</span>
          </div>
          <span
            className="text-sm font-semibold truncate"
            style={{ color: "#E2F1FF" }}
          >
            {phone || "Not set"}
          </span>
        </div>

        {/* Email */}
        <div
          className="flex items-center gap-4 px-6 py-4 rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.85))",
            border: "1px solid rgba(129,140,248,0.6)",
            boxShadow: "0 18px 35px rgba(15,23,42,0.9)",
          }}
        >
          <div
            className="flex items-center justify-center w-11 h-11 rounded-2xl"
            style={{
              background:
                "radial-gradient(circle at 0% 0%, rgba(129,140,248,0.8), rgba(56,189,248,0.65))",
              boxShadow: "0 0 20px rgba(129,140,248,0.7)",
            }}
          >
            <span className="text-xl text-white">✉️</span>
          </div>
          <span
            className="text-sm font-semibold truncate"
            style={{ color: "#E2F1FF" }}
          >
            {email || "Not set"}
          </span>
        </div>
      </div>

      {/* Bottom badges */}
      <div className="w-full px-4 pb-4 pt-2">
        <div className="flex items-center justify-between gap-3">
          {[
            { label: "Listener", icon: "🎵", color: "rgba(148,163,184,0.5)" },
            { label: "Beats", icon: "📲", color: "rgba(96,165,250,0.75)" },
            { label: "Active", icon: "🎧", color: "rgba(45,212,191,0.7)" },
          ].map((badge, idx) => (
            <div
              key={idx}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.9))",
                border: `1px solid ${badge.color}`,
                boxShadow: "0 10px 25px rgba(15,23,42,0.9)",
                color: "#E5F2FF",
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
          fill="rgba(15,23,42,0.95)"
        />
      </svg>
    </div>
  );
};

export default UpdateProfileCard;
