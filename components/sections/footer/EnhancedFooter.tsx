"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import FooterBadgesGroup from "./FooterBadge";
import FooterImageCard from "./FooterImageCard";
import LimitedWidthWrapper from "@/components/limited-width-wrapper";
import HighlightHover from "@/components/HighlightHover";
import { footerBadges } from "@/data/stuff";

interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactElement;
  targetId: string;
}

interface EnhancedFooterProps {
  navItems: NavItem[];
  paddingDesktop: string;
  paddingMobile: string;
  maxWidth: string;
  isMobile: boolean;
  isRTL: boolean;
  onCreditClicked: () => void;
  metricEvent: (metric: string) => void;
}

type TextPart = {
  text: string;
  isLink: boolean;
  link?: { href: string; text: string };
};

type LanguageStrings = {
  line: TextPart[];
};

export default function EnhancedFooter({
  navItems,
  paddingDesktop,
  paddingMobile,
  maxWidth,
  isMobile,
  isRTL,
  onCreditClicked,
  metricEvent,
}: EnhancedFooterProps) {
  const { t, i18n } = useTranslation();
  const gridRef = useRef<HTMLDivElement>(null);
  const columnProbeRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [profileHovered, setProfileHovered] = useState(false);
  const [cardWidth, setCardWidth] = useState(360);
  
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1440,
    height: typeof window !== "undefined" ? window.innerHeight : 900,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Structural Column Width Calculations for layout fill alignment
  useEffect(() => {
    if (isMobile) return;
    const gridEl = gridRef.current;
    const probeEl = columnProbeRef.current;
    const wrapEl = wrapperRef.current;
    if (!gridEl || !probeEl || !wrapEl) return;

    const calc = () => {
      const wrapperWidth = wrapEl.clientWidth;
      const gridStyle = getComputedStyle(gridEl);
      const gap = parseFloat(gridStyle.columnGap || "0");
      const totalGapsWidth = gap * 4; // 5 columns total
      const colWidth = (wrapperWidth - totalGapsWidth) / 5;
      const remainingWidth = colWidth * 3 + gap * 2; // Spans Column 3, 4, and 5
      setCardWidth(remainingWidth);
    };

    const observer = new ResizeObserver(calc);
    observer.observe(gridEl);
    observer.observe(wrapEl);
    calc();

    window.addEventListener("resize", calc);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", calc);
    };
  }, [isMobile]);

  // Integrated Hero-style layout interpolations for responsive heights and ratios
  const layoutInterpolations = useMemo(() => {
    const minHeightBoundary = 800;
    const maxHeightBoundary = 912;
    const startRatio = 40 / 31;   // ~1.2903
    const endRatio = 160 / 144;   // ~1.1111
    const startShadowPct = 84;
    const endShadowPct = 58;

    const currentHeight = windowDimensions.height;
    if (currentHeight <= minHeightBoundary) {
      return { aspectRatio: startRatio, shadowHeight: `${startShadowPct}%` };
    }
    if (currentHeight >= maxHeightBoundary) {
      return { aspectRatio: endRatio, shadowHeight: `${endShadowPct}%` };
    }

    const tFactor = (currentHeight - minHeightBoundary) / (maxHeightBoundary - minHeightBoundary);
    const calculatedRatio = startRatio + tFactor * (endRatio - startRatio);
    const calculatedShadowPct = startShadowPct + tFactor * (endShadowPct - startShadowPct);

    return { aspectRatio: calculatedRatio, shadowHeight: `${Math.round(calculatedShadowPct)}%` };
  }, [windowDimensions.height]);

  // Explicitly mapped Language-Dependent block honoring translations dynamic hooks
  const madeByText: Record<string, LanguageStrings> = useMemo(() => {
    return {
      en: {
        line: [
          { text: "Made by ", isLink: false },
          { text: "Maxim Bortnikov", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "Maxim Bortnikov" } },
        ],
      },
      es: {
        line: [
          { text: "Hecho por ", isLink: false },
          { text: "Maxim Bortnikov", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "Maxim Bortnikov" } },
        ],
      },
      it: {
        line: [
          { text: "Creato da ", isLink: false },
          { text: "Maxim Bortnikov", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "Maxim Bortnikov" } },
        ],
      },
      pt: {
        line: [
          { text: "Feito por ", isLink: false },
          { text: "Maxim Bortnikov", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "Maxim Bortnikov" } },
        ],
      },
      de: {
        line: [
          { text: "Erstellt von ", isLink: false },
          { text: "Maxim Bortnikov", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "Maxim Bortnikov" } },
        ],
      },
      fr: {
        line: [
          { text: "Fait par ", isLink: false },
          { text: "Maxim Bortnikov", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "Maxim Bortnikov" } },
        ],
      },
      vi: {
        line: [
          { text: "Được làm bởi ", isLink: false },
          { text: "Maxim Bortnikov", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "Maxim Bortnikov" } },
        ],
      },
      tr: {
        line: [
          { text: "Tarafından yapıldı ", isLink: false },
          { text: "Maxim Bortnikov", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "Maxim Bortnikov" } },
        ],
      },
      he: {
        line: [
          { text: "נוצר על ידי ", isLink: false }, // "Created by" in Hebrew
          { text: "מקסים בורטניקוב", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "מקסים בורטניקוב" } },
        ],
      },
      hi: {
        line: [
          { text: "द्वारा बनाया गया ", isLink: false }, // "Made by" in Hindi
          { text: "मैक्सिम बोर्टनिकोव", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "मैक्सिम बोर्टनिकोव" } },
        ],
      },
      ja: {
        line: [
          { text: "制作者: ", isLink: false }, // "Creator/Made by" in Japanese
          { text: "Maxim Bortnikov", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "マクシム・ボルトニコフ" } },
        ],
      },
      yue: {
        line: [
          { text: "由本人製作: ", isLink: false }, // "Made by" in Cantonese
          { text: "Maxim Bortnikov", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "馬克西姆·博爾特尼科夫" } },
        ],
      },
      ko: {
        line: [
          { text: "제작자: ", isLink: false }, // "Creator/Made by" in Korean
          { text: "막심 보르트니코프", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "막심 보르트니코프" } },
        ],
      },
      ar: {
        line: [
          { text: "صنع بواسطة ", isLink: false }, // "Made by" in Gulf Arabic
          { text: "ماكسيم بورتنيكوف", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "ماكسيم بورتنيكوف" } },
        ],
      },
      fa: {
        line: [
          { text: "ساخته شده توسط ", isLink: false }, // "Made by" in Persian
          { text: "ماکسیم بورتنیکوف", isLink: true, link: { href: "https://maxim-bortnikov.netlify.app/", text: "ماکسیم بورتنیکوف" } },
        ],
      },
    };
  }, []);

  const currentLanguageParts = useMemo(() => {
    const lang = i18n.language || "en";
    return madeByText[lang]?.line || madeByText["en"].line;
  }, [madeByText, i18n.language]);

  // Exact scroll behavior mapped seamlessly from the navbar logic
  const handleSmoothScroll = (index: number) => {
    const item = navItems[index];
    if (!item) return;

    const scrollContainer = document.getElementById("page-scroll-container");
    if (!scrollContainer) return;

    if (item.id === "home") {
      const heroAnchor = document.getElementById("home-anchor");
      if (heroAnchor) {
        scrollContainer.scrollTo({
          top: heroAnchor.offsetTop,
          behavior: "smooth",
        });
      }
    } else {
      const target = document.getElementById(item.targetId);
      if (!target) return;
      scrollContainer.scrollTo({
        top: target.offsetTop,
        behavior: "smooth",
      });
    }
  };

  const gapClass = isRTL ? (isMobile ? "gap-[6.5px]" : "gap-[7px]") : (isMobile ? "gap-[5.5px]" : "gap-[6px]");
  const bioTextClass = isMobile ? "text-xs" : "text-sm";
  const logoFontSize = isMobile ? "text-[19px]" : "text-xl";

  // Reusable component node to inject layout configurations seamlessly
  const DirectCreditMarkup = (
    <div className={cn(
      "text-xs text-[var(--sub-foreground)] tracking-normal selection:bg-[var(--accent)] selection:text-[var(--foreground)]",
      isMobile ? "text-center w-full mt-4" : "text-start mt-6"
    )}
    >
      {currentLanguageParts.map((part, index) => {
        if (part.isLink && part.link) {
          return (
            <HighlightHover
              key={index}
              as="a"
              href={part.link.href}
              target="_blank"
              rel="noopener noreferrer"
              barThickness={0.11}
              gapRatio={0.03}
              className="font-medium text-[var(--foreground)] transition-colors"
              defaultTextColor="var(--foreground)"
            >
              {part.link.text}
            </HighlightHover>
          );
        }
        return <span key={index}>{part.text}</span>;
      })}
    </div>
  );

  return (
    <footer className="w-full text-[var(--foreground)] flex flex-col items-center" dir={isRTL ? "rtl" : "ltr"} style={{ minHeight: "80vh" }}>
      <div className="h-[64px]" />
      <LimitedWidthWrapper expandToFull={false} maxWidth={maxWidth} paddingDesktop={paddingDesktop} paddingMobile={paddingMobile}>
        <div ref={wrapperRef} className={cn("flex flex-col gap-12 w-full", isMobile && "items-center")}>
          <div ref={gridRef} className={cn("grid gap-8 w-full", isMobile ? "grid-cols-1" : "grid-cols-5")}
            style={{
              textAlign: isMobile ? "center" : "start",
              justifyItems: isMobile ? "center" : "start",
              alignItems: isMobile ? "center" : "start",
            }}
          >
            {/* Column 1 - Brand Info */}
            <div ref={columnProbeRef} className={cn("flex flex-col", isMobile ? "items-center" : "items-start")} style={{ textAlign: isMobile ? "center" : "start" }}>
              <a href="."
                onClick={(e) => {
                  e.preventDefault();
                  handleSmoothScroll(0);
                }}
                className={cn("group/logo flex items-center font-bold justify-center cursor-pointer", gapClass)}
                onMouseEnter={() => setProfileHovered(true)}
                onMouseLeave={() => setProfileHovered(false)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSmoothScroll(0);
                  }
                }}
                style={{
                  color: profileHovered ? "var(--accent)" : "var(--foreground)",
                  transition: "color 0.3s ease-in-out",
                  userSelect: "none",
                  fontSize: isMobile ? 19 : 20,
                  maxWidth: "max-content",
                }}
              >
                <span className={cn("font-bold lowercase first-letter:uppercase transition-colors duration-300 ease-in-out", logoFontSize)}>
                  {t("midbar")}
                </span>
              </a>
              <p className={cn("mt-4 text-[var(--sub-foreground)]", bioTextClass)}>{t("hero_subtext")}</p>
              
              <div className="mt-4 md:mt-6 w-full flex" style={{ justifyContent: isMobile ? "center" : "flex-start" }}>
                <FooterBadgesGroup
                  isRTL={isRTL}
                  metricEvent={metricEvent}
                  badges={footerBadges.map((item) => ({
                    id: item.id,
                    link: item.link,
                    image: item.image,
                    topText: t(item.topTextKey),
                    subText: t(item.subTextKey),
                    isMobile,
                  }))}
                />
              </div>

              {/* Desktop Render Position */}
              {!isMobile && DirectCreditMarkup}
            </div>

            {/* Column 2 - Navigation */}
            <nav aria-label="Footer Navigation" style={{ direction: isRTL ? "rtl" : "ltr", textAlign: isMobile ? "center" : "start", justifySelf: isMobile ? "center" : "start" }}>
              <h3 className="font-semibold text-[var(--foreground)] mb-4">{t("navigation_inscription")}</h3>
              <ul className={cn("space-y-[2px] flex flex-col", isMobile ? "items-center" : "items-start")}>
                {navItems.map(({ id, label }, index) => (
                  <li
                    key={id}
                    onClick={() => handleSmoothScroll(index)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSmoothScroll(index);
                      }
                    }}
                    style={{ maxWidth: "max-content" }}
                  >
                    <HighlightHover as="span" barThickness={0.0} gapRatio={0.03} className={cn("cursor-pointer", bioTextClass)}>
                      {label}
                    </HighlightHover>
                  </li>
                ))}
                <li
                  onClick={onCreditClicked}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onCreditClicked();
                    }
                  }}
                  style={{ maxWidth: "max-content" }}
                >
                  <HighlightHover as="span" barThickness={0.0} gapRatio={0.03} className={cn("cursor-pointer", bioTextClass)}>
                    {t("credit_inscription")}
                  </HighlightHover>
                </li>
              </ul>
            </nav>

            {/* Columns 3-5 - Interactive Hero-Image Card Component */}
            <FooterImageCard isMobile={isMobile} isRTL={isRTL} cardWidth={cardWidth} layoutInterpolations={layoutInterpolations} />
          </div>

          {/* Mobile Render Position (Absolute bottom alignment below all elements) */}
          {isMobile && DirectCreditMarkup}
          <div className="h-[24px]" />
        </div>
      </LimitedWidthWrapper>
    </footer>
  );
}