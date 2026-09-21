import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Ghost,
  Heart,
  HeartHandshake,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";

export const AboutView: React.FC = () => {
  const { navigate, settings, setSelectedCategory } = useStore();

  const phone = settings?.whatsapp || "233544590749";
  const email = settings?.email || "nancybempah2@gmail.com";
  const address =
    settings?.address ||
    "Perfect For You, St. John's Overhead, Achimota, Accra, Ghana";

  const tiktokPrimary = "https://www.tiktok.com/@perfect_for_you2";
  const tiktokSecondary = "https://www.tiktok.com/@pfy_everythinggirlie";
  const snapchatUrl =
    settings?.social_links?.snapchat || "https://snapchat.com/t/3UgHdBXR";

  // "Perfect For You on the map" — Google Maps search link
  const mapUrl =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Perfect For You, Achimota St John's Overhead, Accra");

  // Embeddable Google Maps iframe for the same location (no API key needed via output=embed)
  const mapEmbedUrl =
    "https://maps.google.com/maps?q=" +
    encodeURIComponent(
      "Perfect For You, St John's Overhead, Achimota, Accra, Ghana"
    ) +
    "&output=embed";

  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#1a3c34] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-emerald-200 text-xs font-medium uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Brand Story</span>
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight font-medium mt-5">
            Perfect For You, <br />
            <span className="italic font-normal text-emerald-200">
              Made in Ghana. Grown with Care.
            </span>
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mt-5">
            A Ghanaian beauty destination for healthy hair, happy skin, and
            everyday style — rooted in authentic herbal hair care and handpicked
            essentials delivered to your doorstep.
          </p>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block">
              Get To Know Us
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1a3c34] font-medium leading-tight">
              Beauty, Confidence &amp; Simplicity —{" "}
              <span className="italic">for every Ghanaian woman.</span>
            </h2>
            <p className="text-[#5a5a40] text-sm sm:text-base leading-relaxed">
              Perfect For You was founded on a simple realization: everyday
              beauty, self-care, and personal style shouldn't be filled with
              toxic additives, confusing steps, or fragile materials.
            </p>
            <p className="text-[#5a5a40] text-sm leading-relaxed">
              From raw unrefined shea butter hand-whipped by women's
              cooperatives in Northern Ghana, to herbal scalp infusions, beauty
              tools, comfort slide sandals, and durable tote bags — every piece
              in our store is curated to honor your daily routine and celebrate
              your natural beauty.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-black/5 text-center">
              <div>
                <p className="font-serif text-2xl font-bold text-[#1a3c34]">
                  100%
                </p>
                <p className="text-[11px] text-[#5a5a40] uppercase tracking-wider">
                  Ghana Sourced
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-[#1a3c34]">
                  0%
                </p>
                <p className="text-[11px] text-[#5a5a40] uppercase tracking-wider">
                  Harsh Synthetics
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-[#1a3c34]">
                  5k+
                </p>
                <p className="text-[11px] text-[#5a5a40] uppercase tracking-wider">
                  Happy Crowns
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative aspect-[4/5] rounded-3xl overflow-hidden card-shadow">
            <img
              src="/images/pyf_model_collection.jpeg"
              alt="PERFECT FOR YOU Natural Care Collection"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute bottom-4 left-4 bg-[#112923]/85 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/15">
              <p className="font-serif text-sm font-semibold text-emerald-200">
                Healthy Hair, Happy Skin
              </p>
              <p className="text-[10px] text-stone-300">Accra, Ghana 🇬🇭</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="bg-white/60 py-16 border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-lg mx-auto mb-12">
            <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block mb-1">
              The Perfect Collection
            </span>
            <h2 className="font-serif text-3xl text-[#1a3c34] font-medium">
              What We Offer
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Leaf className="w-5 h-5 text-[#1a3c34]" />,
                title: "Hair Care Routines",
                desc: "Herbal oils, masks, butters and mist made with raw shea, amla, chebe and cold-pressed oils.",
              },
              {
                icon: <HeartHandshake className="w-5 h-5 text-[#1a3c34]" />,
                title: "Skincare & Balms",
                desc: "Authentic black soap, glow oils, and hydrating balms for a naturally radiant barrier.",
              },
              {
                icon: <Sparkles className="w-5 h-5 text-[#1a3c34]" />,
                title: "Beauty Accessories",
                desc: "Derma rollers, scalp massagers and tools that help your products work harder.",
              },
              {
                icon: <Store className="w-5 h-5 text-[#1a3c34]" />,
                title: "Style & Comfort",
                desc: "Slide sandals, totes and lifestyle pieces designed for everyday Ghanaian living.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-6 rounded-2xl border border-black/5 card-shadow text-center space-y-3"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-[#f5f5f0] flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#1a1a1a]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#5a5a40] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              id="about-shop-btn"
              onClick={() => {
                setSelectedCategory("all");
                navigate("shop");
              }}
              className="px-8 py-4 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full text-sm font-semibold tracking-wide transition-all inline-flex items-center space-x-2 shadow-sm"
            >
              <span>Explore the Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* VISIT, CONTACT & PAYMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-lg mx-auto mb-10">
          <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block mb-1">
            We'd Love To Hear From You
          </span>
          <h2 className="font-serif text-3xl text-[#1a3c34] font-medium">
            Visit, Call or Chat With Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact details */}
          <div className="bg-white rounded-3xl border border-black/5 card-shadow p-7 sm:p-9 space-y-5">
            <h3 className="font-serif text-xl font-semibold text-[#1a3c34]">
              Business Details
            </h3>

            <a
              href={`mailto:${email}`}
              className="flex items-start space-x-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#f5f5f0] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#1a3c34]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#5a5a40] font-bold">
                  Email Us
                </p>
                <p className="text-sm font-medium text-[#1a1a1a] group-hover:text-[#1a3c34] transition-colors">
                  {email}
                </p>
              </div>
            </a>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#f5f5f0] flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-[#1a3c34]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#5a5a40] font-bold">
                  Call / WhatsApp
                </p>
                <div className="text-sm font-medium text-[#1a1a1a] space-y-0.5">
                  <a
                    href="tel:+233544590749"
                    className="block hover:text-[#1a3c34] transition-colors"
                  >
                    054 459 0749
                  </a>
                  <a
                    href="tel:+233538055631"
                    className="block hover:text-[#1a3c34] transition-colors"
                  >
                    053 805 5631
                  </a>
                </div>
              </div>
            </div>

            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start space-x-3 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#f5f5f0] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#1a3c34]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#5a5a40] font-bold">
                  Our Location
                </p>
                <p className="text-sm font-medium text-[#1a1a1a] leading-snug group-hover:text-[#1a3c34] transition-colors">
                  {address}
                </p>
                <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-800 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>Open in Google Maps</span>
                </span>
              </div>
            </a>

            <a
              href={`https://wa.me/${phone}?text=${encodeURIComponent(
                "Hi Perfect For You, I'm reaching out from your About page."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Chat With Us on WhatsApp</span>
            </a>
          </div>

          {/* Paystack checkout */}
          <div className="bg-[#1a3c34] text-white rounded-3xl card-shadow p-7 sm:p-9 space-y-5">
            <h3 className="font-serif text-xl font-semibold">
              Pay Securely With Paystack
            </h3>
            <p className="text-stone-300 text-sm leading-relaxed">
              All orders are paid and verified online at checkout through
              Paystack — no direct transfers. We confirm your payment and reach
              out within 24 hours to arrange delivery.
            </p>

            <div className="bg-[#112923] rounded-2xl border border-white/10 p-5 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-emerald-200 font-bold">
                    Accepted At Checkout
                  </p>
                  <p className="font-serif text-base font-bold leading-snug">
                    MTN MoMo, Telecel Cash, AT Money, Visa &amp; Mastercard
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Payments are tracked &amp; verified, so delivery is arranged
                  faster after confirmation.
                </p>
              </div>
              <button
                onClick={() => navigate("shop")}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-full bg-white hover:bg-[#f5f2ed] text-[#1a3c34] text-xs font-semibold transition-colors shadow-xs"
              >
                <span>Shop the Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Find Us On The Map */}
        <div className="mt-8 bg-white rounded-3xl border border-black/5 card-shadow overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 sm:p-8">
            <div>
              <h3 className="font-serif text-xl font-semibold text-[#1a3c34]">
                Find Us On The Map
              </h3>
              <p className="text-xs text-[#5a5a40] mt-1">
                Achimota — St. John's Overhead, Accra, Ghana
              </p>
            </div>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#1a3c34] border border-[#1a3c34]/25 px-4 py-2.5 rounded-full hover:bg-[#1a3c34] hover:text-white transition-colors self-start sm:self-auto"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Open in Google Maps</span>
            </a>
          </div>
          <div className="h-80 sm:h-[420px]">
            <iframe
              title="Perfect For You Store Location — Achimota"
              src={mapEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* SOCIALS */}
      <section className="bg-white/60 py-16 border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-lg mx-auto mb-10">
            <span className="text-[#5a5a40] text-xs uppercase tracking-[0.3em] font-bold block mb-1">
              Follow The Journey
            </span>
            <h2 className="font-serif text-3xl text-[#1a3c34] font-medium">
              Connect With Us Online
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <a
              href={tiktokPrimary}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white rounded-2xl p-6 card-shadow border border-black/10 hover:-translate-y-1 transition-transform flex flex-col items-center text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/15">
                <Music2 className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold">
                  TikTok — Main
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  @perfect_for_you2
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/15">
                Follow Us
              </span>
            </a>

            <a
              href={tiktokSecondary}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white rounded-2xl p-6 card-shadow border border-black/10 hover:-translate-y-1 transition-transform flex flex-col items-center text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center border border-white/15">
                <Music2 className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold">
                  TikTok — Everything Girlie
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  @pfy_everythinggirlie
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/15">
                Follow Us
              </span>
            </a>

            <a
              href={snapchatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FFFC00] text-black rounded-2xl p-6 card-shadow border border-black/10 hover:-translate-y-1 transition-transform flex flex-col items-center text-center space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center border border-black/10">
                <Ghost className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold">Snapchat</h3>
                <p className="text-xs text-stone-800 mt-1">
                  Add us for behind-the-scenes &amp; restocks
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black text-white px-3 py-1 rounded-full">
                Add Us
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* WHY SHOP WITH US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-black/5 card-shadow flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f0] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#1a3c34]" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-[#1a3c34]">
                Nationwide Delivery
              </h4>
              <p className="text-xs text-[#5a5a40] leading-relaxed mt-1">
                Same-day dispatch in Accra, express delivery to Kumasi, Tema,
                Takoradi and all regions of Ghana.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-black/5 card-shadow flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f0] flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-[#1a3c34]" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-[#1a3c34]">
                Personal Care
              </h4>
              <p className="text-xs text-[#5a5a40] leading-relaxed mt-1">
                Direct WhatsApp consultation and support to guide your routine
                before you order.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-black/5 card-shadow flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f0] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#1a3c34]" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-[#1a3c34]">
                Secure Payments
              </h4>
              <p className="text-xs text-[#5a5a40] leading-relaxed mt-1">
                Paystack-secured checkout with tracked &amp; verified payments for
                every order.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};