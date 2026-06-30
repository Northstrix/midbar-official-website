"use client";

import { useTranslation } from "react-i18next";

const RTL_LANGS = new Set([
  "he",
  "ar",
  "fa",
  "ur",
  "yi",
]);

export default function useIsRTL() {
  const { i18n } = useTranslation();

  const lang = (i18n.resolvedLanguage || i18n.language || "").toLowerCase();
  const base = lang.split("-")[0];

  return RTL_LANGS.has(base);
}