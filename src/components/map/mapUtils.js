// OpenFreeMap — pulsuz, açarsız vektor xəritə (OpenStreetMap məlumatları əsasında)
export const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// Bakı mərkəzi
export const DEFAULT_VIEW = { longitude: 49.8671, latitude: 40.4093, zoom: 11 };

// Usta sənədindən [lat, lng] (Mongo [lng, lat] saxlayır)
export function masterLatLng(master) {
  const [lng, lat] = master?.location?.coordinates || [];
  return typeof lat === "number" && typeof lng === "number" && (lat !== 0 || lng !== 0) ? [lat, lng] : null;
}

// Eyni nöqtədə olan pin-ləri kiçik dairə üzrə aralayır ki, üst-üstə düşməsinlər
export function spreadOverlaps(items) {
  const groups = new Map();
  for (const item of items) {
    const key = `${item.pos[0].toFixed(4)},${item.pos[1].toFixed(4)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  const result = [];
  for (const group of groups.values()) {
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }
    const radius = 0.0006 + group.length * 0.00004; // ~60m+
    group.forEach((item, i) => {
      const angle = (2 * Math.PI * i) / group.length;
      result.push({
        ...item,
        pos: [item.pos[0] + radius * Math.sin(angle), item.pos[1] + (radius * Math.cos(angle)) / Math.cos((item.pos[0] * Math.PI) / 180)],
      });
    });
  }
  return result;
}

// Mərkəz [lat, lng] ətrafında radiusKm dairəsi (GeoJSON polygon) — xəritədə axtarış radiusu üçün
export function circlePolygon([lat, lng], radiusKm, steps = 72) {
  const coords = [];
  const dLat = radiusKm / 110.574;
  const dLng = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= steps; i++) {
    const a = (2 * Math.PI * i) / steps;
    coords.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] }, properties: {} };
}

// [[minLng, minLat], [maxLng, maxLat]]
export function boundsOf(points) {
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

// İki nöqtə arasında məsafə (km), Haversine
export function distanceKm([lat1, lon1], [lat2, lon2]) {
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km) {
  if (km == null || !isFinite(km)) return null;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// "4.2 km · ~9 dəq" (yol üzrə) və ya "≈3.1 km" (düz xətt)
export function distanceText(distance, duration, isRoad) {
  if (distance == null || !isFinite(distance)) return null;
  return isRoad ? `${formatDistance(distance)}${duration ? ` · ~${duration} dəq` : ""}` : `≈${formatDistance(distance)}`;
}

// Brauzerin geolokasiyası Promise kimi: [lat, lng]
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Brauzer yer təyinini dəstəkləmir"));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
      () => reject(new Error("Yerinizi təyin etmək mümkün olmadı. Brauzerdə yer icazəsini yoxlayın.")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
