import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: 'classic' | 'sleek';
}

export function NbsLogo({ className = '', size = 64, showText = true, variant = 'sleek' }: LogoProps) {
  // Scales the proportions symmetrically based on requested sizing
  const scale = size / 64;
  const width = showText ? 240 * scale : 90 * scale;
  const height = 80 * scale;

  return (
    <div className={`flex items-center select-none ${className}`} id="nbs-brand-logo">
      <svg
        width={width}
        height={height}
        viewBox="0 0 240 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible shrink-0"
      >
        <defs>
          {/* Subtle brand glow behind emblem to pop out, as requested in background colors */}
          <radialGradient id="brandLogoGlow" cx="45%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9E2FF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient radial sky blue brand halo behind the logo elements */}
        <circle cx="50" cy="40" r="45" fill="url(#brandLogoGlow)" />

        {/* --- LEFT DESIGN MARK: Red "NBS" text, overlapping the signature Jumping Figure --- */}
        <g id="nbs-emblem-cluster">
          {/* Crimson Red Bold 'NBS' letters - italicized, extra heavy, exactly matched */}
          <text
            x="4"
            y="64"
            fill="#E31D2B"
            fontFamily="'Impact', 'Arial Black', 'Trebuchet MS', sans-serif"
            fontSize="64"
            fontWeight="950"
            fontStyle="italic"
            letterSpacing="-3.5"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            paintOrder="stroke fill"
          >
            NBS
          </text>

          {/* Jumping person swooshes in corporate Deep Royal Blue (#1B2A7E) */}
          {/* Swoosh 1: Bold upward bounding body curve arching from bottom list left to top right */}
          <path
            d="M 46,74 C 55,63 64,48 68,36 C 72,24 82,14 102,6 C 86,18 72,29 68,43 C 64,57 59,67 46,74 Z"
            fill="#1B2A7E"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />

          {/* Swoosh 2: Left arm and secondary intersecting flight stroke */}
          <path
            d="M 55,42 C 45,40 38,29 48,24 C 58,18 73,28 87,11 C 75,28 65,38 55,42 Z"
            fill="#1B2A7E"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />

          {/* Person Head: High-contrast red circle with bold white outline */}
          <circle
            cx="63"
            cy="27"
            r="8.5"
            fill="#E31D2B"
            stroke="#FFFFFF"
            strokeWidth="1.7"
          />
        </g>

        {/* --- RIGHT DESIGN MARK: Company Lettering Lockup --- */}
        {showText && (
          <g id="nbs-lettering-cluster">
            {/* "NKUNA'S" in elegant slanted, bold brand deep blue */}
            <text
              x="106"
              y="38"
              fill="#1B2A7E"
              fontFamily="'Impact', 'Arial Black', 'Trebuchet MS', sans-serif"
              fontSize="24"
              fontWeight="900"
              fontStyle="italic"
              letterSpacing="0.5"
            >
              NKUNA'S
            </text>

            {/* "BURIAL SOCIETY" solid deep blue badge background */}
            <rect
              x="106"
              y="44"
              width="122"
              height="20"
              rx="4"
              fill="#1B2A7E"
            />

            {/* "BURIAL SOCIETY" copy in white typography */}
            <text
              x="167"
              y="58"
              fill="#FFFFFF"
              fontFamily="'Arial Black', 'Arial', sans-serif"
              fontSize="11.5"
              fontWeight="900"
              textAnchor="middle"
              letterSpacing="0.2"
            >
              BURIAL SOCIETY
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export function NbsWatermark({ className = 'absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0', variant = 'sleek' }: { className?: string; variant?: 'classic' | 'sleek' }) {
  return (
    <div className={`${className}`} id="nbs-watermark-real">
      <svg
        width="460"
        height="460"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-[0.04] overflow-visible"
      >
        <defs>
          {/* Circular pattern grid to look super-secured */}
          <radialGradient id="watermarkSkyRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#80B5FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Radial brand backing behind watermark */}
        <circle cx="100" cy="100" r="95" fill="url(#watermarkSkyRadial)" />

        {/* Inner SVG Watermark Lockup */}
        <g transform="translate(14, 38) scale(0.75)">
          {/* Red "NBS" letters */}
          <text
            x="5"
            y="94"
            fill="#E31D2B"
            fontFamily="'Impact', 'Arial Black', sans-serif"
            fontSize="85"
            fontWeight="950"
            fontStyle="italic"
            letterSpacing="-4"
            stroke="#FFFFFF"
            strokeWidth="2"
          >
            NBS
          </text>

          {/* Jumping person body */}
          <path
            d="M 64,110 C 77,95 90,72 96,54 C 102,36 116,21 144,10 C 120,27 100,43 94,64 C 88,85 81,100 64,110 Z"
            fill="#1B2A7E"
          />
          <path
            d="M 77,64 C 63,61 53,44 67,37 C 81,29 103,44 123,19 C 106,44 91,59 77,64 Z"
            fill="#1B2A7E"
          />
          <circle cx="87" cy="42" r="12" fill="#E31D2B" />
        </g>
        
        {/* Security watermark background borders and text */}
        <circle cx="100" cy="100" r="95" stroke="#1B2A7E" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="88" stroke="#E31D2B" strokeWidth="0.75" />
        
        <text
          x="100"
          y="164"
          textAnchor="middle"
          fill="#1B2A7E"
          fontSize="9.5"
          fontFamily="'Arial Black', sans-serif"
          fontWeight="900"
          letterSpacing="1.8"
        >
          NKUNA'S BURIAL SOCIETY
        </text>
        <text
          x="100"
          y="174"
          textAnchor="middle"
          fill="#E31D2B"
          fontSize="6"
          fontFamily="'Arial', sans-serif"
          fontWeight="bold"
          letterSpacing="1.3"
        >
          AUTHENTIC BCEA CO. OFFICE ORIGINAL
        </text>
      </svg>
    </div>
  );
}
