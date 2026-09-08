import React from "react";

interface BrandLogoProps {
  variant?: "horizontal" | "vertical" | "mark" | "stacked";
  size?: "sm" | "md" | "lg" | "xl";
  inverted?: boolean; // For dark backgrounds (like footer or admin bar)
  showTagline?: boolean;
  className?: string;
}

/**
 * Botanical 'P' Emblem for Perfect For You
 * Features the signature deep botanical green 'P' with integrated organic leaves
 * and delicate natural venation reflecting "Healthy Hair, Happy Skin".
 */
export const BrandEmblem: React.FC<{
  className?: string;
  inverted?: boolean;
}> = ({ className = "w-10 h-10", inverted = false }) => {
  const fillColor = inverted ? "#ffffff" : "#1a3c34";
  const leafColor = inverted ? "#d4e4dc" : "#1a3c34";
  const veinColor = inverted ? "#1a3c34" : "#f5f2ed";
  const cutoutBg = inverted ? "#1a3c34" : "currentColor";

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer P Silhouette */}
      <path
        d="M48 18 H74 C91.5 18 102 28.5 102 43 C102 57.5 91 67.5 73.5 67.5 H58.5 V98 C58.5 100.5 56.5 102 53.5 102 C50.5 102 48 100.5 48 98 V18 Z"
        fill={fillColor}
      />

      {/* Inner P Counter Cutout */}
      <path
        d="M58.5 28.5 H72 C81 28.5 88 34.5 88 43 C88 51.5 81 57.5 72 57.5 H58.5 V28.5 Z"
        fill={inverted ? "#1a3c34" : "#f5f2ed"}
      />

      {/* Inner Botanical Leaf emerging into the P's loop */}
      <path
        d="M51 64 C50 48 60 30 84 25 C82 43 70 59 51 64 Z"
        fill={leafColor}
      />
      {/* Inner Leaf Vein */}
      <path
        d="M54 60 Q 64 45 81 28"
        stroke={veinColor}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Sprouting Left Leaf */}
      <path
        d="M50 56 C38 42 22 46 16 54 C 20 66 36 71 50 63 Z"
        fill={fillColor}
      />
      {/* Left Leaf Vein */}
      <path
        d="M48 61 Q 32 58 20 53"
        stroke={veinColor}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "horizontal",
  size = "md",
  inverted = false,
  showTagline = true,
  className = "",
}) => {
  // Sizing definitions
  const sizeMap = {
    sm: {
      emblem: "w-7 h-7 sm:w-8 sm:h-8",
      title: "text-base sm:text-lg tracking-wider",
      tagline: "text-[9px] sm:text-[10px]",
    },
    md: {
      emblem: "w-9 h-9 sm:w-11 sm:h-11",
      title: "text-lg sm:text-xl md:text-2xl tracking-[0.14em]",
      tagline: "text-[10px] sm:text-[11px]",
    },
    lg: {
      emblem: "w-12 h-12 sm:w-14 sm:h-14",
      title: "text-2xl sm:text-3xl tracking-[0.16em]",
      tagline: "text-xs sm:text-sm",
    },
    xl: {
      emblem: "w-16 h-16 sm:w-20 sm:h-20",
      title: "text-3xl sm:text-4xl tracking-[0.18em]",
      tagline: "text-sm sm:text-base",
    },
  }[size];

  const textColor = inverted ? "text-white" : "text-[#1a3c34]";
  const taglineColor = inverted ? "text-stone-300" : "text-[#5a5a40]";

  if (variant === "mark") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <BrandEmblem className={sizeMap.emblem} inverted={inverted} />
      </div>
    );
  }

  if (variant === "vertical" || variant === "stacked") {
    return (
      <div
        className={`inline-flex flex-col items-center text-center select-none ${className}`}
      >
        <BrandEmblem
          className={`${sizeMap.emblem} mb-1.5`}
          inverted={inverted}
        />
        <span
          className={`font-serif font-bold uppercase ${textColor} ${sizeMap.title} leading-tight`}
        >
          PERFECT FOR YOU
        </span>
        {showTagline && (
          <span
            className={`font-sans font-medium ${taglineColor} ${sizeMap.tagline} mt-0.5 tracking-normal`}
          >
            Healthy Hair, Happy Skin
          </span>
        )}
      </div>
    );
  }

  // Default "horizontal" layout
  return (
    <div
      className={`inline-flex items-center space-x-2.5 sm:space-x-3 select-none ${className}`}
    >
      <BrandEmblem
        className={`${sizeMap.emblem} shrink-0`}
        inverted={inverted}
      />
      <div className="flex flex-col items-start leading-none text-left">
        <span
          className={`font-serif font-bold uppercase ${textColor} ${sizeMap.title}`}
        >
          PERFECT FOR YOU
        </span>
        {showTagline && (
          <span
            className={`font-sans font-medium ${taglineColor} ${sizeMap.tagline} mt-1 tracking-normal`}
          >
            Healthy Hair, Happy Skin
          </span>
        )}
      </div>
    </div>
  );
};
