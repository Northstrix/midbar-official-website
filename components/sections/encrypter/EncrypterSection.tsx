"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import useIsRTL from "@/hooks/useIsRTL";
import { useTranslation } from "react-i18next";
import SectionText from "@/components/SectionText";
import LimitedWidthWrapper from "@/components/limited-width-wrapper";
import FloatingLabelInput from "./FloatingLabelInput";
import RefinedChronicleButton from "@/components/RefinedChronicleButton";
import { GlowingEffect } from "@/components/GlowingEffect";
import { encryptStringWithMidbarAES256CBC, decryptStringWithMidbarAES256CBC } from "./midbar-cipher";

interface EncrypterSectionProps {
  maxWidth: string;
  paddingDesktop: string;
  paddingMobile: string;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  isMobile?: boolean;
}

export default function EncrypterSection({
  maxWidth,
  paddingDesktop,
  paddingMobile,
  scrollContainerRef,
  isMobile = false,
}: EncrypterSectionProps) {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const [plainText, setPlainText] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [cipherOutput, setCipherOutput] = useState("");

  // High fidelity visual state engine for dynamic output label coloring
  const [accentStateColor, setAccentStateColor] = useState<string>("var(--accent)");
  const [outputLabelKey, setOutputLabelKey] = useState<string>("encrypter_output_label_default");

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const useTwoColumnDesktopLayout = !isMobile;
  const stackButtonsVertical = viewportWidth < 640;

  const handleEncryption = useCallback(() => {
    if (!plainText || !secretKey) return;
    try {
      const output = encryptStringWithMidbarAES256CBC(plainText, secretKey);
      setCipherOutput(output);
      // Updates state colors and labels safely using CSS variables
      setAccentStateColor("var(--accent)");
      setOutputLabelKey("encrypter_output_label_ciphertext");
    } catch (e) {
      console.error("Encryption run error:", e);
    }
  }, [plainText, secretKey]);

  const handleDecryption = useCallback(() => {
    if (!plainText || !secretKey) return;
    try {
      const result = decryptStringWithMidbarAES256CBC(plainText, secretKey);
      setCipherOutput(result.data);
      
      // FIXED: Swapped underscores for hyphens to match your CSS variables
      if (result.statusKey === "decryption_success") {
        setAccentStateColor("var(--accent-success)");
        setOutputLabelKey("encrypter_output_label_plaintext_success");
      } else {
        setAccentStateColor("var(--accent-error)");
        setOutputLabelKey("encrypter_output_label_plaintext_failed");
      }
    } catch (e) {
      console.error("Decryption run error:", e);
      setCipherOutput("");
      // FIXED: Swapped underscores for hyphens to match your CSS variables
      setAccentStateColor("var(--accent-error)");
      setOutputLabelKey("encrypter_output_label_plaintext_failed");
    }
  }, [plainText, secretKey]);

  return (
    <section
      ref={sectionRef}
      dir={isRTL ? "rtl" : "ltr"}
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
          id="encrypter-section-text"
          title={t("encrypter_block")}
          description={t("encrypter_section_text")}
          scrollContainerRef={scrollContainerRef}
          isRTL={isRTL}
        />

        <div
          className="w-full transition-all duration-300 mt-8 mx-auto"
          style={{ maxWidth: isMobile ? "100%" : "none" }}
        >
          <div
            className="relative w-full h-full rounded-(--smooth-border-radius) border p-2 md:p-3"
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

            <div className="border-0.75 relative h-full overflow-hidden p-6 md:p-8">
              <div
                className={`grid w-full gap-4 ${
                  useTwoColumnDesktopLayout ? "grid-cols-2" : "grid-cols-1"
                }`}
              >
                {/* Column 1: Configurator Inputs */}
                <div className="flex flex-col w-full gap-4">
                  <div className="flex flex-col gap-4 w-full">
                    <FloatingLabelInput
                      label={t("encrypter_input_label")}
                      value={plainText}
                      onValueChange={setPlainText}
                      textarea={false}
                      isRTL={isRTL}
                    />
                    <FloatingLabelInput
                      label={t("encrypter_key_label")}
                      value={secretKey}
                      onValueChange={setSecretKey}
                      type="password"
                      isRTL={isRTL}
                    />
                  </div>

                  <div
                    className={`flex w-full items-center gap-4 mt-4 ${
                      stackButtonsVertical
                        ? "flex-col justify-stretch items-stretch"
                        : "flex-row justify-start"
                    }`}
                  >
                    <div className={stackButtonsVertical ? "w-full" : "flex-1"}>
                      <RefinedChronicleButton
                        backgroundColor="var(--foreground)"
                        textColor="var(--background)"
                        hoverBackgroundColor="var(--accent)"
                        hoverTextColor="var(--foreground)"
                        borderVisible={false}
                        buttonHeight="2.875rem"
                        width="100%"
                        isRTL={isRTL}
                        onClick={handleEncryption}
                      >
                        {t("encrypter_encrypt_btn")}
                      </RefinedChronicleButton>
                    </div>
                    <div className={stackButtonsVertical ? "w-full" : "flex-1"}>
                      <RefinedChronicleButton
                        backgroundColor="var(--foreground)"
                        textColor="var(--background)"
                        hoverBackgroundColor="var(--accent)"
                        hoverTextColor="var(--foreground)"
                        borderVisible={false}
                        buttonHeight="2.875rem"
                        width="100%"
                        isRTL={isRTL}
                        onClick={handleDecryption}
                      >
                        {t("encrypter_decrypt_btn")}
                      </RefinedChronicleButton>
                    </div>
                  </div>
                </div>

                {/* Column 2: Read-Only Dynamic Colored Output Area */}
                <div className={`flex flex-col w-full justify-start h-full ${isMobile ? "mt-4" : ""}`}>
                  <FloatingLabelInput
                    label={t(outputLabelKey)}
                    value={cipherOutput}
                    onValueChange={() => {}}
                    textarea={true}
                    readOnly={true}
                    isRTL={isRTL}
                    accentColor={accentStateColor}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </LimitedWidthWrapper>
    </section>
  );
}