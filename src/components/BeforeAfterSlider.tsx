import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  MoveHorizontal,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

interface BeforeAfterItem {
  id: string;
  title: string;
  timeline: string;
  ritualUsed: string;
  beforeImg: string;
  afterImg: string;
  beforeLabel: string;
  afterLabel: string;
  quote: string;
  customerName: string;
  location: string;
}

export const BeforeAfterSlider: React.FC = () => {
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);
    window.addEventListener("resize", updateWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const items: BeforeAfterItem[] = [
    {
      id: "case-edges",
      title: "Edge Line Regrowth & Breakage Halt",
      timeline: "30 Days of Consistency",
      ritualUsed: "Nourishing Growth Oil + Ayurvedic Hair Mask",
      beforeImg: "/images/thin_edges.png",
      afterImg: "/images/pfy_model_duo.jpg",
      beforeLabel: "Day 1: Thinning Edges & Shedding",
      afterLabel: "Day 30: Full Temples & Stronger Root Anchor",
      quote:
        "My edges were struggling after tight braids. Massaging the herbal oil every night completely restored my temples without any itching.",
      customerName: "Akosua K.",
      location: "East Legon, Accra",
    },
    {
      id: "case-moisture",
      title: "4C Coils 72-Hour Moisture & Stretch",
      timeline: "After 2 Washday Cycles",
      ritualUsed: "Hydration Hair Mist + Whipped Shea Butter",
      beforeImg: "/images/tangled.png",
      afterImg: "/images/pfy_model_collection.jpg",
      beforeLabel: "Dry, Brittle & Crunchy Ends",
      afterLabel: "Juicy, Pliable & Deeply Hydrated Coils",
      quote:
        "The mist opens my hair immediately, and the whipped butter locks it in for days. Detangling went from 45 minutes to under 10!",
      customerName: "Peace D.",
      location: "Kumasi, Ashanti Region",
    },
  ];

  const current = items[activeItemIndex];

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current && e.buttons !== 1) return;
    handleMove(e.clientX);
  };

  return (
    <section id="results-comparison-section" className="scroll-mt-28">
      <div className="bg-[#f7f5f0] border border-stone-200/80 rounded-3xl p-6 sm:p-10 lg:p-12 card-shadow space-y-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Visible Botanical Results</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1a3c34] font-medium tracking-tight">
              Real Transformations. Zero Filters.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
              Drag or swipe the slider below to see the difference Ghanaian
              herbal care makes on real texture.
            </p>
          </div>

          {/* Toggle between case studies */}
          <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-stone-200 shadow-xs shrink-0">
            {items.map((it, idx) => (
              <button
                key={it.id}
                onClick={() => {
                  setActiveItemIndex(idx);
                  setSliderPosition(50);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeItemIndex === idx
                    ? "bg-[#1a3c34] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {it.title.split(" ")[0]} Case
              </button>
            ))}
          </div>
        </div>

        {/* The Interactive Comparison Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Slider Container */}
          <div className="lg:col-span-7">
            <div
              ref={containerRef}
              onMouseDown={() => (isDragging.current = true)}
              onMouseUp={() => (isDragging.current = false)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-stone-900 cursor-ew-resize select-none shadow-md"
            >
              {/* After Image (Background / Base) */}
              <img
                src={current.afterImg}
                alt={current.afterLabel}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute top-4 right-4 bg-[#1a3c34]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase z-10 shadow-sm">
                {current.afterLabel}
              </div>

              {/* Before Image (Clipped / Foreground) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={current.beforeImg}
                  alt={current.beforeLabel}
                  className="absolute inset-0 w-full h-full object-cover object-center max-w-none pointer-events-none"
                  style={{
                    width: `${containerWidth}px`,
                    height: "100%",
                  }}
                />
                <div className="absolute top-4 left-4 bg-stone-900/90 backdrop-blur-sm text-stone-200 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase z-10 shadow-sm">
                  {current.beforeLabel}
                </div>
              </div>

              {/* Drag Handle Divider */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="w-9 h-9 rounded-full bg-white shadow-xl border border-stone-200 flex items-center justify-center text-[#1a3c34]">
                  <MoveHorizontal className="w-4 h-4" />
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-stone-500 mt-2 flex items-center justify-center space-x-1">
              <MoveHorizontal className="w-3.5 h-3.5 text-stone-400" />
              <span>Drag horizontal slider left/right to compare</span>
            </p>
          </div>

          {/* Details & Testimonial */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md inline-block">
                Timeline: {current.timeline}
              </span>

              <h3 className="font-serif text-2xl font-bold text-[#1a3c34]">
                {current.title}
              </h3>

              <p className="text-xs text-stone-600">
                <strong>Formula:</strong> {current.ritualUsed}
              </p>
            </div>

            {/* Testimonial Quote */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-3">
              <div className="flex text-amber-500 text-sm">★★★★★</div>
              <blockquote className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                "{current.quote}"
              </blockquote>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
                <span className="font-bold text-stone-900">
                  {current.customerName}
                </span>
                <span>Verified Buyer • {current.location}</span>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center space-x-2.5 text-xs text-stone-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% genuine feedback from real Ghanaian naturals.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
