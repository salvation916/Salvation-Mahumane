import React from 'react';

interface Props {
  size?: number | string;
  className?: string;
  glow?: boolean;
}

export const SalvationVpnLogo: React.FC<Props> = ({
  size = 40,
  className = '',
  glow = true,
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full transition-transform active:scale-95 ${className}`}
      style={{
        width: dimension,
        height: dimension,
        filter: glow ? 'drop-shadow(0 0 10px rgba(217, 168, 53, 0.45)) drop-shadow(0 0 4px rgba(215, 0, 38, 0.35))' : undefined,
      }}
    >
      <img
        src="/salvation-vpn-logo.svg"
        alt="Salvation Mahumane VPN Logo"
        className="w-full h-full object-contain rounded-full select-none pointer-events-none"
        loading="eager"
      />
    </div>
  );
};
