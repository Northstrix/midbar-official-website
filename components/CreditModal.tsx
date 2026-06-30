"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ModalOverlay } from "./modal-overlay";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import ChronicleButton from "@/components/RefinedChronicleButton";
import HighlightHover from "@/components/HighlightHover";

// Define the handle interface for parent usage
export interface CreditModalHandle {
  open: () => void;
  close: () => void;
}

// Props interface (empty if no props needed, or add onClose if desired)
interface CreditModalProps {
  onClose?: () => void;
}

const ANIMATION_DURATION = 0.3;

const creditsMarkdown = `
[Resizable Navbar](https://ui.aceternity.com/components/resizable-navbar) by [Aceternity UI](https://ui.aceternity.com/)

[Limelight Nav](https://21st.dev/easemize/limelight-nav/default) by [EaseMize UI](https://21st.dev/easemize)

[Chronicle Button](https://codepen.io/Haaguitos/pen/OJrVZdJ) by [Haaguitos](https://codepen.io/Haaguitos)

[Wheel Picker](https://21st.dev/ncdai/wheel-picker/default) by [Chánh Đại](https://21st.dev/ncdai)

[React Wheel Picker](https://www.npmjs.com/package/@ncdai/react-wheel-picker) by [Chánh Đại](https://github.com/ncdai)

[すりガラスなプロフィールカード](https://codepen.io/ash_creator/pen/zYaPZLB) by [あしざわ - Webクリエイター](https://codepen.io/ash_creator)

[Glowing Effect](https://ui.aceternity.com/components/glowing-effect) by [Aceternity UI](https://ui.aceternity.com/)

[GSAP (GreenSock Animation Platform)](https://www.npmjs.com/package/gsap)

[framer-motion](https://www.npmjs.com/package/framer-motion)

[i18next](https://www.npmjs.com/package/i18next)

[crypto-js](https://github.com/brix/crypto-js)

[clsx](https://github.com/lukeed/clsx)

[Lucide React](https://www.npmjs.com/package/lucide-react)

[Text scroll and hover effect with GSAP and clip](https://codepen.io/Juxtopposed/pen/mdQaNbG) by [Juxtopposed](https://codepen.io/Juxtopposed)

[Fill Text with Image Using CSS](https://codepen.io/iamdejean/pen/wvwjjer) by [Ezekiel Japheth Ayuba](https://codepen.io/iamdejean)

[Bento Grid](https://ui.aceternity.com/components/bento-grid) by [Aceternity UI](https://ui.aceternity.com/)

[Input Floating Label animation](https://codepen.io/Mahe76/pen/qBQgXyK) by [Elpeeda](https://codepen.io/Mahe76)

[JTB studios - Link](https://codepen.io/zzznicob/pen/GRPgKLM) by [Nico](https://codepen.io/zzznicob)

[Hover Link Animation](https://21st.dev/erikvalencia1/hover-link-animation/default) by [Ruben](https://21st.dev/rubenerik)

[Vertical Fan | Text Loop Timeline Animation](https://codepen.io/jpbelley/pen/JobwWaP) by [JP](https://codepen.io/jpbelley)

[easing sandbox for gradients, masks, shadows 🤙](https://codepen.io/jh3y/pen/ByQQOLo) by [Jhey](https://codepen.io/jh3y)

[404 galaxy not found](https://codepen.io/remid/pen/YOVawm) by [Rémi Denimal](https://codepen.io/remid)

[BUTTONS](https://codepen.io/uchihaclan/pen/NWOyRWy) by [TAYLOR](https://codepen.io/uchihaclan)

[Perplexity](https://www.perplexity.ai/)

[Google Gemini](https://gemini.google.com/)
`;

function renderEntry(entry: string) {
  // Basic markdown link pattern: [label](url)
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(entry)) !== null) {
    // Add plain text before each match (Wrapped in HighlightHover noReact)
    if (match.index > lastIndex) {
      const text = entry.slice(lastIndex, match.index);
      // Only render if it's not just whitespace, or preserve spacing if needed
      if (text) {
        parts.push(
          <HighlightHover
            key={key++}
            as="span"
            noReact
            wrap
            barThickness={0.0} // Hidden bar for plain text
            gapRatio={0.03}
            className="mx-1"
          >
            {text}
          </HighlightHover>
        );
      }
    }

    // Add linked text (Animated HighlightHover)
    parts.push(
      <HighlightHover
        key={key++}
        as="a"
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        barThickness={0.09}
        gapRatio={0.03}
        wrap // Allow links to wrap if necessary
      >
        {match[1]}
      </HighlightHover>
    );

    lastIndex = regex.lastIndex;
  }

  // Add any remaining trailing text
  if (lastIndex < entry.length) {
    parts.push(
      <HighlightHover
        key={key++}
        as="span"
        noReact
        wrap
        barThickness={0.0}
        gapRatio={0.03}
      >
        {entry.slice(lastIndex)}
      </HighlightHover>
    );
  }

  return parts;
}

export const CreditModal = forwardRef<CreditModalHandle, CreditModalProps>(
  function CreditModal({ onClose }, ref) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const isMobile = useIsMobile();

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
    }));

    const handleClose = () => {
      setOpen(false);
      onClose?.();
    };

    // Split markdown into lines
    const creditEntries = creditsMarkdown
      .trim()
      .split(/\n{2,}/)
      .map((e) => e.trim())
      .filter(Boolean);

    return (
      <AnimatePresence>
        {open && (
          <ModalOverlay onClose={handleClose}>
            <motion.div
              key="credit-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: ANIMATION_DURATION, ease: "easeInOut" }}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              className="relative rounded-lg shadow-xl p-4 md:p-6 min-w-[300px] max-w-[90vw] md:max-w-[600px] border flex flex-col items-center outline-none max-h-[85vh]"
              style={{
                backgroundColor: `var(--background)`,
                borderColor: `var(--border-color)`,
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0,0,0,0.1)",
              }}
            >
              {/* Title */}
              <span
                className="mb-4 md:mb-6 font-semibold text-[20px]"
                style={{
                  color: "var(--foreground)",
                }}
              >
                {t("credit_inscription") || "Credits"}
              </span>

              {/* Scrollable Content Area */}
              <div
                className="w-full rounded-[var(--border-radius)] mb-4 md:mb-7 overflow-y-auto custom-scrollbar flex flex-col items-center"
                style={{
                  backgroundColor:
                    "var(--language-selector-list-bg, hsla(0,0%,100%,0.95))",
                  border: `1px solid var(--border-color)`,
                  color: "var(--foreground)",
                  padding: "16px",
                  maxHeight: "60vh",
                }}
                dir="ltr"
              >
                 <ul className="w-full flex flex-col gap-4 text-center">
                  {creditEntries.map((entry, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {renderEntry(entry)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Close Button */}
              <ChronicleButton
                onClick={handleClose}
                className="w-full"
                variant="default"
                backgroundColor="var(--foreground)"
                hoverBackgroundColor="var(--accent)"
                textColor="var(--background)"
                hoverTextColor="var(--foreground)"
                borderVisible={false}
                borderRadius="var(--border-radius)"
                fontWeight={700}
                buttonHeight={isMobile ? "2.75rem" : "2.875rem"}
                width="100%"
              >
                {t("ok_inscription") || "OK"}
              </ChronicleButton>
            </motion.div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    );
  }
);

export default CreditModal;