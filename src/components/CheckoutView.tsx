import React, { useState, useEffect } from "react";
import {
  Lock,
  ArrowLeft,
  AlertCircle,
  User,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import type { Order } from "../types.ts";
import { formatPrice } from "../utils/format.ts";

// Lazily load the Paystack inline SDK (https://js.paystack.co/v1/inline.js).
const loadPaystackScript = () =>
  new Promise<void>((resolve, reject) => {
    if ((window as any).PaystackPop) return resolve();
    const existing = document.getElementById("paystack-inline-js") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Paystack failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.id = "paystack-inline-js";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Paystack failed to load"));
    document.body.appendChild(script);
  });

type PaystackResponse = { reference?: string };

export const CheckoutView: React.FC = () => {
  const { cart, cartSubtotal, clearCart, navigate } = useStore();

  // Customer Information
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // UI state
  const [errorMsg, setErrorMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Paystack (public key fetched from the backend; the popup opens inline)
  const [paystackKey, setPaystackKey] = useState("");

  // Load the public key exposed by the backend (safe for the browser).
  useEffect(() => {
    let active = true;
    fetch("/api/paystack/public-key")
      .then((r) => r.json())
      .then((d) => {
        if (active && d?.publicKey) setPaystackKey(d.publicKey);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Delivery is arranged by our team after payment — no delivery details at checkout
  const deliveryFee = 0;
  const productTotal = cartSubtotal; // Pay this now via Paystack
  const orderTotal = productTotal; // Total order value

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-3">
          Your cart is empty
        </h2>
        <p className="text-stone-500 text-sm mb-6">
          Add some products before heading to checkout.
        </p>
        <button
          onClick={() => navigate("shop")}
          className="px-6 py-3 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full text-xs font-semibold transition-colors"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const handleOpenPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg("Please fill in your name and phone number.");
      return;
    }

    // Open the Paystack popup straight away on "Pay Now".
    await startPaystackPayment();
  };

  // Called from the Paystack popup once the customer has paid. Verifies the
  // reference server-side (with the secret key) before creating the order.
  const finalizeOrder = async (reference: string) => {
    try {
      setIsProcessing(true);

      const verifyRes = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, amount: productTotal }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.verified) {
        setErrorMsg(verifyData.message || "Payment verification failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Create order on backend
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: fullName,
          email,
          phone,
          region: "Ghana",
          address: "",
          items: cart.map((item) => ({
            product_id: item.product.id,
            product_name: item.product.name,
            product_image: item.product.images[0] || "",
            price: item.unit_price,
            quantity: item.quantity,
            total: item.unit_price * item.quantity,
          })),
          delivery_fee: 0,
          payment_reference: reference,
          payment_method: "paystack",
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create order");
      }

      clearCart();
      setIsProcessing(false);

      navigate("order-confirmation", {
        orderNumber: orderData.order.order_number,
        confirmedOrder: orderData.order,
      });
    } catch (err) {
      console.error(err);
      setErrorMsg("Order failed. Please try again.");
      setIsProcessing(false);
    }
  };

  // Resolve the public key, fetching it fresh if the initial load hasn't landed.
  const getPublicKey = async () => {
    if (paystackKey) return paystackKey;
    try {
      const res = await fetch("/api/paystack/public-key");
      const data = await res.json();
      if (data?.publicKey) {
        setPaystackKey(data.publicKey);
        return data.publicKey as string;
      }
    } catch {
      /* ignore — handled by caller */
    }
    return "";
  };

  // Open the real Paystack inline popup (mobile money + card).
  const startPaystackPayment = async () => {
    setErrorMsg("");
    setIsProcessing(true);
    try {
      const key = await getPublicKey();
      if (!key) {
        setIsProcessing(false);
        setErrorMsg("Payment gateway is not configured. Please contact support.");
        return;
      }

      await loadPaystackScript();
      const PaystackPop = (window as any).PaystackPop;
      if (!PaystackPop) {
        throw new Error("Paystack SDK unavailable");
      }

      const reference = `PFY-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      const handler = PaystackPop.setup({
        key,
        email: email.trim() || `guest-${Date.now()}@perfectforyou.com`,
        amount: Math.round(productTotal * 100), // pesewas
        currency: "GHS",
        channels: ["card", "mobile_money"],
        ref: reference,
        metadata: {
          custom_fields: [
            { display_name: "Customer Name", variable_name: "customer_name", value: fullName },
            { display_name: "Phone", variable_name: "phone", value: phone },
          ],
        },
        callback: (response: PaystackResponse) => {
          finalizeOrder(response?.reference || reference);
        },
        onClose: () => {
          setIsProcessing(false);
        },
      });
      handler.openIframe();
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not start payment. Please check your connection and try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("cart")}
          className="p-2 text-stone-500 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors lg:hidden"
          aria-label="Back to cart"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#5a5a40]">
            Secure Checkout
          </span>
          <h1 className="font-serif text-2xl font-semibold text-[#1a3c34]">
            Complete Your Order
          </h1>
        </div>
        <div className="w-10 lg:hidden" />
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleOpenPayment}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Form Steps */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Contact Information */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-black/5 card-shadow space-y-4">
              <div className="flex items-center space-x-2.5 text-[#1a3c34] pb-3 border-b border-stone-100">
                <div className="w-6 h-6 rounded-full bg-[#1a3c34] text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h2 className="font-serif text-lg font-semibold text-[#1a1a1a]">
                  Contact Information
                </h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        id="checkout-name"
                        type="text"
                        required
                        placeholder="Kwame Asante"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f9f9f7] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        id="checkout-email"
                        type="email"
                        placeholder="kwame@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f9f9f7] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone Number (WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      placeholder="024 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f9f9f7] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    After payment, our team will reach out within 24 hours to arrange delivery.
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery is arranged after payment — no delivery details needed */}
            <div className="bg-[#eae7e0]/60 rounded-3xl border border-black/5 p-6 sm:p-7">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-[#1a3c34] text-white flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-semibold text-[#1a1a1a]">
                    Delivery Arranged After Payment
                  </h2>
                  <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
                    You don't need to add delivery details now. After your payment
                    is confirmed, our team will reach out to you{" "}
                    <strong className="text-[#1a3c34]">within 24 hours</strong> to
                    confirm your order, take your delivery address, and schedule
                    delivery at a time that suits you.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/5 card-shadow space-y-5 sticky top-28">
              <h2 className="font-serif text-xl font-semibold text-[#1a1a1a] pb-3 border-b border-stone-100">
                Order Review
              </h2>

              {/* Items scroll */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1"
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <img
                        src={item.product.images[0] || "/images/pfy_hair_set.jpg"}
                        alt=""
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes("/images/pfy_hair_set.jpg")) {
                            target.src = "/images/pfy_hair_set.jpg";
                          }
                        }}
                        className="w-12 h-14 object-cover rounded-xl bg-[#eae7e0] shrink-0"
                      />
                      <div className="truncate">
                        <span className="font-semibold text-stone-900 block truncate">
                          {item.product.name}
                        </span>
                        <span className="text-stone-400 text-[11px]">
                          Qty: {item.quantity} {item.selected_size ? `• ${item.selected_size}` : ""}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 shrink-0">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="space-y-2.5 pt-4 border-t border-stone-100 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Products Subtotal</span>
                  <span className="font-semibold text-stone-900">
                    {formatPrice(productTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-[11px] text-[#1a3c34] font-semibold text-right">
                    Arranged after payment
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline">
                <span className="font-serif text-base font-semibold text-[#1a1a1a]">
                  Total Order Value
                </span>
                <span className="font-serif text-2xl font-bold text-[#1a3c34]">
                  {formatPrice(orderTotal)}
                </span>
              </div>

              <div className="text-[11px] text-center text-amber-700 bg-amber-50 p-3 rounded-xl font-medium">
                You pay: {formatPrice(productTotal)} now — delivery arranged by our team after payment
              </div>

              <button
                id="checkout-pay-now-btn"
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full font-semibold text-sm tracking-wide shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isProcessing ? "Processing…" : `Pay Now via Paystack • ${formatPrice(productTotal)}`}
                </span>
              </button>

              <div className="text-[11px] text-center text-stone-400 space-y-1">
                <p>Our team will reach out within 24 hours to schedule delivery</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};