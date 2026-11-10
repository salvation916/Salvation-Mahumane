import React from 'react';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SouthAfricaFlag: React.FC<Props> = ({ className = '', size = 'md' }) => {
  const dimensions = {
    sm: 'w-6 h-4',
    md: 'w-8 h-5',
    lg: 'w-10 h-6',
  }[size];

  return (
    <div className={`relative inline-block overflow-hidden rounded-xs shadow-xs border border-white/10 ${dimensions} ${className}`}>
      <svg
        viewBox="0 0 900 600"
        className="w-full h-full object-cover"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Flag of South Africa"
      >
        <clipPath id="sa-flag-clip">
          <path d="M0 0h900v600H0z" />
        </clipPath>
        <g clipPath="url(#sa-flag-clip)">
          {/* Top Red Band */}
          <path fill="#E03C31" d="M0 0h900v300H0z" />
          {/* Bottom Blue Band */}
          <path fill="#001489" d="M0 300h900v300H0z" />
          {/* White border along green pall */}
          <path fill="#FFFFFF" d="M0 0h180l400 300-400 300H0v-90l280-210L0 90z M180 0h120l320 240H900v120H620L300 600H180l300-225v-150z" />
          {/* Green central Y-shape (pall) */}
          <path fill="#007749" d="M0 45l340 255L0 555v-60l260-195L0 105z M240 0h120l320 240H900v120H680L360 600H240l280-210v-180z" />
          {/* Gold border around hoist triangle */}
          <path fill="#FFB81C" d="M0 0l400 300L0 600z" />
          {/* Black isosceles triangle */}
          <path fill="#000000" d="M0 60l320 240L0 540z" />
        </g>
      </svg>
    </div>
  );
};
