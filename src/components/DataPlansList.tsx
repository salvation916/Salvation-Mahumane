import React, { useState } from 'react';
import {
  DATA_PLANS,
  CELL_C_PREMIUM_PLANS,
  MTN_TELKOM_UNLIMITED_PLANS,
  SUPPORT_CONTACT,
  DataPlan,
  PremiumDurationPlan,
  Carrier,
} from '../types/vpn';
import { MessageCircle, Check, X, Shield, Zap, Flame, CreditCard, Sparkles } from 'lucide-react';

interface Props {
  selectedCarrier: Carrier;
  onSelectPlan: (plan: DataPlan) => void;
  onClose?: () => void;
  whatsappNumber?: string;
  onPayWithCard?: (plan: { name: string; priceZar: number; gigabytes?: number; durationDays?: number }) => void;
}

export const DataPlansList: React.FC<Props> = ({
  selectedCarrier,
  onSelectPlan,
  onClose,
  whatsappNumber = SUPPORT_CONTACT.cleanNumber,
  onPayWithCard,
}) => {
  const [category, setCategory] = useState<'UNLIMITED_MT_TEL' | 'CELL_C_PREMIUM' | 'GB_PLANS'>('UNLIMITED_MT_TEL');

  const handlePayDurationCard = (p: PremiumDurationPlan) => {
    if (onPayWithCard) {
      onPayWithCard({
        name: p.title,
        priceZar: p.priceZar,
        durationDays: p.days,
        gigabytes: p.days >= 30 ? 100 : 30,
      });
    }
  };

  const handlePayGbCard = (plan: DataPlan) => {
    if (onPayWithCard) {
      onPayWithCard({
        name: plan.name,
        priceZar: plan.promoPriceZar || plan.priceZar,
        gigabytes: plan.gigabytes,
        durationDays: 30,
      });
    }
  };

  const handleOrderDurationPlan = (p: PremiumDurationPlan) => {
    const message = encodeURIComponent(
      `Hello SALVATION MAHUMANE VPN TOP SA,\n\nI want to purchase the ${p.title} (${p.days} Days) for R${p.priceZar}.\n\nPayment Method: 1voucher or Bank Transfer (Capitec 1707317036) ✅\nSelected Carrier: ${selectedCarrier}\n\nPlease send payment details and activate my single-phone code.\n\nDM: ${SUPPORT_CONTACT.phoneNumber}`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const handleOrderGbPlan = (plan: DataPlan) => {
    onSelectPlan(plan);
    const message = encodeURIComponent(
      `Hello SALVATION MAHUMANE VPN TOP SA,\n\nI want to purchase the ${plan.name} (${plan.gigabytes}GB) for R${plan.promoPriceZar || plan.priceZar}.\n\nPayment Method: 1voucher or Bank Transfer (Capitec 1707317036) ✅\nNetwork Carrier: ${selectedCarrier}\n\nPlease send your South Africa payment details and my single-phone access code.\n\nDM: ${SUPPORT_CONTACT.phoneNumber}`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full flex flex-col max-h-[80vh] overflow-y-auto pr-1 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-extrabold text-white font-heading">
              SALVATION MAHUMANE VPN TOP SA Plans
            </h3>
          </div>
          <p className="text-[10px] text-cyan-400 font-medium mt-0.5">
            {SUPPORT_CONTACT.paymentMethods}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Direct DM Bot Banner */}
      <div className="my-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-[#091C28] to-cyan-500/15 border border-emerald-500/30 flex items-center justify-between text-xs">
        <div>
          <div className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>DM: {SUPPORT_CONTACT.phoneNumber}</span>
          </div>
          <div className="text-[10px] text-emerald-300 font-medium italic mt-0.5">
            "{SUPPORT_CONTACT.tagline}"
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const text = encodeURIComponent(
              `Hello SALVATION MAHUMANE VPN TOP SA,\n\nI want to inquire about your data plans and packages.\nPayment Method: 1voucher / Bank Transfer ✅`
            );
            window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
          }}
          className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20BD5C] text-black font-extrabold text-[11px] flex items-center gap-1 shadow-md transition-transform active:scale-95"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-black text-[#25D366]" />
          <span>WhatsApp DM</span>
        </button>
      </div>

      {/* Top Capitec Card Payment Banner for Admin Income */}
      <div className="my-2 p-3 rounded-2xl bg-gradient-to-r from-blue-950 via-[#071D38] to-cyan-950 border border-cyan-400/50 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <span>Pay with Card / Capitec</span>
              <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1 rounded border border-emerald-400/30 font-mono">
                INSTANT APP LINK
              </span>
            </div>
            <div className="text-[10px] text-cyan-200/90 font-mono-numbers mt-0.5">
              Account: <strong>1707317036</strong> · MS CT MAHUMANE
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onPayWithCard) {
              onPayWithCard({
                name: '100GB Ultimate',
                priceZar: 50,
                gigabytes: 100,
                durationDays: 30,
              });
            }
          }}
          className="px-2.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          Pay Card
        </button>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 my-2">
        <button
          type="button"
          onClick={() => setCategory('UNLIMITED_MT_TEL')}
          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
            category === 'UNLIMITED_MT_TEL'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ⚡ MTN & Telkom ⚡
        </button>
        <button
          type="button"
          onClick={() => setCategory('CELL_C_PREMIUM')}
          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
            category === 'CELL_C_PREMIUM'
              ? 'bg-[#F97316] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ⚡ Cell C Premium ⚡
        </button>
        <button
          type="button"
          onClick={() => setCategory('GB_PLANS')}
          className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
            category === 'GB_PLANS'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          GB Data Plans
        </button>
      </div>

      {/* 1. MtnXtelkom Unlimited Plans */}
      {category === 'UNLIMITED_MT_TEL' && (
        <div className="space-y-2 my-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ MᴛɴXᴛᴇʟᴋᴏᴍ Uɴʟɪᴍɪᴛᴇᴅ Plans ⚡</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MTN_TELKOM_UNLIMITED_PLANS.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-gradient-to-r from-[#0F1B2B] to-[#0A1322] border border-amber-500/30 flex items-center justify-between shadow-md hover:border-amber-400 transition-all"
              >
                <div>
                  <div className="text-xs font-black text-white font-heading">
                    {p.days} Days Unlimited
                  </div>
                  <div className="text-[10px] text-amber-300 font-mono-numbers mt-0.5">
                    MTN & Telkom Networks
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-amber-400 font-mono-numbers">
                    R{p.priceZar}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handlePayDurationCard(p)}
                      title="Pay with Capitec Card"
                      className="px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] flex items-center gap-1 shadow transition-transform active:scale-95"
                    >
                      <CreditCard className="w-3 h-3 text-cyan-200" />
                      <span>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOrderDurationPlan(p)}
                      title="Order via WhatsApp"
                      className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition-transform active:scale-95"
                    >
                      <MessageCircle className="w-3 h-3 fill-white" />
                      <span>DM</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Cell C Premium Plans */}
      {category === 'CELL_C_PREMIUM' && (
        <div className="space-y-2 my-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#F97316] flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#F97316]" />
            <span>⚡ Cᴇʟʟ C Pʀᴇᴍɪᴜᴍ Plans ⚡</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CELL_C_PREMIUM_PLANS.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-gradient-to-r from-[#1B110B] to-[#0F0B08] border border-orange-500/30 flex items-center justify-between shadow-md hover:border-orange-400 transition-all"
              >
                <div>
                  <div className="text-xs font-black text-white font-heading">
                    {p.days} Days Cell C
                  </div>
                  <div className="text-[10px] text-orange-300 font-mono-numbers mt-0.5">
                    Fast Roaming APN ♡
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-orange-400 font-mono-numbers">
                    R{p.priceZar}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handlePayDurationCard(p)}
                      title="Pay with Capitec Card"
                      className="px-2 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] flex items-center gap-1 shadow transition-transform active:scale-95"
                    >
                      <CreditCard className="w-3 h-3 text-cyan-200" />
                      <span>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOrderDurationPlan(p)}
                      title="Order via WhatsApp"
                      className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition-transform active:scale-95"
                    >
                      <MessageCircle className="w-3 h-3 fill-white" />
                      <span>DM</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Standard GB Plans (All 9) */}
      {category === 'GB_PLANS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2">
          {DATA_PLANS.map((plan) => (
            <div
              key={plan.id}
              className="p-3 rounded-xl bg-slate-900/70 border border-cyan-500/25 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-heading">
                    {plan.name}
                  </span>
                  {plan.badge && (
                    <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between mt-1.5">
                  <span className="text-xl font-black text-cyan-300 font-mono-numbers">
                    {plan.gigabytes} GB
                  </span>
                  <span className="text-sm font-black text-amber-400 font-mono-numbers">
                    R{plan.promoPriceZar || plan.priceZar}
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[9px] text-slate-400">All Networks</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handlePayGbCard(plan)}
                    className="px-2 py-0.8 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold flex items-center gap-1"
                  >
                    <CreditCard className="w-3 h-3 text-cyan-200" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOrderGbPlan(plan)}
                    className="px-2 py-0.8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3 fill-white" />
                    <span>DM</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment methods & footer */}
      <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800/90 text-center space-y-1">
        <div className="text-[11px] font-extrabold text-emerald-400 flex items-center justify-center gap-1">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payment: 1voucher And Bank Transfer ✅</span>
        </div>
        <div className="text-[10px] text-slate-400">
          Fast activation: Instant voucher code entry after payment confirmation.
        </div>
      </div>
    </div>
  );
};
