import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, ShieldCheck, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Carrier } from '../types/vpn';

import { SalvationVpnLogo } from './SalvationVpnLogo';

interface Props {
  isConnected: boolean;
  carrier: Carrier;
  tunnelIp?: string;
  serverNodeName?: string;
}

export const AndroidStatusBar: React.FC<Props> = ({
  isConnected,
  carrier,
  tunnelIp,
  serverNodeName = 'Johannesburg Core (JNB-1)',
}) => {
  const [timeStr, setTimeStr] = useState('13:11');
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#030712] text-slate-300 select-none border-b border-slate-900/80">
      {/* Top Native Status Bar Row */}
      <div className="h-7 px-3.5 flex items-center justify-between text-[11px] font-medium tracking-tight">
        {/* Left: Device Clock & App notification icons */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white font-mono-numbers">{timeStr}</span>
          {isConnected && (
            <span
              className="text-xs text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse"
              title="Android VpnService Key Active"
            >
              🔑
            </span>
          )}
        </div>

        {/* Center: Real VPN Active pill indicator when connected */}
        {isConnected ? (
          <button
            type="button"
            onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] text-cyan-300 font-semibold cursor-pointer hover:bg-cyan-900/60 transition-all shadow-[0_0_10px_rgba(0,229,255,0.2)]"
          >
            <span className="text-amber-400">🔑</span>
            <span className="tracking-wide">VPN ACTIVE</span>
            <ChevronDown className={`w-3 h-3 text-cyan-400 transition-transform ${showNotificationDrawer ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          <div className="text-[10px] text-slate-500 font-mono tracking-wider">
            {carrier} SA
          </div>
        )}

        {/* Right: Network signal, 4G/VoLTE, Battery */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-[9px] font-bold text-slate-400 tracking-tighter">4G</span>
          <Signal className="w-3.5 h-3.5 text-slate-200 fill-slate-200" />
          <Wifi className="w-3.5 h-3.5 text-slate-200" />
          <div className="flex items-center gap-0.5 text-[10px] text-slate-200 font-mono-numbers">
            <span className="text-[9px] text-slate-300">12%</span>
            <BatteryMedium className="w-4 h-4 text-slate-300" />
          </div>
        </div>
      </div>

      {/* Android System VPN Notification Drawer (Toggleable) */}
      {isConnected && showNotificationDrawer && (
        <div className="px-3 py-2 bg-gradient-to-r from-[#071328] via-[#091C36] to-[#071328] border-t border-cyan-500/30 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <SalvationVpnLogo size={24} className="shrink-0" />
            <div>
              <div className="font-bold text-white text-[11px] flex items-center gap-1">
                <span>Salvation Mahumane VPN Connected</span>
                <span className="text-amber-400">🔑</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-[10px] text-cyan-300/90 font-mono-numbers">
                Tunnel: {tunnelIp || '10.84.14.92'} · 🔒 TLS 1.3 · 🇿🇦 {serverNodeName}
              </div>
            </div>
          </div>

          <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
            PROTECTED
          </span>
        </div>
      )}
    </div>
  );
};
