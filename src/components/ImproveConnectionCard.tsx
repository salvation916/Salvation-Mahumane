import React, { useState } from 'react';
import {
  Zap,
  Gauge,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Carrier } from '../types/vpn';
import { vpnEngine } from '../services/vpnEngine';

interface Props {
  latencyMs: number;
  jitterMs: number;
  carrier: Carrier;
  onCarrierSwitch?: (carrier: Carrier) => void;
  className?: string;
}

export const ImproveConnectionCard: React.FC<Props> = ({
  latencyMs,
  jitterMs,
  carrier,
  onCarrierSwitch,
  className = '',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<{
    savedMs: number;
    recommendedNode: string;
    recommendedCarrier: Carrier;
  } | null>(null);

  // Consider latency "high" if > 40ms or jitter > 3ms
  const isHighLatency = latencyMs > 40 || jitterMs > 3;

  if (isDismissed && !optimizedResult) return null;

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    vpnEngine.addLog('INFO', 'TUNNEL', `Analyzing South African mobile carrier routes for ${carrier}...`);
    
    // Simulate real gateway node probe
    await new Promise((r) => setTimeout(r, 800));
    await vpnEngine.probeLatency();

    const saved = Math.min(latencyMs - 14, Math.floor(Math.random() * 20) + 12);
    const recommendedCarrier: Carrier = carrier === 'MTN' ? 'TELKOM' : 'MTN';

    vpnEngine.addLog('SUCCESS', 'TUNNEL', `Route optimized! Switched to Johannesburg Core JNB-1 (Latency dropped by ${saved}ms)`);

    setOptimizedResult({
      savedMs: saved,
      recommendedNode: 'Johannesburg Core (JNB-1)',
      recommendedCarrier,
    });
    setIsOptimizing(false);
  };

  const handleApplyRecommendedCarrier = () => {
    if (optimizedResult && onCarrierSwitch) {
      onCarrierSwitch(optimizedResult.recommendedCarrier);
      setOptimizedResult(null);
      setIsDismissed(true);
    }
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#0D1E38] to-cyan-500/15 border border-amber-500/40 p-3.5 shadow-[0_0_25px_rgba(245,158,11,0.15)] relative animate-fade-in ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-300 font-heading">
                Improve Connection
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/30">
                {latencyMs}ms Latency
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
              {carrier === 'MTN'
                ? 'High mobile traffic detected on MTN APN (mydata.mtn.co.za).'
                : carrier === 'TELKOM'
                ? 'Cellular routing delay detected on Telkom LTE gateway.'
                : 'South Africa network latency elevated. Route optimization recommended.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested optimizations */}
      {!optimizedResult ? (
        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="text-[10px] text-slate-400">
            <span>Recommended: Switch to </span>
            <strong className="text-cyan-300">Johannesburg Core (JNB-1)</strong>
          </div>

          <button
            type="button"
            onClick={handleOptimizeRoute}
            disabled={isOptimizing}
            className="h-8 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3 h-3 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Optimizing...' : 'Optimize Route'}</span>
          </button>
        </div>
      ) : (
        <div className="mt-2.5 pt-2.5 border-t border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Latency dropped by ~{optimizedResult.savedMs}ms on {optimizedResult.recommendedNode}!</span>
          </div>

          {onCarrierSwitch && (
            <button
              type="button"
              onClick={handleApplyRecommendedCarrier}
              className="w-full h-8 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <span>Switch to Fast {optimizedResult.recommendedCarrier} Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
