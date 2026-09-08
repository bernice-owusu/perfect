import React from "react";
import {
  CheckCircle2,
  Truck,
  ArrowRight,
  ShoppingBag,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { BrandLogo } from "./BrandLogo.tsx";
import { formatPrice } from "../utils/format.ts";

export const OrderConfirmationView: React.FC = () => {
  const { routeParams, navigate, settings, recordCustomerPurchase } = useStore();
  const [copied, setCopied] = React.useState(false);

  const order = routeParams.confirmedOrder;
  const orderNumber = routeParams.orderNumber || order?.order_number || "PFY-000101";

  React.useEffect(() => {
    if (orderNumber) {
      recordCustomerPurchase(orderNumber);
    }
  }, [orderNumber, recordCustomerPurchase]);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const phone = settings?.whatsapp || "233544590749";
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    `Hi Perfect For You, I just completed order ${orderNumber}. Kindly share dispatch updates!`
  )}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-black/5 card-shadow text-center space-y-6">
        <div className="pb-4 border-b border-black/5 flex justify-center">
          <BrandLogo variant="horizontal" size="sm" />
        </div>

        {/* Celebration icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-[#eae7e0] text-[#1a3c34] flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5a5a40]">
            Payment Received &amp; Verified
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#1a3c34]">
            🎉 Order Confirmed!
          </h1>
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            Thank you for shopping with Perfect For You. We have received your order and our dispatch team in Accra is preparing your package.
          </p>
        </div>

        {/* Order Number Box */}
        <div className="max-w-md mx-auto bg-[#f9f9f7] rounded-2xl p-4 border border-black/10 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#5a5a40] block">
              Order Number
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-[#1a3c34]">
              {orderNumber}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-white text-stone-700 hover:text-[#1a3c34] rounded-xl border border-stone-200 text-xs font-semibold flex items-center space-x-1 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
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

        {/* Order Details Breakdown if available */}
        {order && (
          <div className="text-left bg-[#f9f9f7] rounded-2xl p-5 border border-black/5 text-xs space-y-3">
            <div className="flex justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500">Customer Name:</span>
              <span className="font-semibold text-stone-900">{order.customer_name}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500">Phone Number:</span>
              <span className="font-semibold text-stone-900">{order.phone}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500">Delivery Address:</span>
              <span className="font-semibold text-stone-900 text-right max-w-xs">
                {order.address}, {order.city} ({order.region})
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-stone-500">Total Amount Paid:</span>
              <span className="font-bold text-base text-[#1a3c34]">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            id="confirmation-track-order-btn"
            onClick={() => navigate("order-tracking", { orderNumber })}
            className="w-full sm:w-auto px-7 py-3.5 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full font-semibold text-xs tracking-wide shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track My Order</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full font-semibold text-xs tracking-wide shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Updates on WhatsApp</span>
          </a>

          <button
            onClick={() => navigate("shop")}
            className="w-full sm:w-auto px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full font-semibold text-xs transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
