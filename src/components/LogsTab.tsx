import React, { useState, useEffect, useRef } from 'react';
import { vpnEngine } from '../services/vpnEngine';
import { VpnLogEntry } from '../types/vpn';
import {
  Terminal,
  Copy,
  Check,
  Trash2,
  Download,
  Filter,
  MessageCircle,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const LogsTab: React.FC = () => {
  const [logs, setLogs] = useState<VpnLogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'SUCCESS' | 'ERROR'>('ALL');
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = vpnEngine.subscribeLogs((newLogs) => {
      setLogs(newLogs);
    });
    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'ALL') return true;
    if (filterLevel === 'ERROR') return log.level === 'ERROR' || log.level === 'WARN';
    return log.level === filterLevel;
  });

  const handleCopy = () => {
    const text = logs.map((l) => `${l.timestamp} [${l.level}] [${l.category}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `SALVATION MAHUMANE VPN TOP SA - SYSTEM CONNECTION LOGS\nGenerated: ${new Date().toLocaleString()}\n\n` +
      logs.map((l) => `${l.timestamp} [${l.level}] [${l.category}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SalvationVPN-Logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareWhatsApp = () => {
    const summary = logs.slice(-8).map((l) => `${l.timestamp} [${l.level}] ${l.message}`).join('\n');
    const text = encodeURIComponent(
      `Hello SALVATION MAHUMANE VPN Support,\n\nHere are my recent connection debug logs:\n\n${summary}\n\nPlease help me resolve my connectivity issue.`
    );
    window.open(`https://wa.me/27603962303?text=${text}`, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col p-3 space-y-2.5 max-h-[75vh] select-none">
      {/* Header & Actions */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white font-heading">
            Live Connection Logs
          </h2>
          <span className="text-[10px] text-cyan-400 font-mono-numbers px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/20">
            {filteredLogs.length} events
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            title="Copy logs"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            title="Download log file"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => vpnEngine.clearLogs()}
            title="Clear logs"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => setFilterLevel('ALL')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ${
            filterLevel === 'ALL'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilterLevel('SUCCESS')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ${
            filterLevel === 'SUCCESS'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Success
        </button>
        <button
          type="button"
          onClick={() => setFilterLevel('INFO')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ${
            filterLevel === 'INFO'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Info
        </button>
        <button
          type="button"
          onClick={() => setFilterLevel('ERROR')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ${
            filterLevel === 'ERROR'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Errors / Warn
        </button>
      </div>

      {/* Scrollable Terminal Console */}
      <div
        ref={logContainerRef}
        className="flex-1 min-h-[300px] max-h-[46vh] rounded-2xl bg-[#030712] border border-cyan-500/20 p-3 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1.5 shadow-inner"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No events match selected filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const levelColor =
              log.level === 'SUCCESS'
                ? 'text-[#00FFA3]'
                : log.level === 'ERROR'
                ? 'text-red-400'
                : log.level === 'WARN'
                ? 'text-amber-400'
                : 'text-cyan-300';

            const categoryBadge =
              log.category === 'HANDSHAKE'
                ? 'bg-purple-500/20 text-purple-300'
                : log.category === 'AUTH'
                ? 'bg-amber-500/20 text-amber-300'
                : log.category === 'CARRIER'
                ? 'bg-yellow-500/20 text-yellow-300'
                : log.category === 'DNS'
                ? 'bg-blue-500/20 text-blue-300'
                : 'bg-slate-800 text-slate-300';

            return (
              <div key={log.id} className="flex items-start gap-1.5 hover:bg-slate-900/40 p-0.5 rounded">
                <span className="text-slate-500 shrink-0 select-none">
                  {log.timestamp}
                </span>

                <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded shrink-0 uppercase tracking-tight ${categoryBadge}`}>
                  {log.category}
                </span>

                <span className={`font-bold shrink-0 ${levelColor}`}>
                  [{log.level}]
                </span>

                <span className="text-slate-200 break-words flex-1">
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Debugging Assistance / WhatsApp Share */}
      <div className="pt-2 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Real-time kernel event stream active</span>
        </span>

        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-sm"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
          <span>Send Logs to WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
