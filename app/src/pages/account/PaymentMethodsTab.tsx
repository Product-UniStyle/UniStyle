import { useState } from 'react';
import { CreditCard, Plus, ShieldCheck, X } from 'lucide-react';
import { showToast } from '@/components/ToastContainer';

export function PaymentMethodsTab() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold">Payment Methods</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-semibold px-4 py-2.5 hover:bg-[#333] transition-colors"
        >
          <Plus size={16} /> Add Payment Method
        </button>
      </div>
      <p className="text-sm text-[#666] mb-6">Manage your saved payment methods for faster checkout.</p>

      <p className="text-sm font-semibold mb-4">Saved Cards (0)</p>
      <div className="text-center py-10 bg-[#F5F5F5] mb-6">
        <CreditCard size={32} className="mx-auto text-[#CCC] mb-3" />
        <p className="text-[#666]">No saved cards yet</p>
      </div>

      {/* Apple Liquid Glass Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-3xl border border-white/40 animate-liquid-glass-in"
            style={{
              background: 'rgba(255,255,255,0.22)',
              backdropFilter: 'blur(48px)',
              WebkitBackdropFilter: 'blur(48px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 32px 64px rgba(0,0,0,0.22)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Specular rim highlights */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-t-3xl pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/25 to-transparent rounded-t-3xl pointer-events-none" />

            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                    <CreditCard size={18} className="text-[#1A1A1A]" />
                  </div>
                  <h3 className="font-bold text-lg text-[#1A1A1A]">Add Payment Method</h3>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/40 hover:bg-white/60 transition-colors"
                >
                  <X size={16} className="text-[#1A1A1A]" />
                </button>
              </div>

              <p className="text-xs text-[#666] mb-5">Saved cards aren't supported yet — this is a preview of the upcoming design.</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast('Saved payment methods are coming soon. Card details are entered securely at checkout and are never stored.', 'info');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-[#444] mb-1 block">Card Number</label>
                  <input disabled placeholder="1234 5678 9012 3456" className="w-full bg-white/60 border border-white/50 px-3 py-2.5 text-sm outline-none cursor-not-allowed rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-[#444] mb-1 block">Name on Card</label>
                  <input disabled placeholder="Full Name" className="w-full bg-white/60 border border-white/50 px-3 py-2.5 text-sm outline-none cursor-not-allowed rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-[#444] mb-1 block">Expiry</label>
                    <input disabled placeholder="MM / YY" className="w-full bg-white/60 border border-white/50 px-3 py-2.5 text-sm outline-none cursor-not-allowed rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-[#444] mb-1 block">CVV</label>
                    <input disabled placeholder="123" className="w-full bg-white/60 border border-white/50 px-3 py-2.5 text-sm outline-none cursor-not-allowed rounded-xl" />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-[0.08em] px-6 py-3 hover:bg-[#333] transition-colors rounded-xl"
                >
                  Save Card
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 p-5 bg-[#F5F5F5] mt-6">
        <div className="w-10 h-10 rounded-full bg-[#F1E7FB] flex items-center justify-center shrink-0"><ShieldCheck size={18} /></div>
        <div>
          <p className="text-sm font-semibold">Your payment information is secure</p>
          <p className="text-xs text-[#666]">Payment details are entered at checkout via Stripe and are never stored in plain text on our servers.</p>
        </div>
      </div>
    </div>
  );
}
