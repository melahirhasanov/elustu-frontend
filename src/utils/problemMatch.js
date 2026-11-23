import { CATEGORIES, POPULAR_CATEGORIES } from "../constants/data";
import PROBLEM_RULES from "./problemDictionary";

// Kiril hərfləri latınla (rusca yazılan "розетка" -> "rozetka")
const CYRILLIC = {
  а: "a", б: "b", в: "v", г: "q", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "c", ш: "s", щ: "s", ъ: "",
  ы: "i", ь: "", э: "e", ю: "yu", я: "ya", ә: "e", ө: "o", ү: "u", ғ: "g", һ: "h", ҹ: "c", ј: "y",
};

// "Kombi işləmir", "kombi islemir" və "КОМБИ" eyni nəticə versin deyə mətn sadələşdirilir
export function normalize(text) {
  return String(text || "")
    .toLocaleLowerCase("az")
    .replace(/[Ѐ-ӿ]/g, (ch) => CYRILLIC[ch] ?? "")
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/i̇/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g")
    .replace(/w/g, "v").replace(/sh/g, "s").replace(/ch/g, "c").replace(/kh/g, "x")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// İki söz arasında hərf fərqi (Damerau-Levenshtein, yerdəyişmə də 1 sayılır)
function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

// Söz uzunluğuna görə icazə verilən səhv sayı: qısa sözlərdə səhvə yol verilmir
const allowedTypos = (len) => (len >= 10 ? 2 : len >= 5 ? 1 : 0);

// İstifadəçinin sözü açar sözlə uyğundurmu? Şəkilçilər nəzərə alınır: "kranim", "kombimiz", "isiqlar"
// Qısa açar sözlər ("su", "pol", "qaz") yalnız özü və ya şəkilçi ilə uyğun gəlsin: "suyu" bəli, "sumqayit" xeyr
const SUFFIX = /^(n|y|s)?(lar|ler|imiz|umuz|iniz|unuz|miz|muz|niz|nuz|im|um|in|un|m|n|i|u|a|e|da|de|dan|den|ya|ye|nin|nun|ni|nu|si|su|dir|dur)*$/;

// 2 = dəqiq uyğun (şəkilçi ilə), 1 = səhv yazılışla uyğun, 0 = uyğun deyil
function wordMatches(word, key) {
  if (key.length <= 4) return word.startsWith(key) && SUFFIX.test(word.slice(key.length)) ? 2 : 0;
  if (word.startsWith(key)) return 2;
  const typos = allowedTypos(key.length);
  // Səhv yazılışda ilk hərf adətən düzdür — bu, "plite"→"split" kimi təsadüfi uyğunluqların qarşısını alır
  if (!typos || word.length < 4 || word[0] !== key[0]) return 0;
  // Sözün əvvəlini açar sözün uzunluğunda (± səhv) götürüb müqayisə et — şəkilçili səhv yazılışlar üçün
  for (let len = key.length - typos; len <= key.length + typos; len++) {
    if (len < 4 || len > word.length) continue;
    if (editDistance(word.slice(0, len), key, typos) <= typos) return 1;
  }
  return 0;
}

// Açar ifadə mətndə varmı (ardıcıl sözlər): 2 = dəqiq, 1 = səhv yazılışla, 0 = yox
function phraseMatches(words, keyWords) {
  let best = 0;
  outer: for (let i = 0; i + keyWords.length <= words.length; i++) {
    let quality = 2;
    for (let k = 0; k < keyWords.length; k++) {
      const m = wordMatches(words[i + k], keyWords[k]);
      if (!m) continue outer;
      quality = Math.min(quality, m);
    }
    best = Math.max(best, quality);
    if (best === 2) break;
  }
  return best;
}

// Yarımçıq yazılan son söz ("kond") açar sözün əvvəli olsun
const prefixOfKey = (last, key) => last.length >= 3 && key.startsWith(last);

// "~" ilə başlayan açarlar ümumi əlamətdir ("su axır", "iy gəlir"): cihaz adı ("kondisioner", "qaz") varsa, o üstün gəlir
const RULES = PROBLEM_RULES.map(({ keys, categories }) => ({
  keys: keys.map((k) => ({ generic: k.startsWith("~"), words: normalize(k.replace(/^~/, "")).split(" ") })),
  categories,
}));

const popularity = (c) => {
  const i = POPULAR_CATEGORIES.indexOf(c);
  return i === -1 ? 0 : POPULAR_CATEGORIES.length - i;
};
const NORMALIZED_CATEGORIES = CATEGORIES.map((c) => [c, normalize(c)]);

/**
 * Problem mətnindən uyğun ixtisasları tapır.
 * Qaytarır: [{ category, reason }] — reason: "name" (ixtisas adı uyğun gəldi) və ya "problem" (açar söz)
 */
export function matchCategories(text, limit = 6) {
  const q = normalize(text);
  if (q.length < 2) return [];
  const words = q.split(" ");
  const last = words[words.length - 1];
  const scores = new Map();
  const add = (category, score, reason) => {
    const prev = scores.get(category);
    if (!prev) scores.set(category, { score, reason, hits: 1 });
    else {
      prev.hits += 1; // bir neçə açar söz eyni ixtisasa işarə edirsə, o daha yuxarı çıxır
      if (prev.score < score) Object.assign(prev, { score, reason });
    }
  };

  for (const [category, name] of NORMALIZED_CATEGORIES) {
    if (name.startsWith(q)) add(category, 100, "name");
    // Çoxsözlü problem mətnində ixtisas adındakı söz ("ev təmiri" → "...təmiri ustası") zəif siqnaldır
    else if (name.split(" ").some((w) => w.startsWith(last) && last.length >= 2)) add(category, words.length > 1 ? 74 : 90, "name");
    else if (q.length >= 3 && name.includes(q)) add(category, 70, "name");
  }

  for (const { keys, categories } of RULES) {
    let best = 0;
    for (const { generic, words: keyWords } of keys) {
      const quality = phraseMatches(words, keyWords);
      if (quality) {
        // uzun ifadə daha dəqiqdir; səhv yazılış və ümumi əlamət bir az aşağı
        const score = 80 + Math.min(keyWords.length, 3) * 2 - (quality === 1 ? 3 : 0) - (generic ? 8 : 0);
        best = Math.max(best, score);
      } else if (keyWords.length === 1 && prefixOfKey(last, keyWords[0])) best = Math.max(best, 72);
    }
    if (best) categories.forEach((c, i) => add(c, best - i * 5, "problem"));
  }

  return [...scores.entries()]
    .sort((a, b) => b[1].score - a[1].score || b[1].hits - a[1].hits || popularity(b[0]) - popularity(a[0]))
    .slice(0, limit)
    .map(([category, { reason }]) => ({ category, reason }));
}
