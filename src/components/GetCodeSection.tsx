import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, MessageCircle, Sparkles, ChevronDown } from 'lucide-react';
import { Carrier } from '../types/vpn';

interface Props {
  accessCode: string;
  onCodeChange: (code: string) => void;
  carrier: Carrier;
  onVerify: () => Promise<void>;
  verificationResult: {
    checked: boolean;
    valid: boolean;
    message?: string;
    planName?: string;
    remainingDays?: number;
  };
  onOpenPlans: () => void;
  onPayWhatsApp: () => void;
  disabled?: boolean;
}

export const GetCodeSection: React.FC<Props> = ({
  accessCode,
  onCodeChange,
  carrier,
  onVerify,
  verificationResult,
  onOpenPlans,
  onPayWhatsApp,
  disabled = false,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  const demoCodes = [
    { code: 'SALV-100GB-ZA88', label: '100GB Ultimate (30 Days Active)' },
    { code: 'SALV-99GB-MTN49', label: '99GB MTN Fast APN (30 Days Active)' },
    { code: 'SALV-180GB-VOD90', label: '180GB Vodacom (30 Days Active)' },
    { code: 'SALV-DEMO-EXPIRED', label: 'Expired Demo (Tests Expiration Block)' },
  ];

  const handleVerifyClick = async () => {
    setIsVerifying(true);
    await onVerify();
    setIsVerifying(false);
  };

  return (
    <div className="w-full my-3 p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0B132B]/90 border border-amber-500/20 shadow-lg">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <KeyRound className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading">
            GET CODE & Access Token
          </h2>
        </div>

        {/* Quick Demo Code picker for instant testing */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDemoSelector(!showDemoSelector)}
            className="text-[10px] text-amber-400/90 hover:text-amber-300 font-medium flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-colors"
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>Test Codes</span>
            <ChevronDown className="w-2.5 h-2.5" />
          </button>

          {showDemoSelector && (
            <div className="absolute right-0 top-7 z-30 w-64 p-1.5 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md">
              <div className="text-[10px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                Select Test Code:
              </div>
              {demoCodes.map((d) => (
                <button
                  key={d.code}
                  type="button"
                  onClick={() => {
                    onCodeChange(d.code);
                    setShowDemoSelector(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-amber-500/15 hover:text-amber-300 font-mono-numbers transition-colors"
                >
                  <div className="font-bold text-amber-400">{d.code}</div>
                  <div className="text-[10px] text-slate-400">{d.label}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
        Customers must enter an active, non-expired access code to connect to the South Africa VPN Network.
      </p>

      {/* Code Input Field */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={accessCode}
            disabled={disabled}
            onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
            placeholder="e.g. SALV-100GB-ZA88"
            className="w-full h-11 px-3 text-xs sm:text-sm font-mono-numbers uppercase tracking-wider bg-slate-950/80 border border-slate-700/80 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-xl text-slate-100 placeholder:text-slate-600 transition-all"
          />
          {verificationResult.checked && verificationResult.valid && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3.5" />
          )}
        </div>

        <button
          type="button"
          onClick={handleVerifyClick}
          disabled={disabled || !accessCode.trim() || isVerifying}
          className="h-11 px-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 text-xs font-semibold font-heading transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          {isVerifying ? 'Checking...' : 'Verify'}
        </button>
      </div>

      {/* Verification status output */}
      {verificationResult.checked && (
        <div
          className={`mt-2.5 p-2 rounded-xl text-xs flex items-start gap-2 border ${
            verificationResult.valid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {verificationResult.valid ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="text-[11px] leading-snug">
            {verificationResult.message}
            {verificationResult.valid && verificationResult.planName && (
              <span className="block mt-0.5 font-bold text-slate-200">
                Plan: {verificationResult.planName} · {verificationResult.remainingDays ?? 30} days remaining
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action buttons: Pay on WhatsApp & View Plans */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onPayWhatsApp}
          className="h-10 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
          <span>PAY ON WHATSAPP</span>
        </button>

        <button
          type="button"
          onClick={onOpenPlans}
          className="h-10 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
        >
          <span>VIEW 9 DATA PLANS</span>
        </button>
      </div>
    </div>
  );
};
