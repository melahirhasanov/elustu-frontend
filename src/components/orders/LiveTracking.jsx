import { useEffect, useMemo, useRef, useState } from "react";
import { Layer, Marker, Source } from "@vis.gl/react-maplibre";
import { Box, Chip, Stack, Typography } from "@mui/material";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import SensorsIcon from "@mui/icons-material/Sensors";
import socketService from "../../api/socket";
import BaseMap from "../map/BaseMap";
import { boundsOf, distanceKm, formatDistance } from "../map/mapUtils";

const CITY_SPEED_KMH = 28; // şəhər içi orta sürət — təxmini çatma vaxtı üçün
const ROAD_FACTOR = 1.3; // düz xətt → yol məsafəsi təxmini əmsalı

// Marker yeni nöqtəyə birdən tullanmasın: 1 saniyəyə hamar keçid
function useSmoothPosition(target) {
  const [pos, setPos] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    if (!target) return;
    const from = fromRef.current || target;
    const start = performance.now();
    let frame;
    const step = (now) => {
      const t = Math.min(1, (now - start) / 1000);
      const e = t * (2 - t);
      const next = [from[0] + (target[0] - from[0]) * e, from[1] + (target[1] - from[1]) * e];
      fromRef.current = next;
      setPos(next);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target?.[0], target?.[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  return pos;
}

/**
 * Canlı izləmə xəritəsi: müştərinin ünvanı (ev) və ustanın son məlum yeri (maşın).
 * Ustanın yeri "order_location" socket hadisəsi ilə yenilənir.
 */
export default function LiveTracking({ order, height = 240 }) {
  const mapRef = useRef(null);
  const home = order.location?.coordinates?.length === 2 ? [order.location.coordinates[1], order.location.coordinates[0]] : null;
  const initial = order.tracking?.lat != null ? [order.tracking.lat, order.tracking.lng] : null;
  const [live, setLive] = useState({ pos: initial, at: order.tracking?.at ? new Date(order.tracking.at) : null });
  const [, tick] = useState(0);
  const car = useSmoothPosition(live.pos);

  useEffect(() => {
    const handler = (e) => {
      if (e.orderId !== order._id) return;
      setLive({ pos: [e.lat, e.lng], at: new Date(e.at) });
    };
    socketService.on("order_location", handler);
    const timer = setInterval(() => tick((n) => n + 1), 5000); // "x san. əvvəl" yazısı üçün
    return () => {
      socketService.off("order_location", handler);
      clearInterval(timer);
    };
  }, [order._id]);

  // İlk dəfə hər iki nöqtə görünsün
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || !mapRef.current || !live.pos) return;
    const points = home ? [home, live.pos] : [live.pos];
    if (points.length === 2) mapRef.current.fitBounds(boundsOf(points), { padding: 50, maxZoom: 15, duration: 0 });
    else mapRef.current.jumpTo({ center: [live.pos[1], live.pos[0]], zoom: 14 });
    fitted.current = true;
  });

  const km = home && live.pos ? distanceKm(live.pos, home) * ROAD_FACTOR : null;
  const eta = km != null ? Math.max(1, Math.round((km / CITY_SPEED_KMH) * 60)) : null;
  const arrived = km != null && km < 0.15;
  const ago = live.at ? Math.round((Date.now() - live.at.getTime()) / 1000) : null;
  const line = useMemo(
    () => (home && car ? { type: "Feature", geometry: { type: "LineString", coordinates: [[car[1], car[0]], [home[1], home[0]]] }, properties: {} } : null),
    [home?.[0], home?.[1], car?.[0], car?.[1]] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <Box sx={{ borderRadius: 3, overflow: "hidden", border: 1, borderColor: "divider" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, py: 1, bgcolor: "surface.warm" }}>
        <DirectionsCarFilledIcon sx={{ color: "secondary.dark" }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
            {!live.pos ? "Usta yola çıxıb, yeri gözlənilir…" : arrived ? "Usta çatdı" : `Usta yoldadır · ${formatDistance(km)} · ~${eta} dəq`}
          </Typography>
          {ago != null && (
            <Typography variant="caption" color="text.secondary">
              Son yeniləmə: {ago < 10 ? "indicə" : ago < 60 ? `${ago} san. əvvəl` : `${Math.round(ago / 60)} dəq. əvvəl`}
            </Typography>
          )}
        </Box>
        <Chip size="small" icon={<SensorsIcon />} label="Canlı" color="secondary" sx={{ fontWeight: 700 }} />
      </Stack>
      <Box sx={{ height }}>
        <BaseMap ref={mapRef} controls={false} initialViewState={home ? { latitude: home[0], longitude: home[1], zoom: 13 } : undefined}>
          {line && (
            <Source id={`track-${order._id}`} type="geojson" data={line}>
              <Layer id={`track-line-${order._id}`} type="line" paint={{ "line-color": "#0F766E", "line-width": 3, "line-dasharray": [2, 1.5] }} />
            </Source>
          )}
          {home && (
            <Marker latitude={home[0]} longitude={home[1]} anchor="center">
              <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "#0F172A", color: "#fff", display: "grid", placeItems: "center", border: "3px solid #fff", boxShadow: "0 3px 10px rgba(0,0,0,.3)" }}>
                <HomeRoundedIcon sx={{ fontSize: 18 }} />
              </Box>
            </Marker>
          )}
          {car && (
            <Marker latitude={car[0]} longitude={car[1]} anchor="center">
              <Box sx={{
                width: 40, height: 40, borderRadius: "50%", bgcolor: "secondary.main", color: "#422006", display: "grid", placeItems: "center",
                border: "3px solid #fff", boxShadow: "0 0 0 0 rgba(245,158,11,.6)", animation: "carPulse 1.8s infinite",
                "@keyframes carPulse": { "0%": { boxShadow: "0 0 0 0 rgba(245,158,11,.55)" }, "100%": { boxShadow: "0 0 0 16px rgba(245,158,11,0)" } },
              }}>
                <DirectionsCarFilledIcon sx={{ fontSize: 22 }} />
              </Box>
            </Marker>
          )}
        </BaseMap>
      </Box>
    </Box>
  );
}
