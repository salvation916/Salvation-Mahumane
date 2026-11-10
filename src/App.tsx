import React, { useState, useEffect } from 'react';
import { vpnEngine } from './services/vpnEngine';
import { Carrier, ConnectionState, VpnLiveTelemetry, VpnConnectionDetails, DataPlan, DATA_PLANS, SUPPORT_CONTACT } from './types/vpn';
import { WhatsAppTopBanner } from './components/WhatsAppTopBanner';
import { GlobeGraphic } from './components/GlobeGraphic';
import { CarrierSelector } from './components/CarrierSelector';
import { ConnectButton } from './components/ConnectButton';
import { StatsGrid } from './components/StatsGrid';
import { ActivePlanCard } from './components/ActivePlanCard';
import { TrialCodeModal } from './components/TrialCodeModal';
import { BottomNav, TabType } from './components/BottomNav';
import { DataPlansList } from './components/DataPlansList';
import { LogsTab } from './components/LogsTab';
import { AdminConsole } from './components/AdminConsole';
import { ApkDownloadButton } from './components/ApkDownloadButton';
import { AndroidVpnModal } from './components/AndroidVpnModal';
import { SpeedTestCard } from './components/SpeedTestCard';
import { ShareWhatsAppButton } from './components/ShareWhatsAppButton';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { ImproveConnectionCard } from './components/ImproveConnectionCard';
import { CapitecPaymentModal } from './components/CapitecPaymentModal';
import { SouthAfricaVpsModal } from './components/SouthAfricaVpsModal';
import { SalvationVpnLogo } from './components/SalvationVpnLogo';
import { playVpnAlarmSound, playHandshakeSuccessSound } from './utils/audioAlarm';
import { Crown, Gift, Smartphone, Shield, Lock, Layers, RefreshCw, KeyRound, Share2, CreditCard, AlertTriangle, MessageCircle, X } from 'lucide-react';
import { usePWAInstall } from './hooks/usePWAInstall';

