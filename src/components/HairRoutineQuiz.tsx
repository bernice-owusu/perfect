import React, { useState } from "react";
import { Sparkles, Check, ArrowRight, RefreshCw, ShoppingBag, Heart } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { formatPrice } from "../utils/format.ts";

interface RoutineResult {
  title: string;
  subtitle: string;
  hairTypeBadge: string;
  frequency: string;
  recommendedProductIds: string[];
  steps: { step: number; name: string; instruction: string; timing: string }[];
  bundleSavings: string;
}

export const HairRoutineQuiz: React.FC = () => {
  const { products, addToCart, setIsCartOpen } = useStore();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hairGoal, setHairGoal] = useState<string>("growth");
  const [hairTexture, setHairTexture] = useState<string>("4c");
  const [porosityOrScalp, setPorosityOrScalp] = useState<string>("dry");
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [addedAll, setAddedAll] = useState<boolean>(false);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCalculated(true);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setIsCalculated(false);
    setAddedAll(false);
  };

  // Determine tailored recommendation
  const getRecommendation = (): RoutineResult => {
    if (hairGoal === "edges_growth") {
      return {
        title: "Edge Recovery & Scalp Stimulation Ritual",
        subtitle: "Botanical cold-pressed botanical herbs specifically formulated to awaken dormant follicles and retain fragile temples.",
        hairTypeBadge: `Tailored for ${hairTexture.toUpperCase()} & Sensitive Edges`,
        frequency: "3-4 times weekly + nightly satin protection",
        recommendedProductIds: ["prod-hair-oil-big", "prod-hair-mist", "prod-hair-mask-small"],
        steps: [
          {
            step: 1,
            name: "Mist Edges & Scalp",
            instruction: "Spray Revitalizing Hydration Mist to hydrate hair shafts without weighing them down.",
            timing: "Morning & Night",
          },
          {
            step: 2,
            name: "Inversion Oil Massage",
            instruction: "Dispense 3-4 drops of Nourishing Growth Oil directly onto edges and massage in circular motions for 3 minutes.",
            timing: "Bedtime",
          },
          {
            step: 3,
            name: "Ayurvedic Protein Strengthener",
            instruction: "Apply Ayurvedic Hair Mask once weekly from root to tip to reinforce strand elasticity and stop breakage.",
            timing: "Weekly Washday",
          },
        ],
        bundleSavings: "Save GH₵15 when purchased as a ritual",
      };
    }

    if (hairGoal === "moisture_retention") {
      return {
        title: "Maximum Moisture & Length Retention (L.O.C) Ritual",
        subtitle: "Liquid-Oil-Cream layering system for natural hair that drinks moisture and battles dryness.",
        hairTypeBadge: `Designed for ${hairTexture.toUpperCase()} & ${porosityOrScalp === "low" ? "Low Porosity" : "High Porosity"} Textures`,
        frequency: "Every 2-3 days for maximum softness",
        recommendedProductIds: ["prod-hair-mist", "prod-hair-oil-small", "prod-hair-butter"],
        steps: [
          {
            step: 1,
            name: "Liquid Base",
            instruction: "Generously spritz with Revitalizing Aloe & Rose Hair Mist to open hair cuticles and hydrate.",
            timing: "Step 1 (Liquid)",
          },
          {
            step: 2,
            name: "Botanical Oil",
            instruction: "Apply Nourishing Growth Oil to seal moisture deep into the cortex and stimulate growth.",
            timing: "Step 2 (Oil)",
          },
          {
            step: 3,
            name: "Whipped Butter Lock",
            instruction: "Coat ends with Whipped Shea Hair Butter to lock in supreme 72-hour moisture and prevent split ends.",
            timing: "Step 3 (Cream)",
          },
        ],
        bundleSavings: "Best Value: Complete 3-Step Hydration",
      };
    }

    // Default: Complete Growth & Crown Care
    return {
      title: "Royal Crown Growth & Regrowth Regimen",
      subtitle: "The complete 4-step herbal treatment for length retention, thicker volume, and healthy scalp.",
      hairTypeBadge: `Perfect for ${hairTexture.toUpperCase()} Coils & Natural Curls`,
      frequency: "Full weekly routine with daily hydration",
      recommendedProductIds: ["prod-hair-set-big", "prod-hair-mist"],
      steps: [
        {
          step: 1,
          name: "Deep Ayurvedic Conditioning",
          instruction: "Mix Ayurvedic Herbal Mask with warm water or oil, apply thoroughly, and steam or wear plastic cap for 30 minutes.",
          timing: "Every Sunday",
        },
        {
          step: 2,
          name: "Daily Botanical Mist",
          instruction: "Spray mist directly to scalp and strands before styling or protective wear.",
          timing: "Daily AM",
        },
        {
          step: 3,
          name: "Growth Oil & Butter Seal",
          instruction: "Warm a dime-size of butter in palms, smooth through sections, and seal with Nourishing Growth Oil.",
          timing: "3x Weekly",
        },
      ],
      bundleSavings: "Full Complete Regimen with Accessories",
    };
  };

  const result = getRecommendation();
  const recommendedProducts = products.filter((p) =>
    result.recommendedProductIds.includes(p.id)
  );

  const bundleTotal = recommendedProducts.reduce((sum, p) => sum + p.price, 0);

  const handleAddAllToCart = () => {
    recommendedProducts.forEach((p) => {
      addToCart(p, 1);
    });
    setAddedAll(true);
    setTimeout(() => {
      setIsCartOpen(true);
    }, 400);
    setTimeout(() => setAddedAll(false), 2500);
  };

  return (
    <section id="routine-quiz-section" className="scroll-mt-28">
      <div className="bg-[#fcfbf9] rounded-3xl border border-stone-200/80 p-6 sm:p-10 lg:p-12 card-shadow overflow-hidden relative">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10">
          {!isCalculated ? (
            <div className="max-w-2xl mx-auto text-center space-y-8">
              {/* Header */}
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>30-Second Hair &amp; Glow Matcher</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#1a3c34] font-medium tracking-tight">
                  Discover Your Custom Natural Hair Routine
                </h2>
                <p className="text-sm text-stone-600 max-w-lg mx-auto">
                  No guesswork. Answer 3 quick questions to get a personalized Ghanaian botanical ritual matched to your exact curl texture and growth goals.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      step === currentStep
                        ? "w-10 bg-[#1a3c34]"
                        : step < currentStep
                        ? "w-6 bg-emerald-500"
                        : "w-6 bg-stone-200"
                    }`}
                  />
                ))}
              </div>

              {/* Step 1: Goal */}
              {currentStep === 1 && (
                <div className="space-y-5 text-left bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                    Question 1 of 3: Primary Focus
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-stone-900 font-semibold">
                    What is your #1 crown priority right now?
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {[
                      {
                        id: "growth",
                        title: "Length & Volume",
                        desc: "Thicker strands, faster growth & fullness",
                        icon: "🌿",
                      },
                      {
                        id: "edges_growth",
                        title: "Edge & Scalp Recovery",
                        desc: "Restore fragile temples, reduce friction & shedding",
                        icon: "✨",
                      },
                      {
                        id: "moisture_retention",
                        title: "Deep Hydration & Softness",
                        desc: "Combat brittle dryness, lock in 72-hour moisture",
                        icon: "💧",
                      },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setHairGoal(option.id)}
                        className={`p-4 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                          hairGoal === option.id
                            ? "border-[#1a3c34] bg-emerald-50/40 shadow-xs"
                            : "border-stone-200 hover:border-stone-300 bg-stone-50/50"
                        }`}
                      >
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div>
                          <p className="text-sm font-bold text-stone-900">{option.title}</p>
                          <p className="text-xs text-stone-500 mt-1 leading-snug">{option.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Hair Texture */}
              {currentStep === 2 && (
                <div className="space-y-5 text-left bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                    Question 2 of 3: Texture &amp; Pattern
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-stone-900 font-semibold">
                    What best describes your hair texture?
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {[
                      {
                        id: "4c",
                        title: "Type 4C Coily",
                        desc: "Tight zig-zag coils, high shrinkage, loves rich butters",
                        icon: "👑",
                      },
                      {
                        id: "4a_4b",
                        title: "Type 4A / 4B Curly",
                        desc: "Defined spring curls, soft ringlets, needs balanced moisture",
                        icon: "💫",
                      },
                      {
                        id: "transitioning",
                        title: "Transitioning / Braids",
                        desc: "Protective styles, fragile line of demarcation",
                        icon: "🌱",
                      },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setHairTexture(option.id)}
                        className={`p-4 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                          hairTexture === option.id
                            ? "border-[#1a3c34] bg-emerald-50/40 shadow-xs"
                            : "border-stone-200 hover:border-stone-300 bg-stone-50/50"
                        }`}
                      >
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div>
                          <p className="text-sm font-bold text-stone-900">{option.title}</p>
                          <p className="text-xs text-stone-500 mt-1 leading-snug">{option.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Porosity / Scalp */}
              {currentStep === 3 && (
                <div className="space-y-5 text-left bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                    Question 3 of 3: Scalp &amp; Porosity
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-stone-900 font-semibold">
                    How does your hair typically behave?
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {[
                      {
                        id: "dry",
                        title: "Dries Out Fast",
                        desc: "Absorbs water quickly but dries out by next morning",
                        icon: "🌾",
                      },
                      {
                        id: "low",
                        title: "Slow Absorption",
                        desc: "Products sit on top of hair; benefits from warm steaming",
                        icon: "💧",
                      },
                      {
                        id: "sensitive",
                        title: "Itchy / Flaky Scalp",
                        desc: "Needs botanical anti-dandruff & scalp purification",
                        icon: "🌿",
                      },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPorosityOrScalp(option.id)}
                        className={`p-4 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                          porosityOrScalp === option.id
                            ? "border-[#1a3c34] bg-emerald-50/40 shadow-xs"
                            : "border-stone-200 hover:border-stone-300 bg-stone-50/50"
                        }`}
                      >
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div>
                          <p className="text-sm font-bold text-stone-900">{option.title}</p>
                          <p className="text-xs text-stone-500 mt-1 leading-snug">{option.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-2">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="text-xs font-bold text-stone-600 hover:text-stone-900 uppercase tracking-wider transition-colors"
                  >
                    ← Back
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  id="quiz-continue-btn"
                  onClick={handleNext}
                  className="px-7 py-3 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center space-x-2 transition-all shadow-sm active:scale-95"
                >
                  <span>{currentStep === 3 ? "Reveal My Tailored Ritual" : "Next Question"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-8">
              {/* Header banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{result.hairTypeBadge}</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1a3c34] font-medium">
                    {result.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                    {result.subtitle}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-400 text-xs font-semibold transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Matcher</span>
                  </button>
                </div>
              </div>

              {/* 2-Column layout: Step-by-step ritual & Recommended bundle */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Steps guide */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Your Step-by-Step Routine Application
                  </h4>

                  <div className="space-y-3">
                    {result.steps.map((s) => (
                      <div
                        key={s.step}
                        className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-start space-x-4"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#1a3c34] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {s.step}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-bold text-stone-900">{s.name}</h5>
                            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {s.timing}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {s.instruction}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-amber-900 text-xs flex items-center space-x-3">
                    <span className="text-lg">💡</span>
                    <span>
                      <strong>Pro-tip for Ghana weather:</strong> Always mist before oiling. Oil seals moisture in; it does not generate moisture on its own!
                    </span>
                  </div>
                </div>

                {/* Right: Curated Bundle Card */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full">
                        Recommended Bundle
                      </span>
                      <h5 className="font-serif text-lg font-bold text-stone-900 mt-1">
                        Your Custom Starter Set
                      </h5>
                    </div>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      In Stock
                    </span>
                  </div>

                  <div className="divide-y divide-stone-100">
                    {recommendedProducts.map((p) => (
                      <div key={p.id} className="py-3 flex items-center space-x-3">
                        <img
                          src={p.images[0] || "/images/pfy_hair_set.jpg"}
                          alt={p.name}
                          className="w-12 h-14 object-cover rounded-xl bg-stone-100 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-stone-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-stone-500">{p.sizes?.[0] || "Standard"}</p>
                        </div>
                        <span className="text-xs font-bold text-[#1a3c34] shrink-0">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-200 pt-4 space-y-3">
                    <div className="flex justify-between items-center text-sm font-bold text-stone-900">
                      <span>Total Bundle Investment</span>
                      <span className="text-base text-[#1a3c34]">{formatPrice(bundleTotal)}</span>
                    </div>

                    <button
                      type="button"
                      id="add-custom-bundle-btn"
                      onClick={handleAddAllToCart}
                      className="w-full py-3.5 bg-[#1a3c34] hover:bg-[#2a4d45] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-98"
                    >
                      {addedAll ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add Entire Ritual to Cart</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-stone-500">
                      ✓ Free Delivery across Greater Accra on orders above GH₵2
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
