import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, ArrowDownCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  className?: string;
  autoDownloadOnMount?: boolean;
}

export const ApkDownloadButton: React.FC<Props> = ({ className = '', autoDownloadOnMount = false }) => {
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const triggerApkDownload = () => {
    setDownloading(true);
    // Create direct native download anchor
    const link = document.createElement('a');
    link.href = '/api/vpn/download/apk';
    link.setAttribute('download', 'SalvationMahumaneVPN-TOP-SA.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Also trigger PWA Add to Home Screen if supported
    if (isInstallable) {
      setTimeout(() => {
        install();
      }, 500);
    }

    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 4000);
    }, 1200);
  };

  useEffect(() => {
    if (autoDownloadOnMount) {
      triggerApkDownload();
    }
  }, [autoDownloadOnMount]);

  return (
    <div className={`w-full flex flex-col items-center justify-center gap-1.5 ${className}`}>
      {/* Automatic Direct Download / Add to Home Screen button */}
      <button
        type="button"
        onClick={triggerApkDownload}
        disabled={downloading}
        className="w-full max-w-sm h-11 px-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] via-[#00FFA3] to-[#00E5FF] hover:opacity-95 text-slate-950 font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all active:scale-98 cursor-pointer border border-cyan-200"
      >
        <Smartphone className="w-4 h-4 fill-slate-950 shrink-0" />
        <span>
          {downloading
            ? 'STARTING DOWNLOAD...'
            : downloaded
            ? '✓ APK DOWNLOADED — ADDING TO HOME SCREEN'
            : 'DOWNLOAD APK & ADD TO HOME SCREEN'}
        </span>
        <Download className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* Package indicator */}
      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono-numbers">
        <span>File: <strong className="text-cyan-400">SalvationMahumaneVPN-TOP-SA.apk</strong></span>
        <span>·</span>
        <span>Auto-install ready</span>
      </div>
    </div>
  );
};
