import React, { useState } from 'react';
import { X, Zap, Smartphone, CreditCard, Building2, CheckCircle2 } from 'lucide-react';

interface WebRazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  purpose: 'add_funds' | 'withdraw';
  orderId: string;
  onSuccess: (paymentDetails: { razorpay_payment_id: string; razorpay_order_id: string }) => void;
}

export const WebRazorpayCheckoutModal: React.FC<WebRazorpayModalProps> = ({
  isOpen,
  onClose,
  amount,
  purpose,
  orderId,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const isWithdraw = purpose === 'withdraw';
  const title = isWithdraw ? 'Razorpay Payouts' : 'Razorpay Secure Checkout';
  const buttonText = isWithdraw
    ? `Authorize Payout ₹${amount.toFixed(2)}`
    : `Pay ₹${amount.toFixed(2)} with Razorpay`;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const fakePaymentId = `pay_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString().slice(-4)}`;
      onSuccess({
        razorpay_payment_id: fakePaymentId,
        razorpay_order_id: orderId || `order_${Date.now()}`,
      });
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scaleUp">
        {/* Top Header */}
        <div className="bg-[#0C2340] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0C2340] font-black shadow">
              <Zap size={18} className="fill-[#0C2340]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight tracking-wide">Razorpay</h3>
              <p className="text-[11px] text-teal-300 font-medium">
                {title} • <span className="text-amber-300 font-bold">Test Mode</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount Box */}
        <div className="p-6">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              {isWithdraw ? 'WITHDRAWAL AMOUNT' : 'PAYABLE AMOUNT'}
            </p>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              ₹{amount.toFixed(2)}
            </div>
            <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-slate-200/80 text-[10px] font-mono font-medium text-slate-600">
              Order ID: {orderId || 'Active Session'}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="mt-5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 block">
              Select Payment Option
            </label>

            <div className="space-y-2.5">
              {/* UPI */}
              <div
                onClick={() => setSelectedMethod('upi')}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                  selectedMethod === 'upi'
                    ? 'border-sky-500 bg-sky-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Smartphone size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">UPI (GPay, PhonePe, Paytm)</p>
                  <p className="text-xs text-slate-500">Instant UPI QR & Test Approval</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'upi' ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                  }`}
                >
                  {selectedMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>

              {/* Cards */}
              <div
                onClick={() => setSelectedMethod('card')}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                  selectedMethod === 'card'
                    ? 'border-sky-500 bg-sky-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <CreditCard size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">Debit / Credit Card</p>
                  <p className="text-xs text-slate-500">Visa, Mastercard, RuPay</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'card' ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                  }`}
                >
                  {selectedMethod === 'card' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>

              {/* NetBanking */}
              <div
                onClick={() => setSelectedMethod('netbanking')}
                className={`flex items-center gap-3.5 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                  selectedMethod === 'netbanking'
                    ? 'border-sky-500 bg-sky-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Building2 size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">NetBanking & IMPS</p>
                  <p className="text-xs text-slate-500">All Indian Banks Supported</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'netbanking' ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                  }`}
                >
                  {selectedMethod === 'netbanking' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          </div>

          {/* Test Mode Info Banner */}
          <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <span className="font-bold">Sandbox Test Mode:</span> Click button below to complete the test transaction instantly and credit wallet.
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="w-1/3 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-2/3 py-3 px-4 rounded-xl bg-[#0C2340] hover:bg-[#14325a] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{buttonText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
