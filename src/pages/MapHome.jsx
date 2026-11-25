import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layer, Marker, Source } from "@vis.gl/react-maplibre";
import {
  Alert, Box, Button, Chip, CircularProgress, Fab, IconButton, Paper, Stack, ToggleButton, ToggleButtonGroup, Tooltip,
  Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import PlaceIcon from "@mui/icons-material/Place";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import api from "../api/client";
import BaseMap from "../components/map/BaseMap";
import MasterPin from "../components/map/MasterPin";
import MasterDetail, { MasterRow } from "../components/map/MasterDetail";
import CategoryIcon from "../components/CategoryIcon";
import EmptyState from "../components/EmptyState";
import OrderDialog from "../components/orders/OrderDialog";
import FindWizard from "../components/find/FindWizard";
import { saveRecentPlace } from "../utils/recentPlaces";
import useOnlineIds from "../hooks/useOnlineIds";
import { CATEGORIES } from "../constants/data";
import {
  DEFAULT_VIEW, boundsOf, circlePolygon, distanceKm, getCurrentPosition, masterLatLng, spreadOverlaps,
} from "../components/map/mapUtils";

const PANEL_WIDTH = 400;
const MAX_DISTANCE_KM = 20;
const BAKU = [DEFAULT_VIEW.latitude, DEFAULT_VIEW.longitude];
const AZ_BOUNDS = { minLat: 38.3, maxLat: 41.95, minLng: 44.7, maxLng: 50.9 };

// URL-dən yer: ?lat=..&lng=..&yer=..&menbe=gps|search|recent|area|area-list|map
function placeFromParams(params) {
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  if (!params.get("lat") || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < AZ_BOUNDS.minLat || lat > AZ_BOUNDS.maxLat || lng < AZ_BOUNDS.minLng || lng > AZ_BOUNDS.maxLng) return null;
  return { lat, lng, title: (params.get("yer") || "Seçilmiş yer").slice(0, 80), source: params.get("menbe") || "" };
}

/**
 * Ana səhifə 3 addımdır və vəziyyət URL-də saxlanılır (geri düyməsi və link paylaşımı işləyir):
 *  1) ?            — nə lazımdır (problem yazılır və ya xidmət seçilir)
 *  2) ?xidmet=..   — usta hara gəlsin (GPS, ünvan axtarışı, rayon və ya xəritədə nöqtə)
 *  3) ?xidmet=..&lat=..&lng=.. — xəritə həmin yerə açılır, 20 km-dəki aktiv ustalar göstərilir
 */
export default function MapHome() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const mapRef = useRef(null);
  const onlineIds = useOnlineIds();
  const [params, setParams] = useSearchParams();

  const categoryParam = params.get("xidmet") || "";
  const category = CATEGORIES.includes(categoryParam) ? categoryParam : "";
  const problem = (params.get("problem") || "").slice(0, 200);
  const place = useMemo(() => placeFromParams(params), [params]);
  const step = !category ? 1 : !place ? 2 : 3;
  const active = step === 3;

  const [masters, setMasters] = useState(null);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("distance"); // distance | rating
  const [topRated, setTopRated] = useState(false); // yalnız 4★+
  const [showAreaButton, setShowAreaButton] = useState(false);
  const [locating, setLocating] = useState(false);
  const [pickMode, setPickMode] = useState(false); // "Xəritədə nöqtə seç"
  const [selectedId, setSelectedId] = useState(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [orderMaster, setOrderMaster] = useState(null);
  const [road, setRoad] = useState({ key: "", results: {}, loading: false });
  const [mapReady, setMapReady] = useState(false);

  const origin = useMemo(() => (place ? [place.lat, place.lng] : BAKU), [place]);

  useEffect(() => {
    api.get("/api/master")
      .then(({ data }) => setMasters(data))
      .catch(() => {
        setMasters([]);
        setError("Ustalar yüklənmədi. Serverin işlədiyini yoxlayın.");
      });
  }, []);

  // URL-i yeniləyən köməkçi: boş dəyərlər silinir
  const updateParams = useCallback(
    (changes, options) => {
      const next = new URLSearchParams(params);
      Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, String(v)) : next.delete(k)));
      setParams(next, options);
    },
    [params, setParams]
  );

  const placeParams = (p) => ({ lat: p.lat.toFixed(5), lng: p.lng.toFixed(5), yer: p.title, menbe: p.source });

  // Sifariş qəbul edən ustaların ixtisas üzrə sayı (1-ci addımda göstərilir)
  const counts = useMemo(() => {
    if (!masters) return null;
    const result = {};
    masters.filter((m) => !m.isDemo && m.isAvailable !== false && !m.isBusy && masterLatLng(m)).forEach((m) => {
      result[m.category] = (result[m.category] || 0) + 1;
    });
    return result;
  }, [masters]);

  // 1) Filtr: ixtisas, yalnız aktiv və boş ustalar, düz xətt üzrə 20 km-ə qədər
  const candidates = useMemo(() => {
    if (!active) return [];
    return (masters || [])
      .filter((m) => m.isAvailable !== false && !m.isBusy && m.category === category)
      .map((m) => {
        const pos = masterLatLng(m);
        return { master: m, pos, air: pos ? distanceKm(origin, pos) : Infinity };
      })
      .filter((r) => r.pos && r.air <= MAX_DISTANCE_KM);
  }, [masters, category, origin, active]);

  // 2) Real yol məsafəsi (OSRM, maşınla). Alınmasa düz xətt məsafəsi istifadə olunur
  const roadKey = `${origin.join(",")}|${candidates.map((c) => c.master._id).join(",")}`;
  useEffect(() => {
    if (candidates.length === 0) return;
    let cancelled = false;
    setRoad((r) => ({ ...r, loading: true }));
    api.post("/api/routing/distances", {
      origin,
      points: candidates.map((c) => ({ id: c.master._id, lat: c.pos[0], lng: c.pos[1] })),
    })
      .then(({ data }) => !cancelled && setRoad({ key: roadKey, results: data.results || {}, loading: false }))
      .catch(() => !cancelled && setRoad({ key: roadKey, results: {}, loading: false }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadKey]);

  // 3) Yol məsafəsi ilə 20 km limiti, reytinq filtri və sıralama
  const rows = useMemo(() => {
    const results = road.key === roadKey ? road.results : {};
    return candidates
      .map((c) => {
        const r = results[c.master._id];
        return { ...c, distance: r ? r.distanceKm : c.air, duration: r?.durationMin ?? null, isRoad: Boolean(r) };
      })
      .filter((r) => r.distance <= MAX_DISTANCE_KM)
      .filter((r) => !topRated || (r.master.ratingCount > 0 && r.master.ratingAvg >= 4))
      .sort((a, b) =>
        Number(Boolean(a.master.isDemo)) - Number(Boolean(b.master.isDemo)) || (sortBy === "rating"
          ? (b.master.ratingAvg || 0) - (a.master.ratingAvg || 0) || (b.master.ratingCount || 0) - (a.master.ratingCount || 0) || a.distance - b.distance
          : a.distance - b.distance)
      );
  }, [candidates, road, roadKey, topRated, sortBy]);

  const pins = useMemo(() => spreadOverlaps(rows), [rows]);
  const radius = useMemo(() => circlePolygon(origin, MAX_DISTANCE_KM), [origin]);
  const selected = rows.find((r) => r.master._id === selectedId) || null;

  const padding = useMemo(
    () => (isDesktop ? { top: 60, bottom: 60, left: PANEL_WIDTH + 60, right: 60 } : { top: 110, bottom: 220, left: 40, right: 40 }),
    [isDesktop]
  );

  const fitTo = useCallback(
    (points) => {
      const map = mapRef.current;
      if (!map || points.length === 0) return;
      if (points.length === 1) map.flyTo({ center: [points[0][1], points[0][0]], zoom: 14, padding, duration: 900 });
      else map.fitBounds(boundsOf(points), { padding, maxZoom: 14, duration: 900 });
    },
    [padding]
  );

  // Yer və ya nəticələr dəyişəndə: ustalara yaxınlaş; usta yoxdursa seçilmiş yerə; sihirbazda — Bakı ümumi görünüşü
  const fitKey = `${active}|${origin.join(",")}|${candidates.map((c) => c.master._id).join(",")}`;
  useEffect(() => {
    if (!mapReady || selectedId || pickMode) return;
    const map = mapRef.current;
    if (!active) map?.flyTo({ center: [BAKU[1], BAKU[0]], zoom: 11, padding: 0, duration: 600 });
    else if (candidates.length > 0) fitTo([origin, ...candidates.map((c) => c.pos)]);
    else map?.flyTo({ center: [origin[1], origin[0]], zoom: 13, padding, duration: 900 });
    setShowAreaButton(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, mapReady]);

  // Xidmət və ya yer dəyişəndə seçilmiş usta sıfırlansın
  useEffect(() => {
    setSelectedId(null);
    setSheetExpanded(false);
  }, [category, place?.lat, place?.lng]);

  // ---------- Sihirbaz hərəkətləri ----------
  const pickCategory = (c, problemText) =>
    updateParams({ xidmet: c, problem: problemText || "" });

  const pickLocation = (p) => {
    saveRecentPlace(p);
    updateParams(placeParams(p));
  };

  const changeService = () => updateParams({ xidmet: "" });
  const changePlace = () => updateParams({ lat: "", lng: "", yer: "", menbe: "" });
  const resetAll = () => setParams(new URLSearchParams());

  const startPickOnMap = () => {
    setPickMode(true);
    mapRef.current?.flyTo({ center: [BAKU[1], BAKU[0]], zoom: 12.5, padding: 0, duration: 600 });
  };
  const confirmPick = () => {
    const c = mapRef.current?.getCenter();
    if (!c) return;
    setPickMode(false);
    pickLocation({ lat: c.lat, lng: c.lng, title: "Xəritədə seçilmiş nöqtə", source: "map" });
  };

  // ---------- Xəritə hərəkətləri ----------
  const onMoveEnd = (e) => {
    if (!active || !e.originalEvent) return; // proqramla edilən hərəkətlərə (flyTo) reaksiya vermə
    const c = mapRef.current?.getCenter();
    if (c && distanceKm([c.lat, c.lng], origin) > 1.5) setShowAreaButton(true);
  };

  const searchThisArea = () => {
    const c = mapRef.current?.getCenter();
    if (!c) return;
    setShowAreaButton(false);
    updateParams({ lat: c.lat.toFixed(5), lng: c.lng.toFixed(5), yer: "Seçilmiş ərazi", menbe: "area" }, { replace: true });
  };

  const select = (id) => {
    setSelectedId(id);
    setSheetExpanded(false);
    setPanelOpen(true);
    const pin = pins.find((p) => p.master._id === id);
    if (pin) mapRef.current?.flyTo({ center: [pin.pos[1], pin.pos[0]], zoom: Math.max(mapRef.current.getZoom(), 14), padding, duration: 700 });
  };

  const locate = async () => {
    setLocating(true);
    try {
      const [lat, lng] = await getCurrentPosition();
      updateParams({ lat: lat.toFixed(5), lng: lng.toFixed(5), yer: "Mənim yerim", menbe: "gps" }, { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setLocating(false);
    }
  };

  // ---------- Hissələr ----------
  const sortBar = (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.25 }}>
      <ToggleButtonGroup size="small" exclusive value={sortBy} onChange={(_, v) => v && setSortBy(v)} sx={{ bgcolor: "#fff", "& .MuiToggleButton-root": { py: 0.25, px: 1.25, fontSize: 12.5, whiteSpace: "nowrap" } }}>
        <ToggleButton value="distance">Ən yaxın</ToggleButton>
        <ToggleButton value="rating">Reytinq</ToggleButton>
      </ToggleButtonGroup>
      <Chip
        size="small"
        icon={<StarRoundedIcon />}
        label="4.0+"
        onClick={() => setTopRated((v) => !v)}
        color={topRated ? "secondary" : "default"}
        variant={topRated ? "filled" : "outlined"}
        sx={{ bgcolor: topRated ? undefined : "#fff" }}
      />
    </Stack>
  );

  // Seçilmiş xidmət və yer — hər biri toxunanda dəyişdirilə bilər
  const summaryRow = (icon, label, onClick, ariaLabel) => (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      sx={{
        display: "flex", alignItems: "center", gap: 1, width: "100%", minWidth: 0, p: 0.75, pr: 1,
        border: 0, bgcolor: "transparent", borderRadius: 2, cursor: "pointer", font: "inherit", textAlign: "left", color: "text.primary",
        "&:hover": { bgcolor: "action.hover" }, "& .edit": { opacity: 0.55 }, "&:hover .edit": { opacity: 1 },
      }}
    >
      <Box sx={{ width: 30, height: 30, borderRadius: 2, bgcolor: "#F0FDFA", color: "primary.main", display: "grid", placeItems: "center", flexShrink: 0, "& svg": { fontSize: 18 } }}>{icon}</Box>
      <Typography sx={{ fontWeight: 600, fontSize: 14.5, flex: 1, minWidth: 0 }} noWrap>{label}</Typography>
      <EditOutlinedIcon className="edit" sx={{ fontSize: 17, color: "text.secondary" }} />
    </Box>
  );

  const summary = (
    <>
      {summaryRow(<CategoryIcon category={category} />, category, changeService, "Xidməti dəyiş")}
      {summaryRow(<PlaceOutlinedIcon />, place?.title, changePlace, "Yeri dəyiş")}
    </>
  );

  const list =
    masters === null ? (
      <Box sx={{ display: "grid", placeItems: "center", py: 6 }}><CircularProgress size={28} /></Box>
    ) : rows.length === 0 ? (
      <EmptyState
        icon={<EngineeringOutlinedIcon />}
        title="Yaxınlıqda aktiv usta tapılmadı"
        text={`Seçdiyiniz yerdən ${MAX_DISTANCE_KM} km-ə qədər${topRated ? ", 4.0+ reytinqli" : ""} sifariş qəbul edən ${category.toLocaleLowerCase("az")} yoxdur. Xəritəni sürüşdürüb "Bu ərazidə axtar"-a basın və ya başqa xidmət seçin.`}
      />
    ) : (
      rows.map((r) => (
        <MasterRow
          key={r.master._id}
          master={r.master}
          distance={r.distance}
          duration={r.duration}
          online={onlineIds.has(r.master._id)}
          selected={r.master._id === selectedId}
          onClick={() => select(r.master._id)}
        />
      ))
    );

  const detail = selected && (
    <MasterDetail
      master={selected.master}
      distance={selected.distance}
      duration={selected.duration}
      isRoad={selected.isRoad}
      online={onlineIds.has(selected.master._id)}
      onBack={() => setSelectedId(null)}
      onOrder={setOrderMaster}
    />
  );

  const countText = !masters
    ? "Yüklənir..."
    : `${rows.filter((r) => !r.master.isDemo).length} aktiv usta${rows.some((r) => r.master.isDemo) ? ` + ${rows.filter((r) => r.master.isDemo).length} nümunə` : ""} · ${MAX_DISTANCE_KM} km radius${road.loading ? " · hesablanır..." : ""}`;

  // Sifariş formasına ötürülən ünvan: yalnız istifadəçinin özünün seçdiyi konkret ünvan
  const orderAddress = place && ["search", "recent"].includes(place.source) ? place.title : "";

  return (
    <Box sx={{ position: "relative", flex: 1, minHeight: 0, overflow: "hidden" }}>
      {/* Xəritə öz stacking context-ində: pin-lər panellərin üstünə çıxmasın */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <BaseMap ref={mapRef} onLoad={() => setMapReady(true)} onClick={() => setSelectedId(null)} onMoveEnd={onMoveEnd}>
          {active && (
            <Source id="search-radius" type="geojson" data={radius}>
              <Layer id="search-radius-fill" type="fill" paint={{ "fill-color": "#0F766E", "fill-opacity": 0.05 }} />
              <Layer id="search-radius-line" type="line" paint={{ "line-color": "#0F766E", "line-width": 1.5, "line-opacity": 0.5, "line-dasharray": [3, 2] }} />
            </Source>
          )}
          {active && pins.map(({ master, pos, distance }) => (
            <Marker
              key={master._id}
              latitude={pos[0]}
              longitude={pos[1]}
              anchor="bottom"
              style={{ zIndex: master._id === selectedId ? 10 : 1 }}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                select(master._id);
              }}
            >
              <MasterPin master={master} selected={master._id === selectedId} online={onlineIds.has(master._id)} distance={distance} />
            </Marker>
          ))}
          {/* Axtarış mərkəzi: GPS (mavi, nəbz) və ya seçilmiş ünvan (yaşıl pin) */}
          {active && (
            <Marker latitude={origin[0]} longitude={origin[1]} anchor={place.source === "gps" ? "center" : "bottom"} style={{ zIndex: 0 }}>
              {place.source === "gps" ? (
                <Box sx={{
                  width: 18, height: 18, borderRadius: "50%", bgcolor: "#2563EB", border: "3px solid #fff", animation: "userPulse 2s infinite",
                  "@keyframes userPulse": { "0%": { boxShadow: "0 0 0 0 rgba(37,99,235,.5)" }, "100%": { boxShadow: "0 0 0 18px rgba(37,99,235,0)" } },
                }} />
              ) : (
                <PlaceIcon sx={{ fontSize: 40, color: "#0F172A", filter: "drop-shadow(0 3px 4px rgba(0,0,0,.3))" }} />
              )}
            </Marker>
          )}
        </BaseMap>
      </Box>

      {/* 1-2-ci addımlar: xəritənin üstündə sihirbaz */}
      {!active && !pickMode && (
        <FindWizard
          step={step}
          category={category}
          problem={problem}
          counts={counts}
          onPickCategory={pickCategory}
          onBack={changeService}
          onPickLocation={pickLocation}
          onPickOnMap={startPickOnMap}
        />
      )}

      {/* Xəritədə nöqtə seçimi: mərkəzdəki pin + təsdiq paneli */}
      {pickMode && (
        <>
          <Box sx={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -100%)", zIndex: 3, pointerEvents: "none" }}>
            <PlaceIcon sx={{ fontSize: 52, color: "secondary.main", filter: "drop-shadow(0 4px 5px rgba(0,0,0,.35))", display: "block" }} />
          </Box>
          <Paper sx={{
            position: "absolute", zIndex: 4, left: "50%", transform: "translateX(-50%)", bottom: { xs: 16, md: 32 },
            width: "calc(100% - 24px)", maxWidth: 440, p: 2, borderRadius: 4, boxShadow: "0 16px 40px rgba(15,23,42,.22)",
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Usta hara gəlsin?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Xəritəni sürüşdürüb pin-i lazım olan yerə gətirin.</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => setPickMode(false)} sx={{ flex: 1 }}>Geri</Button>
              <Button variant="contained" onClick={confirmPick} sx={{ flex: 2 }}>Bu nöqtəni seç</Button>
            </Stack>
          </Paper>
        </>
      )}

      {active && showAreaButton && (
        <Button
          variant="contained"
          startIcon={<TravelExploreIcon />}
          onClick={searchThisArea}
          sx={{
            position: "absolute", zIndex: 4, borderRadius: 99, px: 2.5, boxShadow: "0 8px 24px rgba(15,23,42,.25)",
            top: { xs: 104, md: 20 },
            left: { xs: "50%", md: `calc(${PANEL_WIDTH + 16}px + (100% - ${PANEL_WIDTH + 16}px) / 2)` },
            transform: "translateX(-50%)", whiteSpace: "nowrap",
          }}
        >
          Bu ərazidə axtar
        </Button>
      )}

      {active && (
        <Tooltip title="Mənim yerim" placement="left">
          <Fab
            size="medium"
            onClick={locate}
            disabled={locating}
            sx={{
              position: "absolute", zIndex: 2, right: 16, bgcolor: "#fff", color: place?.source === "gps" ? "primary.main" : "text.primary",
              bottom: { xs: selected ? "auto" : 184, md: 130 }, top: { xs: selected ? 104 : "auto", md: "auto" },
              "&:hover": { bgcolor: "#F8FAFC" },
            }}
            aria-label="Mənim yerim"
          >
            {locating ? <CircularProgress size={22} /> : <MyLocationIcon />}
          </Fab>
        </Tooltip>
      )}

      {error && (
        <Alert severity="warning" onClose={() => setError("")} sx={{ position: "absolute", top: { xs: 104, md: 72 }, left: { xs: 12, md: active ? PANEL_WIDTH + 32 : "auto" }, right: { xs: 12, md: active ? "auto" : 16 }, zIndex: 7, maxWidth: 520 }}>
          {error}
        </Alert>
      )}

      {active && (isDesktop ? (
        /* KOMPÜTER: solda xülasə + siyahı paneli */
        (() => {
          const expanded = Boolean(selected) || panelOpen;
          return (
            <Paper
              sx={{
                position: "absolute", zIndex: 2, top: 16, left: 16, width: PANEL_WIDTH,
                bottom: expanded ? 16 : "auto", maxHeight: "calc(100% - 32px)",
                display: "flex", flexDirection: "column", overflow: "hidden",
                border: 1, borderColor: "divider", boxShadow: "0 12px 40px rgba(15,23,42,.14)",
              }}
            >
              {!selected && (
                <Box sx={{ p: 1.5, pb: 1.5, borderBottom: expanded ? 1 : 0, borderColor: "divider" }}>
                  <Stack direction="row" alignItems="flex-start" spacing={0.5}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>{summary}</Box>
                    <Stack spacing={0.5}>
                      <Tooltip title="Yeni axtarış">
                        <IconButton size="small" onClick={resetAll} aria-label="Yeni axtarış"><CloseIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title={panelOpen ? "Siyahını gizlət — xəritə genişlənsin" : "Siyahını göstər"}>
                        <IconButton size="small" onClick={() => setPanelOpen((v) => !v)}>
                          {panelOpen ? <ChevronLeftIcon fontSize="small" /> : <FormatListBulletedIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  <Box sx={{ px: 0.75 }}>
                    {sortBar}
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>{countText}</Typography>
                  </Box>
                </Box>
              )}
              {expanded && <Box sx={{ flex: 1, overflowY: "auto" }}>{selected ? detail : list}</Box>}
            </Paper>
          );
        })()
      ) : (
        /* MOBİL: yuxarıda xülasə kartı, aşağıda sürüşən siyahı */
        <>
          <Paper sx={{ position: "absolute", top: 12, left: 12, right: 12, zIndex: 2, p: 0.5, borderRadius: 3, boxShadow: "0 6px 20px rgba(15,23,42,.15)" }}>
            <Stack direction="row" alignItems="center">
              <Box sx={{ flex: 1, minWidth: 0 }}>{summary}</Box>
              <IconButton size="small" onClick={resetAll} aria-label="Yeni axtarış" sx={{ mx: 0.5 }}><CloseIcon fontSize="small" /></IconButton>
            </Stack>
          </Paper>
          <Paper
            sx={{
              position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 3,
              borderRadius: "22px 22px 0 0", boxShadow: "0 -8px 30px rgba(15,23,42,.15)",
              maxHeight: selected ? "78%" : sheetExpanded ? "70%" : 168,
              display: "flex", flexDirection: "column", transition: "max-height .25s ease",
            }}
          >
            <Box sx={{ pt: 1, pb: selected ? 0 : 1, flexShrink: 0 }}>
              <Box onClick={() => !selected && setSheetExpanded((v) => !v)} sx={{ cursor: "pointer" }}>
                <Box sx={{ width: 40, height: 5, borderRadius: 3, bgcolor: "#CBD5E1", mx: "auto" }} />
                {!selected && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, pt: 1 }}>
                    <Typography variant="subtitle2">{countText}</Typography>
                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600, flexShrink: 0, ml: 1 }}>{sheetExpanded ? "Bağla" : "Siyahını aç"}</Typography>
                  </Stack>
                )}
              </Box>
              {!selected && <Box sx={{ px: 2 }}>{sortBar}</Box>}
            </Box>
            <Box sx={{ overflowY: "auto", flex: 1 }}>{selected ? detail : list}</Box>
          </Paper>
        </>
      ))}

      <OrderDialog
        open={Boolean(orderMaster)}
        master={orderMaster}
        initialPosition={place ? origin : null}
        initialDescription={problem}
        initialAddress={orderAddress}
        onClose={() => setOrderMaster(null)}
      />
    </Box>
  );
}
