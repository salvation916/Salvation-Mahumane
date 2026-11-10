import React, { useState, useEffect } from 'react';
import { DATA_PLANS, Carrier, AccessCodeRecord } from '../types/vpn';
import { SalvationVpnLogo } from './SalvationVpnLogo';
import {
  ShieldAlert,
  Lock,
  KeyRound,
  PlusCircle,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  X,
  MessageCircle,
  LogOut,
  Sparkles,
  Clock,
  UserCheck,
  Smartphone,
  RotateCcw,
  Users,
  CreditCard,
  TrendingUp,
} from 'lucide-react';

interface Props {
  onClose: () => void;
  onCodeGenerated?: (code: string) => void;
}

export const AdminConsole: React.FC<Props> = ({ onClose, onCodeGenerated }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('salv_admin_auth') === 'true';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Management State
  const [codes, setCodes] = useState<AccessCodeRecord[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [incomeData, setIncomeData] = useState<{
    totalIncomeZar: number;
    ordersCount: number;
    accountHolder: string;
    accountNumber: string;
    orders: any[];
  } | null>(null);

  // Form State for Code Generation
  const [codeType, setCodeType] = useState<'PAID_SINGLE_PHONE' | 'TRIAL'>('PAID_SINGLE_PHONE');
  const [maxAllowedUsers, setMaxAllowedUsers] = useState<number>(100);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-100gb');
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | 'ALL'>('ALL');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [customerNote, setCustomerNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccessCode, setGeneratedSuccessCode] = useState<string | null>(null);

  // Fetch codes on auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchCodes();
      fetchIncome();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Invalid credentials. Only Salvation Mahumane can access this panel.');
        setIsSubmitting(false);
        return;
      }

      sessionStorage.setItem('salv_admin_auth', 'true');
      sessionStorage.setItem('salv_admin_token', data.adminToken || '');
      setIsAuthenticated(true);
      setIsSubmitting(false);
      fetchIncome();
    } catch {
      setAuthError('Connection failed. Please check backend connection.');
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('salv_admin_auth');
    sessionStorage.removeItem('salv_admin_token');
    setIsAuthenticated(false);
  };

  const fetchIncome = async () => {
    try {
      const res = await fetch('/api/admin/income?admin_pin=Mahumane2009');
      const data = await res.json();
      if (data && data.totalIncomeZar !== undefined) {
        setIncomeData(data);
      }
    } catch {
      // Ignored
    }
  };

  const fetchCodes = async () => {
    setIsLoadingCodes(true);
    try {
      const res = await fetch('/api/admin/codes?admin_pin=Mahumane2009');
      const data = await res.json();
      if (data && data.codes) {
        setCodes(data.codes);
      }
      fetchIncome();
    } catch (err) {
      console.error('Failed to load codes', err);
    } finally {
      setIsLoadingCodes(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    setApprovingOrderId(orderId);
    try {
      const res = await fetch('/api/admin/payments/approve-and-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, adminPin: 'Mahumane2009' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetFeedback(`Approved! Generated single-phone code ${data.code} for order ${orderId}.`);
        setTimeout(() => setResetFeedback(null), 4000);
        fetchIncome();
        fetchCodes();
      } else {
        alert(data.error || 'Failed to approve order and generate code.');
      }
    } catch {
      alert('Network error communicating with server.');
    } finally {
      setApprovingOrderId(null);
    }
  };

  const sendOrderCodeWhatsApp = (order: any) => {
    if (!order.generatedCode) return;
    const phone = order.customerPhone ? order.customerPhone.replace(/\D/g, '') : '';
    const cleanPhone = phone.startsWith('0') ? '27' + phone.substring(1) : phone;
    const msg = encodeURIComponent(
      `Hello! Your payment to Capitec (MS CT MAHUMANE · 1707317036) for ${order.planName} has been verified.\n\n🔑 Your Single-Phone SALV- Pass: ${order.generatedCode}\n\nOne-Tap App Activation Link:\n${window.location.origin}/?code=${order.generatedCode}\n\nThis code is locked to your single phone. Thank you for choosing SALVATION MAHUMANE VPN TOP SA!`
    );
    const target = cleanPhone ? `https://wa.me/${cleanPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(target, '_blank');
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedSuccessCode(null);

    const plan = DATA_PLANS.find((p) => p.id === selectedPlanId) || DATA_PLANS[0];

    try {
      const res = await fetch('/api/admin/codes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('salv_admin_token') || 'valid'}`,
        },
        body: JSON.stringify({
          adminPin: 'Mahumane2009',
          planName: plan.name,
          gigabytes: plan.gigabytes,
          carrier: selectedCarrier,
          durationDays,
          customerNote,
          codeType,
          maxAllowedUsers: codeType === 'TRIAL' ? Math.max(50, Number(maxAllowedUsers) || 100) : 1,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedSuccessCode(data.code.code);
        if (onCodeGenerated) onCodeGenerated(data.code.code);
        setCustomerNote('');
        fetchCodes();
      } else {
        alert(data.error || 'Failed to generate code.');
      }
    } catch (err) {
      alert('Error communicating with server.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetDevice = async (code: string) => {
    if (!confirm(`Reset single-phone binding for ${code}? This allows the customer to connect using a new or transferred phone.`)) return;

    try {
      const res = await fetch('/api/admin/codes/reset-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, adminPin: 'Mahumane2009' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetFeedback(`Device lock reset for ${code}. Customer can now bind to their new phone.`);
        setTimeout(() => setResetFeedback(null), 3500);
        fetchCodes();
      } else {
        alert(data.error || 'Failed to reset device binding.');
      }
    } catch {
      alert('Network error communicating with server.');
    }
  };

  const handleRevokeCode = async (code: string) => {
    if (!confirm(`Are you sure you want to revoke access code ${code}?`)) return;

    try {
      const res = await fetch('/api/admin/codes/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, adminPin: 'Mahumane2009' }),
      });
      if (res.ok) {
        fetchCodes();
      }
    } catch {
      alert('Failed to revoke code.');
    }
  };

  const handleDeleteCode = async (code: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY DELETE access code "${code}" from the database? This cannot be undone.`)) return;

    try {
      const res = await fetch('/api/admin/codes/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, adminPin: 'Mahumane2009' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetFeedback(`Code ${code} was permanently deleted.`);
        setTimeout(() => setResetFeedback(null), 3000);
        fetchCodes();
      } else {
        alert(data.error || 'Failed to delete code.');
      }
    } catch {
      alert('Network error deleting code.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const shareCodeWhatsApp = (codeObj: AccessCodeRecord) => {
    const isTrial = codeObj.codeType === 'TRIAL' || codeObj.code.startsWith('TRIAL-');
    const note = isTrial 
      ? `⚡ COMMUNITY TRIAL PASS: This trial code can be shared and used by 50+ people simultaneously! Share with friends.`
      : `🔒 PAID SINGLE-PHONE PASS: This code is strictly locked to 1 single phone upon connect for full dedicated bandwidth.`;

    const text = encodeURIComponent(
      `Hello! Here is your official SALVATION MAHUMANE VPN Access Code:\n\n🔑 Code: ${codeObj.code}\n📦 Plan: ${codeObj.planName}\n📱 Carrier: ${codeObj.carrier}\n⏳ Duration: ${codeObj.durationDays} Days\n${note}\n\nEnter this code into the SALVATION MAHUMANE VPN TOP SA app and tap CONNECT to start your secure high-speed tunnel.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // ---------------- LOGIN VIEW ---------------- //
  if (!isAuthenticated) {
    return (
      <div className="w-full p-5 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100 font-heading">
              Authorised Administrator Portal
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="my-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Restricted Access Area</div>
            <div>Only authorized administrators can log in to generate and revoke VPN customer access codes.</div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Salvationmahumane38@gmail.com"
              required
              className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 text-slate-100 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full h-11 px-3.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 text-slate-100 text-sm transition-all"
            />
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {authError}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Administrator'}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---------------- AUTHENTICATED ADMIN DASHBOARD ---------------- //
  return (
    <div className="w-full flex flex-col max-h-[80vh] overflow-y-auto pr-1">
      {/* Admin Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <SalvationVpnLogo size={36} className="shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-heading">
              Salvation Mahumane VPN · Admin Control
            </h3>
            <span className="text-[11px] text-slate-400">
              Admin: Salvationmahumane38@gmail.com
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reset Feedback Notification */}
      {resetFeedback && (
        <div className="my-2 p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{resetFeedback}</span>
        </div>
      )}

      {/* Capitec Bank Income Card for Admin (Directly connected to Account 1707317036) */}
      <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-blue-950 via-[#0B2144] to-cyan-950 border border-cyan-400/40 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-heading">
              Capitec Bank Income Tracker
            </h4>
          </div>
          <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
            ACCOUNT ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 my-3">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Revenue Collected</div>
            <div className="text-xl font-black text-amber-400 font-mono-numbers mt-0.5">
              R {incomeData?.totalIncomeZar ?? 80}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {incomeData?.ordersCount ?? 2} Paid Customers
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Destination Account</div>
            <div className="text-sm font-mono-numbers font-bold text-white mt-0.5">
              1707317036
            </div>
            <div className="text-[10px] text-cyan-300 font-medium">
              MS CT MAHUMANE · Capitec
            </div>
          </div>
        </div>
      </div>

      {/* Pending Card Payments Awaiting Admin Code Generation */}
      {incomeData?.orders && incomeData.orders.some((o: any) => o.status === 'PENDING_ADMIN_CODE') && (
        <div className="my-3 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/50 shadow-lg animate-fade-in">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-heading">
                Card Payments Awaiting Code Generation ({incomeData.orders.filter((o: any) => o.status === 'PENDING_ADMIN_CODE').length})
              </h4>
            </div>
            <span className="text-[10px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded font-mono font-bold">
              ACTION REQUIRED
            </span>
          </div>

          <p className="text-[11px] text-slate-300 mb-2.5">
            These customers paid into your Capitec account (<strong>1707317036</strong>). Click to verify receipt and issue their <strong>SALV-</strong> single-phone pass.
          </p>

          <div className="space-y-2">
            {incomeData.orders
              .filter((o: any) => o.status === 'PENDING_ADMIN_CODE')
              .map((order: any) => (
                <div key={order.orderId} className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{order.orderId}</span>
                      <span className="text-amber-400 font-black font-mono-numbers">R{order.amountZar}</span>
                      <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30 font-semibold">{order.carrier}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">
                      {order.planName} · Phone: <strong className="text-slate-100">{order.customerPhone || 'Not specified'}</strong>
                    </div>
                    <div className="text-[10px] text-amber-300/80 mt-0.5">
                      Paid to Capitec 1707317036 · Waiting for admin to generate SALV- code
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApproveOrder(order.orderId)}
                    disabled={approvingOrderId === order.orderId}
                    className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{approvingOrderId === order.orderId ? 'Generating...' : '⚡ Verify & Generate SALV- Code'}</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recently Approved Card Payments with WhatsApp Notification */}
      {incomeData?.orders && incomeData.orders.some((o: any) => o.status === 'CODE_GENERATED' && o.generatedCode) && (
        <div className="my-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center justify-between">
            <span>Recent Card Orders & Generated SALV- Codes</span>
            <span className="text-emerald-400">Income Verified</span>
          </div>
          <div className="space-y-1.5">
            {incomeData.orders
              .filter((o: any) => o.status === 'CODE_GENERATED')
              .slice(0, 3)
              .map((order: any) => (
                <div key={order.orderId} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 text-[11px]">
                  <div>
                    <span className="font-mono text-cyan-300 font-bold">{order.generatedCode}</span>
                    <span className="text-slate-400 ml-2">R{order.amountZar} ({order.carrier})</span>
                    {order.customerPhone && <span className="text-slate-500 ml-1">· {order.customerPhone}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => sendOrderCodeWhatsApp(order)}
                    title="Send Code to Customer on WhatsApp"
                    className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3 fill-white" />
                    <span>Send Code</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Code Generation Section */}
      <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0F1E38] border border-amber-500/30">
        <div className="flex items-center gap-2 mb-3">
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-heading">
            Generate Expiring Access Code
          </h4>
        </div>

        {/* Code Type Switcher: 50+ Trial vs Single-Phone Paid */}
        <div className="mb-3.5 p-1 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setCodeType('PAID_SINGLE_PHONE')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              codeType === 'PAID_SINGLE_PHONE'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>🔒 Paid (1 Phone Only)</span>
          </button>

          <button
            type="button"
            onClick={() => setCodeType('TRIAL')}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              codeType === 'TRIAL'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>⚡ Trial (50+ People)</span>
          </button>
        </div>

        {/* Context description based on mode */}
        <div className="mb-3 text-[11px] leading-relaxed">
          {codeType === 'PAID_SINGLE_PHONE' ? (
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/90 flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>Single-Phone Protection:</strong> Generates a <code className="text-white">SALV-...</code> code that locks to 1 single customer phone upon first connect. Prevents account sharing.
              </span>
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300/90 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                <strong>Multi-User Trial:</strong> Generates a <code className="text-white">TRIAL-...</code> code that can be shared and used simultaneously by <strong>50+ people</strong>!
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleGenerateCode} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Plan Selector */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                Data Plan
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-amber-400"
              >
                {DATA_PLANS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.gigabytes}GB) — R{p.promoPriceZar || p.priceZar}
                  </option>
                ))}
              </select>
            </div>

            {/* Carrier restriction */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                Carrier Binding
              </label>
              <select
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value as any)}
                className="w-full h-9 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-amber-400"
              >
                <option value="ALL">ALL CARRIERS (Flexible)</option>
                <option value="MTN">MTN Network Only</option>
                <option value="TELKOM">TELKOM Network Only</option>
                <option value="CELL C">CELL C Network Only</option>
                <option value="VODACOM">VODACOM Network Only</option>
              </select>
            </div>

            {/* Expiration Duration */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                Expiration
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full h-9 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-amber-400"
              >
                <option value={1}>24 Hours (1 Day)</option>
                <option value={2}>2 Days Trial</option>
                <option value={7}>7 Days (Weekly)</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days (Standard Month)</option>
                <option value={60}>60 Days (Extended)</option>
              </select>
            </div>
          </div>

          {/* Conditional Multi-User Trial Capacity */}
          {codeType === 'TRIAL' && (
            <div>
              <label className="block text-[10px] uppercase font-semibold text-cyan-300 mb-1 flex items-center justify-between">
                <span>Trial User Capacity (Allows 50+ people)</span>
                <span className="text-slate-400 font-normal">Min: 50 users</span>
              </label>
              <input
                type="number"
                min={50}
                max={1000}
                value={maxAllowedUsers}
                onChange={(e) => setMaxAllowedUsers(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-cyan-500/50 text-xs text-cyan-200 focus:border-cyan-400 font-mono-numbers"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
              Customer Note or WhatsApp Contact
            </label>
            <input
              type="text"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder={codeType === 'TRIAL' ? 'e.g. WhatsApp Group Promo Batch (50+ people)' : 'e.g. Paid R50 via Capitec / 1voucher - 082 123 4567'}
              className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-600 focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className={`w-full h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              codeType === 'TRIAL'
                ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isGenerating
                ? 'Generating Code...'
                : codeType === 'TRIAL'
                ? `Generate Multi-User Trial Code (${maxAllowedUsers}+ People)`
                : 'Generate Paid Single-Phone Code (1 Phone Locked)'}
            </span>
          </button>
        </form>

        {/* Display newly created code banner */}
        {generatedSuccessCode && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400">
                Code Created & Active:
              </div>
              <div className="font-mono-numbers text-sm font-extrabold text-white mt-0.5">
                {generatedSuccessCode}
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">
                {generatedSuccessCode.startsWith('TRIAL-')
                  ? `⚡ Multi-User Pass: Can be used by ${maxAllowedUsers}+ people`
                  : '🔒 Single-Phone Pass: Locks to customer phone on first use'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(generatedSuccessCode)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
            >
              {copiedCode === generatedSuccessCode ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Generated Access Codes Table */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          Active & Issued Access Codes ({codes.length})
        </h4>
        <button
          type="button"
          onClick={fetchCodes}
          disabled={isLoadingCodes}
          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${isLoadingCodes ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-2">
        {codes.map((c) => {
          const isExpired = Date.now() > c.expiresAt || c.status === 'EXPIRED';
          const isRevoked = c.status === 'REVOKED';
          const remainingMs = Math.max(0, c.expiresAt - Date.now());
          const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
          const remainingHours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
          const isTrial = c.codeType === 'TRIAL' || c.code.startsWith('TRIAL-');

          return (
            <div
              key={c.id}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                isRevoked
                  ? 'bg-slate-950/50 border-red-950/80 opacity-60'
                  : isExpired
                  ? 'bg-slate-950/50 border-amber-950/80 opacity-75'
                  : isTrial
                  ? 'bg-slate-900/90 border-cyan-500/30 hover:border-cyan-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-mono-numbers font-bold text-sm ${isTrial ? 'text-cyan-300' : 'text-amber-300'}`}>
                    {c.code}
                  </span>
                  
                  {/* Status badge */}
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isRevoked
                        ? 'bg-red-500/20 text-red-400'
                        : isExpired
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {isRevoked ? 'REVOKED' : isExpired ? 'EXPIRED' : 'ACTIVE'}
                  </span>

                  {/* Single phone vs Multi-user Badge */}
                  {isTrial ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" />
                      <span>Trial: {c.boundDeviceIds?.length || 0}/{c.maxAllowedUsers || 100} users (50+ allowed)</span>
                    </span>
                  ) : (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                      c.lockedToDeviceId ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Smartphone className="w-2.5 h-2.5" />
                      <span>{c.lockedToDeviceId ? 'Locked to 1 Phone' : 'Single Phone (Unbound)'}</span>
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 mt-1">
                  {c.planName} · Carrier: <span className="text-slate-200">{c.carrier}</span> ·
                  Expires:{' '}
                  {isRevoked
                    ? 'Revoked'
                    : isExpired
                    ? 'Expired'
                    : `${remainingDays}d ${remainingHours}h left`}
                </div>

                {c.customerNote && (
                  <div className="text-[10px] text-slate-500 italic mt-0.5">
                    Note: {c.customerNote}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                {/* Reset Phone Lock button if paid code is locked */}
                {!isTrial && c.lockedToDeviceId && (
                  <button
                    type="button"
                    onClick={() => handleResetDevice(c.code)}
                    title="Reset single-phone binding (Customer changed phone)"
                    className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1 text-[10px] font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Reset Phone</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => copyToClipboard(c.code)}
                  title="Copy code"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {copiedCode === c.code ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => shareCodeWhatsApp(c)}
                  title="Send via WhatsApp"
                  className="p-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                </button>

                {!isRevoked && (
                  <button
                    type="button"
                    onClick={() => handleRevokeCode(c.code)}
                    title="Revoke code"
                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-900/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
