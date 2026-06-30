import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
resources: {
    en: {
      translation: require("./public/locales/en/translation.json"),
    },
    he: {
      translation: require("./public/locales/he/translation.json"),
    },
    es: {
      translation: require("./public/locales/es/translation.json"),
    },
    it: {
      translation: require("./public/locales/it/translation.json"),
    },
    pt: {
      translation: require("./public/locales/pt/translation.json"),
    },
    ja: {
      translation: require("./public/locales/ja/translation.json"),
    },
    yue: {
      translation: require("./public/locales/yue/translation.json"),
    },
    ko: {
      translation: require("./public/locales/ko/translation.json"),
    },
    hi: {
      translation: require("./public/locales/hi/translation.json"),
    },
    ar: {
      translation: require("./public/locales/ar/translation.json"),
    },
    fa: {
      translation: require("./public/locales/fa/translation.json"),
    },
    de: {
      translation: require("./public/locales/de/translation.json"),
    },
    fr: {
      translation: require("./public/locales/fr/translation.json"),
    },
    vi: {
      translation: require("./public/locales/vi/translation.json"),
    },
    tr: {
      translation: require("./public/locales/tr/translation.json"),
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
