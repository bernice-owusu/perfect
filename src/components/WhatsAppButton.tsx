import React from "react";
import { MessageCircle } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";

export const WhatsAppButton: React.FC = () => {
  const { settings, currentRoute } = useStore();

  // Don't show inside admin portal
  if (currentRoute === "admin") return null;

  const phone = settings?.whatsapp || "233544590749";
  const defaultMsg = encodeURIComponent(
    "Hi Perfect For You, I am browsing your online store and need assistance with a product."
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${defaultMsg}`;

  return (
    <aside
      aria-label="Customer WhatsApp assistance"
      className="fixed bottom-20 md:bottom-6 right-4 z-40 flex items-center group"
    >
      <div className="hidden md:flex items-center mr-3 bg-white/95 backdrop-blur-md shadow-lg border border-emerald-100 rounded-full py-1.5 px-3.5 text-xs text-emerald-950 font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
        Chat with our Beauty Specialist
      </div>
      <a
        id="whatsapp-floating-btn"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="w-13 h-13 md:w-14 md:h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
      </a>
    </aside>
  );
};
