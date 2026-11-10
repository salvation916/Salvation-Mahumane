import React from 'react';
import { MessageCircle, PhoneCall } from 'lucide-react';

interface Props {
  phoneNumber?: string;
  className?: string;
}

export const WhatsAppTopBanner: React.FC<Props> = ({
  phoneNumber = '+27 63 824 9382',
  className = '',
}) => {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

  const handleClick = () => {
    const text = encodeURIComponent(
      'Hello SALVATION MAHUMANE VPN TOP SA,\n\nI need an Access Code / Data Plan activation.\nPlease send payment and setup details.'
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className={`w-full flex justify-center py-1 select-none ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        title="Chat on WhatsApp"
        className="h-8 px-3.5 rounded-full bg-white text-slate-900 font-bold text-[11px] flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:bg-slate-100 transition-transform active:scale-95 cursor-pointer max-w-[340px]"
      >
        {/* WhatsApp Icon */}
        <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
          <MessageCircle className="w-3.5 h-3.5 fill-white text-[#25D366]" />
        </div>

        {/* Text exactly matching screenshot */}
        <span className="font-mono-numbers tracking-tight truncate">
          {phoneNumber}
        </span>

        <span className="text-[10px] text-slate-500 font-normal truncate">
          / Voice message (ONLY)
        </span>
      </button>
    </div>
  );
};
