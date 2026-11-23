import { CATEGORIES, POPULAR_CATEGORIES } from "../constants/data";

// "Kombi işləmir" və "kombi islemir" eyni nəticə versin deyə Azərbaycan hərfləri sadələşdirilir
export function normalize(text) {
  return String(text || "")
    .toLocaleLowerCase("az")
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/i̇/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Problem təsvirindəki açar sözlər -> uyğun ixtisaslar (sözlər normallaşdırılmış formadadır, kök kimi yoxlanılır)
const PROBLEM_RULES = [
  [["kran", "su axir", "axir", "sizir", "boru", "unitaz", "rakovina", "vanna", "dus", "smesitel", "su yoxdur", "su gelmir", "sayqac"], ["Santexnik", "Kanalizasiya ustası"]],
  [["tixan", "kanalizasiya", "iy gelir", "lagim"], ["Kanalizasiya ustası", "Santexnik"]],
  [["isiq", "rozetka", "elektrik", "sitok", "naqil", "avtomat", "qisa qapanma", "sigorta", "lampa", "cilciraq", "lyustr"], ["Elektrikçi", "İşıqlandırma ustası"]],
  [["kondisioner", "kondisaner", "split", "soyutmur", "sərin", "serin", "freon"], ["Kondisioner ustası", "İsitmə və soyutma ustası"]],
  [["kombi", "isitmir", "isti su", "radiator", "batareya", "pec", "kotel"], ["Kombi ustası", "İsitmə və soyutma ustası"]],
  [["qaz", "qaz iyi", "plita", "soba"], ["Qaz ustası"]],
  [["mebel", "skaf", "dolab", "carpayi", "divan", "stol", "stul", "mətbəx", "metbex"], ["Mebel ustası", "Dülgər"]],
  [["reng", "boya", "divar", "malyar", "kraska", "suvaq"], ["Malyar (Rəngsaz)", "Təmir-tikinti ustası"]],
  [["oboy", "divar kagizi"], ["Oboy ustası"]],
  [["kafel", "fayans", "metlax", "plitka"], ["Kafel ustası", "Fayans ustası", "Metlax ustası"]],
  [["parket", "laminat", "dosheme", "doseme", "pol"], ["Parket ustası", "Laminat ustası", "Pol ustası"]],
  [["tavan", "alcipan", "gips"], ["Tavan ustası", "Alçıpan ustası"]],
  [["temir", "remont", "tikinti", "ev temiri", "menzil"], ["Təmir-tikinti ustası", "Tikinti ustası"]],
  [["temizlik", "yigis", "toz", "yuma", "yumaq"], ["Təmizlik ustası"]],
  [["xalca", "palaz"], ["Xalça ustası", "Təmizlik ustası"]],
  [["qapi", "menteşe", "mentese"], ["Qapı ustası", "Dülgər"]],
  [["kilid", "acar", "acmir", "qapi baglanib", "qapida qaldim"], ["Çilingər", "Qapı ustası"]],
  [["pencere", "plastik", "jalyuz", "zanaveska"], ["Pəncərə ustası"]],
  [["suse", "guzgu", "vitrin"], ["Şüşə ustası", "Vitraj ustası"]],
  [["komputer", "noutbuk", "laptop", "internet", "wifi", "modem", "printer", "telefon"], ["İT mütəxəssisi"]],
  [["masin", "avtomobil", "motor", "aküm", "akum", "aku", "start"], ["Avtomobil təmiri ustası", "Avtomobil elektrik ustası"]],
  [["teker", "sin", "partlayib", "vulkan"], ["Vulkanizasiya ustası"]],
  [["sac", "berber", "uz qirx"], ["Bərbər"]],
  [["hovuz"], ["Hovuz ustası"]],
  [["fasad", "bina divari"], ["Fasad ustası"]],
  [["metal", "qaynaq", "demir", "darvaza", "barmaqliq"], ["Metal konstruksiya ustası"]],
  [["yangin", "sondurucu"], ["Yanğın təhlükəsizliyi ustası"]],
  [["qizil", "uzuk", "zinet"], ["Zinət əşyaları ustası"]],
  [["piano", "gitara", "tar", "musiqi"], ["Musiqi alətləri təmiri ustası"]],
];

const RULES = PROBLEM_RULES.map(([words, categories]) => [words.map(normalize), categories]);
// Bərabər uyğunluqda populyar ixtisaslar öndə
const popularity = (c) => {
  const i = POPULAR_CATEGORIES.indexOf(c);
  return i === -1 ? 0 : POPULAR_CATEGORIES.length - i;
};
const NORMALIZED_CATEGORIES =CATEGORIES.map((c) => [c, normalize(c)]);

/**
 * Problem mətnindən uyğun ixtisasları tapır.
 * Qaytarır: [{ category, reason }] — reason: "name" (ixtisas adı uyğun gəldi) və ya "problem" (açar söz)
 */
export function matchCategories(text, limit = 6) {
  const q = normalize(text);
  if (q.length < 2) return [];
  const scores = new Map();
  const add = (category, score, reason) => {
    const prev = scores.get(category);
    if (!prev || prev.score < score) scores.set(category, { score, reason });
  };

  for (const [category, name] of NORMALIZED_CATEGORIES) {
    if (name.startsWith(q)) add(category, 100, "name");
    else if (name.split(" ").some((w) => w.startsWith(q))) add(category, 90, "name");
    else if (q.length >= 3 && name.includes(q)) add(category, 70, "name");
  }

  const words = q.split(" ");
  for (const [keys, categories] of RULES) {
    // Açar söz mətnin içində və ya istifadəçinin yazdığı son söz açar sözün əvvəli olsun ("kond" -> kondisioner)
    const last = words[words.length - 1];
    const hit = keys.some((k) => ` ${q} `.includes(` ${k}`) || (last.length >= 3 && k.startsWith(last)));
    if (hit) categories.forEach((c, i) => add(c, 80 - i * 5, "problem"));
  }

  return [...scores.entries()]
    .sort((a, b) => b[1].score - a[1].score || popularity(b[0]) - popularity(a[0]))
    .slice(0, limit)
    .map(([category, { reason }]) => ({ category, reason }));
}
