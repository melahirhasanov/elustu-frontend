// Son seçilmiş ünvanlar (yalnız bu brauzerdə saxlanılır)
const RECENT_KEY = "usta_recent_places";

export function loadRecentPlaces() {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY));
    return Array.isArray(list) ? list.slice(0, 3) : [];
  } catch {
    return [];
  }
}

export function saveRecentPlace(place) {
  if (place.source === "gps" || place.source === "area") return; // yalnız yazılan/seçilən ünvanlar yadda qalır
  try {
    const rest = loadRecentPlaces().filter((p) => p.title !== place.title);
    localStorage.setItem(RECENT_KEY, JSON.stringify([{ title: place.title, subtitle: place.subtitle || "", lat: place.lat, lng: place.lng }, ...rest].slice(0, 3)));
  } catch {
    /* gizli rejimdə localStorage əlçatmaz ola bilər */
  }
}
