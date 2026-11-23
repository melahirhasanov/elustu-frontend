import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Button, Chip, CircularProgress, Divider, IconButton, InputAdornment, List, ListItemButton, ListItemIcon,
  ListItemText, Paper, Stack, TextField, Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import HistoryIcon from "@mui/icons-material/History";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import api from "../../api/client";
import CategoryIcon from "../CategoryIcon";
import { CATEGORIES, POPULAR_CATEGORIES, QUICK_AREAS } from "../../constants/data";
import { matchCategories } from "../../utils/problemMatch";
import { getCurrentPosition } from "../map/mapUtils";
import { loadRecentPlaces } from "../../utils/recentPlaces";

function Progress({ step, onBack }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
      {onBack ? (
        <IconButton size="small" onClick={onBack} aria-label="Geri" sx={{ ml: -0.75 }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
      ) : null}
      <Stack direction="row" spacing={0.75} sx={{ flex: 1, maxWidth: 120 }}>
        {[1, 2].map((s) => (
          <Box key={s} sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: s <= step ? "primary.main" : "divider", transition: "background-color .3s" }} />
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary">Addım {step} / 2</Typography>
    </Stack>
  );
}

// ---------------- 1-ci addım: problem / xidmət ----------------
function ServiceStep({ initialText, counts, onPick }) {
  const [text, setText] = useState(initialText || "");
  const [showAll, setShowAll] = useState(false);
  const matches = useMemo(() => matchCategories(text), [text]);
  const typing = text.trim().length >= 2;

  const countLabel = (c) => {
    if (!counts) return null;
    const n = counts[c] || 0;
    return n ? `${n} aktiv usta` : "Hazırda aktiv usta yoxdur";
  };

  const pick = (category) => onPick(category, typing ? text.trim() : "");

  return (
    <>
      <Progress step={1} />
      <Typography variant="h4" sx={{ fontSize: { xs: 26, md: 32 }, mb: 0.75 }}>Nəyi düzəltmək lazımdır?</Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>
        Problemi öz sözlərinizlə yazın, uyğun ustanı biz tapaq.
      </Typography>
      <TextField
        autoFocus
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && matches[0] && pick(matches[0].category)}
        placeholder="Kombi işləmir, kran axır, işıq yanmır…"
        inputProps={{ "aria-label": "Problemi yazın", maxLength: 200 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>,
          endAdornment: text && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setText("")} aria-label="Təmizlə"><CloseIcon fontSize="small" /></IconButton>
            </InputAdornment>
          ),
          sx: { borderRadius: 3, fontSize: 17, py: 0.5, bgcolor: "background.paper" },
        }}
      />

      {typing ? (
        <Box sx={{ mt: 1.5 }}>
          {matches.length > 0 ? (
            <>
              <Typography variant="overline" color="text.secondary">Uyğun ustalar</Typography>
              <List disablePadding sx={{ border: 1, borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
                {matches.map(({ category, reason }, i) => (
                  <ListItemButton key={category} onClick={() => pick(category)} divider={i < matches.length - 1} sx={{ py: 1.25 }}>
                    <ListItemIcon sx={{ minWidth: 44 }}>
                      <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "#F0FDFA", color: "primary.main", display: "grid", placeItems: "center", "& svg": { fontSize: 20 } }}>
                        <CategoryIcon category={category} />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={category}
                      secondary={[i === 0 && reason === "problem" ? "Ən uyğun" : null, countLabel(category)].filter(Boolean).join(" · ")}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <ChevronRightIcon color="action" />
                  </ListItemButton>
                ))}
              </List>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
              Uyğun ixtisas tapılmadı. Başqa sözlə yazın və ya aşağıdan seçin.
            </Typography>
          )}
        </Box>
      ) : null}

      {(!typing || matches.length === 0) && (
        <Box sx={{ mt: 2.5 }}>
          <Typography variant="overline" color="text.secondary">{showAll ? "Bütün xidmətlər" : "Populyar xidmətlər"}</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", sm: "repeat(4, minmax(0,1fr))" }, gap: 1, mt: 0.5, maxHeight: showAll ? 320 : "none", overflowY: showAll ? "auto" : "visible", pr: showAll ? 0.5 : 0 }}>
            {(showAll ? CATEGORIES : POPULAR_CATEGORIES).map((c) => (
              <Box
                key={c}
                component="button"
                type="button"
                onClick={() => pick(c)}
                sx={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, p: 1.25, minHeight: 84,
                  border: 1, borderColor: "divider", borderRadius: 3, bgcolor: "background.paper", cursor: "pointer",
                  font: "inherit", fontSize: 13, fontWeight: 500, color: "text.primary", textAlign: "center", lineHeight: 1.25,
                  transition: "border-color .15s, background-color .15s, transform .1s",
                  "&:hover": { borderColor: "primary.main", bgcolor: "#F0FDFA" },
                  "&:active": { transform: "scale(.97)" },
                  "& svg": { fontSize: 24, color: "primary.main" },
                }}
              >
                <CategoryIcon category={c} />
                {c}
              </Box>
            ))}
          </Box>
          <Button size="small" onClick={() => setShowAll((v) => !v)} sx={{ mt: 1 }}>
            {showAll ? "Yalnız populyarları göstər" : `Bütün xidmətlər (${CATEGORIES.length})`}
          </Button>
        </Box>
      )}
    </>
  );
}

