import React, { useState, useEffect } from "react";
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  MessageCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import type { Order, OrderStatus } from "../types.ts";
import { formatPrice } from "../utils/format.ts";

export const OrderTrackingView: React.FC = () => {
  const { routeParams, settings, navigate } = useStore();

  const [orderQuery, setOrderQuery] = useState(routeParams.orderNumber || "");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const searchOrder = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    try {
      setIsLoading(true);
      setErrorMsg("");
      setTrackedOrder(null);

      const res = await fetch(`/api/orders/track?order_number=${encodeURIComponent(queryToSearch.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.order) {
        setErrorMsg(data.error || "Order not found. Please double-check your order number.");
      } else {
        setTrackedOrder(data.order);
      }
    } catch (err: any) {
      setErrorMsg("Failed to check tracking status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (routeParams.orderNumber) {
      searchOrder(routeParams.orderNumber);
    }
  }, [routeParams.orderNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchOrder(orderQuery);
  };

  // Status step progression calculation
  const stages: { label: string; subtext: string; key: OrderStatus }[] = [
    { label: "Payment Received", subtext: "Verified via Paystack", key: "Paid" },
    { label: "Order Processing", subtext: "Confirmed by Perfect For You", key: "Processing" },
    { label: "Preparing Order", subtext: "Botanicals packaged in East Legon", key: "Processing" },
    { label: "Out for Delivery", subtext: "With courier rider", key: "Shipped" },
    { label: "Delivered", subtext: "Delivered to customer", key: "Delivered" },
  ];

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return 0;
      case "Paid":
        return 1;
      case "Processing":
        return 2;
      case "Shipped":
        return 3;
      case "Delivered":
        return 4;
      case "Cancelled":
        return -1;
      default:
        return 1;
    }
  };

  const currentStageIndex = trackedOrder ? getStageIndex(trackedOrder.order_status) : 0;

  const phone = settings?.whatsapp || "233544590749";
  const whatsappUrl = trackedOrder
    ? `https://wa.me/${phone}?text=${encodeURIComponent(
        `Hi Perfect For You, I am tracking my order ${trackedOrder.order_number}. Kindly share latest updates!`
      )}`
    : `https://wa.me/${phone}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#5a5a40] block mb-1">
          Real-Time Updates
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#1a3c34] mb-3">
          Track Your Delivery
        </h1>
        <p className="text-sm text-stone-600">
          Enter your order reference number (e.g. <strong>PFY-000101</strong>) to view current status and dispatch progress.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-xl mx-auto bg-white p-2.5 rounded-full border border-stone-300 shadow-sm mb-10">
        <form onSubmit={handleSearchSubmit} className="flex items-center">
          <div className="pl-3 text-stone-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            id="order-tracking-input"
            type="text"
            placeholder="Enter Order Number (e.g. PFY-000101)"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none placeholder:text-stone-400 font-mono font-medium"
          />
          <button
            id="track-order-submit-btn"
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full text-xs font-semibold tracking-wide transition-colors"
          >
            {isLoading ? "Checking..." : "Track"}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="max-w-xl mx-auto mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tracked Result Display */}
      {trackedOrder && (
        <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-10 card-shadow space-y-8 animate-in fade-in duration-300">
          {/* Header info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                Order Tracking
              </span>
              <h2 className="font-mono text-2xl font-bold text-[#1a3c34]">
                {trackedOrder.order_number}
              </h2>
              <span className="text-xs text-stone-500">
                Placed on {new Date(trackedOrder.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-stone-500">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  trackedOrder.order_status === "Delivered"
                    ? "bg-emerald-100 text-[#1a3c34]"
                    : trackedOrder.order_status === "Shipped"
                    ? "bg-sky-100 text-sky-900"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {trackedOrder.order_status}
              </span>
            </div>
          </div>

          {/* Stepper progress (PRD #17) */}
          <div className="space-y-6">
            <h3 className="font-serif text-lg font-semibold text-[#1a1a1a]">
              Delivery Progress
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-stone-200 ml-3 sm:ml-4">
              {stages.map((stage, idx) => {
                const isCompleted = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={idx} className="relative">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isCompleted
                          ? "bg-[#1a3c34] text-white"
                          : "bg-stone-200 text-stone-500"
                      } ${isCurrent ? "ring-4 ring-emerald-100" : ""}`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div>
                      <span
                        className={`text-sm font-semibold block ${
                          isCompleted ? "text-stone-900" : "text-stone-400"
                        }`}
                      >
                        {stage.label}
                      </span>
                      <span className="text-xs text-[#5a5a40] block">
                        {stage.subtext}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Details & Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-stone-200 text-xs">
            <div className="space-y-2 bg-[#f9f9f7] p-4 rounded-2xl border border-black/5">
              <span className="font-bold text-stone-900 block mb-1">
                Recipient Details:
              </span>
              <p>
                <strong>Name:</strong> {trackedOrder.customer_name}
              </p>
              <p>
                <strong>Phone:</strong> {trackedOrder.phone}
              </p>
              <p>
                <strong>Address:</strong> {trackedOrder.address}, {trackedOrder.city} ({trackedOrder.region})
              </p>
              {trackedOrder.delivery_instructions && (
                <p>
                  <strong>Instructions:</strong> {trackedOrder.delivery_instructions}
                </p>
              )}
            </div>

            <div className="space-y-2 bg-[#f9f9f7] p-4 rounded-2xl border border-black/5">
              <span className="font-bold text-stone-900 block mb-1">
                Ordered Items:
              </span>
              <div className="space-y-1.5">
                {trackedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.product_name}
                    </span>
                    <span className="font-semibold text-stone-800">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-[#1a3c34]">
                <span>Total Paid:</span>
                <span>{formatPrice(trackedOrder.total)}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Inquiries button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Ask Rider / Dispatch on WhatsApp</span>
            </a>

            <button
              onClick={() => navigate("shop")}
              className="text-xs font-semibold text-[#1a3c34] hover:underline"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
