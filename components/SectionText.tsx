"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";

import MobileSectionText from "./MobileSectionText";

interface SectionHeaderProps {
  id: string;
  isRTL?: boolean;
  title: string;
  description: string;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function SectionHeader({
  id,
  isRTL,
  title,
  description,
  scrollContainerRef,
}: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const uniqueId = useRef(`section-${id}`).current;

  const [isLargeDesktop, setIsLargeDesktop] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [titleFontSize, setTitleFontSize] = useState("16px");
  const [descFontSize, setDescFontSize] = useState("32px");
  const [descMarginTop, setDescMarginTop] = useState("0.25rem");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const handleResize = () => {
      const width = window.innerWidth;
      setIsLargeDesktop(width >= 1280);
      
      const elWidth = el.offsetWidth;
      const MIN_WIDTH = 200;
      const MAX_WIDTH = 1400;
      const ratio = Math.min(Math.max((elWidth - MIN_WIDTH) / (MAX_WIDTH - MIN_WIDTH), 0), 1);

      setTitleFontSize(`${(15 + ratio * 4).toFixed(1)}px`);
      setDescFontSize(`${(28 + ratio * 10).toFixed(1)}px`);
      setDescMarginTop(`${(0.1 + ratio * 0.4).toFixed(2)}rem`);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    const ro = new ResizeObserver(handleResize);
    ro.observe(el);

    return () => {
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
    };
  }, []);

  const parsedTitleLines = useMemo(() => {
    if (!title) return [];
    return title.split(/\n|<br\s*\/?>/).map((line, i) => ({
      key: i,
      chars: line.split(""),
    }));
  }, [title]);

  const parsedDescLines = useMemo(() => {
    if (!description) return [];
    return description.split(/\n|<br\s*\/?>/).map((line, i) => ({ key: i, text: line }));
  }, [description]);

  useEffect(() => {
    if (!isMounted || !ref.current || !scrollContainerRef?.current) return;

    const containerEl = scrollContainerRef.current;
    const wrapper = ref.current;
    let updateIntervalId: number | null = null;

    const calculateProgresses = () => {
      const titleLines = Array.from(wrapper.querySelectorAll(`.${uniqueId}-title-line-wrapper`)) as HTMLElement[];
      
      const containerRect = containerEl.getBoundingClientRect();
      const viewHeight = containerRect.height;
      const start = viewHeight * 0.85; 
      const end = viewHeight * 0.15;

      titleLines.forEach((line) => {
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

        const multiplier = isLargeDesktop ? 1.75 : 2.0;
        const percentage = Math.min(progress * 100 * multiplier, 100);
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
    
    const timeoutId = setTimeout(() => {
      calculateProgresses();
    }, 100);

    return () => {
      containerEl.removeEventListener("scroll", onScroll);
      clearTimeout(timeoutId);
      if (updateIntervalId !== null) {
        clearInterval(updateIntervalId);
      }
    };
  }, [isLargeDesktop, isMounted, scrollContainerRef, uniqueId, title]);

  const config = useMemo(() => {
    return {
      fontWeight: isRTL ? 600 : 900,
      trackingGap: isRTL ? "0.05em" : "0.0275em",
    };
  }, [isRTL]);

  const getFillMaskStyle = () => {
    if (!isLargeDesktop) {
      return {
        maskImage: `radial-gradient(circle at center, black var(--progress), transparent var(--progress))`,
        WebkitMaskImage: `radial-gradient(circle at center, black var(--progress), transparent var(--progress))`,
      };
    }
    const direction = isRTL ? "to left" : "to right";
    return {
      maskImage: `linear-gradient(${direction}, black 0%, black var(--progress), transparent var(--progress), transparent 100%)`,
      WebkitMaskImage: `linear-gradient(${direction}, black 0%, black var(--progress), transparent var(--progress), transparent 100%)`,
    };
  };

  const lineContainerStyle: React.CSSProperties = {
    display: "inline-flex",
    position: "relative",
    paddingBottom: "0.25em", 
    marginBottom: "-0.25em",
    overflow: "visible"
  };

  // ==========================================
  // LAYOUT A: DESKTOP RENDERING (Width >= 1280px)
  // ==========================================
  if (isLargeDesktop) {
    return (
      <div 
        ref={ref}
        className="py-16 flex flex-col md:flex-row justify-between items-end gap-6 w-full select-none"
        style={{ borderColor: "var(--border)", direction: isRTL ? "rtl" : "ltr" }}
      >
        <div className="text-start flex-1">
          <h2 className="hero-title text-5xl md:text-8xl w-full" style={{ fontWeight: config.fontWeight }}>
            {parsedTitleLines.map(({ key, chars }) => (
              <span 
                key={key} 
                className={`${uniqueId}-title-line-wrapper block relative w-full`}
                style={lineContainerStyle}
              >
                {/* Background Masked Layer */}
                {/* We swapped parent container 'gap' out for item-level conditional tracking inline padding */}
                <span className="base-layer flex relative z-10" style={{ color: "var(--reveal-mask, #262626)" }}>
                  {chars.map((ch, i) => (
                    <span 
                      key={i} 
                      className="inline-block whitespace-pre leading-none"
                      style={{
                        paddingLeft: i === 0 ? "0px" : config.trackingGap
                      }}
                    >
                      {ch === ' ' ? '\u00a0' : ch}
                    </span>
                  ))}
                </span>
                {/* Foreground Reveal Layer */}
                <span 
                  className="reveal-layer flex absolute inset-0 z-20 pointer-events-none user-select-none" 
                  aria-hidden="true"
                  style={{ ...getFillMaskStyle(), height: "130%" }}
                >
                  {chars.map((ch, i) => (
                    <span 
                      key={i} 
                      className="inline-block whitespace-pre leading-none"
                      style={{ 
                        color: i % 2 === 0 ? "var(--accent)" : "var(--foreground)",
                        paddingLeft: i === 0 ? "0px" : config.trackingGap
                      }}
                    >
                      {ch === ' ' ? '\u00a0' : ch}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </h2>
        </div>

        {/* Static Content Layout Column */}
        <div 
          className="max-w-sm text-[13px] font-mono leading-relaxed text-start p-0 m-0 text-[var(--middle-foreground)]"
          style={{ 
            borderLeft: isRTL ? "none" : "1px solid var(--desktop-section-text-separator-color)",
            borderRight: isRTL ? "1px solid var(--desktop-section-text-separator-color)" : "none",
            paddingLeft: isRTL ? "0" : "1rem",
            paddingRight: isRTL ? "1rem" : "0",
            fontWeight: config.fontWeight
          }}
        >
          {parsedDescLines.map(({ key, text }) => (
            <p key={key} className="block m-0 p-0">{text}</p>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // LAYOUT B: MOBILE RENDERING (Width < 1280px)
  // ==========================================
  return (
    <MobileSectionText 
      ref={ref} 
      isRTL={isRTL} 
      config={{ ...config, marginInlineStart: "auto" }} 
      descFontSize={descFontSize} 
      titleFontSize={titleFontSize} 
      descMarginTop={descMarginTop} 
      uniqueId={uniqueId} 
      parsedTitleLines={parsedTitleLines} 
      parsedDescLines={parsedDescLines} 
      lineContainerStyle={lineContainerStyle}
      scrollContainerRef={scrollContainerRef} // <-- PASS REVEAL REF DOWN HERE
    />
  );
}