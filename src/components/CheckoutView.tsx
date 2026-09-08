import React, { useState } from "react";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ChevronRight,
  Info,
} from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import type { DeliveryZone, Order } from "../types.ts";
import { formatPrice } from "../utils/format.ts";

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    settings,
    clearCart,
    navigate,
    recordCustomerPurchase,
  } = useStore();

  // Customer Information
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Delivery Information
  const [selectedZoneId, setSelectedZoneId] = useState<string>("accra");
  const [city, setCity] = useState("Accra");
  const [address, setAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // UI state
  const [errorMsg, setErrorMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Paystack Modal Simulation
  const [showPaystackModal, setShowPaystackModal] = useState(false);
  const [payMethod, setPayMethod] = useState<"momo" | "card">("momo");
  const [momoProvider, setMomoProvider] = useState<"MTN" | "Telecel" | "AT">("MTN");
  const [momoPhone, setMomoPhone] = useState("");
  const [paymentStep, setPaymentStep] = useState<"form" | "authorizing" | "success">("form");

  const deliveryZones: DeliveryZone[] = settings?.delivery_zones || [
    { id: "accra", name: "Greater Accra (Accra Central, East Legon, Airport, Osu)", fee: 20, eta: "Same day / 24 hours" },
    { id: "tema", name: "Greater Accra (Tema, Spintex, Kasoa)", fee: 30, eta: "1-2 business days" },
    { id: "kumasi", name: "Ashanti Region (Kumasi & environs)", fee: 35, eta: "2-3 business days" },
    { id: "takoradi", name: "Western Region (Sekondi-Takoradi)", fee: 40, eta: "2-3 business days" },
    { id: "other", name: "Other Regions across Ghana", fee: 50, eta: "3-4 business days" },
  ];

  const currentZone = deliveryZones.find((z) => z.id === selectedZoneId) || deliveryZones[0];

  // Delivery fee logic: free in Accra if cartSubtotal >= 300
  const isFreeAccraDelivery =
    (selectedZoneId === "accra" || selectedZoneId === "tema") &&
    cartSubtotal >= (settings?.free_delivery_threshold || 300);

  const deliveryFee = isFreeAccraDelivery ? 0 : currentZone.fee;
  const orderTotal = cartSubtotal + deliveryFee;

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

  const handleOpenPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      setErrorMsg("Please fill in your full name, phone number, email, and delivery address.");
      return;
    }

    setMomoPhone(phone);
    setShowPaystackModal(true);
    setPaymentStep("form");
  };

  const executePaystackVerificationAndCreateOrder = async () => {
    try {
      setIsProcessing(true);
      setPaymentStep("authorizing");

      const generatedReference = `pstk_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

      // 1. Verify payment with backend (PRD requirement: "The backend must verify the Paystack transaction rather than trusting only frontend")
      const verifyRes = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: generatedReference,
          amount: orderTotal,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.verified) {
        throw new Error("Payment verification failed on server");
      }

      // 2. Create and persist order in backend (deducts stock)
      const orderPayload = {
        customer_name: fullName,
        email,
        phone,
        region: currentZone.name,
        city: city || "Accra",
        address,
        delivery_instructions: deliveryInstructions,
        items: cart.map((item) => ({
          id: `item-${Date.now()}-${Math.random()}`,
          product_id: item.product_id,
          product_name: item.product.name,
          product_image: item.product.images[0],
          size: item.selected_size,
          price: item.unit_price,
          quantity: item.quantity,
          total: item.unit_price * item.quantity,
        })),
        delivery_fee: deliveryFee,
        payment_reference: generatedReference,
        payment_method: payMethod === "momo" ? "momo" : "paystack",
      };

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Record purchase for tracking visibility
      recordCustomerPurchase(orderData.order.order_number);

      setPaymentStep("success");

      setTimeout(() => {
        clearCart();
        setShowPaystackModal(false);
        navigate("order-confirmation", {
          orderNumber: orderData.order.order_number,
          confirmedOrder: orderData.order as Order,
        });
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while confirming your order.");
      setShowPaystackModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back to Cart */}
      <button
        onClick={() => navigate("cart")}
        className="inline-flex items-center space-x-1.5 text-xs text-[#5a5a40] hover:text-[#1a3c34] mb-6 font-medium uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Cart</span>
      </button>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-medium text-[#1a3c34] mb-1">
          Express Checkout
        </h1>
        <p className="text-[#5a5a40] text-xs sm:text-sm">
          Guest checkout • No account needed • Safe delivery across Ghana
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleOpenPayment}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: Checkout Form Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Customer Info */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-black/5 card-shadow space-y-4">
              <div className="flex items-center space-x-2.5 text-[#1a3c34] pb-3 border-b border-stone-100">
                <div className="w-6 h-6 rounded-full bg-[#1a3c34] text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h2 className="font-serif text-lg font-semibold text-[#1a1a1a]">
                  Customer Information
                </h2>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    placeholder="e.g. Akosua Mensah"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-[#f9f9f7] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Phone Number (Ghana) *
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      placeholder="e.g. 024 412 3890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-[#f9f9f7] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Used for delivery dispatch &amp; MoMo prompt
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      required
                      placeholder="e.g. akosua@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-[#f9f9f7] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Order receipt will be sent here
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Details */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-black/5 card-shadow space-y-4">
              <div className="flex items-center space-x-2.5 text-[#1a3c34] pb-3 border-b border-stone-100">
                <div className="w-6 h-6 rounded-full bg-[#1a3c34] text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h2 className="font-serif text-lg font-semibold text-[#1a1a1a]">
                  Delivery Destination
                </h2>
              </div>

              <div className="space-y-4">
                {/* Region selector */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Select Region / Delivery Zone *
                  </label>
                  <div className="space-y-2">
                    {deliveryZones.map((zone) => (
                      <label
                        key={zone.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          selectedZoneId === zone.id
                            ? "border-[#1a3c34] bg-[#eae7e0]/50 ring-1 ring-[#1a3c34]"
                            : "border-stone-200 hover:border-stone-300 bg-[#f9f9f7]"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="delivery_zone"
                            value={zone.id}
                            checked={selectedZoneId === zone.id}
                            onChange={() => setSelectedZoneId(zone.id)}
                            className="text-[#1a3c34] focus:ring-[#1a3c34]"
                          />
                          <div>
                            <span className="text-xs font-semibold text-stone-900 block">
                              {zone.name}
                            </span>
                            <span className="text-[11px] text-[#5a5a40]">
                              ETA: {zone.eta}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#1a3c34]">
                          {(zone.id === "accra" || zone.id === "tema") && isFreeAccraDelivery ? (
                            <span className="text-[#1a3c34] uppercase font-bold">Free</span>
                          ) : (
                            formatPrice(zone.fee)
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* City & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      City / Suburb *
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      required
                      placeholder="e.g. East Legon / Spintex / Osu"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-[#f9f9f7] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Delivery Address *
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      required
                      placeholder="House / Office / Street name"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-[#f9f9f7] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                    />
                  </div>
                </div>

                {/* Landmark Instructions */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Landmark or Special Delivery Instructions
                  </label>
                  <input
                    id="checkout-instructions"
                    type="text"
                    placeholder="e.g. Near A&C Mall, gate is cream with black security door"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-[#f9f9f7] border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3c34]"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method Banner */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-black/5 card-shadow space-y-3">
              <div className="flex items-center space-x-2.5 text-[#1a3c34] pb-3 border-b border-stone-100">
                <div className="w-6 h-6 rounded-full bg-[#1a3c34] text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <h2 className="font-serif text-lg font-semibold text-[#1a1a1a]">
                  Payment Method
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-[#eae7e0]/70 border border-black/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1a3c34] text-white flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1a3c34] block">
                      Paystack Secure Checkout
                    </span>
                    <span className="text-[11px] text-stone-600">
                      MTN MoMo, Telecel Cash, AT Money, Visa, &amp; Mastercard
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#1a3c34] bg-white px-3 py-1 rounded-full border border-black/10">
                  Encrypted
                </span>
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
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">
                    {formatPrice(cartSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery ({currentZone.name.split("(")[0].trim()})</span>
                  <span className="font-semibold text-stone-900">
                    {deliveryFee === 0 ? (
                      <span className="text-[#1a3c34] font-bold">FREE</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline">
                <span className="font-serif text-base font-semibold text-[#1a1a1a]">
                  Total Due
                </span>
                <span className="font-serif text-2xl font-bold text-[#1a3c34]">
                  {formatPrice(orderTotal)}
                </span>
              </div>

              <button
                id="checkout-pay-now-btn"
                type="submit"
                className="w-full py-4 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full font-semibold text-sm tracking-wide shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98"
              >
                <Lock className="w-4 h-4" />
                <span>Pay Now with Paystack • {formatPrice(orderTotal)}</span>
              </button>

              <div className="text-[11px] text-center text-stone-400 space-y-1">
                <p>🔒 256-Bit SSL Encrypted Payment</p>
                <p>Orders are dispatched immediately after confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* PAYSTACK PAYMENT MODAL (PRD #15 & #40) */}
      {showPaystackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Paystack Header Banner */}
            <div className="bg-[#0BA4DB] text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">
                  P
                </div>
                <div>
                  <span className="font-bold text-sm tracking-wide block">
                    Paystack
                  </span>
                  <span className="text-[10px] opacity-80 block">
                    Secured by Paystack Payments
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                  Amount
                </span>
                <span className="text-lg font-bold">{formatPrice(orderTotal)}</span>
              </div>
            </div>

            {/* Merchant Identity */}
            <div className="px-6 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">Merchant:</span>
              <span className="font-semibold text-stone-900">
                Perfect For You (PFY Ghana)
              </span>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {paymentStep === "form" && (
                <div className="space-y-5">
                  {/* Method Picker */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPayMethod("momo")}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        payMethod === "momo"
                          ? "border-[#0BA4DB] bg-sky-50/50 ring-1 ring-[#0BA4DB]"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-[#0BA4DB] mb-2" />
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">
                          Mobile Money
                        </span>
                        <span className="text-[10px] text-stone-500">
                          MTN, Telecel, AT
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayMethod("card")}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        payMethod === "card"
                          ? "border-[#0BA4DB] bg-sky-50/50 ring-1 ring-[#0BA4DB]"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-stone-700 mb-2" />
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">
                          Card
                        </span>
                        <span className="text-[10px] text-stone-500">
                          Visa, Mastercard
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* MoMo Form */}
                  {payMethod === "momo" ? (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Network Provider
                        </label>
                        <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                          {(["MTN", "Telecel", "AT"] as const).map((prov) => (
                            <button
                              key={prov}
                              type="button"
                              onClick={() => setMomoProvider(prov)}
                              className={`py-2 px-3 rounded-xl border text-center transition-all ${
                                momoProvider === prov
                                  ? "bg-amber-400/20 border-amber-500 text-stone-900 font-bold"
                                  : "border-stone-200 text-stone-600 hover:bg-stone-50"
                              }`}
                            >
                              {prov}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Mobile Money Number
                        </label>
                        <input
                          type="tel"
                          value={momoPhone}
                          onChange={(e) => setMomoPhone(e.target.value)}
                          placeholder="e.g. 0244123890"
                          className="w-full px-4 py-2.5 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0BA4DB]"
                        />
                        <span className="text-[10px] text-stone-400 mt-1 block">
                          A prompt will appear on your phone to authorize payment.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          defaultValue="4084 •••• •••• 1290"
                          readOnly
                          className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl text-stone-700"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Expiry
                          </label>
                          <input
                            type="text"
                            defaultValue="12/28"
                            readOnly
                            className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl text-stone-700"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            CVV
                          </label>
                          <input
                            type="text"
                            defaultValue="•••"
                            readOnly
                            className="w-full px-4 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl text-stone-700"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="pt-3 space-y-2">
                    <button
                      type="button"
                      onClick={executePaystackVerificationAndCreateOrder}
                      className="w-full py-3.5 bg-[#0BA4DB] hover:bg-[#0991c2] text-white font-semibold text-sm rounded-full shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Confirm &amp; Pay {formatPrice(orderTotal)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPaystackModal(false)}
                      className="w-full py-2 text-xs text-stone-400 hover:text-stone-600 font-medium"
                    >
                      Cancel Payment
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === "authorizing" && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full border-4 border-sky-200 border-t-[#0BA4DB] animate-spin" />
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm">
                      Authorizing with Paystack...
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                      Verifying transaction with server and deducting product stock safely.
                    </p>
                  </div>
                </div>
              )}

              {paymentStep === "success" && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-serif text-lg font-semibold text-stone-900">
                    Payment Approved!
                  </h4>
                  <p className="text-xs text-stone-500">
                    Redirecting to your order confirmation receipt...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
