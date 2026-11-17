import React from 'react';

export const FoldedMapIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[260px] sm:w-[300px] h-auto drop-shadow-sm"
      >
        <defs>
          {/* Flyora Teal Brand Gradients */}
          <linearGradient id="panelLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CCFBF1" />
            <stop offset="100%" stopColor="#99F6E4" />
          </linearGradient>
          <linearGradient id="panelMidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0FDFA" />
            <stop offset="100%" stopColor="#CCFBF1" />
          </linearGradient>
          <linearGradient id="panelRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#99F6E4" />
            <stop offset="100%" stopColor="#5EEAD4" />
          </linearGradient>
          {/* Pin shadow */}
          <radialGradient id="pinShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft Background Clouds */}
        <g opacity="0.85">
          <path
            d="M50 48C50 43 54 39 59 39C60 39 61 39.3 62 39.8C63.5 36.8 66.5 35 70 35C74.5 35 78 38 78.5 42C79.5 41.5 80.5 41 82 41C85 41 88 43.5 88 47C88 47.3 88 47.7 87.8 48H50Z"
            fill="#F0FDFA"
          />
          <path
            d="M230 42C230 38 233 35 237 35C238 35 238.8 35.2 239.5 35.6C240.8 33 243.5 31.5 246.5 31.5C250.5 31.5 253.5 34.2 254 37.8C255 37.2 256 37 257 37C260 37 262 39 262 42H230Z"
            fill="#F0FDFA"
          />
        </g>

        {/* Background Trees on Left */}
        <g>
          <rect x="44" y="96" width="3" height="10" rx="1.5" fill="#5EEAD4" />
          <path
            d="M45.5 76C40.5 76 37 83 37 92C37 97 41 98 45.5 98C50 98 54 97 54 92C54 83 50.5 76 45.5 76Z"
            fill="#99F6E4"
          />
          <rect x="58" y="92" width="3.5" height="12" rx="1.5" fill="#2DD4BF" />
          <path
            d="M59.7 68C53.5 68 49 76 49 86C49 92 54 94 59.7 94C65.5 94 70.5 92 70.5 86C70.5 76 66 68 59.7 68Z"
            fill="#14B8A6"
          />
        </g>

        {/* Background Trees on Right */}
        <g>
          <rect x="256" y="92" width="3.5" height="12" rx="1.5" fill="#2DD4BF" />
          <path
            d="M257.7 68C251.5 68 247 76 247 86C247 92 252 94 257.7 94C263.5 94 268.5 92 268.5 86C268.5 76 264 68 257.7 68Z"
            fill="#14B8A6"
          />
          <rect x="272" y="98" width="3" height="10" rx="1.5" fill="#5EEAD4" />
          <path
            d="M273.5 78C268.5 78 265 85 265 94C265 99 269 100 273.5 100C278 100 282 99 282 94C282 85 278.5 78 273.5 78Z"
            fill="#99F6E4"
          />
        </g>

        {/* Soft Shadow Underneath Map */}
        <ellipse cx="160" cy="116" rx="90" ry="12" fill="#0A1628" fillOpacity="0.04" />

        {/* ─── 3D Folded Map (Flyora Brand Colors) ─── */}
        <g>
          {/* Panel 1: Left */}
          <polygon
            points="76,82 132,60 132,118 76,128"
            fill="url(#panelLeftGrad)"
          />
          <line x1="90" y1="76" x2="90" y2="125" stroke="#5EEAD4" strokeWidth="0.8" opacity="0.6" />
          <line x1="108" y1="69" x2="108" y2="121" stroke="#5EEAD4" strokeWidth="0.8" opacity="0.6" />

          {/* Panel 2: Center */}
          <polygon
            points="132,60 188,80 188,128 132,118"
            fill="url(#panelMidGrad)"
          />
          <line x1="150" y1="66" x2="150" y2="121" stroke="#99F6E4" strokeWidth="0.8" opacity="0.6" />
          <line x1="170" y1="73" x2="170" y2="125" stroke="#99F6E4" strokeWidth="0.8" opacity="0.6" />

          {/* Panel 3: Right */}
          <polygon
            points="188,80 244,60 244,118 188,128"
            fill="url(#panelRightGrad)"
          />
          <line x1="206" y1="74" x2="206" y2="125" stroke="#2DD4BF" strokeWidth="0.8" opacity="0.6" />
          <line x1="226" y1="67" x2="226" y2="121" stroke="#2DD4BF" strokeWidth="0.8" opacity="0.6" />

          {/* Dotted Route Line in Flyora Teal */}
          <path
            d="M160 74 C168 84 178 94 195 90 C210 86 216 75 228 82"
            stroke="#0D9488"
            strokeWidth="2.5"
            strokeDasharray="3.5 3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Pin Ground Shadow */}
          <ellipse cx="160" cy="74" rx="6" ry="2.5" fill="url(#pinShadow)" />

          {/* Location Pin Marker in Flyora Teal */}
          <g transform="translate(160, 48)">
            <path
              d="M0 24 C-4 18 -10 12 -10 6 C-10 -2 -5 -7 0 -7 C5 -7 10 -2 10 6 C10 12 4 18 0 24 Z"
              fill="#0D9488"
            />
            <circle cx="0" cy="5" r="3.6" fill="#FFFFFF" />
          </g>
        </g>
      </svg>
    </div>
  );
};
