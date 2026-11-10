import React, { useState } from 'react';
import { Share2, MessageCircle, Check, Sparkles } from 'lucide-react';
import { SUPPORT_CONTACT } from '../types/vpn';

interface Props {
  className?: string;
  variant?: 'banner' | 'button' | 'icon';
  label?: string;
}

export const ShareWhatsAppButton: React.FC<Props> = ({
  className = '',
  variant = 'button',
  label = 'Share VPN with a Friend on WhatsApp',
}) => {
  const [copied, setCopied] = useState(false);

  const getShareMessage = () => {
    const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://salvation-vpn.co.za';
    return `🇿🇦 *SALVATION MAHUMANE VPN TOP SA* — High-Speed Private VPN!

⚡ *Fast Carrier Optimization:*
• MTN · Telkom · Cell C · Vodacom

🔥 *Hot South Africa Plans:*
• MTN & Telkom Unlimited: 2D = R10 | 7D = R20 | 14D = R30 | 31D = R100
• Cell C Premium: 2D = R10 | 7D = R25 | 14D = R35 | 31D = R80
• GB Data: 100GB = R50 | 99GB = R49 | 180GB = R150

📲 *Download APK & Add to Home Screen:*
${appUrl}

🔑 *DM For Access Codes (24/7 Online):*
${SUPPORT_CONTACT.phoneNumber}
💳 *Payment:* 1voucher And Bank Transfer ✅`;
  };

  const handleShare = async () => {
    const text = getShareMessage();

    // Check if native Web Share API is available on mobile
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'SALVATION MAHUMANE VPN TOP SA',
          text,
        });
        return;
      } catch (err) {
        // Fallback to direct WhatsApp web/app link
      }
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleShare}
        title="Share VPN on WhatsApp"
        className={`p-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] transition-all active:scale-95 cursor-pointer ${className}`}
      >
        <Share2 className="w-4 h-4" />
      </button>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-[#091D26] to-cyan-500/15 border border-emerald-500/30 flex items-center justify-between select-none ${className}`}>
        <div>
          <div className="text-xs font-bold text-white flex items-center gap-1.5 font-heading">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Invite Friends & Share VPN</span>
          </div>
          <div className="text-[10px] text-slate-300 mt-0.5">
            Share our fast MTN, Telkom, Cell C & Vodacom plans on WhatsApp
          </div>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5C] text-black font-extrabold text-[11px] flex items-center gap-1.5 shadow-[0_0_15px_rgba(37,211,102,0.35)] transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-black text-[#25D366]" />
          <span>{copied ? 'Shared!' : 'Share Now'}</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#25D366] via-emerald-400 to-[#25D366] hover:opacity-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all active:scale-98 cursor-pointer select-none ${className}`}
    >
      <MessageCircle className="w-4 h-4 fill-black text-[#25D366]" />
      <span>{copied ? '✓ SHARED ON WHATSAPP' : label}</span>
      <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
    </button>
  );
};
