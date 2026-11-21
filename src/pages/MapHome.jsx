import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layer, Marker, Source } from "@vis.gl/react-maplibre";
import {
  Alert, Box, Button, Chip, CircularProgress, Fab, IconButton, InputAdornment, ListItemIcon, Menu, MenuItem, Paper,
  Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import api from "../api/client";
import BaseMap from "../components/map/BaseMap";
import MasterPin from "../components/map/MasterPin";
import MasterDetail, { MasterRow } from "../components/map/MasterDetail";
import CategoryIcon from "../components/CategoryIcon";
import EmptyState from "../components/EmptyState";
import OrderDialog from "../components/orders/OrderDialog";
import useOnlineIds from "../hooks/useOnlineIds";
import { CATEGORIES, POPULAR_CATEGORIES } from "../constants/data";
import {
  DEFAULT_VIEW, boundsOf, circlePolygon, distanceKm, getCurrentPosition, masterLatLng, spreadOverlaps,
} from "../components/map/mapUtils";

const PANEL_WIDTH = 400;
const MAX_DISTANCE_KM = 20;
const BAKU = [DEFAULT_VIEW.latitude, DEFAULT_VIEW.longitude];

// Taksi/yemək tətbiqləri kimi: xəritə Bakı ilə açılır, ixtisas seçiləndə radiusdakı aktiv ustalar görünür
export default function MapHome() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const mapRef = useRef(null);
  const onlineIds = useOnlineIds();

  const [masters, setMasters] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("distance"); // distance | rating
  const [topRated, setTopRated] = useState(false); // yalnız 4★+
  const [userPos, setUserPos] = useState(null);
  const [areaCenter, setAreaCenter] = useState(null); // "Bu ərazidə axtar" ilə seçilmiş mərkəz
  const [showAreaButton, setShowAreaButton] = useState(false);
  const [locating, setLocating] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true); // kompüterdə siyahı panelini gizlədib xəritəni genişləndirmək üçün
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [orderMaster, setOrderMaster] = useState(null);
  const [road, setRoad] = useState({ key: "", results: {}, loading: false });
  const askedLocationRef = useRef(false);

  // Ustalar yalnız ixtisas seçiləndən və ya axtarış yazılandan sonra göstərilir
  const active = Boolean(category) || search.trim().length >= 2;
  // Axtarış mərkəzi: seçilmiş ərazi → istifadəçinin yeri → Bakı mərkəzi
  const origin = areaCenter || userPos || BAKU;
  const originLabel = areaCenter ? "seçilmiş ərazidən" : userPos ? "yerinizdən" : "Bakı mərkəzindən";

  useEffect(() => {
    api.get("/api/master")
      .then(({ data }) => setMasters(data))
      .catch(() => {
        setMasters([]);
        setError("Ustalar yüklənmədi. Serverin işlədiyini yoxlayın.");
      });
    // İcazə artıq verilibsə, yeri səssizcə götür
    navigator.permissions?.query({ name: "geolocation" }).then((p) => {
      if (p.state === "granted") getCurrentPosition().then(setUserPos).catch(() => {});
    }).catch(() => {});
  }, []);

  // 1) Filtr: ixtisas/axtarış, yalnız aktiv və boş ustalar, düz xətt üzrə 20 km-ə qədər
  const candidates = useMemo(() => {
    if (!active) return [];
    const term = search.trim().toLowerCase();
    return (masters || [])
      .filter((m) => m.isAvailable !== false && !m.isBusy)
      .filter((m) => !category || m.category === category)
      .filter((m) => !term || `${m.name} ${m.surname} ${m.category} ${m.city}`.toLowerCase().includes(term))
      .map((m) => {
        const pos = masterLatLng(m);
        return { master: m, pos, air: pos ? distanceKm(origin, pos) : Infinity };
      })
      .filter((r) => r.pos && r.air <= MAX_DISTANCE_KM);
  }, [masters, category, search, origin, active]);

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
        sortBy === "rating"
          ? (b.master.ratingAvg || 0) - (a.master.ratingAvg || 0) || (b.master.ratingCount || 0) - (a.master.ratingCount || 0) || a.distance - b.distance
          : a.distance - b.distance
      );
  }, [candidates, road, roadKey, topRated, sortBy]);

  const pins = useMemo(() => spreadOverlaps(rows), [rows]);
  const radius = useMemo(() => circlePolygon(origin, MAX_DISTANCE_KM), [origin]);
  const selected = rows.find((r) => r.master._id === selectedId) || null;

  // Panelin altında qalmaması üçün xəritə kənar boşluqları
  const padding = useMemo(
    () => (isDesktop ? { top: 60, bottom: 60, left: PANEL_WIDTH + 60, right: 60 } : { top: 140, bottom: 240, left: 40, right: 40 }),
    [isDesktop]
  );

  const fitTo = useCallback(
    (points) => {
      const map = mapRef.current;
      if (!map || points.length === 0) return;
      if (points.length === 1) map.flyTo({ center: [points[0][1], points[0][0]], zoom: 14, padding, duration: 800 });
      else map.fitBounds(boundsOf(points), { padding, maxZoom: 14, duration: 800 });
    },
    [padding]
  );

  // Filtr və ya mərkəz dəyişəndə: nəticə varsa onlara yaxınlaş, yoxdursa mərkəzə qayıt
  const [mapReady, setMapReady] = useState(false);
  const fitKey = `${active}|${origin.join(",")}|${candidates.map((c) => c.master._id).join(",")}`;
  useEffect(() => {
    if (!mapReady || selectedId) return;
    if (active && candidates.length > 0) fitTo([origin, ...candidates.map((c) => c.pos)]);
    else mapRef.current?.flyTo({ center: [origin[1], origin[0]], zoom: 11, padding, duration: 800 });
    setShowAreaButton(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, mapReady]);

  // İlk filtr seçiləndə bir dəfə yeri soruş; verilməsə, Bakı mərkəzindən hesabla
  useEffect(() => {
    if (!active || userPos || areaCenter || askedLocationRef.current) return;
    askedLocationRef.current = true;
    getCurrentPosition()
      .then(setUserPos)
      .catch(() => setNotice("Məsafə Bakı mərkəzindən hesablanır. Dəqiq nəticə üçün \"Mənim yerim\" düyməsinə basın və ya xəritəni sürüşdürüb \"Bu ərazidə axtar\"-a basın."));
  }, [active, userPos, areaCenter]);

  // İstifadəçi xəritəni sürüşdürəndə "Bu ərazidə axtar" düyməsi çıxır
  const onMoveEnd = (e) => {
    if (!e.originalEvent) return; // proqramla edilən hərəkətlərə (flyTo) reaksiya vermə
    const c = mapRef.current?.getCenter();
    if (c && distanceKm([c.lat, c.lng], origin) > 1.5) setShowAreaButton(true);
  };

  const searchThisArea = () => {
    const c = mapRef.current?.getCenter();
    if (!c) return;
    setAreaCenter([c.lat, c.lng]);
    setSelectedId(null);
    setShowAreaButton(false);
    setNotice("");
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
      const pos = await getCurrentPosition();
      setUserPos(pos);
      setAreaCenter(null);
      setNotice("");
      if (!active) mapRef.current?.flyTo({ center: [pos[1], pos[0]], zoom: 12, padding, duration: 800 });
    } catch (e) {
      setError(e.message);
    } finally {
      setLocating(false);
    }
  };

  const chipCategories = category && !POPULAR_CATEGORIES.includes(category) ? [category, ...POPULAR_CATEGORIES] : POPULAR_CATEGORIES;

  const filters = (
    <Box>
      <TextField
        placeholder="Usta və ya xidmət axtar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size={isDesktop ? "medium" : "small"}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
          endAdornment: search && (
            <InputAdornment position="end">
              <CloseIcon fontSize="small" sx={{ cursor: "pointer", color: "text.secondary" }} onClick={() => setSearch("")} />
            </InputAdornment>
          ),
          sx: { borderRadius: 99, bgcolor: "#fff" },
        }}
      />
      <Stack direction="row" spacing={1} sx={{ mt: 1.25, overflowX: "auto", pb: 0.5, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
        {chipCategories.map((c) => (
          <Chip
            key={c}
            icon={<CategoryIcon category={c} />}
            label={c}
            onClick={() => setCategory(c === category ? "" : c)}
            onDelete={c === category ? () => setCategory("") : undefined}
            color={c === category ? "primary" : "default"}
            variant={c === category ? "filled" : "outlined"}
            sx={{ flexShrink: 0, bgcolor: c === category ? undefined : "#fff" }}
          />
        ))}
        <Chip icon={<TuneIcon />} label="Bütün ixtisaslar" variant="outlined" onClick={(e) => setMoreAnchor(e.currentTarget)} sx={{ flexShrink: 0, bgcolor: "#fff" }} />
      </Stack>
      <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)} slotProps={{ paper: { sx: { maxHeight: 420 } } }}>
        {CATEGORIES.map((c) => (
          <MenuItem key={c} selected={c === category} onClick={() => { setCategory(c); setMoreAnchor(null); }}>
            <ListItemIcon><CategoryIcon category={c} fontSize="small" /></ListItemIcon>
            {c}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );

  // Sıralama və reytinq filtri (nəticələr göstəriləndə)
  const sortBar = active && (
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

  const list =
    masters === null ? (
      <Box sx={{ display: "grid", placeItems: "center", py: 6 }}><CircularProgress size={28} /></Box>
    ) : !active ? null : rows.length === 0 ? (
      <EmptyState
        icon={<EngineeringOutlinedIcon />}
        title="Yaxınlıqda aktiv usta tapılmadı"
        text={`${originLabel[0].toUpperCase()}${originLabel.slice(1)} ${MAX_DISTANCE_KM} km-ə qədər${topRated ? ", 4.0+ reytinqli" : ""} sifariş qəbul edən usta yoxdur. Xəritəni sürüşdürüb "Bu ərazidə axtar"-a basın və ya başqa ixtisas seçin.`}
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
    : !active
      ? "İxtisas seçin"
      : `${rows.length} aktiv usta · ${MAX_DISTANCE_KM} km radius${areaCenter ? " (seçilmiş ərazi)" : userPos ? "" : " (Bakı mərkəzi)"}${road.loading ? " · hesablanır..." : ""}`;

  return (
    <Box sx={{ position: "relative", flex: 1, minHeight: 0, overflow: "hidden" }}>
      {/* Xəritə öz stacking context-ində: pin-lər panellərin üstünə çıxmasın */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <BaseMap ref={mapRef} onLoad={() => setMapReady(true)} onClick={() => setSelectedId(null)} onMoveEnd={onMoveEnd}>
          {/* 20 km axtarış radiusu */}
          {active && (
            <Source id="search-radius" type="geojson" data={radius}>
              <Layer id="search-radius-fill" type="fill" paint={{ "fill-color": "#0F766E", "fill-opacity": 0.05 }} />
              <Layer id="search-radius-line" type="line" paint={{ "line-color": "#0F766E", "line-width": 1.5, "line-opacity": 0.5, "line-dasharray": [3, 2] }} />
            </Source>
          )}
          {pins.map(({ master, pos, distance }) => (
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
          {/* Axtarış mərkəzi: istifadəçinin yeri (mavi) və ya seçilmiş ərazi (boz) */}
          {(userPos || areaCenter) && (
            <Marker latitude={origin[0]} longitude={origin[1]}>
              <Box sx={{
                width: 18, height: 18, borderRadius: "50%", bgcolor: areaCenter ? "#475569" : "#2563EB", border: "3px solid #fff",
                animation: areaCenter ? "none" : "userPulse 2s infinite",
                "@keyframes userPulse": { "0%": { boxShadow: "0 0 0 0 rgba(37,99,235,.5)" }, "100%": { boxShadow: "0 0 0 18px rgba(37,99,235,0)" } },
              }} />
            </Marker>
          )}
        </BaseMap>
      </Box>

      {/* Bu ərazidə axtar */}
      {showAreaButton && (
        <Button
          variant="contained"
          startIcon={<TravelExploreIcon />}
          onClick={searchThisArea}
          sx={{
            position: "absolute", zIndex: 4, borderRadius: 99, px: 2.5, boxShadow: "0 8px 24px rgba(15,23,42,.25)",
            top: { xs: 112, md: 20 },
            left: { xs: "50%", md: `calc(${PANEL_WIDTH + 16}px + (100% - ${PANEL_WIDTH + 16}px) / 2)` },
            transform: "translateX(-50%)",
          }}
        >
          Bu ərazidə axtar
        </Button>
      )}

      {/* Yerimi tap */}
      <Tooltip title="Mənim yerim" placement="left">
        <Fab
          size="medium"
          onClick={locate}
          disabled={locating}
          sx={{
            position: "absolute", zIndex: 2, right: 16, bgcolor: "#fff", color: userPos && !areaCenter ? "primary.main" : "text.primary",
            bottom: { xs: selected ? "auto" : active ? 184 : 28, md: 130 }, top: { xs: selected ? 130 : "auto", md: "auto" },
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
          aria-label="Mənim yerim"
        >
          {locating ? <CircularProgress size={22} /> : <MyLocationIcon />}
        </Fab>
      </Tooltip>

      {notice && !error && (
        <Alert severity="info" onClose={() => setNotice("")} sx={{ position: "absolute", top: { xs: 118, md: 72 }, left: { xs: 12, md: PANEL_WIDTH + 32 }, right: { xs: 12, md: "auto" }, zIndex: 5, maxWidth: 520 }}>
          {notice}
        </Alert>
      )}
      {error && (
        <Alert severity="warning" onClose={() => setError("")} sx={{ position: "absolute", top: { xs: 118, md: 72 }, left: { xs: 12, md: PANEL_WIDTH + 32 }, right: { xs: 12, md: "auto" }, zIndex: 5 }}>
          {error}
        </Alert>
      )}

      {isDesktop ? (
        /* KOMPÜTER: başlanğıcda kiçik axtarış kartı (xəritə geniş), nəticə olanda siyahı paneli */
        (() => {
          const expanded = Boolean(selected) || (active && panelOpen);
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
                <Box sx={{ p: 2, pb: 1.5, borderBottom: expanded ? 1 : 0, borderColor: "divider" }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                    <Typography variant="h6">Hansı usta lazımdır?</Typography>
                    {active && (
                      <Tooltip title={panelOpen ? "Siyahını gizlət — xəritə genişlənsin" : "Siyahını göstər"}>
                        <IconButton size="small" onClick={() => setPanelOpen((v) => !v)} sx={{ border: 1, borderColor: "divider" }}>
                          {panelOpen ? <ChevronLeftIcon /> : <FormatListBulletedIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                  {filters}
                  {sortBar}
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    {active ? countText : "İxtisas seçin — yaxınlıqdakı aktiv ustalar xəritədə görünəcək"}
                  </Typography>
                  {active && !panelOpen && rows.length > 0 && (
                    <Button fullWidth size="small" variant="outlined" startIcon={<FormatListBulletedIcon />} onClick={() => setPanelOpen(true)} sx={{ mt: 1 }}>
                      Siyahını göstər ({rows.length})
                    </Button>
                  )}
                </Box>
              )}
              {expanded && <Box sx={{ flex: 1, overflowY: "auto" }}>{selected ? detail : list}</Box>}
            </Paper>
          );
        })()
      ) : (
        /* MOBİL: yuxarıda filtrlər, aşağıda sürüşən panel */
        <>
          <Box sx={{ position: "absolute", top: 12, left: 12, right: 12, zIndex: 2, "& .MuiOutlinedInput-root": { boxShadow: "0 6px 20px rgba(15,23,42,.15)" } }}>
            {filters}
            {!active && (
              <Typography variant="caption" sx={{ display: "inline-block", mt: 0.5, px: 1.25, py: 0.5, borderRadius: 99, bgcolor: "rgba(255,255,255,.92)", boxShadow: "0 2px 8px rgba(15,23,42,.12)", fontWeight: 600 }}>
                İxtisas seçin — yaxınlıqdakı ustalar görünəcək
              </Typography>
            )}
          </Box>
          {(active || selected) && <Paper
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
          </Paper>}
        </>
      )}

      <OrderDialog open={Boolean(orderMaster)} master={orderMaster} initialPosition={userPos} onClose={() => setOrderMaster(null)} />
    </Box>
  );
}
