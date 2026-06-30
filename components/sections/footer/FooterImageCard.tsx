"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import RefinedChronicleButton from "@/components/RefinedChronicleButton";

interface FooterImageCardProps {
  isMobile: boolean;
  isRTL: boolean;
  cardWidth: number;
  layoutInterpolations: {
    aspectRatio: number;
    shadowHeight: string;
  };
}

export default function FooterImageCard({
  isMobile,
  isRTL,
  cardWidth,
  layoutInterpolations,
}: FooterImageCardProps) {
  const { t } = useTranslation();
  const imageSrc = "/Midbar_STM32F407VET6_and_Arduino_Uno_Version.webp";

  const wrapperClassName = cn(
    "flex select-none",
    isMobile ? "w-full justify-center items-center text-center mt-8 col-span-1" : "col-span-3 items-center",
    !isMobile && (isRTL ? "justify-start" : "justify-end")
  );

  const outerStyle: React.CSSProperties = isMobile
    ? {
        width: "100%",
        maxWidth: "600px",
        minHeight: "auto",
        boxSizing: "border-box",
      }
    : {
        width: `${cardWidth}px`,
        minHeight: "480px",
        boxSizing: "border-box",
      };

  const cardStyle: React.CSSProperties = {
    border: "1px solid var(--border-color)",
    borderRadius: "var(--smooth-border-radius)",
    backgroundColor: "var(--background)",
    boxSizing: "border-box",
  };

  const mobilePaddingStyle: React.CSSProperties = {
    padding: "16px",
    boxSizing: "border-box",
  };

  /* Linear Scaling Calculations (From 768px down to 320px):
    - Title: Max 16px at 768px, 75% (12px) at 320px. 
      Equation: calc(9.14px + 0.89vw)
    - Description: Max 14px at 768px, 80% (11.2px -> bounded to 12px min) at 320px. 
      Equation: calc(10.57px + 0.45vw)
  */
  const mobileTitleStyle: React.CSSProperties = {
    color: "var(--foreground)",
    fontWeight: 700,
    margin: 0,
    lineHeight: 1.1,
    fontSize: "clamp(12px, calc(9.14px + 0.89vw), 16px)",
  };

  const mobileDescriptionStyle: React.CSSProperties = {
    color: "var(--sub-foreground)",
    margin: 0,
    lineHeight: 1.35,
    fontSize: "clamp(12px, calc(10.57px + 0.45vw), 14px)",
  };

  return (
    <div className={wrapperClassName} style={outerStyle}>
      {isMobile ? (
        <div
          className="w-full flex flex-col"
          style={{
            ...cardStyle,
            overflow: "visible",
          }}
        >
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
              src={imageSrc}
              alt={t("footer_version_name")}
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
              ...mobilePaddingStyle,
              borderTop: "1px solid var(--border-color)",
              borderBottomLeftRadius: "inherit",
              borderBottomRightRadius: "inherit",
              backgroundColor: "var(--background)",
              gap: "12px",
            }}
          >
            <div className="w-full flex flex-col gap-2">
              <h3 style={mobileTitleStyle}>{t("footer_version_name")}</h3>
              <p style={mobileDescriptionStyle}>
                {t("footer_version_description")}
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
                href="https://sourceforge.net/projects/midbar/files/STM32F407VET6%20%2B%20Arduino%20Uno%20Version/V1.0/"
              >
                {t("get_firmware")}
              </RefinedChronicleButton>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="w-full relative group overflow-hidden select-none"
          style={{
            aspectRatio: `${layoutInterpolations.aspectRatio}`,
            border: "1px solid var(--border-color)",
            borderRadius: "var(--smooth-border-radius)",
            backgroundColor: "var(--background)",
            maxWidth: "100%",
          }}
        >
          <img
            src={imageSrc}
            alt={t("footer_version_name")}
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-[1.04] transform-gpu backface-hidden pointer-events-none"
            style={{ display: "block" }}
          />
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
                style={{
                  color: "var(--foreground)",
                  fontWeight: isRTL ? "600" : "700",
                }}
              >
                {t("footer_version_name")}
              </h3>
              <p className="text-sm leading-normal text-[var(--sub-foreground)] mt-1">
                {t("footer_version_description")}
              </p>
            </div>
            <div className="w-full pt-2">
              <div
                className="flex w-full justify-start items-center gap-4"
                dir={isRTL ? "rtl" : "ltr"}
              >
                <RefinedChronicleButton
                  backgroundColor="var(--foreground)"
                  textColor="var(--background)"
                  hoverBackgroundColor="var(--accent)"
                  hoverTextColor="var(--foreground)"
                  borderVisible={false}
                  buttonHeight="2.875rem"
                  isRTL={isRTL}
                  href="https://sourceforge.net/projects/midbar/files/STM32F407VET6%20%2B%20Arduino%20Uno%20Version/V1.0/"
                >
                  {t("get_firmware")}
                </RefinedChronicleButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}