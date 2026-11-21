import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box, Button, Card, CardActionArea, Chip, Container, Grid, InputAdornment, MenuItem,
  Paper, Skeleton, Stack, TextField, Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import api from "../api/client";
import { CITIES, POPULAR_CATEGORIES } from "../constants/data";
import CategoryIcon from "../components/CategoryIcon";
import UserAvatar from "../components/UserAvatar";

const STEPS = [
  { icon: <SearchIcon />, title: "Axtarın", text: "Lazım olan xidməti və şəhəri seçin, siyahıda və ya xəritədə ustalara baxın." },
  { icon: <ChatBubbleOutlineIcon />, title: "Yazışın", text: "Ustaya birbaşa mesaj yazın, işi və qiyməti əvvəlcədən razılaşdırın." },
  { icon: <HowToRegOutlinedIcon />, title: "İşi həll edin", text: "Usta gəlir, işi görür. Hamısı vasitəçisiz və şəffaf." },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [masters, setMasters] = useState(null);

  useEffect(() => {
    api.get("/api/master").then(({ data }) => setMasters(data)).catch(() => setMasters([]));
  }, []);

  const countByCategory = useMemo(() => {
    const counts = {};
    for (const m of masters || []) counts[m.category] = (counts[m.category] || 0) + 1;
    return counts;
  }, [masters]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city) params.set("seher", city);
    navigate(`/ustalar${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <>
      {/* HERO */}
      <Box
        sx={{
          background: "linear-gradient(180deg, #ECFDF5 0%, #F6F8FA 100%)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                icon={<PlaceOutlinedIcon />}
                label={masters ? `${masters.length} usta qeydiyyatdadır` : "Ustalar yüklənir..."}
                sx={{ bgcolor: "#fff", border: 1, borderColor: "divider", mb: 3 }}
              />
              <Typography variant="h2" sx={{ fontSize: { xs: "2.2rem", md: "3.25rem" }, lineHeight: 1.1 }}>
                Evinizdəki işə uyğun{" "}
                <Box component="span" sx={{ color: "primary.main" }}>
                  ustanı
                </Box>{" "}
                dəqiqələr içində tapın
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mt: 2, mb: 4, maxWidth: 540 }}>
                Santexnik, elektrikçi, kondisioner ustası və daha çoxu — yaxınlığınızda, birbaşa yazışma ilə.
              </Typography>

              <Paper
                component="form"
                onSubmit={handleSearch}
                sx={{ p: 1, display: "flex", gap: 1, flexDirection: { xs: "column", sm: "row" }, border: 1, borderColor: "divider", boxShadow: "0 10px 30px rgba(15,23,42,.06)" }}
              >
                <TextField
                  placeholder="Hansı usta lazımdır?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
                  sx={{ "& fieldset": { border: "none" } }}
                />
                <TextField
                  select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  SelectProps={{ displayEmpty: true }}
                  sx={{ minWidth: { sm: 170 }, "& fieldset": { border: "none" } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PlaceOutlinedIcon color="action" /></InputAdornment> }}
                >
                  <MenuItem value="">Bütün şəhərlər</MenuItem>
                  {CITIES.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
                <Button type="submit" variant="contained" size="large" sx={{ px: 4, flexShrink: 0 }}>
                  Axtar
                </Button>
              </Paper>

              <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                {POPULAR_CATEGORIES.slice(0, 4).map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    component={RouterLink}
                    to={`/ustalar?kateqoriya=${encodeURIComponent(c)}`}
                    clickable
                    variant="outlined"
                    sx={{ bgcolor: "#fff" }}
                  />
                ))}
              </Stack>
            </Grid>

            {/* Yeni qoşulan ustalar — real data */}
            <Grid item xs={12} md={5}>
              <Card sx={{ p: 2.5, boxShadow: "0 20px 50px rgba(15,23,42,.08)" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">Yeni qoşulan ustalar</Typography>
                  <Button component={RouterLink} to="/ustalar" size="small" endIcon={<ArrowForwardIcon />}>
                    Hamısı
                  </Button>
                </Stack>
                <Stack spacing={1}>
                  {masters === null
                    ? [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={64} />)
                    : masters.slice(0, 4).map((m) => (
                        <CardActionArea key={m._id} component={RouterLink} to={`/usta/${m._id}`} sx={{ borderRadius: 3, p: 1.25 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <UserAvatar name={`${m.name} ${m.surname}`} size={44} />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle2" noWrap>{m.name} {m.surname}</Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {m.category} · {m.city}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardActionArea>
                      ))}
                  {masters?.length === 0 && (
                    <Typography color="text.secondary" variant="body2">Hələ usta qeydiyyatdan keçməyib.</Typography>
                  )}
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* KATEQORİYALAR */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4">Populyar xidmətlər</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>Ən çox axtarılan usta növləri</Typography>
          </Box>
          <Button component={RouterLink} to="/ustalar" endIcon={<ArrowForwardIcon />} sx={{ display: { xs: "none", sm: "inline-flex" } }}>
            Bütün kateqoriyalar
          </Button>
        </Stack>
        <Grid container spacing={2}>
          {POPULAR_CATEGORIES.map((c) => (
            <Grid item xs={6} sm={4} md={3} key={c}>
              <Card sx={{ height: "100%", "&:hover": { borderColor: "primary.light" } }}>
                <CardActionArea component={RouterLink} to={`/ustalar?kateqoriya=${encodeURIComponent(c)}`} sx={{ p: 2.5, height: "100%" }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: "#ECFDF5", color: "primary.main", display: "grid", placeItems: "center", mb: 1.5 }}>
                    <CategoryIcon category={c} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{c}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {countByCategory[c] ? `${countByCategory[c]} usta` : "Usta axtar"}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* NECƏ İŞLƏYİR */}
      <Box sx={{ bgcolor: "background.paper", borderBlock: 1, borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
          <Typography variant="h4" sx={{ textAlign: "center" }}>Necə işləyir?</Typography>
          <Typography color="text.secondary" sx={{ textAlign: "center", mt: 0.5, mb: 5 }}>
            Üç sadə addım
          </Typography>
          <Grid container spacing={4}>
            {STEPS.map((s, i) => (
              <Grid item xs={12} md={4} key={s.title}>
                <Stack alignItems="center" sx={{ textAlign: "center" }}>
                  <Box sx={{ position: "relative", mb: 2 }}>
                    <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: "primary.main", color: "#fff", display: "grid", placeItems: "center", "& svg": { fontSize: 28 } }}>
                      {s.icon}
                    </Box>
                    <Box sx={{ position: "absolute", top: -4, right: -4, width: 26, height: 26, borderRadius: "50%", bgcolor: "secondary.main", color: "#1F2937", fontWeight: 800, fontSize: 13, display: "grid", placeItems: "center", border: "3px solid #fff" }}>
                      {i + 1}
                    </Box>
                  </Box>
                  <Typography variant="h6">{s.title}</Typography>
                  <Typography color="text.secondary" sx={{ maxWidth: 300 }}>{s.text}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* XƏRİTƏ + USTA CTA */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column" }}>
              <MapOutlinedIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h5">Yaxınlığınızdakı ustaları xəritədə görün</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mb: 3, flex: 1 }}>
                Yerinizi paylaşın — ustalar sizə olan məsafəyə görə sıralansın.
              </Typography>
              <Box>
                <Button component={RouterLink} to="/" variant="outlined" endIcon={<ArrowForwardIcon />}>
                  Xəritəni aç
                </Button>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: "100%", bgcolor: "primary.main", color: "#fff", border: "none", display: "flex", flexDirection: "column" }}>
              <Typography variant="overline" sx={{ color: "secondary.light", fontWeight: 700 }}>Ustalar üçün</Typography>
              <Typography variant="h5">Bacarığınızı müştərilərə göstərin</Typography>
              <Typography sx={{ mt: 1, mb: 3, opacity: 0.85, flex: 1 }}>
                Pulsuz profil yaradın, işlərinizi paylaşın və müştərilərdən birbaşa mesaj alın.
              </Typography>
              <Box>
                <Button component={RouterLink} to="/qeydiyyat?rol=usta" variant="contained" color="secondary" endIcon={<ArrowForwardIcon />}>
                  Usta kimi qoşul
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
