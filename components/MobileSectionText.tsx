"use client";

import React, { useState, useEffect, useMemo } from "react";

interface MobileSectionTextProps {
  ref: React.RefObject<HTMLDivElement | null>;
  isRTL: boolean;
  config: {
    fontWeight: number;
    trackingGap: string;
    marginInlineStart: string;
  };
  descFontSize: string;
  titleFontSize: string;
  descMarginTop: string;
  uniqueId: string;
  parsedTitleLines: Array<{ key: number; chars: string[] }>;
  parsedDescLines: Array<{ key: number; text: string }>;
  lineContainerStyle: React.CSSProperties;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>; // Received from parent
}

// ==========================================
// EASILY TWEAK MULTIPLIERS HERE
// ==========================================
const MULTIPLIER_CONFIG = {
  topText:    { max: 2.4, min: 1.0 }, // Maps to <h2> (descFontSize)
  bottomText: { max: 1.8, min: 1.0 }, // Maps to <div> (titleFontSize)
  range:      { maxW: 1280, minW: 320 }
};

export default function MobileSectionText({
  ref,
  isRTL,
  config,
  descFontSize,
  titleFontSize,
  descMarginTop,
  uniqueId,
  parsedTitleLines,
  parsedDescLines,
  lineContainerStyle,
  scrollContainerRef,
}: MobileSectionTextProps) {
  
  // Dynamic scale state based on window width
  const [multipliers, setMultipliers] = useState({ top: 1.0, bottom: 1.0 });

  // 1. Dynamic Font Scaling Effect
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const { topText, bottomText, range } = MULTIPLIER_CONFIG;

      const clampedWidth = Math.max(range.minW, Math.min(range.maxW, width));
      const factor = (clampedWidth - range.minW) / (range.maxW - range.minW);

      setMultipliers({
        top: topText.min + factor * (topText.max - topText.min),
        bottom: bottomText.min + factor * (bottomText.max - bottomText.min)
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Mobile-Specific Radial Scroll Progress Effect
  useEffect(() => {
    if (!ref || !ref.current || !scrollContainerRef?.current) return;
    
    const containerEl = scrollContainerRef.current;
    const wrapper = ref.current;
    let updateIntervalId: number | null = null;

    const calculateProgresses = () => {
      // Find the mobile-wrapped text rows
      const lines = Array.from(
        wrapper.querySelectorAll(`.${uniqueId}-mobile-line-wrapper`)
      ) as HTMLElement[];
      
      const containerRect = containerEl.getBoundingClientRect();
      const viewHeight = containerRect.height;
      const start = viewHeight * 0.85;
      const end = viewHeight * 0.15;

      lines.forEach((line) => {
        const rect = line.getBoundingClientRect();
        const relativeTop = rect.top - containerRect.top;
        const height = rect.height;
        
        let progress = 0;
        if (relativeTop < start && relativeTop + height > end) {
          progress = 1 - (relativeTop - end) / (start - end);
          progress = Math.min(Math.max(progress, 0), 1);
        } else if (relativeTop + height <= end) {
          progress = 1;
        } else {
          progress = 0;
        }

        // Target mobile multiplier
        const percentage = Math.min(progress * 100 * 2.0, 100);
        line.style.setProperty("--progress", `${percentage}%`);
      });
    };

    const onScroll = () => {
      calculateProgresses();
      if (updateIntervalId === null) {
        updateIntervalId = window.setInterval(() => {
          calculateProgresses();
        }, 16);
      }
    };

    containerEl.addEventListener("scroll", onScroll, { passive: true });
    
    // Initial paint calculation
    const timeoutId = setTimeout(() => {
      calculateProgresses();
    }, 50);

    return () => {
      containerEl.removeEventListener("scroll", onScroll);
      clearTimeout(timeoutId);
      if (updateIntervalId !== null) {
        clearInterval(updateIntervalId);
      }
    };
  }, [scrollContainerRef, uniqueId, parsedTitleLines, ref]);

  // Helper function to scale font properties cleanly
  const getScaledFontSize = (baseSizeStr: string, multiplier: number) => {
    const numericValue = parseFloat(baseSizeStr);
    const unit = baseSizeStr.replace(/[0-9.]/g, "") || "px";
    return isNaN(numericValue) ? baseSizeStr : `${numericValue * multiplier}${unit}`;
  };

  const finalTopSize = getScaledFontSize(descFontSize, multipliers.top);
  const finalBottomSize = getScaledFontSize(titleFontSize, multipliers.bottom);

  // Mobile Radial Gradient Style Mask
  const mobileMaskStyle: React.CSSProperties = {
    maskImage: `radial-gradient(circle at center, black var(--progress, 0%), transparent var(--progress, 0%))`,
    WebkitMaskImage: `radial-gradient(circle at center, black var(--progress, 0%), transparent var(--progress, 0%))`,
  };

  return (
    <div
      ref={ref}
      className="flex flex-col w-full overflow-hidden relative items-center text-center px-[10px] py-16 select-none"
      style={{ direction: isRTL ? "rtl" : "ltr" }}
    >
      {/* TOP TEXT (Gets the 2.4 - 1 multiplier & radial scroll animation) */}
      <h2
        className="font-headline tracking-tight mt-4 mb-2.5 leading-tight w-full flex flex-col items-center"
        style={{ fontSize: finalTopSize, fontWeight: config.fontWeight, lineHeight: 1.2 }}
      >
        {parsedTitleLines.map(({ key, chars }) => (
          <span 
            key={key} 
            className={`${uniqueId}-mobile-line-wrapper block relative`}
            style={lineContainerStyle}
          >
            {/* Base Background Layer */}
            <span className="base-layer flex relative z-10" style={{ color: "var(--reveal-mask, #262626)", gap: config.trackingGap }}>
              {chars.map((ch, i) => (
                <span key={i} className="inline-block whitespace-pre leading-none">
                  {ch === ' ' ? '\u00a0' : ch}
                </span>
              ))}
            </span>
            
            {/* Active Foreground Reveal Layer */}
            <span 
              className="reveal-layer flex absolute inset-0 z-20 pointer-events-none user-select-none" 
              aria-hidden="true"
              style={{ ...mobileMaskStyle, height: "130%", gap: config.trackingGap }}
            >
              {chars.map((ch, i) => (
                <span 
                  key={i} 
                  className="inline-block whitespace-pre leading-none"
                  style={{ color: i % 2 === 0 ? "var(--accent)" : "var(--foreground)" }}
                >
                  {ch === ' ' ? '\u00a0' : ch}
                </span>
              ))}
            </span>
          </span>
        ))}
      </h2>
      
      {/* BOTTOM TEXT (Gets the 1.8 - 1 multiplier, no scroll animation mask) */}
      <div
        className="w-full relative mt-1.5 text-[var(--middle-foreground)]"
        style={{ fontSize: finalBottomSize, lineHeight: 1.4, marginTop: descMarginTop, fontWeight: config.fontWeight }}
      >
        {parsedDescLines.map(({ key, text }) => (
          <p key={key} className="block m-0 p-0">{text}</p>
        ))}
      </div>
    </div>
  );
}