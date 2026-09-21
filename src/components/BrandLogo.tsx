import React from "react";

interface BrandLogoProps {
  variant?: "horizontal" | "vertical" | "mark" | "stacked";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  inverted?: boolean; // For dark backgrounds (like footer or admin bar)
  showTagline?: boolean;
  className?: string;
}

const logoClassMap = {
  sm: "h-7 sm:h-8 w-auto",
  md: "h-10 sm:h-12 w-auto",
  lg: "h-16 sm:h-20 w-auto",
  xl: "h-20 sm:h-24 w-auto",
  full: "h-16 sm:h-24 w-auto max-w-full",
};

const titleSizeMap = {
  sm: "text-base sm:text-lg tracking-wider",
  md: "text-lg sm:text-xl md:text-2xl tracking-[0.14em]",
  lg: "text-2xl sm:text-3xl tracking-[0.16em]",
  xl: "text-3xl sm:text-4xl tracking-[0.18em]",
};

const taglineSizeMap = {
  sm: "text-[9px] sm:text-[10px]",
  md: "text-[10px] sm:text-[11px]",
  lg: "text-xs sm:text-sm",
  xl: "text-sm sm:text-base",
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "horizontal",
  size = "md",
  inverted = false,
  showTagline = true,
  className = "",
}) => {
  const textColor = inverted ? "text-white" : "text-[#1a3c34]";
  const taglineColor = inverted ? "text-stone-300" : "text-[#5a5a40]";
  // The logo PNG carries dark colors, so on dark backgrounds we render it white.
  const imgFilter = inverted ? "brightness-0 invert" : "";

  const logoClass = logoClassMap[size];
  const titleClass = titleSizeMap[size];
  const taglineClass = taglineSizeMap[size];

  if (variant === "mark") {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src="/images/logo.png"
          alt="Perfect For You"
          className={`${logoClass} ${imgFilter} object-contain select-none`}
          aria-hidden="true"
        />
      </div>
    );
  }

  if (variant === "vertical" || variant === "stacked") {
    return (
      <div
        className={`inline-flex flex-col items-center text-center select-none ${className}`}
      >
        <img
          src="/images/logo.png"
          alt="Perfect For You"
          className={`${logoClass} ${imgFilter} mb-1.5 object-contain`}
          aria-hidden="true"
        />
        <span
          className={`font-serif font-bold uppercase ${textColor} ${titleClass} leading-tight`}
        >
          PERFECT FOR YOU
        </span>
        {showTagline && (
          <span
            className={`font-sans font-medium ${taglineColor} ${taglineClass} mt-0.5 tracking-normal`}
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
      <img
        src="/images/logo.png"
        alt="Perfect For You"
        className={`${logoClass} ${imgFilter} shrink-0 object-contain`}
        aria-hidden="true"
      />
    </div>
  );
};