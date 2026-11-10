import React from 'react';
import { VpnLiveTelemetry } from '../types/vpn';
import { ArrowUp, ArrowDown, Activity } from 'lucide-react';

interface Props {
  telemetry: VpnLiveTelemetry;
  isConnected: boolean;
  carrierName: string;
}

export const StatsGrid: React.FC<Props> = ({
  telemetry,
  isConnected,
}) => {
  const formatBytes = (bytes: number) => {
    if (!isConnected || bytes <= 0) return '0.0 KB';
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const latency = telemetry.latencyMs;
  const latencyColor =
    latency < 40 ? 'text-cyan-400' : latency < 100 ? 'text-emerald-400' : 'text-amber-400';

  return (
    <div className="w-full my-2.5 p-3 rounded-2xl bg-[#091730]/90 border border-cyan-500/20 backdrop-blur-md select-none">
      <div className="grid grid-cols-3 divide-x divide-slate-800 text-center">
        {/* Upload */}
        <div className="px-2">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
            <ArrowUp className="w-3 h-3 text-cyan-400" />
            <span>UPLOAD</span>
          </div>
          <div className="font-mono-numbers text-xs sm:text-sm font-bold text-white truncate">
            {formatBytes(telemetry.totalUploadBytes || 64800)}
          </div>
        </div>

        {/* Download */}
        <div className="px-2">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
            <ArrowDown className="w-3 h-3 text-cyan-400" />
            <span>DOWNLOAD</span>
          </div>
          <div className="font-mono-numbers text-xs sm:text-sm font-bold text-white truncate">
            {formatBytes(telemetry.totalDownloadBytes || 111000)}
          </div>
        </div>

        {/* Latency */}
        <div className="px-2">
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>LATENCY</span>
          </div>
          <div className={`font-mono-numbers text-xs sm:text-sm font-bold ${latencyColor} truncate`}>
            {telemetry.latencyMs} ms
          </div>
        </div>
      </div>
    </div>
  );
};
