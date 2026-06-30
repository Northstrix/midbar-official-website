"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import useIsRTL from "@/hooks/useIsRTL";
import { useTranslation } from "react-i18next";

interface AnimatedHeroTitleProps {
  isLargeDesktop?: boolean;
  maxLayoutWidth?: string | number; // Bound directly to parent's dynamically lerped width limiter
}

/**
 * TUNABLE METRIC RANGES per language context.
 * Calculates everything precisely in pixel transformations,
 * locked between min and max viewport boundaries.
 */
const TYPOGRAPHY_CONFIG = {
  he: {
    minWindowWidth: 1280,
    maxWindowWidth: 1440,
    minFontPx: 140,
    maxFontPx: 164,
    fontWeight: 600,
    trackingGap: "0.03em",
    minOffsetPx: 16,
    maxOffsetPx: 32,
  },
  en: {
    minWindowWidth: 1280,
    maxWindowWidth: 1440,
    minFontPx: 82,
    maxFontPx: 86,
    fontWeight: 900,
    trackingGap: "0.0075em",
    minOffsetPx: 12,
    maxOffsetPx: 32,
  },
  default: {
    minWindowWidth: 1280,
    maxWindowWidth: 1440,
    minFontPx: 82,
    maxFontPx: 86,
    fontWeight: 900,
    trackingGap: "0.0075em",
    minOffsetPx: 12,
    maxOffsetPx: 32,
  }
};

// Precise linear interpolation mathematical handler
const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

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
  return lerp(minVal, maxVal, t);
};

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
  const low = 320; const high = 800;
  if (width >= high) return maxI;
  if (width <= low) return minI;
  const factor = (width - low) / (high - low);
  return minI + factor * (maxI - minI);
};

const calculateMarginInlineStart = (width: number, isRTL: boolean): string => {
  const minWidth = 1280; const maxWidth = 1464;
  const startVal = isRTL ? -2 : -7;
  const endVal = isRTL ? -4 : -10;
  if (width <= minWidth) return `${startVal}px`;
  if (width >= maxWidth) return `${endVal}px`;
  const factor = (width - minWidth) / (maxWidth - minWidth);
  return `${startVal + factor * (endVal - startVal)}px`;
};

export const AnimatedHeroTitle = ({ isLargeDesktop = false, maxLayoutWidth = 1448 }: AnimatedHeroTitleProps) => {
  const isRTL = useIsRTL();
  const { t, i18n } = useTranslation();
  const word = t('midbar') || "";
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  
  const [chars, setChars] = useState<string[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 800);

  // Cleanses the input 'px' string bounds down into raw mathematical numbers
  const numericMaxLayoutWidth = useMemo(() => {
    return typeof maxLayoutWidth === 'string' ? parseInt(maxLayoutWidth, 10) : maxLayoutWidth;
  }, [maxLayoutWidth]);

  // Recalculates viewport width dimensions dynamically upon resize mutations
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setChars(word.split(''));
    frameRef.current = 0;
  }, [word]);

  // CRITICAL STEP: Hard-caps standard viewport window size directly against the wrapper layout limits!
  const cappedWorkingWidth = useMemo(() => {
    return Math.min(windowWidth, numericMaxLayoutWidth);
  }, [windowWidth, numericMaxLayoutWidth]);

  const currentSpecs = useMemo(() => {
    const currentLang = (i18n.language === "he" || i18n.language === "en") ? i18n.language : "default";
    return TYPOGRAPHY_CONFIG[currentLang];
  }, [i18n.language]);

  // Processes linear transitions across structural parameters simultaneously
  const dynamicConfig = useMemo(() => {
    const calculatedFontPx = getInterpolatedValue(
      cappedWorkingWidth,
      currentSpecs.minWindowWidth,
      currentSpecs.maxWindowWidth,
      currentSpecs.minFontPx,
      currentSpecs.maxFontPx
    );

    const calculatedOffsetPx = getInterpolatedValue(
      cappedWorkingWidth,
      currentSpecs.minWindowWidth,
      currentSpecs.maxWindowWidth,
      currentSpecs.minOffsetPx,
      currentSpecs.maxOffsetPx
    );

    return {
      fontWeight: currentSpecs.fontWeight,
      fontSize: `${Math.round(calculatedFontPx)}px`,
      trackingGap: currentSpecs.trackingGap,
      offsetPx: calculatedOffsetPx,
      marginInlineStart: isLargeDesktop ? calculateMarginInlineStart(windowWidth, isRTL) : "auto"
    };
  }, [cappedWorkingWidth, currentSpecs, isLargeDesktop, windowWidth, isRTL]);

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
        
        // Employs the responsive layout calculation offset cleanly
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
      className="relative flex min-h-[124px] w-full" 
      style={{ 
        justifyContent: isLargeDesktop ? "start" : "center", 
        alignItems: isLargeDesktop ? "start" : "center", 
        textAlign: isLargeDesktop ? "start" : "center" 
      }}
    >
      <div 
        ref={containerRef} 
        className="grid grid-cols-1 grid-rows-1 select-none inline-grid" 
        style={{ 
          fontWeight: dynamicConfig.fontWeight, 
          fontSize: dynamicConfig.fontSize, 
          justifyItems: isLargeDesktop ? "start" : "center", 
          marginInlineStart: dynamicConfig.marginInlineStart, 
          marginInlineEnd: isLargeDesktop ? "0px" : "auto", 
        }}
      >
        {/* Ghost Layer */}
        <div 
          className="col-start-1 row-start-1 hero-title pointer-events-none flex" 
          style={{ 
            gap: dynamicConfig.trackingGap, 
            color: "var(--foreground)", 
            opacity: 0.144, 
            justifyContent: isLargeDesktop ? "start" : "center" 
          }} 
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
          className="col-start-1 row-start-1 hero-title flex pointer-events-none" 
          style={{ 
            gap: dynamicConfig.trackingGap, 
            color: "var(--foreground)", 
            justifyContent: isLargeDesktop ? "start" : "center" 
          }}
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
};