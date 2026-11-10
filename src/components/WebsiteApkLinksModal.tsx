import React, { useState } from 'react';
import {
  Globe,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Download,
  Share2,
  MessageCircle,
  X,
  QrCode,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { SalvationVpnLogo } from './SalvationVpnLogo';
import { SUPPORT_CONTACT } from '../types/vpn';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentAccessCode?: string;
}

export const WebsiteApkLinksModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentAccessCode = '',
}) => {
  const [copiedLink, setCopiedLink] = useState<'website' | 'apk' | 'applink' | null>(null);
  const [showQr, setShowQr] = useState(false);
  const { isInstallable, install } = usePWAInstall();

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://salvation-vpn.co.za';
  const websiteUrl = origin;
  const apkDownloadUrl = `${origin}/api/vpn/download/apk`;
  const appActivationLink = currentAccessCode.trim()
    ? `${origin}/?code=${encodeURIComponent(currentAccessCode.trim())}`
    : `${origin}/?ref=salvation_vpn`;

  const copyToClipboard = (text: string, type: 'website' | 'apk' | 'applink') => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const shareOnWhatsApp = (target: 'website' | 'apk') => {
    const text =
      target === 'website'
        ? `🇿🇦 *SALVATION MAHUMANE VPN TOP SA*\n\nVisit our official website to browse high-speed South Africa VPN plans (MTN, Telkom, Cell C, Vodacom):\n🌐 ${websiteUrl}\n\n🔑 Contact Admin Salvation Mahumane (+27 63 824 9382) for your access code!`
        : `🇿🇦 *SALVATION MAHUMANE VPN ANDROID APK*\n\nDownload the official Android APK directly to your phone:\n📥 ${apkDownloadUrl}\n\n⚡ 9 South African provinces covered with zero-rating & TLS 1.3 tunnel!`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const triggerApkDownload = () => {
    const a = document.createElement('a');
    a.href = apkDownloadUrl;
    a.download = 'SalvationMahumaneVPN-TOP-SA.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (isInstallable) {
      setTimeout(() => install(), 600);
    }
  };

  // Generate SVG QR code data URL using QR server API or local SVG
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(websiteUrl)}&color=00E5FF&bgcolor=09152B`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm rounded-[28px] bg-gradient-to-b from-[#09152B] via-[#060E20] to-[#040814] border border-cyan-500/40 p-5 shadow-[0_0_50px_rgba(0,229,255,0.25)] relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <SalvationVpnLogo size={38} className="shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                Website & APK Links
              </h3>
              <p className="text-[10px] text-cyan-300">
                Share web app or open Android APK
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

        {/* SECTION 1: VISIT MY WEBSITE */}
        <div className="my-3 p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Official Website Link</span>
            </div>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
              LIVE 24/7
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-cyan-300 truncate max-w-[200px] select-all">
              {websiteUrl}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(websiteUrl, 'website')}
              title="Copy Website Link"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              {copiedLink === 'website' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Quick Actions for Website */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Visit Website</span>
            </a>

            <button
              type="button"
              onClick={() => shareOnWhatsApp('website')}
              className="h-9 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-[#25D366]" />
              <span>Share on WA</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: OPEN / DOWNLOAD THE APK */}
        <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#07172A] to-[#0A2338] border border-cyan-400/40 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Smartphone className="w-4 h-4 text-[#00FFA3]" />
              <span>Android APK Download Link</span>
            </div>
            <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded border border-cyan-500/30">
              v2.4 ANDROID
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Install the native Android APK package directly to your phone for high-speed South Africa tunneling.
          </p>

          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-300 truncate max-w-[200px] select-all">
              {apkDownloadUrl}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(apkDownloadUrl, 'apk')}
              title="Copy APK Link"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              {copiedLink === 'apk' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Primary APK Download & Open Button */}
          <button
            type="button"
            onClick={triggerApkDownload}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 hover:opacity-95 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,163,0.4)] active:scale-98 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>DOWNLOAD & OPEN APK NOW</span>
          </button>

          <button
            type="button"
            onClick={() => shareOnWhatsApp('apk')}
            className="w-full h-8 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Send Direct APK Link on WhatsApp</span>
          </button>
        </div>

        {/* SECTION 3: APP LINK WITH ACTIVE CODE (1-TAP AUTO-CONNECT) */}
        {currentAccessCode && (
          <div className="my-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-amber-300 font-bold text-[11px] flex items-center gap-1">
                <span>🔑 Your 1-Tap App Link</span>
              </span>
              <span className="font-mono text-white text-[10px] font-bold">
                {currentAccessCode}
              </span>
            </div>
            <div className="p-1.5 rounded bg-slate-950 border border-amber-500/20 flex items-center justify-between font-mono text-[10px] text-slate-300">
              <span className="truncate max-w-[210px]">{appActivationLink}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(appActivationLink, 'applink')}
                className="p-1 text-slate-400 hover:text-amber-300 transition-colors"
              >
                {copiedLink === 'applink' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}

        {/* QR CODE TOGGLE */}
        <div className="mt-3 pt-2 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{showQr ? 'Hide QR Code' : 'Show QR Code to Scan on Phone'}</span>
          </button>

          {showQr && (
            <div className="mt-2.5 p-4 rounded-2xl bg-[#09152B] border border-cyan-500/40 inline-flex flex-col items-center animate-fade-in shadow-xl">
              <img
                src={qrCodeUrl}
                alt="Website QR Code"
                className="w-44 h-44 rounded-xl border border-cyan-400/40 shadow-inner"
              />
              <span className="text-[10px] text-slate-300 mt-2 font-medium">
                Scan with camera to open website on phone
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
