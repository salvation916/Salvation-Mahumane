import React, { useState } from 'react';
import { KeyRound, X, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onClaimCode: (code: string) => Promise<{ success: boolean; message?: string }>;
  onOpenActivation?: () => void;
  isOnline?: boolean;
}

export const TrialCodeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onClaimCode,
  onOpenActivation,
  isOnline = true,
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ isError: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setFeedback(null);

    const res = await onClaimCode(code.trim().toUpperCase());
    setIsLoading(false);

    if (res.success) {
      setFeedback({ isError: false, text: res.message || 'Trial code activated successfully!' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setFeedback({ isError: true, text: res.message || 'Invalid or expired trial code.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-[28px] bg-gradient-to-b from-[#0B1A35] via-[#09152B] to-[#060D1E] border border-cyan-500/40 p-6 shadow-[0_0_50px_rgba(0,229,255,0.2)] text-center relative">
        {/* Key Icon inside Cyan Badge */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.3)] mb-4">
          <KeyRound className="w-7 h-7 text-cyan-400 stroke-[2.2]" />
        </div>

        {/* Modal Title */}
        <h3 className="text-xl font-bold text-white tracking-tight font-heading">
          Enter Trial Code
        </h3>
        <p className="text-xs text-slate-300 mt-1 mb-5">
          Enter your trial code to unlock free access.
        </p>

        {/* Input Form */}
        <form onSubmit={handleClaim} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setFeedback(null);
              }}
              placeholder="e.g. TRIAL-FREE-50"
              autoFocus
              className="w-full h-12 px-4 rounded-xl bg-[#050C1B]/90 border border-slate-700/80 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-sm font-mono-numbers text-center tracking-wider text-white placeholder:text-slate-500"
            />
          </div>

          <div className="text-[11px] text-cyan-400/80 flex items-center justify-center gap-1.5">
            <span>⚡ Multi-User Trial: Codes support 50+ people sharing!</span>
          </div>

          {feedback && (
            <div
              className={`p-2 rounded-xl text-xs flex items-center justify-center gap-1.5 ${
                feedback.isError
                  ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              }`}
            >
              {feedback.isError ? (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Primary CLAIM TRIAL button */}
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>VERIFYING...</span>
              </>
            ) : (
              <span>CLAIM TRIAL</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-[1px] bg-slate-800" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
            OR
          </span>
          <div className="flex-1 h-[1px] bg-slate-800" />
        </div>

        {/* Secondary: Have an activation code? */}
        <button
          type="button"
          onClick={() => {
            if (onOpenActivation) onOpenActivation();
          }}
          className="w-full h-11 rounded-xl bg-[#0A162B] hover:bg-[#0E203E] border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
        >
          <span className="text-cyan-400">🪪</span>
          <span>Have an activation code?</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 mt-2 rounded-xl bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Footer Note */}
        <div className="mt-3 text-[10px] text-slate-500">
          {isOnline ? 'Online · Connected to South Africa Gateway' : 'Offline · showing your last plan update'}
        </div>
      </div>
    </div>
  );
};
