"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import useIsRTL from "@/hooks/useIsRTL";
import RefinedChronicleButton from "@/components/RefinedChronicleButton";
import { cn } from "@/lib/utils";

/* ==========================================================================
   TUNABLE CONFIGURATION RANGES (Easily edit margins and breakpoints here)
   ========================================================================== */
const LAYOUT_SETTINGS = {
  // Global Viewport Boundaries
  minWidthBoundary: 320,
  maxWidthBoundary: 1000,
  titleMarginWidthBoundary: 1280,

  // Section Top Margin Controls
  minSectionTopMargin: 0,
  maxSectionTopMargin: 36,

  // Animated Title Bottom Margin Controls
  minTitleBottomMargin: 0,
  maxTitleBottomMargin: 72,
};

const SUBTEXT_MULTIPLIER_CONFIG = { max: 1.8, min: 1.0, maxW: 1280, minW: 320 };

const TYPOGRAPHY_CONFIG = {
  he: {
    minWindowWidth: 320,
    maxWindowWidth: 1440,
    minFontPx: 100,
    maxFontPx: 380,
    fontWeight: 600,
    trackingGap: "0.0275em",
    minOffsetPx: 12,
    maxOffsetPx: 32,
  },
  en: {
    minWindowWidth: 320,
    maxWindowWidth: 1440,
    minFontPx: 60,
    maxFontPx: 200,
    fontWeight: 900,
    trackingGap: "0.0075em",
    minOffsetPx: 12,
    maxOffsetPx: 32,
  },
  default: {
    minWindowWidth: 375,
    maxWindowWidth: 1440,
    minFontPx: 44,
    maxFontPx: 112,
    fontWeight: 900,
    trackingGap: "0.0275em",
    minOffsetPx: 12,
    maxOffsetPx: 32,
  }
};

/* --- Linear Interpolation Helper --- */
const getInterpolatedValue = (
  currentWidth: number,
  minWidth: number,
  maxWidth: number,
  minVal: number,
  maxVal: number
 ): number => {
  if (currentWidth <= minWidth) return minVal;
  if (currentWidth >= maxWidth) return maxVal;
  const t = (currentWidth - minWidth) / (maxWidth - minWidth);
  return startValue + t * (maxVal - minVal);
};

const startValue = 0;
const ease = {
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  in: (t: number) => Math.pow(t, 3),
};

function cyc(f: number, offset: number, enter: number, hold: number, exit: number, pause: number) {
  if (f < offset) return 0;
  const total = enter + hold + exit + pause;
  const t = (f - offset) % total;
  if (t < enter) return ease.out(t / enter);
  if (t < enter + hold) return 1;
  if (t < enter + hold + exit) return 1 - ease.in((t - enter - hold) / exit);
  return 0;
}

const calculateIntensity = (width: number, minI: number, maxI: number) => {
  const low = 320;
  const high = 800;
  if (width >= high) return maxI;
  if (width <= low) return minI;
  const factor = (width - low) / (high - low);
  return minI + factor * (maxI - minI);
};

/* --- INTEGRATED FORKED ANIMATED HERO TITLE --- */
interface TitleProps {
  maxLayoutWidth: number;
  windowWidth: number;
  bottomMargin: number;
}

