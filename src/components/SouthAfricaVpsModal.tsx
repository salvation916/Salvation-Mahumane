import React, { useState } from 'react';
import {
  Server,
  Shield,
  Lock,
  Cpu,
  Globe,
  Check,
  Copy,
  Zap,
  X,
  Radio,
  Sliders,
  ExternalLink,
  Code2,
  Share2,
  FileText,
  Activity,
  Flame,
} from 'lucide-react';
import {
  SOUTH_AFRICA_NODES,
  CARRIER_SNI_PRESETS,
  Carrier,
  TlsMode,
  ServerNode,
} from '../types/vpn';
import { vpnEngine } from '../services/vpnEngine';
import { SalvationVpnLogo } from './SalvationVpnLogo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeCarrier: Carrier;
  onCarrierChange?: (carrier: Carrier) => void;
}

export const SouthAfricaVpsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeCarrier,
  onCarrierChange,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(() => vpnEngine.getSelectedNodeId());
  const [tlsMode, setTlsMode] = useState<TlsMode>(() => vpnEngine.getTlsMode());
  const [sniHost, setSniHost] = useState<string>(() => vpnEngine.getSniHost());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'nodes' | 'tls' | 'vps' | 'export'>('nodes');
  const [appliedFeedback, setAppliedFeedback] = useState(false);

  if (!isOpen) return null;

  const activeNode = SOUTH_AFRICA_NODES.find((n) => n.id === selectedNodeId) || SOUTH_AFRICA_NODES[0];
  const carrierPresets = CARRIER_SNI_PRESETS[activeCarrier] || CARRIER_SNI_PRESETS.MTN;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyConfig = () => {
    vpnEngine.setSelectedNodeId(selectedNodeId);
    vpnEngine.setTlsMode(tlsMode);
    vpnEngine.setSniHost(sniHost);
    setAppliedFeedback(false);
    setTimeout(() => {
      setAppliedFeedback(false);
      onClose();
    }, 900);
  };

  // HTTP Custom snippet generator for South Africa tunnelers
  const httpCustomPayload = `GET / HTTP/1.1[crlf]Host: ${sniHost}[crlf]X-Online-Host: ${sniHost}[crlf]Connection: Keep-Alive[crlf]User-Agent: [ua][crlf]Upgrade: websocket[crlf][crlf]`;

  // HA Tunnel Plus export snippet
  const haTunnelConfig = `[HA-Tunnel-Plus-ZA]
Server=${activeNode.ip}
Port=443
SNI=${sniHost}
Payload=${httpCustomPayload}
DNS=196.43.1.11,196.25.1.1
Mode=TLS/SSL Direct`;

  // V2Ray VLESS URL for South Africa
  const v2rayLink = `vless://salvation-sa@${activeNode.ip}:443?encryption=none&security=tls&sni=${sniHost}&type=ws&host=${sniHost}&path=%2Fsalvation-ws#SALVATION-ZA-${activeNode.city.replace(/\s+/g, '')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md rounded-[28px] bg-gradient-to-b from-[#09152B] via-[#060E20] to-[#040814] border border-cyan-500/40 p-5 shadow-[0_0_50px_rgba(0,229,255,0.25)] relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <SalvationVpnLogo size={36} className="shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white font-heading">
                  South Africa VPS & TLS SNI
                </h3>
                <span className="text-[9px] font-black tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  9 PROVINCES
                </span>
              </div>
              <p className="text-[10px] text-cyan-300">
                North West, Mpumalanga, Gauteng, Western Cape & more
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Strict South Africa Lock Notice */}
        <div className="my-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-[11px] text-emerald-300">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <strong>Connect Only On South Africa Works:</strong> All 9 South African provinces supported (North West, Mpumalanga, Gauteng, Western Cape, KZN, Limpopo, Free State, Eastern Cape, Northern Cape) for lowest ping and carrier zero-rating.
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 my-2 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('nodes')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'nodes' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            🇿🇦 Nodes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tls')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'tls' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔒 TLS SNI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vps')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'vps' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            🖥️ VPS Spec
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'export' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            📤 Export
          </button>
        </div>

        {/* TAB 1: SOUTH AFRICA NODES */}
        {activeTab === 'nodes' && (
          <div className="space-y-2 my-2 animate-fade-in text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Select High-Speed South Africa VPS Core Node:
            </span>
            {SOUTH_AFRICA_NODES.map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400/80 shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {node.id.split('-')[1].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white text-xs">{node.name}</span>
                        {node.province && (
                          <span className="text-[9px] bg-amber-400/15 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                            {node.province}
                          </span>
                        )}
                        <span className="text-[9px] bg-slate-800 text-cyan-300 px-1 py-0.2 rounded font-mono">
                          {node.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {node.city} {node.province ? `(${node.province})` : ''} · <span className="font-mono text-slate-300">{node.ip}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {node.latencyBase} ms
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      Load: {node.load}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: TLS ENGINE & SNI BUG HOSTS */}
        {activeTab === 'tls' && (
          <div className="space-y-3 my-2 animate-fade-in text-xs">
            {/* TLS Mode Switcher */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                TLS Engine Protocol Mode ("App Works Like TLS")
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'TLS_DIRECT_SNI', label: 'TLS Direct SNI (Port 443)', badge: 'Recommended' },
                  { id: 'TLS_PAYLOAD', label: 'TLS + Custom Payload', badge: 'HTTP Custom' },
                  { id: 'V2RAY_WS_TLS', label: 'V2Ray WS-TLS 1.3', badge: 'WebSocket' },
                  { id: 'WIREGUARD', label: 'WireGuard UDP / SSL', badge: '51820' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTlsMode(m.id as TlsMode)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      tlsMode === m.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-[11px]">{m.label}</div>
                    <span className="text-[9px] text-cyan-300 font-semibold">{m.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Carrier SNI Presets */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                South African Carrier SNI Bug Hosts ({activeCarrier})
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => setSniHost(carrierPresets.defaultSni)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    sniHost === carrierPresets.defaultSni
                      ? 'bg-cyan-400 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ★ {carrierPresets.defaultSni}
                </button>
                {carrierPresets.altSni.map((alt) => (
                  <button
                    key={alt}
                    type="button"
                    onClick={() => setSniHost(alt)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                      sniHost === alt
                        ? 'bg-cyan-400 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {alt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom SNI Host Input */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Active SNI Host Domain (Port 443 Spoof)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={sniHost}
                  onChange={(e) => setSniHost(e.target.value)}
                  placeholder="e.g. mydata.mtn.co.za"
                  className="w-full h-10 px-3 pr-8 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white font-mono placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(sniHost, 'sni')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  {copiedKey === 'sni' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Live TLS Handshake Spec Preview */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono space-y-1">
              <div className="text-slate-400">TLS Version: <span className="text-white">TLS 1.3 (RFC 8446)</span></div>
              <div className="text-slate-400">Target Port: <span className="text-cyan-400">443 (HTTPS Direct)</span></div>
              <div className="text-slate-400">Cipher: <span className="text-slate-200">TLS_CHACHA20_POLY1305_SHA256</span></div>
              <div className="text-slate-400">ALPN: <span className="text-slate-200">h2, http/1.1</span></div>
              <div className="text-slate-400">SNI Header: <span className="text-emerald-400 font-bold">{sniHost}</span></div>
            </div>
          </div>
        )}

        {/* TAB 3: FULL VPS DETAILS & CREDENTIALS */}
        {activeTab === 'vps' && (
          <div className="space-y-2.5 my-2 animate-fade-in text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              South Africa VPS Server Credentials:
            </span>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">VPS Hostname:</span>
                <span className="text-white font-bold">{activeNode.host}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">Public IP:</span>
                <span className="text-emerald-400 font-bold">{activeNode.ip}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">SSL / TLS Port:</span>
                <span className="text-cyan-400 font-bold">443</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">Dropbear / SSH:</span>
                <span className="text-slate-200">442 / 22</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">V2Ray WebSocket:</span>
                <span className="text-slate-200">Port 443 · Path: /salvation-ws</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                <span className="text-slate-400">WireGuard Endpoint:</span>
                <span className="text-slate-200">{activeNode.wireguardEndpoint}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">South Africa DNS:</span>
                <span className="text-slate-300">196.43.1.11, 196.25.1.1</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-slate-300">
              💡 <strong>Zero-Rating APN:</strong> Use with carrier APN <code>{activeCarrier === 'MTN' ? 'mydata.mtn.co.za' : 'internet'}</code> and active access code.
            </div>
          </div>
        )}

        {/* TAB 4: EXPORT FOR HTTP CUSTOM, HA TUNNEL & V2RAY */}
        {activeTab === 'export' && (
          <div className="space-y-2.5 my-2 animate-fade-in text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              1-Click Copy Configs for South African Tunnel Apps:
            </span>

            {/* HTTP Custom Payload */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-[11px]">HTTP Custom (.hc) Payload</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(httpCustomPayload, 'hc')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'hc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'hc' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2 rounded bg-slate-900 text-[9px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
                {httpCustomPayload}
              </pre>
            </div>

            {/* HA Tunnel Plus String */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-[11px]">HA Tunnel Plus (.hat) Config</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(haTunnelConfig, 'hat')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'hat' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'hat' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2 rounded bg-slate-900 text-[9px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap break-all">
                {haTunnelConfig}
              </pre>
            </div>

            {/* V2Ray VLESS Link */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-[11px]">V2Ray VLESS Link</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(v2rayLink, 'v2ray')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'v2ray' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'v2ray' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2 rounded bg-slate-900 text-[9px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap break-all truncate">
                {v2rayLink}
              </pre>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="mt-4 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleApplyConfig}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all cursor-pointer active:scale-98"
          >
            {appliedFeedback ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>APPLIED TO TUNNEL ENGINE!</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-slate-950" />
                <span>APPLY TO APP TUNNEL ENGINE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