export default function App() {
  // VPN Engine state
  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED');
  const [telemetry, setTelemetry] = useState<VpnLiveTelemetry>({
    uploadSpeedBps: 0,
    downloadSpeedBps: 0,
    totalUploadBytes: 0,
    totalDownloadBytes: 0,
    latencyMs: 16,
    jitterMs: 2,
    packetLossPercent: 0,
    uptimeSeconds: 0,
  });
  const [details, setDetails] = useState<VpnConnectionDetails | null>(null);

  // User input states (starts empty: "Don't show active on screen show go and get a code to admin right now")
  const [carrier, setCarrier] = useState<Carrier>('MTN');
  const [accessCode, setAccessCode] = useState<string>('');
  const [activePlan, setActivePlan] = useState<DataPlan>(DATA_PLANS[0]);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showNeedCodePrompt, setShowNeedCodePrompt] = useState(false);

  // Modal visibility
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const [showCapitecModal, setShowCapitecModal] = useState(false);
  const [showVpsModal, setShowVpsModal] = useState(false);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<{
    name: string;
    priceZar: number;
    gigabytes?: number;
    durationDays?: number;
  }>({
    name: '100GB Ultimate',
    priceZar: 50,
    gigabytes: 100,
    durationDays: 30,
  });

  // PWA install hook
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Load access code from App Link query parameter if present
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('code');
      if (codeFromUrl) {
        const clean = codeFromUrl.trim().toUpperCase();
        setAccessCode(clean);
        vpnEngine.setAccessCode(clean);
        vpnEngine.addLog('SUCCESS', 'AUTH', `Loaded single-phone code from App Link: ${clean}`);
      }
    } catch {
      // Ignored
    }
  }, []);

  // Subscribe to VPN Engine
  useEffect(() => {
    vpnEngine.setAccessCode(accessCode);
    const unsubscribe = vpnEngine.subscribe((state, telem, det) => {
      setConnectionState(state);
      setTelemetry(telem);
      setDetails(det);
    });
    return () => unsubscribe();
  }, []);

  const handleCarrierChange = (newCarrier: Carrier) => {
    setCarrier(newCarrier);
    vpnEngine.setActiveCarrier(newCarrier);
  };

  const handleConnect = async () => {
    // Play tactical alarm sound on connect tap as requested
    playVpnAlarmSound();

    if (!accessCode.trim()) {
      setShowNeedCodePrompt(true);
      return;
    }

    await vpnEngine.connect();
    if (vpnEngine.getConnectionState() === 'CONNECTED') {
      playHandshakeSuccessSound();
    }
  };

  const handleDisconnect = async () => {
    await vpnEngine.disconnect();
  };

  const handleClaimTrialCode = async (codeToClaim: string): Promise<{ success: boolean; message?: string }> => {
    const res = await vpnEngine.verifyAccessCode(codeToClaim, carrier);
    if (res.valid) {
      setAccessCode(codeToClaim);
      vpnEngine.setAccessCode(codeToClaim);
      return { success: true, message: `Active: ${res.planName || 'Trial Plan'} unlocked!` };
    }
    return { success: false, message: res.error || 'Invalid or expired trial code.' };
  };

  return (
    <div className="min-h-screen bg-[#040916] text-slate-100 flex flex-col items-center justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Outer Mobile Frame Container */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#060E21] via-[#040A18] to-[#02050D] relative border-x border-slate-900 shadow-2xl">
        
        {/* Real Android Mobile System Status Bar (With Key 🔑 on VPN Active) */}
        <AndroidStatusBar
          isConnected={connectionState === 'CONNECTED'}
          carrier={carrier}
          tunnelIp={details?.virtualIp}
          serverNodeName={details?.serverNode?.name}
        />

        {/* Top Floating WhatsApp Number Pill (Direct match to Screenshot 1) */}
        <div className="pt-2 px-3">
          <WhatsAppTopBanner phoneNumber={SUPPORT_CONTACT.phoneNumber} />
        </div>

        {/* Brand Header: Logo next to VPN Name as requested */}
        <header className="px-4 pt-2 pb-1 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            {/* User Uploaded Royal Crown Paisley Logo */}
            <SalvationVpnLogo size={42} className="shrink-0" />

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-white font-heading leading-tight">
                  SALVATION<span className="text-cyan-400">·</span>MAHUMANE VPN
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-black tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/30">
                  TOP SA
                </span>
                <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-cyan-400/80">
                  9 PROVINCES · TLS 1.3
                </span>
              </div>
            </div>
          </div>

          {/* Actions: Pay Card, WhatsApp Share & Admin Golden Crown */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowCapitecModal(true)}
              title="Pay with Card / Capitec"
              className="px-2 py-1 rounded-xl bg-cyan-400/15 border border-cyan-400/40 hover:bg-cyan-400/25 text-cyan-300 font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-cyan-300" />
              <span>Pay Card</span>
            </button>
            <ShareWhatsAppButton variant="icon" />
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              title="Admin Portal"
              className="p-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400/20 text-amber-400 transition-colors cursor-pointer"
            >
              <Crown className="w-5 h-5 fill-amber-400 text-amber-400" />
            </button>
          </div>
        </header>

        {/* TAB 1: HOME (Exact match to user's screenshots) */}
        {activeTab === 'home' && (
          <div className="flex-1 flex flex-col px-3 pb-3">
            {/* Globe Graphic Backdrop with "● South Africa" (Click to configure VPS & TLS) */}
            <GlobeGraphic
              activeNode="● South Africa"
              onClick={() => setShowVpsModal(true)}
              className="my-1"
            />

            {/* South Africa VPS & TLS Engine Status Pill */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#09152B]/90 border border-cyan-500/30 text-xs mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10B981]" />
                <span className="text-[11px] font-bold text-white font-heading">🇿🇦 South Africa VPS:</span>
                <span className="text-[10px] text-cyan-300 font-mono">
                  {details?.serverNode?.name?.split(' ')[0] || 'Johannesburg'} · 🔒 TLS 1.3
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowVpsModal(true)}
                className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-[10px] text-cyan-300 font-bold transition-all cursor-pointer active:scale-95"
              >
                Config &gt;
              </button>
            </div>

            {/* Carrier Buttons (MTN & Telkom from Screenshot 1) */}
            <CarrierSelector
              selectedCarrier={carrier}
              onSelectCarrier={handleCarrierChange}
              disabled={connectionState === 'CONNECTING'}
            />

            {/* 3-Column Stats Strip (Upload, Download, Latency) */}
            <StatsGrid
              telemetry={telemetry}
              isConnected={connectionState === 'CONNECTED'}
              carrierName={carrier}
            />

            {/* Improve Connection Tooltip/Card for South Africa Routing & Latency Optimization */}
            <ImproveConnectionCard
              latencyMs={telemetry.latencyMs}
              jitterMs={telemetry.jitterMs}
              carrier={carrier}
              onCarrierSwitch={handleCarrierChange}
              className="my-1.5"
            />

            {/* Active Plan Card with Used & Remaining Quota */}
            <ActivePlanCard
              planName={`${activePlan.gigabytes} GB Plan`}
              gigabytes={activePlan.gigabytes}
              usedBytes={telemetry.totalUploadBytes + telemetry.totalDownloadBytes}
              remainingBytes={Math.max(0, activePlan.gigabytes * 1024 * 1024 * 1024 - (telemetry.totalUploadBytes + telemetry.totalDownloadBytes))}
              expiresDateStr="21 Nov 2026"
              daysLeft={30}
              tunnelIp={details?.virtualIp || '10.84.14.92'}
              isActive={connectionState === 'CONNECTED'}
              hasActiveCode={Boolean(accessCode.trim())}
              activeCodeString={accessCode}
              onRefresh={() => vpnEngine.probeLatency()}
              onOpenPlans={() => setActiveTab('plans')}
              onGetCodeFromAdmin={() => setShowNeedCodePrompt(true)}
              onOpenCardPay={() => setShowCapitecModal(true)}
            />

            {/* Stadium Neon Connect Button (Screenshot 1) */}
            <ConnectButton
              state={connectionState}
              carrier={carrier}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              uptimeSeconds={telemetry.uptimeSeconds}
              virtualIp={details?.virtualIp}
              hasCode={Boolean(accessCode.trim())}
              latencyMs={telemetry.latencyMs}
            />

            {/* "Have a trial code?" Pill Trigger (Opens Screenshot 2 modal) */}
            <div className="my-2 flex justify-center">
              <button
                type="button"
                onClick={() => setShowTrialModal(true)}
                className="h-8 px-4 rounded-full bg-[#0A162B] hover:bg-[#0E203E] border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all active:scale-95 cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5 text-cyan-400" />
                <span>Have a trial code?</span>
                <span className="text-cyan-500">&gt;</span>
              </button>
            </div>

            {/* Invite Friends & Share on WhatsApp */}
            <ShareWhatsAppButton variant="banner" className="my-2" />

            {/* Automatic Android APK Download & Add to Home Screen Action */}
            <ApkDownloadButton className="mt-1" />
          </div>
        )}

        {/* TAB 2: USAGE (Speed Test, Bandwidth & Carrier Gateway) */}
        {activeTab === 'usage' && (
          <div className="flex-1 flex flex-col p-3 space-y-3 overflow-y-auto max-h-[75vh]">
            <h2 className="text-sm font-bold text-white font-heading">
              Network Usage & Carrier Benchmark
            </h2>

            {/* Run Speed Test Benchmark Card */}
            <SpeedTestCard carrier={carrier} tunnelIp={details?.virtualIp} />

            {/* Gateway & APN details */}
            <div className="p-3.5 rounded-2xl bg-[#09152B] border border-cyan-500/30 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Carrier Network:</span>
                <span className="text-cyan-400 font-bold">{carrier} Mobile SA</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Core Node:</span>
                <span className="text-white font-mono-numbers">Johannesburg (JNB-1)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Tunnel IP:</span>
                <span className="text-emerald-400 font-mono-numbers font-bold">
                  {details?.virtualIp || '10.84.14.92/32'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Cipher Protocol:</span>
                <span className="text-slate-300 font-mono-numbers">ChaCha20-Poly1305 (256-bit)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">MTU:</span>
                <span className="text-slate-300 font-mono-numbers">1500 (Cellular Optimized)</span>
              </div>
            </div>

            {/* Traffic Diagnostics */}
            <div className="p-3.5 rounded-2xl bg-[#09152B] border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-white block">Cumulative Session Traffic</span>
              <div className="flex justify-between text-slate-400">
                <span>Total Uploaded:</span>
                <span className="text-white font-mono-numbers">
                  {(telemetry.totalUploadBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Downloaded:</span>
                <span className="text-white font-mono-numbers">
                  {(telemetry.totalDownloadBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Round-Trip Latency:</span>
                <span className="text-cyan-400 font-mono-numbers font-bold">
                  {telemetry.latencyMs} ms (Jitter: {telemetry.jitterMs}ms)
                </span>
              </div>
            </div>

            {/* Share Speed & VPN on WhatsApp */}
            <ShareWhatsAppButton variant="button" label="Share My Speed & VPN with a Friend" className="mt-1" />
          </div>
        )}

        {/* TAB 3: PLANS (All South African Data Plans with WhatsApp Buy & Capitec Card) */}
        {activeTab === 'plans' && (
          <div className="flex-1 flex flex-col p-3 overflow-y-auto max-h-[75vh]">
            <DataPlansList
              selectedCarrier={carrier}
              onSelectPlan={(p) => {
                setActivePlan(p);
                setActiveTab('home');
              }}
              whatsappNumber={SUPPORT_CONTACT.cleanNumber}
              onPayWithCard={(plan) => {
                setSelectedPaymentPlan(plan);
                setShowCapitecModal(true);
              }}
            />
          </div>
        )}

        {/* TAB 4: LOGS (Real-time connection events & debugging) */}
        {activeTab === 'logs' && (
          <LogsTab />
        )}

        {/* TAB 5: SETTINGS / ADMIN */}
        {activeTab === 'settings' && (
          <div className="flex-1 flex flex-col p-4 space-y-3">
            <h2 className="text-base font-bold text-white font-heading">
              Settings & Administration
            </h2>

            {/* Admin Console trigger */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-[#09152B] border border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm text-amber-300 font-heading">
                  Authorised Admin Console & Income
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Log in as <code>Salvationmahumane38@gmail.com</code> to track Capitec payments (MS CT MAHUMANE) & issue codes.
              </p>
              <button
                type="button"
                onClick={() => setShowAdminModal(true)}
                className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <KeyRound className="w-4 h-4" />
                <span>Open Admin & Income Console</span>
              </button>
            </div>

            {/* Native Android VpnService source trigger */}
            <div className="p-4 rounded-2xl bg-[#09152B] border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm text-cyan-300 font-heading">
                  Android VpnService & WireGuard
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Export <code>SalvationVpnService.kt</code>, <code>AndroidManifest.xml</code>, and <code>.conf</code> files.
              </p>
              <button
                type="button"
                onClick={() => setShowAndroidModal(true)}
                className="w-full h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>View Android Native Sources</span>
              </button>
            </div>

            {/* APK Download & Add to Home Screen */}
            <div className="p-4 rounded-2xl bg-[#09152B] border border-slate-800">
              <span className="font-bold text-sm text-white block mb-1">
                Install App on Phone
              </span>
              <p className="text-xs text-slate-400 mb-3">
                Download the APK installer or add this app directly to your Android home screen.
              </p>
              <ApkDownloadButton />
            </div>

            {/* Footer reference note matching Screenshot 2 */}
            <div className="pt-4 text-center text-[10px] text-slate-500 leading-relaxed">
              <div>SALVATION MAHUMANE VPN TOP SA · About & licenses</div>
              <div>For education purposes and securing your IP address</div>
            </div>
          </div>
        )}

        {/* 5-Tab Bottom Navigation Bar */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* ---------------- MODALS ---------------- */}

      {/* Capitec Card Payment Modal (MS CT MAHUMANE · 1707317036) */}
      <CapitecPaymentModal
        isOpen={showCapitecModal}
        onClose={() => setShowCapitecModal(false)}
        planName={selectedPaymentPlan.name}
        amountZar={selectedPaymentPlan.priceZar}
        carrier={carrier}
        gigabytes={selectedPaymentPlan.gigabytes}
        durationDays={selectedPaymentPlan.durationDays}
        onApplyCode={(newCode) => {
          setAccessCode(newCode);
          vpnEngine.setAccessCode(newCode);
          handleConnect();
        }}
      />

      {/* Trial Code Modal (Exact match to Screenshot 2) */}
      <TrialCodeModal
        isOpen={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        onClaimCode={handleClaimTrialCode}
        onOpenActivation={() => {
          setShowTrialModal(false);
          setActiveTab('plans');
        }}
        isOnline={connectionState === 'CONNECTED'}
      />

      {/* Admin Console Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl p-5 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl">
            <AdminConsole
              onClose={() => setShowAdminModal(false)}
              onCodeGenerated={(newCode) => {
                setAccessCode(newCode);
                vpnEngine.setAccessCode(newCode);
              }}
            />
          </div>
        </div>
      )}

      {/* Android VpnService & WireGuard Sources Modal */}
      {showAndroidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl p-5 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-2xl">
            <AndroidVpnModal
              onClose={() => setShowAndroidModal(false)}
              activeCarrier={carrier}
              accessCode={accessCode}
            />
          </div>
        </div>
      )}

      {/* South Africa VPS & TLS SNI Configuration Modal */}
      <SouthAfricaVpsModal
        isOpen={showVpsModal}
        onClose={() => setShowVpsModal(false)}
        activeCarrier={carrier}
        onCarrierChange={handleCarrierChange}
      />

      {/* "GO AND GET A CODE TO ADMIN RIGHT NOW" Alert Modal */}
      {showNeedCodePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in select-none">
          <div className="w-full max-w-sm rounded-[28px] bg-gradient-to-b from-[#1C0E12] via-[#14080B] to-[#0D0407] border border-rose-500/50 p-5 shadow-[0_0_50px_rgba(244,63,94,0.3)] relative">
            <div className="flex items-start justify-between pb-3 border-b border-rose-500/30">
              <div className="flex items-center gap-2.5">
                <SalvationVpnLogo size={38} className="shrink-0" />
                <div>
                  <h3 className="text-xs font-black tracking-wider text-rose-400 uppercase font-heading">
                    GO AND GET A CODE TO ADMIN RIGHT NOW
                  </h3>
                  <p className="text-[10px] text-amber-300/90 font-medium">
                    Admin: Salvation Mahumane
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNeedCodePrompt(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3 space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-300 font-extrabold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Access Code Required to Connect</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  You tapped connect, but no active pass was found on your phone. Go and get a single-phone code directly from <strong>Salvation Mahumane</strong> right now!
                </p>
              </div>

              {/* 1-Tap Action: WhatsApp Admin */}
              <button
                type="button"
                onClick={() => {
                  setShowNeedCodePrompt(false);
                  const msg = encodeURIComponent(
                    `Hello Salvation Mahumane,\n\nI need a code for SALVATION MAHUMANE VPN TOP SA right now. Please generate my single-phone access pass.\n\nThank you!`
                  );
                  window.open(`https://wa.me/${SUPPORT_CONTACT.cleanNumber}?text=${msg}`, '_blank');
                }}
                className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#20BD5C] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>WhatsApp Admin Salvation Mahumane</span>
              </button>

              {/* 1-Tap Action: Pay with Card / Capitec */}
              <button
                type="button"
                onClick={() => {
                  setShowNeedCodePrompt(false);
                  setShowCapitecModal(true);
                }}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay R50 to Capitec (MS CT MAHUMANE)</span>
              </button>

              {/* 1-Tap Action: Claim Trial Code if available */}
              <button
                type="button"
                onClick={() => {
                  setShowNeedCodePrompt(false);
                  setShowTrialModal(true);
                }}
                className="w-full h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5 text-cyan-400" />
                <span>I Have a Code to Enter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