// ---------------- 2-ci addım: yer ----------------
function PlaceRow({ icon, title, subtitle, onClick, divider }) {
  return (
    <ListItemButton onClick={onClick} divider={divider} sx={{ py: 1 }}>
      <ListItemIcon sx={{ minWidth: 38, color: "text.secondary" }}>{icon}</ListItemIcon>
      <ListItemText primary={title} secondary={subtitle || null} primaryTypographyProps={{ fontWeight: 500 }} secondaryTypographyProps={{ noWrap: true }} />
    </ListItemButton>
  );
}

function LocationStep({ category, problem, onBack, onPick, onPickOnMap }) {
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const recent = useMemo(loadRecentPlaces, []);
  const reqId = useRef(0);

  // Yazmağı dayandırandan 450 ms sonra axtar (Nominatim-i yükləməmək üçün)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setSearching(false);
      setSearchError("");
      return;
    }
    setSearching(true);
    const id = ++reqId.current;
    const timer = setTimeout(() => {
      api.get("/api/routing/geocode", { params: { q } })
        .then(({ data }) => {
          if (id !== reqId.current) return;
          setResults(data.results || []);
          setSearchError("");
        })
        .catch(() => id === reqId.current && setSearchError("Ünvan axtarışı alınmadı. Rayon seçin və ya xəritədə nöqtə seçin."))
        .finally(() => id === reqId.current && setSearching(false));
    }, 450);
    return () => clearTimeout(timer);
  }, [query]);

  const locate = async () => {
    setLocating(true);
    setGpsError("");
    try {
      const [lat, lng] = await getCurrentPosition();
      onPick({ lat, lng, title: "Mənim yerim", source: "gps" });
    } catch (e) {
      setGpsError(e.message);
    } finally {
      setLocating(false);
    }
  };

  const typing = query.trim().length >= 3;

  return (
    <>
      <Progress step={2} onBack={onBack} />
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Chip
          icon={<CategoryIcon category={category} />}
          label={category}
          onClick={onBack}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ fontWeight: 600, maxWidth: "100%" }}
        />
      </Stack>
      <Typography variant="h4" sx={{ fontSize: { xs: 26, md: 32 }, mb: 0.75 }}>Usta hara gəlsin?</Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }} noWrap={Boolean(problem)} title={problem || undefined}>
        {problem ? `“${problem}”` : "Yaxınlığınızdakı aktiv ustaları göstərək."}
      </Typography>

      <Button
        fullWidth
        size="large"
        variant="contained"
        startIcon={locating ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
        onClick={locate}
        disabled={locating}
        sx={{ py: 1.5, borderRadius: 3, fontSize: 16 }}
      >
        {locating ? "Yeriniz təyin edilir..." : "Yerimi avtomatik tap"}
      </Button>
      {gpsError && <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.75 }}>{gpsError} Ünvanı aşağıda yaza bilərsiniz.</Typography>}

      <Divider sx={{ my: 2, color: "text.secondary", fontSize: 13 }}>və ya</Divider>

      <TextField
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && results[0] && onPick({ ...results[0], source: "search" })}
        placeholder="Küçə, məhəllə və ya metro"
        inputProps={{ "aria-label": "Ünvanı yazın", maxLength: 120 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><PlaceOutlinedIcon color="action" /></InputAdornment>,
          endAdornment: searching ? (
            <InputAdornment position="end"><CircularProgress size={18} /></InputAdornment>
          ) : query ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setQuery("")} aria-label="Təmizlə"><CloseIcon fontSize="small" /></IconButton>
            </InputAdornment>
          ) : null,
          sx: { borderRadius: 3, bgcolor: "background.paper" },
        }}
      />

      <Box sx={{ mt: 1.5 }}>
        {typing ? (
          results.length > 0 ? (
            <List disablePadding sx={{ border: 1, borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
              {results.map((r, i) => (
                <PlaceRow key={`${r.lat},${r.lng},${i}`} icon={<PlaceOutlinedIcon />} title={r.title} subtitle={r.subtitle} divider={i < results.length - 1} onClick={() => onPick({ ...r, source: "search" })} />
              ))}
            </List>
          ) : (
            !searching && (
              <Typography variant="body2" color={searchError ? "error" : "text.secondary"} sx={{ py: 1 }}>
                {searchError || "Ünvan tapılmadı. Rayon seçin və ya xəritədə nöqtə seçin."}
              </Typography>
            )
          )
        ) : (
          <>
            {recent.length > 0 && (
              <>
                <Typography variant="overline" color="text.secondary">Son ünvanlar</Typography>
                <List disablePadding sx={{ border: 1, borderColor: "divider", borderRadius: 3, overflow: "hidden", mb: 2 }}>
                  {recent.map((r, i) => (
                    <PlaceRow key={r.title} icon={<HistoryIcon />} title={r.title} subtitle={r.subtitle} divider={i < recent.length - 1} onClick={() => onPick({ ...r, source: "recent" })} />
                  ))}
                </List>
              </>
            )}
            <Typography variant="overline" color="text.secondary">Rayon seçin</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 0.5 }}>
              {QUICK_AREAS.map((a) => (
                <Chip key={a.title} label={a.title} variant="outlined" onClick={() => onPick({ ...a, subtitle: "Rayonun mərkəzi", source: "area-list" })} sx={{ bgcolor: "background.paper" }} />
              ))}
            </Box>
          </>
        )}
      </Box>

      <Button fullWidth variant="outlined" startIcon={<MapOutlinedIcon />} onClick={onPickOnMap} sx={{ mt: 2.5, borderRadius: 3, py: 1.1 }}>
        Xəritədə nöqtə seç
      </Button>
    </>
  );
}

