import React from 'react';
import { Carrier } from '../types/vpn';
import { Radio, Info } from 'lucide-react';

interface Props {
  selectedCarrier: Carrier;
  onSelectCarrier: (carrier: Carrier) => void;
  disabled?: boolean;
}

export const CarrierSelector: React.FC<Props> = ({
  selectedCarrier,
  onSelectCarrier,
  disabled = false,
}) => {
  return (
    <div className="w-full my-2.5 select-none">
      {/* 2-column or 4-pill carrier bar styled matching TOP PLUG SA reference screenshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* MTN Button: Bold Yellow background with black text */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectCarrier('MTN')}
          className={`h-12 rounded-2xl flex items-center justify-center gap-2 font-black transition-all cursor-pointer ${
            selectedCarrier === 'MTN'
              ? 'bg-[#FFCC00] text-black shadow-[0_0_20px_rgba(255,204,0,0.5)] ring-2 ring-white scale-[1.02]'
              : 'bg-[#FFCC00]/80 text-black/80 hover:bg-[#FFCC00]'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'}`}
        >
          {/* MTN Oval Emblem */}
          <div className="w-12 h-6 rounded-full border-2 border-black flex items-center justify-center">
            <span className="text-[10px] font-black tracking-tighter">MTN</span>
          </div>
        </button>

        {/* Telkom Button: Clean White background with blue text */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectCarrier('TELKOM')}
          className={`h-12 rounded-2xl flex items-center justify-center gap-2 font-black transition-all cursor-pointer ${
            selectedCarrier === 'TELKOM'
              ? 'bg-white text-[#00A3E0] shadow-[0_0_20px_rgba(255,255,255,0.4)] ring-2 ring-cyan-400 scale-[1.02]'
              : 'bg-white/80 text-[#00A3E0]/80 hover:bg-white'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'}`}
        >
          <span className="text-sm font-extrabold tracking-tight font-heading">
            Telkom
          </span>
        </button>

        {/* Cell C */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectCarrier('CELL C')}
          className={`h-12 rounded-2xl flex items-center justify-center gap-2 font-black transition-all cursor-pointer ${
            selectedCarrier === 'CELL C'
              ? 'bg-[#F97316] text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] ring-2 ring-white scale-[1.02]'
              : 'bg-[#121E36] border border-slate-700 text-slate-300 hover:text-white'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'}`}
        >
          <span className="text-xs font-extrabold tracking-tight font-heading">
            CELL C
          </span>
        </button>

        {/* Vodacom */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectCarrier('VODACOM')}
          className={`h-12 rounded-2xl flex items-center justify-center gap-2 font-black transition-all cursor-pointer ${
            selectedCarrier === 'VODACOM'
              ? 'bg-[#E60000] text-white shadow-[0_0_20px_rgba(230,0,0,0.4)] ring-2 ring-white scale-[1.02]'
              : 'bg-[#121E36] border border-slate-700 text-slate-300 hover:text-white'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'}`}
        >
          <span className="text-xs font-extrabold tracking-tight font-heading">
            VODACOM
          </span>
        </button>
      </div>
    </div>
  );
};
