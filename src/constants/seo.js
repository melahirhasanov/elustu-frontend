// Axtarış sistemləri üçün: hər ixtisasın öz səhifəsi (/xidmetler/:slug), başlığı və təsviri.
// Həm React, həm də build sonrası scripts/seo.mjs bu faylı istifadə edir: yalnız sadə məlumat saxlayın.
import { CATEGORIES, POPULAR_CATEGORIES } from "./data.js";
import PROBLEM_RULES from "../utils/problemDictionary.js";

export const SITE_URL = "https://elustu.netlify.app";
export const SITE_NAME = "Əlüstü";
export const DEFAULT_TITLE = "Əlüstü — Bakıda usta tap: santexnik, elektrikçi, kombi ustası";
export const DEFAULT_DESCRIPTION =
  "Əlüstü (el ustu) ilə Bakıda və bütün Azərbaycanda yaxınlıqdakı ustanı tapın: santexnik, elektrikçi, kombi, kondisioner, mebel ustası. Problemi yazın, xəritədə seçin, zəng edin və sifariş verin.";

const TR = { ə: "e", ı: "i", ö: "o", ü: "u", ş: "s", ç: "c", ğ: "g", İ: "i", Ə: "e", Ö: "o", Ü: "u", Ş: "s", Ç: "c", Ğ: "g" };
export const slugify = (s) =>
  s.replace(/[əıöüşçğİƏÖÜŞÇĞ]/g, (c) => TR[c]).toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Lüğətdən hər ixtisas üçün tez-tez yazılan problemlər (kiril və qısa açarlar olmadan)
const problemsFor = (category) => {
  const out = [];
  for (const rule of PROBLEM_RULES) {
    if (rule.categories[0] !== category) continue;
    for (const k of rule.keys) {
      if (k.startsWith("~") || /[а-яё]/i.test(k) || k.length < 4 || k === category.toLowerCase()) continue;
      if (!out.includes(k)) out.push(k);
    }
  }
  return out.slice(0, 10);
};

const lower = (name) => (name === "İT mütəxəssisi" ? name : name.charAt(0).toLowerCase() + name.slice(1));

export const SERVICES = CATEGORIES.map((name) => {
  const short = name.replace(/\s*\(.*?\)/, "");
  return {
    name,
    slug: slugify(name),
    popular: POPULAR_CATEGORIES.includes(name),
    title: `${short} Bakıda — yaxınlıqdakı ${lower(short)} | Əlüstü`,
    description: `Bakıda və Azərbaycanda ${lower(short)} lazımdır? Əlüstü ilə yaxınlıqdakı ustaları xəritədə görün, rəylərə baxın, zəng edin və onlayn sifariş verin.`,
    problems: problemsFor(name),
  };
});

export const serviceBySlug = (slug) => SERVICES.find((s) => s.slug === slug);