function InlineAnimatedHeroTitle({ maxLayoutWidth, windowWidth, bottomMargin }: TitleProps) {
  const { t, i18n } = useTranslation();
  const word = t('midbar') || "";
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const [chars, setChars] = useState<string[]>([]);

  useEffect(() => {
    setChars(word.split(''));
    frameRef.current = 0;
  }, [word]);

  const cappedWorkingWidth = useMemo(() => {
    return Math.min(windowWidth, maxLayoutWidth);
  }, [windowWidth, maxLayoutWidth]);

  const currentSpecs = useMemo(() => {
    const currentLang = (i18n.language === "he" || i18n.language === "en") ? i18n.language : "default";
    return TYPOGRAPHY_CONFIG[currentLang];
  }, [i18n.language]);

  const dynamicConfig = useMemo(() => {
    const calculatedFontPx = currentSpecs.minFontPx + ((cappedWorkingWidth - currentSpecs.minWindowWidth) / (currentSpecs.maxWindowWidth - currentSpecs.minWindowWidth)) * (currentSpecs.maxFontPx - currentSpecs.minFontPx);
    const calculatedOffsetPx = currentSpecs.minOffsetPx + ((cappedWorkingWidth - currentSpecs.minWindowWidth) / (currentSpecs.maxWindowWidth - currentSpecs.minWindowWidth)) * (currentSpecs.maxOffsetPx - currentSpecs.minOffsetPx);
    
    const safeFont = cappedWorkingWidth <= currentSpecs.minWindowWidth ? currentSpecs.minFontPx : (cappedWorkingWidth >= currentSpecs.maxWindowWidth ? currentSpecs.maxFontPx : calculatedFontPx);
    const safeOffset = cappedWorkingWidth <= currentSpecs.minWindowWidth ? currentSpecs.minOffsetPx : (cappedWorkingWidth >= currentSpecs.maxWindowWidth ? currentSpecs.maxOffsetPx : calculatedOffsetPx);

    return {
      fontWeight: currentSpecs.fontWeight,
      fontSize: `${Math.round(safeFont)}px`,
      trackingGap: currentSpecs.trackingGap,
      offsetPx: safeOffset,
    };
  }, [cappedWorkingWidth, currentSpecs]);

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      if (containerRef.current) {
        const style = getComputedStyle(document.documentElement);
        const baseEnter = parseInt(style.getPropertyValue('--hero-enter')) || 92;
        const baseHold = parseInt(style.getPropertyValue('--hero-hold')) || 42;
        const baseExit = parseInt(style.getPropertyValue('--hero-exit')) || 36;
        const basePause = parseInt(style.getPropertyValue('--hero-pause')) || 44;
        const baseStagger = parseInt(style.getPropertyValue('--hero-stagger')) || 8;
        const baseSpread = parseInt(style.getPropertyValue('--hero-spread')) || 16;
        const baseOffset = dynamicConfig.offsetPx;
        
        const minIntensity = parseFloat(style.getPropertyValue('--hero-min-intensity')) || 0.4;
        const maxIntensity = parseFloat(style.getPropertyValue('--hero-max-intensity')) || 1.0;
        const intensity = calculateIntensity(windowWidth, minIntensity, maxIntensity);

        const liveChars = containerRef.current.querySelectorAll('.char-live');
        const N = liveChars.length;
        const center = (N - 1) / 2;

        liveChars.forEach((el: any, i) => {
          const p = cyc(frameRef.current, i * (baseStagger * intensity), baseEnter, baseHold, baseExit, basePause);
          const dist = (Math.abs(i - center) * baseSpread + baseOffset) * intensity;
          const dir = i % 2 === 0 ? -1 : 1;
          el.style.transform = `translateY(${dir * dist * p}px)`;
          el.style.opacity = '1';
        });
      }
      frameRef.current++;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [chars, windowWidth, dynamicConfig.offsetPx]);

  return (
    <div 
      className="relative flex min-h-31 w-full justify-center items-center text-center mx-auto"
      style={{ marginBottom: `${bottomMargin}px` }}
    >
      <div
        ref={containerRef}
        className="grid grid-cols-1 grid-rows-1 select-none justify-items-center mx-auto"
        style={{
          fontWeight: dynamicConfig.fontWeight,
          fontSize: dynamicConfig.fontSize,
        }}
      >
        {/* Ghost Layer */}
        <div 
          className="col-start-1 row-start-1 hero-title pointer-events-none flex justify-center" 
          style={{ gap: dynamicConfig.trackingGap, color: "var(--foreground)", opacity: 0.144 }}
          aria-hidden="true"
        >
          {chars.map((ch, i) => (
            <span key={`ghost-${i}`} className="inline-block whitespace-pre leading-none">
              {ch === ' ' ? '\u00a0' : ch}
            </span>
          ))}
        </div>
        {/* Live Layer */}
        <div 
          className="col-start-1 row-start-1 hero-title flex pointer-events-none justify-center" 
          style={{ gap: dynamicConfig.trackingGap, color: "var(--foreground)" }}
        >
          {chars.map((ch, i) => (
            <span 
              key={`live-${i}`} 
              className="char-live inline-block whitespace-pre leading-none will-change-transform opacity-0"
              style={{ color: i % 2 === 0 ? "var(--accent)" : "inherit" }}
            >
              {ch === ' ' ? '\u00a0' : ch}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- MAIN MOBILE HERO COMPONENT --- */
interface MobileHeroProps {
  onButtonClick?: (buttonKey: "explore" | "contact-info" | "get-firmware") => void;
  contentMaxWidth?: string;
}

export default function MobileHero({ onButtonClick, contentMaxWidth = "1448px" }: MobileHeroProps) {
  const isRTL = useIsRTL();
  const { t, i18n } = useTranslation();
  
  const [windowWidth, setWindowWidth] = useState(800);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxBoundingWidth = useMemo(() => {
    const parsed = parseInt(contentMaxWidth, 10);
    return isNaN(parsed) ? 1448 : parsed;
  }, [contentMaxWidth]);

  const calculatedTopMargin = useMemo(() => {
    const { minWidthBoundary, maxWidthBoundary, minSectionTopMargin, maxSectionTopMargin } = LAYOUT_SETTINGS;
    if (windowWidth <= minWidthBoundary) return minSectionTopMargin;
    if (windowWidth >= maxWidthBoundary) return maxSectionTopMargin;
    const factor = (windowWidth - minWidthBoundary) / (maxWidthBoundary - minWidthBoundary);
    return Math.round(minSectionTopMargin + factor * (maxSectionTopMargin - minSectionTopMargin));
  }, [windowWidth]);

  const calculatedTitleBottomMargin = useMemo(() => {
    const { minWidthBoundary, titleMarginWidthBoundary, minTitleBottomMargin, maxTitleBottomMargin } = LAYOUT_SETTINGS;
    if (windowWidth <= minWidthBoundary) return minTitleBottomMargin;
    if (windowWidth >= titleMarginWidthBoundary) return maxTitleBottomMargin;
    const factor = (windowWidth - minWidthBoundary) / (titleMarginWidthBoundary - minWidthBoundary);
    return Math.round(minTitleBottomMargin + factor * (maxTitleBottomMargin - minTitleBottomMargin));
  }, [windowWidth]);

  const dynamicSubtextFontSize = useMemo(() => {
    const { max, min, maxW, minW } = SUBTEXT_MULTIPLIER_CONFIG;
    const clampedWidth = Math.max(minW, Math.min(maxW, windowWidth));
    const factor = (clampedWidth - minW) / (maxW - minW);
    const currentMultiplier = min + factor * (max - min);
    return `${1 * currentMultiplier}rem`;
  }, [windowWidth]);

  const handleButtonClick = (buttonKey: "explore" | "get-firmware") => {
    if (onButtonClick) onButtonClick(buttonKey);
  };

  /* ==========================================================================
     MOBILE HERO IMAGE CARD INLINE ARCHITECTURE
     ========================================================================== */
  const cardImageSrc = "/Midbar_STM32F401CCU6_and_Arduino_Uno_Version.webp";
  
  const cardWrapperClassName = cn(
    "flex select-none w-full justify-center items-center text-center mt-8 col-span-1"
  );

  const cardOuterStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "600px",
    minHeight: "auto",
    boxSizing: "border-box",
  };

  const cardContainerStyle: React.CSSProperties = {
    border: "1px solid var(--border-color)",
    borderRadius: "var(--smooth-border-radius)",
    backgroundColor: "var(--background)",
    boxSizing: "border-box",
  };

  const cardPaddingStyle: React.CSSProperties = {
    padding: "16px",
    boxSizing: "border-box",
  };

  const cardTitleStyle: React.CSSProperties = {
    color: "var(--foreground)",
    fontWeight: 700,
    margin: 0,
    lineHeight: 1.1,
    fontSize: "clamp(12px, calc(9.14px + 0.89vw), 16px)",
  };

  const cardDescriptionStyle: React.CSSProperties = {
    color: "var(--sub-foreground)",
    margin: 0,
    lineHeight: 1.35,
    fontSize: "clamp(12px, calc(10.57px + 0.45vw), 14px)",
  };

  return (
    <section 
      className="flex flex-col w-full py-8 overflow-x-hidden items-center justify-center text-center"
      dir={isRTL ? "rtl" : "ltr"}
      style={{ marginTop: `${calculatedTopMargin}px` }}
    >
      <div 
        className="mx-auto px-4 w-full flex flex-col gap-10 items-center justify-center text-center"
        style={{ maxWidth: `${maxBoundingWidth}px` }}
      >
        {/* Text Area Frame Group */}
        <div className="flex flex-col w-full items-center justify-center text-center">
          <InlineAnimatedHeroTitle 
            maxLayoutWidth={maxBoundingWidth} 
            windowWidth={windowWidth} 
            bottomMargin={calculatedTitleBottomMargin} 
          />
          <div className="w-full flex flex-col items-center justify-center gap-6">
            <p 
              className="leading-relaxed text-(--middle-foreground) text-center w-full"
              style={{ fontSize: dynamicSubtextFontSize }}
            >
              {t("hero_subtext")}
            </p>
            
            <div className="flex w-full justify-center items-center gap-4">
              <RefinedChronicleButton
                backgroundColor="var(--foreground)"
                textColor="var(--background)"
                hoverBackgroundColor="var(--accent)"
                hoverTextColor="var(--foreground)"
                borderVisible={false}
                buttonHeight="2.875rem"
                isRTL={isRTL}
                onClick={() => handleButtonClick("explore")}
              >
                {t("learn_more")}
              </RefinedChronicleButton>
            </div>

            {/* Exclusively Integrated Mobile Layout Hero Card */}
            <div className={cardWrapperClassName} style={cardOuterStyle}>
              <div className="w-full flex flex-col" style={{ ...cardContainerStyle, overflow: "visible" }}>
                <div 
                  className="w-full relative" 
                  style={{
                    aspectRatio: "40 / 38",
                    overflow: "hidden",
                    borderTopLeftRadius: "inherit",
                    borderTopRightRadius: "inherit",
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    backgroundColor: "var(--background)",
                  }}
                >
                  <img 
                    src={cardImageSrc} 
                    alt={t("hero_version_name")} 
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{
                      display: "block",
                      borderTopLeftRadius: "inherit",
                      borderTopRightRadius: "inherit",
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                      WebkitBackfaceVisibility: "hidden",
                      backfaceVisibility: "hidden",
                    }} 
                  />
                </div>
                <div 
                  className="w-full flex flex-col" 
                  style={{
                    ...cardPaddingStyle,
                    borderTop: "1px solid var(--border-color)",
                    borderBottomLeftRadius: "inherit",
                    borderBottomRightRadius: "inherit",
                    backgroundColor: "var(--background)",
                    gap: "12px",
                  }}
                >
                  <div className="w-full flex flex-col gap-2">
                    <h3 style={cardTitleStyle}>{t("hero_version_name")}</h3>
                    <p style={cardDescriptionStyle}>
                      {t("hero_version_description")}
                    </p>
                  </div>
                  <div className="w-full">
                    <RefinedChronicleButton
                      backgroundColor="var(--foreground)"
                      textColor="var(--background)"
                      hoverBackgroundColor="var(--accent)"
                      hoverTextColor="var(--foreground)"
                      borderVisible={false}
                      buttonHeight="2.875rem"
                      width="100%"
                      isRTL={isRTL}
                      onClick={() => handleButtonClick("get-firmware")}
                      href="https://sourceforge.net/projects/midbar/files/STM32F401CCU6%20%2B%20Arduino%20Uno%20Version/V1.0/"
                    >
                      {t("get_firmware")}
                    </RefinedChronicleButton>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}