/**
 * Giriş sihirbazı: 1) problem/xidmət, 2) yer. Xəritənin üstündə yarımşəffaf örtük kimi açılır.
 * step: 1 | 2
 */
export default function FindWizard({ step, category, problem, counts, onPickCategory, onBack, onPickLocation, onPickOnMap }) {
  return (
    <Box
      sx={{
        position: "absolute", inset: 0, zIndex: 6, overflowY: "auto",
        bgcolor: "rgba(241,245,249,.72)", backdropFilter: "blur(6px)",
        display: "flex", justifyContent: "center", alignItems: "flex-start",
        px: { xs: 1.5, md: 2 }, py: { xs: 1.5, md: "7vh" },
      }}
    >
      <Paper
        key={step}
        elevation={0}
        sx={{
          width: "100%", maxWidth: 580, p: { xs: 2.25, md: 4 }, borderRadius: 5,
          border: 1, borderColor: "divider", boxShadow: "0 24px 60px rgba(15,23,42,.18)",
          animation: "wizardIn .28s ease",
          "@keyframes wizardIn": { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "none" } },
        }}
      >
        {step === 1 ? (
          <ServiceStep initialText={problem} counts={counts} onPick={onPickCategory} />
        ) : (
          <LocationStep category={category} problem={problem} onBack={onBack} onPick={onPickLocation} onPickOnMap={onPickOnMap} />
        )}
      </Paper>
    </Box>
  );
}
