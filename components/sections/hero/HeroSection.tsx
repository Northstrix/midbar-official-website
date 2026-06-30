"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import useIsRTL from "@/hooks/useIsRTL";
import { useTranslation } from "react-i18next";
import { AnimatedHeroTitle } from "./AnimatedHeroTitle";
import RefinedChronicleButton from "@/components/RefinedChronicleButton";

interface NewHeroProps {
  isLargeDesktop: boolean;
  onButtonClick?: (buttonKey: "explore") => void;
  contentMaxWidth?: string;
}

export default function Hero({ isLargeDesktop, onButtonClick, contentMaxWidth = "1448px" }: NewHeroProps) {
  const isRTL = useIsRTL();
  const { t, i18n } = useTranslation();

  // Track reactive window dimensions across breakpoints
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1440,
    height: typeof window !== "undefined" ? window.innerHeight : 900
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxBoundingWidth = useMemo(() => {
    const parsed = parseInt(contentMaxWidth, 10);
    return isNaN(parsed) ? 1448 : parsed;
  }, [contentMaxWidth]);

  // Integrated dynamic language width assignment for buttons


  // Processes both container ratios and shadow coverage heights under unified constraints
  const layoutInterpolations = useMemo(() => {
    const minHeightBoundary = 800;
    const maxHeightBoundary = 912;
    const startRatio = 40 / 31;   // ~1.2903 (Shorter screens)
    const endRatio = 160 / 144;   // ~1.1111 (Taller screens)
    const startShadowPct = 84;
    const endShadowPct = 56;
    const currentHeight = windowDimensions.height;

    // Hard-cap parameters if layout overflows target ranges
    if (currentHeight <= minHeightBoundary) {
      return { aspectRatio: startRatio, shadowHeight: `${startShadowPct}%` };
    }
    if (currentHeight >= maxHeightBoundary) {
      return { aspectRatio: endRatio, shadowHeight: `${endShadowPct}%` };
    }

    // Process fluid transformations
    const tFactor = (currentHeight - minHeightBoundary) / (maxHeightBoundary - minHeightBoundary);
    const calculatedRatio = startRatio + tFactor * (endRatio - startRatio);
    const calculatedShadowPct = startShadowPct + tFactor * (endShadowPct - startShadowPct);

    return { aspectRatio: calculatedRatio, shadowHeight: `${Math.round(calculatedShadowPct)}%` };
  }, [windowDimensions.height]);

  const handleButtonClick = (buttonKey: "explore") => {
    if (onButtonClick) onButtonClick(buttonKey);
  };

  return (
    <section 
      className="flex items-center w-full overflow-hidden" 
      dir={isRTL ? "rtl" : "ltr"} 
      style={{ height: "calc(100vh - 58px)" }}
    >
      <div className="mx-auto px-[10px] md:px-[22px] w-full" style={{ maxWidth: `${maxBoundingWidth}px` }}>
        <div className="flex w-full items-center gap-[24px]" style={{ transform: "translateY(-20px)" }}>
          
          {/* Content Column (36% Width) */}
          <div 
            className="flex flex-col gap-12 items-stretch shrink-0" 
            style={{ width: "calc((100% - 24px) * 0.36)" }}
          >
            <AnimatedHeroTitle isLargeDesktop={true} maxLayoutWidth={maxBoundingWidth} />
            <div className="w-full space-y-12">
              <p 
                className="text-lg leading-relaxed text-[var(--middle-foreground)]" 
                style={{ textAlign: isRTL ? "right" : "left" }}
              >
                {t("hero_subtext")}
              </p>
              <div className="flex w-full justify-start items-center gap-4" dir={isRTL ? "rtl" : "ltr"}>
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
            </div>
          </div>

          {/* Media Column (Strictly 64% Width) */}
          <div 
            className={cn("flex items-center shrink-0", isRTL ? "justify-start" : "justify-end")} 
            style={{ width: "calc((100% - 24px) * 0.64)" }}
          >
            <div 
              className="w-full relative group overflow-hidden select-none" 
              style={{
                aspectRatio: `${layoutInterpolations.aspectRatio}`,
                border: "1px solid var(--border-color)",
                borderRadius: "var(--smooth-border-radius)",
                backgroundColor: "var(--background)",
              }}
            >
              {/* Image utilizes absolute containment to seamlessly cover subpixel rounding gaps */}
              <img 
                src="/Midbar_STM32F401CCU6_and_Arduino_Uno_Version.webp" 
                alt={t("hero_version_name")} 
                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-[1.04] transform-gpu backface-hidden pointer-events-none" 
              />

              {/* Rollup Content Layer with dynamic inline shadow height control */}
              <div 
                className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end gap-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10" 
                style={{ 
                  backgroundImage: "var(--eased-gradient)", 
                  height: layoutInterpolations.shadowHeight,
                }}
              >
                <div className="flex flex-col gap-1 text-start w-full">
                  <h3 
                    className="text-[22px] leading-none" 
                    style={{ color: "var(--foreground)", fontWeight: isRTL ? "600" : "700" }}
                  >
                    {t("hero_version_name")}
                  </h3>
                  <p className="text-sm leading-normal text-[var(--sub-foreground)] mt-1">
                    {t("hero_version_description")}
                  </p>
                </div>
                <div className="w-full pt-2">
                  <div className="flex w-full justify-start items-center gap-4" dir={isRTL ? "rtl" : "ltr"}>
                    <RefinedChronicleButton
                      backgroundColor="var(--foreground)"
                      textColor="var(--background)"
                      hoverBackgroundColor="var(--accent)"
                      hoverTextColor="var(--foreground)"
                      borderVisible={false}
                      buttonHeight="2.875rem"
                      isRTL={isRTL}
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