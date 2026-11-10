import React, { useState } from 'react';
import { ConnectionState, Carrier } from '../types/vpn';
import { Power, Info, X, Shield, Lock, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { playVpnAlarmSound } from '../utils/audioAlarm';

interface Props {
  state: ConnectionState;
  carrier: Carrier;
  onConnect: () => void;
  onDisconnect: () => void;
  uptimeSeconds: number;
  virtualIp?: string;
  hasCode: boolean;
  latencyMs?: number;
}

export const ConnectButton: React.FC<Props> = ({
  state,
  carrier,
  onConnect,
  onDisconnect,
  uptimeSeconds,
  virtualIp,
  hasCode,
  latencyMs = 18,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isConnected = state === 'CONNECTED';
  const isConnecting = state === 'CONNECTING';
  const isError = state === 'ERROR';

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClick = () => {
    if (isConnected) {
      onDisconnect();
    } else if (!isConnecting) {
      // Play tactical alarm sound on connect tap as requested
      playVpnAlarmSound();
      onConnect();
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-3 select-none">
      {/* Stadium/Capsule Neon Connect Button (Exact match to reference screenshot) */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isConnecting}
        className={`w-full max-w-[360px] h-14 rounded-full p-[2px] transition-all duration-300 transform active:scale-98 cursor-pointer relative ${
          isConnected
            ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 shadow-[0_0_25px_rgba(0,255,163,0.45)]'
            : isConnecting
            ? 'bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse'
            : isError
            ? 'bg-gradient-to-r from-red-500 via-rose-400 to-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
            : 'bg-gradient-to-r from-cyan-500/80 via-blue-600/70 to-cyan-500/80 hover:shadow-[0_0_20px_rgba(0,229,255,0.35)]'
        }`}
      >
        {/* Inner container */}
        <div
          className={`w-full h-full rounded-full flex items-center justify-center gap-3 px-6 transition-all ${
            isConnected
              ? 'bg-gradient-to-r from-[#031B19] via-[#042421] to-[#031B19]'
              : isConnecting
              ? 'bg-gradient-to-r from-[#1B1403] via-[#241B04] to-[#1B1403]'
              : isError
              ? 'bg-gradient-to-r from-[#1E0707] via-[#2A0A0A] to-[#1E0707]'
              : 'bg-gradient-to-r from-[#081830] via-[#0A1F40] to-[#081830]'
          }`}
        >
          {/* Circular Icon with Power glyph */}
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isConnected
                ? 'bg-emerald-500/20 text-[#00FFA3] shadow-[0_0_12px_#00FFA3]'
                : isConnecting
                ? 'bg-amber-500/20 text-amber-400'
                : isError
                ? 'bg-red-500/20 text-red-400'
                : 'bg-cyan-500/15 text-cyan-400'
            }`}
          >
            {isConnecting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Power className="w-5 h-5 stroke-[2.4]" />
            )}
          </div>

          {/* Vertical Separator */}
          <div
            className={`w-[1px] h-6 ${
              isConnected
                ? 'bg-emerald-400/50'
                : isConnecting
                ? 'bg-amber-400/50'
                : isError
                ? 'bg-red-400/50'
                : 'bg-cyan-500/40'
            }`}
          />

          {/* Label */}
          <span
            className={`text-sm sm:text-base font-extrabold tracking-wider uppercase font-heading flex items-center gap-1.5 ${
              isConnected
                ? 'text-[#00FFA3] drop-shadow-[0_0_8px_rgba(0,255,163,0.6)]'
                : isConnecting
                ? 'text-amber-300'
                : isError
                ? 'text-red-400'
                : 'text-cyan-300 drop-shadow-[0_0_6px_rgba(0,229,255,0.4)]'
            }`}
          >
            {isConnected && <span className="text-amber-400 text-sm">🔑</span>}
            <span>
              {isConnected
                ? 'CONNECTED'
                : isConnecting
                ? 'CONNECTING...'
                : isError
                ? 'TAP TO RETRY'
                : 'TAP TO CONNECT'}
            </span>
          </span>
        </div>
      </button>

      {/* Sub-label under Stadium Button */}
      <div className="mt-2 flex items-center gap-2 relative">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isConnected
              ? 'bg-[#00FFA3] shadow-[0_0_6px_#00FFA3]'
              : isConnecting
              ? 'bg-amber-400 animate-ping'
              : !hasCode
              ? 'bg-amber-400 animate-pulse'
              : 'bg-slate-600'
          }`}
        />
        <span className={`text-[11px] font-medium font-mono-numbers ${!hasCode && !isConnected ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
          {isConnected
            ? `Connected 🔑 · ${latencyMs} ms · ${carrier} Core`
            : isConnecting
            ? '🚨 Establishing TLS 1.3 tunnel to South Africa...'
            : isError
            ? 'Connection rejected: Access code required'
            : !hasCode
            ? '⚠️ GO AND GET A CODE TO ADMIN RIGHT NOW'
            : `Disconnected · Ready for ${carrier}`}
        </span>

        {/* Small info trigger */}
        <button
          type="button"
          onClick={() => setShowTooltip(!showTooltip)}
          title="VPN Connection Information"
          className="text-slate-500 hover:text-cyan-400 p-0.5"
        >
          <Info className="w-3 h-3" />
        </button>

        {/* Tooltip Dialog */}
        {showTooltip && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-64 p-3 rounded-2xl bg-[#09152B] border border-cyan-500/40 shadow-2xl text-left text-xs text-slate-300 animate-fade-in backdrop-blur-md">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 mb-1.5">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>VPN Status & Security</span>
              </span>
              <button
                type="button"
                onClick={() => setShowTooltip(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="text-[10px] space-y-1 text-slate-300">
              <p>
                {isConnected
                  ? `Active encrypted tunnel via ${carrier} APN routing to 102.130.112.45 with MTU 1500.`
                  : 'Traffic is currently unencrypted. Tap CONNECT with an active code to start.'}
              </p>
              {virtualIp && (
                <div className="text-cyan-300 font-mono-numbers">
                  Virtual IP: {virtualIp}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
