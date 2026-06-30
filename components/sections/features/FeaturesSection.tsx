"use client";

import React, { useRef, useState, useEffect } from "react";
import useIsRTL from "@/hooks/useIsRTL";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import SectionText from "@/components/SectionText";
import LimitedWidthWrapper from "@/components/limited-width-wrapper";
import {
  ShieldCheck,
  Eye,
  BrickWall,
  Layers,
  LibraryBig,
} from "lucide-react";
import { GlowingEffect } from "@/components/GlowingEffect";

interface FeaturesSectionProps {
  maxWidth: string;
  paddingDesktop: string;
  paddingMobile: string;
  scrollContainerRef?: React.RefObject<HTMLElement>;
}

interface GridItemProps {
  className?: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const FeatureGridItem = ({
  className = "",
  icon,
  title,
  subtitle,
}: GridItemProps) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className={`min-h-[14rem] transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div
        className="relative h-full rounded-[var(--smooth-border-radius)] border p-2 md:p-3"
        style={{
          border: "1px solid var(--border-color)",
          transition: "border-color 0.3s ease-in-out",
          background: "var(--footer-background)",
        }}
      >
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden p-6 md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="flex w-full items-start justify-between">
              <div className="w-fit rounded-[var(--border-radius)] border border-[var(--border-color)] bg-[var(--feature-icon-background)] p-2">
                {icon}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="-tracking-4 pt-0.5 text-xl/[1.375rem] font-semibold text-balance text-[var(--foreground)] md:text-2xl/[1.875rem]">
                {title}
              </h3>
              <h2 className="text-sm/[1.125rem] text-[var(--middle-foreground)] md:text-base/[1.375rem]">
                {subtitle}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FeaturesSection({
  maxWidth,
  paddingDesktop,
  paddingMobile,
  scrollContainerRef,
}: FeaturesSectionProps) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const isRTL = useIsRTL();
  const sectionRef = useRef<HTMLElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const currentLang = (i18n.resolvedLanguage || i18n.language || "").toLowerCase().split("-")[0];
  const isArabicOrFarsi = currentLang === "ar" || currentLang === "fa";

  const localFeatureItems = [
  {
      id: "feat-1",
      className: "md:col-span-2",
      icon: (
        <ShieldCheck 
          className={`h-5 w-5 text-[var(--subtle-foreground)] transition-transform duration-300 ${
            isArabicOrFarsi ? "-scale-x-100" : ""
          }`} 
        />
      ),
      title: t("feature_item_1_title"),
      subtitle: t("feature_item_1_subtitle"),
    },
    {
      id: "feat-2",
      className: "",
      icon: <Eye className="h-5 w-5 text-[var(--subtle-foreground)]" />,
      title: t("feature_item_2_title"),
      subtitle: t("feature_item_2_subtitle"),
    },
    {
      id: "feat-3",
      className: "",
      icon: <BrickWall className="h-5 w-5 text-[var(--subtle-foreground)]" />,
      title: t("feature_item_3_title"),
      subtitle: t("feature_item_3_subtitle"),
    },
    {
      id: "feat-4",
      className: "",
      icon: (
        <Layers 
          className={`h-5 w-5 text-[var(--subtle-foreground)] transition-transform duration-300 ${
            isRTL ? "rotate-90" : "-rotate-90"
          }`} 
        />
      ),
      title: t("feature_item_4_title"),
      subtitle: t("feature_item_4_subtitle"),
    },
    {
      id: "feat-5",
      className: "",
      icon: (
        <LibraryBig 
          className={`h-5 w-5 text-[var(--subtle-foreground)] transition-transform duration-300 ${
            isRTL ? "-scale-x-100" : ""
          }`} 
        />
      ),
      title: t("feature_item_5_title"),
      subtitle: t("feature_item_5_subtitle"),
    },
  ];

  useEffect(() => {
    const updateContainerWidth = () => {
      if (sectionRef.current) {
        setContainerWidth(sectionRef.current.clientWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);
    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  const breakpoints = { twoCols: 912 };
  const useBentoGrid = containerWidth >= breakpoints.twoCols;

  return (
    <section
      ref={sectionRef}
      className={`relative flex flex-col overflow-hidden transition duration-300 ease-in-out ${
        isMobile ? "min-h-0 justify-start py-14" : "py-16"
      }`}
    >
      <LimitedWidthWrapper
        expandToFull={false}
        maxWidth={maxWidth}
        paddingDesktop={paddingDesktop}
        paddingMobile={paddingMobile}
      >
        <SectionText
          id="features-section-text"
          title={t("features_block")}
          description={t(
            "features_section_text"
          )}
          scrollContainerRef={scrollContainerRef}
          isRTL={isRTL}
        />

        <div
          className="grid w-full gap-4"
          style={{
            gridTemplateColumns: useBentoGrid
              ? "repeat(3, minmax(0, 1fr))"
              : "repeat(1, minmax(0, 1fr))",
          }}
        >
          {localFeatureItems.map((item) => (
            <FeatureGridItem
              key={item.id}
              className={useBentoGrid ? item.className : ""}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
            />
          ))}
        </div>
      </LimitedWidthWrapper>
    </section>
  );
}