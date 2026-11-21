// Brauzerlərin çoxu "az-AZ" ay adlarını bilmir ("M11" göstərir), ona görə adlar əl ilə verilir
const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"];
const MONTHS_SHORT = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avq", "sen", "okt", "noy", "dek"];

const pad = (n) => String(n).padStart(2, "0");

/** 14:05 */
export const formatClock = (d) => {
  const date = new Date(d);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** 21 noyabr 2026 */
export const formatDate = (d) => {
  const date = new Date(d);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

/** 21 noy */
export const formatShortDate = (d) => {
  const date = new Date(d);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
};

/** noyabr 2026 */
export const formatMonthYear = (d) => {
  const date = new Date(d);
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};
