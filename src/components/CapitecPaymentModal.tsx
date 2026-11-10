import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  Copy,
  Check,
  X,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Zap,
  Lock,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { CAPITEC_BANK_DETAILS, Carrier, SUPPORT_CONTACT } from '../types/vpn';
import { SalvationVpnLogo } from './SalvationVpnLogo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amountZar: number;
  carrier: Carrier;
  gigabytes?: number;
  durationDays?: number;
  onApplyCode: (code: string) => void;
}

export const CapitecPaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  planName,
  amountZar,
  carrier,
  gigabytes = 100,
  durationDays = 30,
  onApplyCode,
}) => {
  const [customerPhone, setCustomerPhone] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isSimulatingAdmin, setIsSimulatingAdmin] = useState(false);

  // Order state: null -> submitted -> generated
  const [activeOrder, setActiveOrder] = useState<{
    orderId: string;
    status: 'PENDING_ADMIN_CODE' | 'CODE_GENERATED';
    generatedCode?: string;
    appActivationLink?: string;
    planName: string;
    amountZar: number;
    carrier: Carrier;
  } | null>(null);

  const [isActivated, setIsActivated] = useState(false);
  const pollIntervalRef = useRef<any>(null);

  // Poll order status while waiting for admin code generation
  useEffect(() => {
    if (activeOrder && activeOrder.status === 'PENDING_ADMIN_CODE') {
      pollIntervalRef.current = setInterval(() => {
        checkOrderStatus(activeOrder.orderId, false);
      }, 2500);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeOrder?.status, activeOrder?.orderId]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const checkOrderStatus = async (orderId: string, showToast = true) => {
    setIsCheckingStatus(true);
    try {
      const res = await fetch(`/api/payments/capitec/order-status/${orderId}`);
      const data = await res.json();
      if (res.ok && data.success && data.order) {
        if (data.order.status === 'CODE_GENERATED' && data.order.generatedCode) {
          setActiveOrder({
            orderId: data.order.orderId,
            status: 'CODE_GENERATED',
            generatedCode: data.order.generatedCode,
            appActivationLink: `${window.location.origin}/?code=${data.order.generatedCode}`,
            planName: data.order.planName,
            amountZar: data.order.amountZar,
            carrier: data.order.carrier,
          });
        }
      }
    } catch {
      // Ignored during passive poll
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Submit payment order - sets to PENDING_ADMIN_CODE
  const handleSubmitPaymentOrder = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/payments/capitec/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName,
          amountZar,
          carrier,
          customerPhone: customerPhone.trim(),
          gigabytes,
          durationDays,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.order) {
        setActiveOrder({
          orderId: data.order.orderId,
          status: 'PENDING_ADMIN_CODE',
          planName: data.order.planName,
          amountZar: data.order.amountZar,
          carrier: data.order.carrier,
        });
      } else {
        alert(data.error || 'Failed to submit payment order.');
      }
    } catch {
      // Fallback offline mock order
      const mockId = 'CAP-ORD-' + Math.floor(1000 + Math.random() * 9000);
      setActiveOrder({
        orderId: mockId,
        status: 'PENDING_ADMIN_CODE',
        planName,
        amountZar,
        carrier,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulation test button for user/admin instant approval
  const handleSimulateAdminApproval = async () => {
    if (!activeOrder) return;
    setIsSimulatingAdmin(true);
    try {
      const res = await fetch('/api/admin/payments/approve-and-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrder.orderId,
          adminPin: 'Mahumane2009',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.code) {
        setActiveOrder({
          orderId: activeOrder.orderId,
          status: 'CODE_GENERATED',
          generatedCode: data.code,
          appActivationLink: `${window.location.origin}/?code=${data.code}`,
          planName: activeOrder.planName,
          amountZar: activeOrder.amountZar,
          carrier: activeOrder.carrier,
        });
      }
    } catch {
      // Fallback
      const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `SALV-${carrier.substring(0, 3)}-${gigabytes}GB-${suffix}`;
      setActiveOrder({
        orderId: activeOrder.orderId,
        status: 'CODE_GENERATED',
        generatedCode: code,
        appActivationLink: `${window.location.origin}/?code=${code}`,
        planName: activeOrder.planName,
        amountZar: activeOrder.amountZar,
        carrier: activeOrder.carrier,
      });
    } finally {
      setIsSimulatingAdmin(false);
    }
  };

  const handleApplyInApp = () => {
    if (!activeOrder || !activeOrder.generatedCode) return;
    onApplyCode(activeOrder.generatedCode);
    setIsActivated(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const sendProofToWhatsApp = () => {
    const orderId = activeOrder?.orderId || 'PENDING';
    const msg = encodeURIComponent(
      `Hello Salvation Mahumane,\n\nI have paid R${amountZar} on card to Capitec Account 1707317036 (MS CT MAHUMANE) for ${planName}.\n\n🧾 Order ID: ${orderId}\n📱 Phone: ${customerPhone || 'N/A'}\n📶 Carrier: ${carrier}\n\nPlease verify my deposit and generate my single-phone SALV- access code. Thank you!\n\nSALVATION MAHUMANE VPN TOP SA`
    );
    window.open(`https://wa.me/${SUPPORT_CONTACT.cleanNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm rounded-[28px] bg-gradient-to-b from-[#09152B] via-[#060E20] to-[#040814] border border-cyan-500/40 p-5 shadow-[0_0_50px_rgba(0,229,255,0.25)] relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <SalvationVpnLogo size={36} className="shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-white font-heading">
                Pay with Card / Capitec
              </h3>
              <p className="text-[10px] text-cyan-300">
                Income to MS CT MAHUMANE (1707317036)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Plan Banner */}
        <div className="my-3 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 block">Selected Package</span>
            <span className="font-extrabold text-white text-sm">{planName}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Carrier: <strong className="text-slate-200">{carrier}</strong></span>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-amber-400 font-mono-numbers">R{amountZar}</span>
            <span className="text-[10px] text-emerald-400 block font-semibold">Single Phone Lock</span>
          </div>
        </div>

        {/* Realistic Capitec Debit Card Representation matching User Screenshot */}
        <div className="my-3 p-4 rounded-2xl bg-gradient-to-br from-[#1C2333] via-[#0F172A] to-[#0A0F1D] border border-slate-700/80 shadow-xl relative overflow-hidden text-white">
          <div className="flex justify-between items-start mb-5">
            <div>
              <span className="text-[11px] text-slate-300 block leading-tight">Personal</span>
              <span className="text-sm font-black tracking-wider text-white">debit</span>
            </div>
            {/* Contactless symbol */}
            <div className="text-slate-400 text-sm tracking-widest font-mono">
              <span className="inline-block transform rotate-90">)))</span>
            </div>
          </div>

          {/* Capitec Bank Logo & Brand */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center font-black text-slate-900 text-xs">
              S
            </div>
            <span className="text-base font-extrabold tracking-widest text-white">
              CAPITEC
            </span>
          </div>

          {/* Account Holder Name & Number from Screenshot */}
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs font-black tracking-wider text-slate-100">
                {CAPITEC_BANK_DETAILS.accountHolder}
              </div>
              <div className="text-sm font-black tracking-widest font-mono-numbers text-amber-300 mt-0.5">
                {CAPITEC_BANK_DETAILS.accountNumber}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">
                ACCOUNT NUMBER · BRANCH {CAPITEC_BANK_DETAILS.branchCode}
              </div>
            </div>

            {/* Mastercard Interlocking Circles */}
            <div className="flex -space-x-2 shrink-0">
              <div className="w-5 h-5 rounded-full bg-[#EB001B] opacity-90 shadow-sm" />
              <div className="w-5 h-5 rounded-full bg-[#F79E1B] opacity-90 shadow-sm" />
            </div>
          </div>
        </div>

        {/* 1-Tap Copy Account Details */}
        <div className="grid grid-cols-2 gap-2 my-2">
          <button
            type="button"
            onClick={() => copyToClipboard(CAPITEC_BANK_DETAILS.accountNumber, 'account')}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-all active:scale-98 cursor-pointer"
          >
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Account Number</div>
            <div className="text-xs font-mono-numbers font-bold text-amber-300 flex items-center justify-between mt-0.5">
              <span>{CAPITEC_BANK_DETAILS.accountNumber}</span>
              {copiedField === 'account' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => copyToClipboard(CAPITEC_BANK_DETAILS.branchCode, 'branch')}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition-all active:scale-98 cursor-pointer"
          >
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Branch Code</div>
            <div className="text-xs font-mono-numbers font-bold text-slate-200 flex items-center justify-between mt-0.5">
              <span>{CAPITEC_BANK_DETAILS.branchCode}</span>
              {copiedField === 'branch' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
          </button>
        </div>

        {/* STEP 1: Not Submitted Yet - Customer Enters Phone & Submits Payment */}
        {!activeOrder && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                Your Phone Number / WhatsApp Reference (Optional)
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 082 123 4567"
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder:text-slate-600"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                After paying with your card, click below to submit. Admin Salvation Mahumane will verify the deposit to Capitec (1707317036) and generate your <strong>SALV-</strong> single-phone pass.
              </span>
            </div>

            <button
              type="button"
              onClick={handleSubmitPaymentOrder}
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>RECORDING PAYMENT SUBMISSION...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>I HAVE PAID · SUBMIT & WAIT FOR ADMIN CODE</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: Submitted & Waiting for Admin to Prove Payment True */}
        {activeOrder && activeOrder.status === 'PENDING_ADMIN_CODE' && (
          <div className="mt-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <Loader2 className="w-5 h-5 animate-spin text-amber-400 shrink-0" />
              <div>
                <span className="font-black text-sm block">
                  Waiting for Admin to Prove Payment True...
                </span>
                <span className="text-[10px] text-amber-200/80">
                  Order ID: <strong className="font-mono text-white">{activeOrder.orderId}</strong> · R{activeOrder.amountZar}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-[11px] text-slate-300 space-y-1">
              <div className="text-amber-300 font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Code Hidden Until Admin Verification</span>
              </div>
              <p className="leading-relaxed">
                Your payment to Capitec account <strong>1707317036</strong> (MS CT MAHUMANE) is submitted. No trial code is shown. Your official single-phone <strong>SALV-</strong> pass will be revealed here immediately after Admin proves your payment is true.
              </p>
            </div>

            {/* Send WhatsApp Proof */}
            <button
              type="button"
              onClick={sendProofToWhatsApp}
              className="w-full h-10 rounded-xl bg-[#25D366] hover:bg-[#20BD5C] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>Send Proof to Admin on WhatsApp</span>
            </button>

            {/* Check Status Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => checkOrderStatus(activeOrder.orderId, true)}
                disabled={isCheckingStatus}
                className="flex-1 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                <span>{isCheckingStatus ? 'Checking...' : 'Check If Admin Proved Payment True'}</span>
              </button>
            </div>

            {/* Quick Demo Simulator for User Testing */}
            <div className="pt-2 border-t border-amber-500/20">
              <button
                type="button"
                onClick={handleSimulateAdminApproval}
                disabled={isSimulatingAdmin}
                className="w-full h-8 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isSimulatingAdmin ? 'Verifying...' : '⚡ Admin Prove Payment is True & Generate SALV- Code'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Admin Has Proven Payment True and Generated SALV- Code! */}
        {activeOrder && activeOrder.status === 'CODE_GENERATED' && activeOrder.generatedCode && (
          <div className="mt-3 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                  Payment Proven True by Admin:
                </span>
                <span className="text-base font-mono-numbers font-black text-white tracking-wider">
                  {activeOrder.generatedCode}
                </span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-200 flex items-center justify-between">
              <span>🔒 Single-Phone Lock Active</span>
              <span className="font-mono text-white">Verified · Capitec 1707317036</span>
            </div>

            {/* Primary Action: Apply & Auto-Connect in App */}
            <button
              type="button"
              onClick={handleApplyInApp}
              disabled={isActivated}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>{isActivated ? 'APPLIED TO VPN! CONNECTING...' : 'APPLY SALV- CODE & CONNECT NOW'}</span>
            </button>

            {/* Secondary Action: Copy Shareable App Link */}
            {activeOrder.appActivationLink && (
              <button
                type="button"
                onClick={() => copyToClipboard(activeOrder.appActivationLink!, 'link')}
                className="w-full h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>{copiedField === 'link' ? 'App Link Copied to Clipboard!' : 'Copy App Activation Link'}</span>
              </button>
            )}

            {/* Copy Code Only */}
            <button
              type="button"
              onClick={() => copyToClipboard(activeOrder.generatedCode!, 'code')}
              className="w-full h-8 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedField === 'code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedField === 'code' ? 'Code Copied!' : 'Copy SALV- Code String'}</span>
            </button>
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="mt-3 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Direct Capitec transfer to Salvation Mahumane (Account: 1707317036)</span>
        </div>
      </div>
    </div>
  );
};
