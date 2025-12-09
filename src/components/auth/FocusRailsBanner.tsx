export function FocusRailsBanner() {
  return (
    <svg
      viewBox="0 0 800 300"
      className="w-full h-auto max-w-2xl mx-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background gradient */}
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.1 }} />
          <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 0.05 }} />
        </linearGradient>
        <linearGradient id="railGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="trainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#84cc16', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#65a30d', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="800" height="300" fill="url(#skyGradient)" />

      {/* Rails - parallel lines going into perspective */}
      <g opacity="0.3">
        {/* Left rail */}
        <path
          d="M 50 250 L 200 200 L 300 180 L 500 160 L 750 150"
          stroke="url(#railGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        {/* Right rail */}
        <path
          d="M 50 270 L 200 220 L 300 200 L 500 180 L 750 170"
          stroke="url(#railGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        {/* Rail ties */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line
            key={i}
            x1={50 + i * 100}
            y1={250 - i * 8}
            x2={50 + i * 100}
            y2={270 - i * 8}
            stroke="url(#railGradient)"
            strokeWidth="4"
            opacity="0.4"
          />
        ))}
      </g>

      {/* Simplified train car (focus on forward motion) */}
      <g>
        {/* Main train body */}
        <rect
          x="120"
          y="140"
          width="120"
          height="80"
          rx="8"
          fill="url(#trainGradient)"
        />

        {/* Train window */}
        <rect
          x="140"
          y="155"
          width="80"
          height="40"
          rx="4"
          fill="white"
          opacity="0.9"
        />

        {/* Window frame */}
        <rect
          x="140"
          y="155"
          width="80"
          height="40"
          rx="4"
          fill="none"
          stroke="#65a30d"
          strokeWidth="2"
        />

        {/* Front of train (nose) */}
        <path
          d="M 240 150 L 270 170 L 270 210 L 240 220 Z"
          fill="url(#trainGradient)"
        />

        {/* Wheels */}
        <circle cx="150" cy="220" r="12" fill="#374151" />
        <circle cx="150" cy="220" r="6" fill="#6b7280" />
        <circle cx="210" cy="220" r="12" fill="#374151" />
        <circle cx="210" cy="220" r="6" fill="#6b7280" />
      </g>

      {/* Focus target/crosshair icon */}
      <g transform="translate(600, 80)">
        <circle cx="0" cy="0" r="40" fill="none" stroke="#6366f1" strokeWidth="3" opacity="0.3" />
        <circle cx="0" cy="0" r="25" fill="none" stroke="#6366f1" strokeWidth="3" opacity="0.5" />
        <circle cx="0" cy="0" r="10" fill="#6366f1" opacity="0.8" />
        <line x1="-50" y1="0" x2="-45" y2="0" stroke="#6366f1" strokeWidth="3" />
        <line x1="45" y1="0" x2="50" y2="0" stroke="#6366f1" strokeWidth="3" />
        <line x1="0" y1="-50" x2="0" y2="-45" stroke="#6366f1" strokeWidth="3" />
        <line x1="0" y1="45" x2="0" y2="50" stroke="#6366f1" strokeWidth="3" />
      </g>

      {/* Decorative elements - productivity dots */}
      <g opacity="0.2">
        <circle cx="100" cy="80" r="4" fill="#6366f1" />
        <circle cx="680" cy="240" r="3" fill="#a855f7" />
        <circle cx="720" cy="100" r="5" fill="#6366f1" />
        <circle cx="380" cy="50" r="3" fill="#84cc16" />
      </g>
    </svg>
  );
}
