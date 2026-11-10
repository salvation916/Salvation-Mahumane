import React from 'react';
import { RotateCw, ShieldCheck, Zap, AlertTriangle, MessageCircle, CreditCard, Lock } from 'lucide-react';
import { SUPPORT_CONTACT, CAPITEC_BANK_DETAILS } from '../types/vpn';

interface Props {
  planName: string;
  gigabytes: number;
  usedBytes: number;
  remainingBytes: number;
  expiresDateStr: string;
  daysLeft: number;
  tunnelIp: string;
  ipcLimitMb?: number;
  isActive: boolean;
  hasActiveCode?: boolean;
  activeCodeString?: string;
  onRefresh?: () => void;
  onOpenPlans?: () => void;
  onGetCodeFromAdmin?: () => void;
  onOpenCardPay?: () => void;
}

export const ActivePlanCard: React.FC<Props> = ({
  planName = '100 GB Plan',
  gigabytes = 100,
  usedBytes = 0,
  remainingBytes = 100 * 1024 * 1024 * 1024,
  expiresDateStr = '21 Nov 2026',
  daysLeft = 30,
  tunnelIp = '10.84.14.92',
  ipcLimitMb = 1000,
  isActive = false,
  hasActiveCode = false,
  activeCodeString = '',
  onRefresh,
  onOpenPlans,
  onGetCodeFromAdmin,
  onOpenCardPay,
}) => {
  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(3)} GB`;
    }
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const openAdminWhatsApp = () => {
    if (onGetCodeFromAdmin) {
      onGetCodeFromAdmin();
      return;
    }
    const msg = encodeURIComponent(
      `Hello Salvation Mahumane,\n\nI need a code for SALVATION MAHUMANE VPN TOP SA right now. Please generate my single-phone access pass.\n\nThank you!`
    );
    window.open(`https://wa.me/${SUPPORT_CONTACT.cleanNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="w-full my-3 p-4 rounded-2xl bg-gradient-to-b from-[#091730]/95 via-[#071328]/95 to-[#050E20]/95 border border-cyan-500/25 shadow-xl select-none">
      {/* Plan Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight font-heading">
            {hasActiveCode ? planName : 'No Active Pass'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* USER REQUIREMENT: Don't show active on the screen show go and get a code to admin right now */}
          {hasActiveCode && isActive ? (
            <span className="px-2.5 py-0.5 rounded-md bg-[#00FFA3]/15 border border-[#00FFA3]/40 text-[#00FFA3] text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1">
              <span className="text-amber-400">🔑</span>
              <span>TUNNEL CONNECTED</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={openAdminWhatsApp}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.45)] transition-all active:scale-95 cursor-pointer animate-pulse"
            >
              <AlertTriangle className="w-3 h-3 text-slate-950 fill-slate-950" />
              <span>GO AND GET A CODE TO ADMIN RIGHT NOW</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            title="Refresh status"
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Prominent Action Banner when no active code */}
      {!hasActiveCode && (
        <div className="my-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-500/40 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
              GO AND GET A CODE TO ADMIN RIGHT NOW
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            You do not have an active code. Contact admin <strong>Salvation Mahumane</strong> on WhatsApp (<strong>+27 63 824 9382</strong>) or pay R50 into Capitec (<strong>{CAPITEC_BANK_DETAILS.accountNumber}</strong>) to receive your official single-phone pass.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={openAdminWhatsApp}
              className="h-8 rounded-lg bg-[#25D366] hover:bg-[#20BD5C] text-black font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-black" />
              <span>WhatsApp Admin</span>
            </button>
            {onOpenCardPay && (
              <button
                type="button"
                onClick={onOpenCardPay}
                className="h-8 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Capitec (R50)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Used vs Remaining metrics */}
      <div className="grid grid-cols-2 gap-3 my-3">
        <div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Used Data
          </div>
          <div className="font-mono-numbers text-base sm:text-lg font-black text-white mt-0.5 truncate">
            {hasActiveCode ? formatBytes(usedBytes) : '0.000 MB'}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Remaining Data
          </div>
          <div className="font-mono-numbers text-base sm:text-lg font-black text-cyan-400 mt-0.5 truncate">
            {hasActiveCode ? formatBytes(remainingBytes) : '0.000 GB'}
          </div>
        </div>
      </div>

      {/* Secondary Meta row */}
      <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[10px] text-slate-400 font-mono-numbers">
        <div className="flex items-center justify-between">
          <span>IPC Limit: {ipcLimitMb} MB</span>
          <span className={`px-2 py-0.5 rounded-full font-bold border ${
            hasActiveCode ? 'bg-blue-600/30 text-blue-300 border-blue-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            {hasActiveCode ? `${daysLeft} days left` : 'CODE REQUIRED'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>{hasActiveCode ? `Expires: ${expiresDateStr}` : 'Admin: Salvation Mahumane'}</span>
          <span className="text-slate-500 truncate">
            {hasActiveCode ? `Code: ${activeCodeString || 'SALV-PAID'}` : 'Contact: +27 63 824 9382'}
          </span>
        </div>
      </div>
    </div>
  );
};
