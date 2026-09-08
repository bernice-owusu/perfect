import React from "react";
import { X, Trash2, ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { formatPrice } from "../utils/format.ts";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    navigate,
    settings,
  } = useStore();

  if (!isCartOpen) return null;

  const freeShippingThreshold = settings?.free_delivery_threshold || 300;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(
    100,
    (cartSubtotal / freeShippingThreshold) * 100
  );

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("checkout");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 pl-0 sm:pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-[#f5f2ed] shadow-2xl flex flex-col justify-between border-l border-black/10">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-black/5 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#1a3c34]" />
              <h2 className="font-serif text-xl font-semibold text-[#1a1a1a]">
                Your Bag ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#eae7e0] px-5 py-3 border-b border-black/5 text-xs">
            <div className="flex items-center space-x-2 text-[#1a3c34] font-medium mb-1.5">
              <Truck className="w-3.5 h-3.5 text-[#5a5a40]" />
              {amountToFreeShipping > 0 ? (
                <span>
                  Add <strong className="font-bold">{formatPrice(amountToFreeShipping)}</strong> more for{" "}
                  <strong className="text-[#1a3c34]">FREE delivery</strong> in Accra!
                </span>
              ) : (
                <span className="text-[#1a3c34] font-semibold">
                  🎉 Congratulations! You unlocked FREE delivery in Accra!
                </span>
              )}
            </div>
            <div className="w-full bg-[#5a5a40]/20 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#1a3c34] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#1a1a1a]">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-[#5a5a40] mt-1 max-w-xs mx-auto">
                    Explore our herbal hair solutions, nourishing balms, or comfortable slides.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate("shop");
                  }}
                  className="px-6 py-3 bg-[#1a3c34] text-white rounded-full text-xs font-semibold hover:bg-[#2a4d45] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={`${item.product_id}-${item.selected_variant_id || ""}-${item.selected_size || ""}-${index}`}
                  className="bg-white p-3.5 rounded-2xl border border-black/5 flex gap-3.5 items-center card-shadow"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0] || "/images/pfy_hair_set.jpg"}
                    alt={item.product.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes("/images/pfy_hair_set.jpg")) {
                        target.src = "/images/pfy_hair_set.jpg";
                      }
                    }}
                    className="w-18 h-20 object-cover rounded-xl bg-[#eae7e0] shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-semibold text-[#1a1a1a] truncate">
                      {item.product.name}
                    </h4>
                    {item.selected_size && (
                      <span className="text-[11px] text-[#5a5a40] block">
                        Size: {item.selected_size}
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#1a3c34] block mt-1">
                      {formatPrice(item.unit_price)}
                    </span>

                    {/* Stepper & Remove */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-black/10 rounded-full bg-[#f9f9f7]">
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              item.product_id,
                              item.quantity - 1,
                              item.selected_variant_id,
                              item.selected_size
                            )
                          }
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-stone-900 text-xs font-bold"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-stone-900">
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
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-stone-900 text-xs font-bold"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          removeFromCart(
                            item.product_id,
                            item.selected_variant_id,
                            item.selected_size
                          )
                        }
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Action */}
          {cart.length > 0 && (
            <div className="p-5 sm:p-6 bg-white border-t border-black/5 space-y-4">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#1a1a1a] text-sm">
                    {formatPrice(cartSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#5a5a40]">
                  <span>Estimated Delivery</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex justify-between items-baseline">
                <span className="font-serif text-base font-semibold text-[#1a1a1a]">
                  Total
                </span>
                <span className="font-serif text-xl font-bold text-[#1a3c34]">
                  {formatPrice(cartSubtotal)}
                </span>
              </div>

              <button
                id="cart-drawer-checkout-btn"
                onClick={handleCheckout}
                className="w-full py-4 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full font-semibold text-sm tracking-wide shadow-md transition-all flex items-center justify-center space-x-2 active:scale-98 min-h-[48px]"
              >
                <span>Proceed to Guest Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-stone-400">
                🔒 Secure Paystack Payment with MoMo or Bank Card
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
