import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import {
  Alert, Box, Button, Container, Grid, InputAdornment, MenuItem, Skeleton, Stack,
  TextField, Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import api from "../api/client";
import { CATEGORIES, CITIES } from "../constants/data";
import MasterCard from "../components/MasterCard";
import EmptyState from "../components/EmptyState";
import { distanceKm, getCurrentPosition, masterLatLng } from "../components/map/mapUtils";

export default function Masters() {
  const [params, setParams] = useSearchParams();
  const category = params.get("kateqoriya") || "";
  const city = params.get("seher") || "";
  const q = params.get("q") || "";

  const [search, setSearch] = useState(q);
  const [masters, setMasters] = useState(null);
  const [error, setError] = useState("");
  const [userPosition, setUserPosition] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  // Axtarış sahəsi 350ms gecikmə ilə URL-ə yazılır
  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => updateParam("q", search.trim()), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setMasters(null);
    setError("");
    api
      .get("/api/master", { params: { search: q || undefined, category: category || undefined, city: city || undefined } })
      .then(({ data }) => !cancelled && setMasters(data))
      .catch(() => {
        if (!cancelled) {
          setMasters([]);
          setError("Ustalar yüklənmədi. Serverin işlədiyini yoxlayın.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [q, category, city]);

  const locate = async () => {
    setLocating(true);
    setLocationError("");
    try {
      setUserPosition(await getCurrentPosition());
    } catch (e) {
      setLocationError(e.message);
    } finally {
      setLocating(false);
    }
  };

  // Yer məlumdursa, ustalar məsafəyə görə sıralanır
  const rows = useMemo(() => {
    const list = (masters || []).map((m) => {
      const pos = masterLatLng(m);
      return { master: m, distance: userPosition && pos ? distanceKm(userPosition, pos) : null };
    });
    // Nümunə profillər həmişə real ustalardan sonra
    list.sort((a, b) => Number(Boolean(a.master.isDemo)) - Number(Boolean(b.master.isDemo)) || (userPosition ? (a.distance ?? Infinity) - (b.distance ?? Infinity) : 0));
    return list;
  }, [masters, userPosition]);

  const hasFilters = q || category || city;

  const list = (
    <>
      {masters === null ? (
        <Grid container spacing={2}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={200} />
            </Grid>
          ))}
        </Grid>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<EngineeringOutlinedIcon />}
          title="Usta tapılmadı"
          text={hasFilters ? "Filtrləri dəyişib yenidən yoxlayın." : "Hələ heç bir usta qeydiyyatdan keçməyib."}
          action={hasFilters && <Button variant="outlined" onClick={() => { setSearch(""); setParams({}); }}>Filtrləri sıfırla</Button>}
        />
      ) : (
        <Grid container spacing={2}>
          {rows.map(({ master, distance }) => (
            <Grid item xs={12} sm={6} md={4} key={master._id}>
              <MasterCard master={master} distance={distance} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-end" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Ustalar</Typography>
          <Typography color="text.secondary">
            {masters ? `${masters.filter((m) => !m.isDemo).length} usta tapıldı${masters.some((m) => m.isDemo) ? ` + ${masters.filter((m) => m.isDemo).length} nümunə` : ""}` : "Yüklənir..."}
            {userPosition && " · yaxınlığa görə sıralanıb"}
          </Typography>
        </Box>
        <Button component={RouterLink} to="/tap" variant="outlined" startIcon={<MapOutlinedIcon />} sx={{ bgcolor: "background.paper" }}>
          Xəritədə bax
        </Button>
      </Stack>

      {/* Filtrlər */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 3 }}>
        <TextField
          placeholder="Ad, soyad və ya ixtisas"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
        />
        <TextField select value={category} onChange={(e) => updateParam("kateqoriya", e.target.value)} SelectProps={{ displayEmpty: true }} sx={{ minWidth: { md: 240 } }}>
          <MenuItem value="">Bütün kateqoriyalar</MenuItem>
          {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField select value={city} onChange={(e) => updateParam("seher", e.target.value)} SelectProps={{ displayEmpty: true }} sx={{ minWidth: { md: 180 } }}>
          <MenuItem value="">Bütün şəhərlər</MenuItem>
          {CITIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <Button
          variant={userPosition ? "contained" : "outlined"}
          startIcon={<MyLocationIcon />}
          onClick={locate}
          disabled={locating}
          sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
        >
          {locating ? "Təyin edilir..." : userPosition ? "Yer yeniləndi" : "Yaxınımdakılar"}
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {locationError && <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setLocationError("")}>{locationError}</Alert>}

      {list}
    </Container>
  );
}
