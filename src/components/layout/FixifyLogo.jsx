import React from "react";

export default function FixifyLogo({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fx-grad" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3fb950" />
          <stop offset="0.55" stopColor="#58a6ff" />
          <stop offset="1" stopColor="#a371f7" />
        </linearGradient>
      </defs>
      {/* hex frame */}
      <path
        d="M16 2.6l10.4 6v14.8L16 29.4 5.6 23.4V8.6L16 2.6z"
        stroke="url(#fx-grad)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        opacity="0.45"
      />
      {/* diverging branch, healed */}
      <path
        d="M12 10v6.5a5 5 0 005 5h1"
        stroke="url(#fx-grad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M20 12.5l-2.6 4.4h3.4L18 23" stroke="#3fb950" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9.2" r="2.1" stroke="url(#fx-grad)" strokeWidth="1.8" />
      <circle cx="19.6" cy="21.5" r="2.1" fill="#3fb950" opacity="0.9" />
    </svg>
  );
}