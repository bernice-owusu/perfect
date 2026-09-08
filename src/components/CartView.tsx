import React from "react";
import { Trash2, ArrowRight, ShoppingBag, Truck, ArrowLeft } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { formatPrice } from "../utils/format.ts";

export const CartView: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    navigate,
    settings,
  } = useStore();

  const freeShippingThreshold = settings?.free_delivery_threshold || 300;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-stone-900 mb-2">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-stone-500 text-sm mb-6 max-w-md mx-auto">
          Explore our Ayurvedic herbal sets, nourishing moisturizers, and handcrafted bags.
        </p>
        <button
          onClick={() => navigate("shop")}
          className="px-8 py-3.5 bg-[#1a3c34] text-white rounded-full text-sm font-semibold hover:bg-[#2a4d45] transition-all"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <button
        onClick={() => navigate("shop")}
        className="inline-flex items-center space-x-1.5 text-xs text-[#5a5a40] hover:text-[#1a3c34] mb-6 font-medium uppercase tracking-wider"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Continue Shopping</span>
      </button>

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
        <h1 className="font-serif text-3xl font-medium text-[#1a3c34]">
          Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-stone-400 hover:text-rose-600 underline font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Alert */}
          <div className="bg-[#eae7e0] border border-black/5 rounded-2xl p-4 flex items-center space-x-3 text-xs text-[#1a3c34]">
            <Truck className="w-5 h-5 text-[#5a5a40] shrink-0" />
            {amountToFreeShipping > 0 ? (
              <span>
                Add <strong>{formatPrice(amountToFreeShipping)}</strong> more to qualify for <strong>FREE delivery</strong> in Accra!
              </span>
            ) : (
              <span className="font-semibold text-[#1a3c34]">
                🎉 You have qualified for FREE delivery in Accra!
              </span>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-black/5 divide-y divide-stone-100 overflow-hidden card-shadow">
            {cart.map((item, idx) => (
              <div
                key={`${item.product_id}-${item.selected_size || ""}-${idx}`}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center space-x-3.5 sm:space-x-4">
                  <img
                    src={item.product.images[0] || "/images/pfy_hair_set.jpg"}
                    alt={item.product.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes("/images/pfy_hair_set.jpg")) {
                        target.src = "/images/pfy_hair_set.jpg";
                      }
                    }}
                    className="w-16 h-18 sm:w-20 sm:h-22 object-cover rounded-2xl bg-[#eae7e0] shrink-0"
                  />
                  <div>
                    <h3 className="font-serif font-semibold text-[#1a1a1a] text-sm sm:text-base">
                      {item.product.name}
                    </h3>
                    <span className="text-[11px] sm:text-xs text-[#5a5a40] block">
                      Category: {item.product.category_name}
                    </span>
                    {item.selected_size && (
                      <span className="text-[11px] sm:text-xs text-[#5a5a40] block">
                        Size: {item.selected_size}
                      </span>
                    )}
                    <span className="text-xs sm:text-sm font-bold text-[#1a3c34] mt-1 block">
                      {formatPrice(item.unit_price)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end sm:space-x-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  {/* Stepper */}
                  <div className="flex items-center border border-stone-200 rounded-full bg-stone-50">
                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.product_id,
                          item.quantity - 1,
                          item.selected_variant_id,
                          item.selected_size
                        )
                      }
                      className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 font-bold text-xs"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.product_id,
                          item.quantity + 1,
                          item.selected_variant_id,
                          item.selected_size
                        )
                      }
                      className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 font-bold text-xs"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <span className="font-bold text-stone-900 text-base">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() =>
                      removeFromCart(
                        item.product_id,
                        item.selected_variant_id,
                        item.selected_size
                      )
                    }
                    className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/5 card-shadow space-y-5 sticky top-28">
            <h2 className="font-serif text-xl font-semibold text-[#1a1a1a]">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-[#1a1a1a]">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#5a5a40]">
                <span>Delivery</span>
                <span>Calculated at next step</span>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-between items-baseline">
              <span className="font-serif text-base font-semibold text-[#1a1a1a]">
                Total
              </span>
              <span className="font-serif text-2xl font-bold text-[#1a3c34]">
                {formatPrice(cartSubtotal)}
              </span>
            </div>

            <button
              id="cart-view-checkout-btn"
              onClick={() => navigate("checkout")}
              className="w-full py-4 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full font-semibold text-sm tracking-wide shadow-md transition-all flex items-center justify-center space-x-2 min-h-[48px]"
            >
              <span>Proceed to Guest Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[11px] text-stone-400 space-y-1">
              <p>✓ No account required to checkout</p>
              <p>✓ Paystack verified Mobile Money &amp; Card</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
