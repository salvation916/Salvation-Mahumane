import React from 'react';

interface Props {
  className?: string;
  activeNode?: string;
  onClick?: () => void;
}

export const GlobeGraphic: React.FC<Props> = ({ className = '', activeNode = 'South Africa', onClick }) => {
  return (
    <div className={`relative w-full overflow-hidden flex flex-col items-center justify-center select-none ${className}`}>
      {/* Background Cyan Radial Glow */}
      <div className="absolute w-72 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -top-10" />

      {/* SVG Hemisphere with Longitude/Latitude Grid lines */}
      <div className="relative w-full max-w-[380px] h-32 flex items-center justify-center">
        <svg
          viewBox="0 0 400 160"
          className="w-full h-full opacity-70"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="globeGlow" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#0B3C68" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#050B18" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="orbitLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0" />
              <stop offset="50%" stopColor="#00E5FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Curved top horizon */}
          <path
            d="M 20 150 Q 200 -20 380 150"
            fill="url(#globeGlow)"
            stroke="#00E5FF"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />

          {/* Latitude Arcs */}
          <path d="M 50 140 Q 200 20 350 140" fill="none" stroke="#00E5FF" strokeWidth="0.75" strokeOpacity="0.3" />
          <path d="M 80 135 Q 200 50 320 135" fill="none" stroke="#00E5FF" strokeWidth="0.75" strokeOpacity="0.25" />
          <path d="M 110 130 Q 200 75 290 130" fill="none" stroke="#00E5FF" strokeWidth="0.75" strokeOpacity="0.2" />

          {/* Longitude Curved Meridians */}
          <path d="M 200 0 L 200 150" stroke="#00E5FF" strokeWidth="0.75" strokeOpacity="0.3" strokeDasharray="3 3" />
          <path d="M 200 0 Q 150 70 150 150" fill="none" stroke="#00E5FF" strokeWidth="0.6" strokeOpacity="0.25" />
          <path d="M 200 0 Q 250 70 250 150" fill="none" stroke="#00E5FF" strokeWidth="0.6" strokeOpacity="0.25" />
          <path d="M 200 0 Q 100 70 100 150" fill="none" stroke="#00E5FF" strokeWidth="0.6" strokeOpacity="0.2" />
          <path d="M 200 0 Q 300 70 300 150" fill="none" stroke="#00E5FF" strokeWidth="0.6" strokeOpacity="0.2" />

          {/* South Africa Signal Pulse Beacon at apex */}
          <circle cx="200" cy="55" r="4" fill="#00FFA3" className="animate-ping" opacity="0.75" />
          <circle cx="200" cy="55" r="2.5" fill="#FFFFFF" />

          {/* Orbit arc */}
          <path d="M 100 80 Q 200 30 300 80" fill="none" stroke="url(#orbitLine)" strokeWidth="1" strokeDasharray="4 2" />
        </svg>

        {/* Floating "● South Africa" Pill Badge (Interactive to open VPS & TLS settings) */}
        <button
          type="button"
          onClick={onClick}
          className="absolute top-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071329]/95 border border-cyan-500/50 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.3)] backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
          <span className="text-[11px] font-bold text-slate-100 tracking-wide">
            {activeNode}
          </span>
          <span className="text-[9px] font-black tracking-wider text-cyan-300 bg-cyan-500/20 px-1.5 py-0.2 rounded ml-0.5">
            VPS · TLS
          </span>
        </button>
      </div>
    </div>
  );
};
