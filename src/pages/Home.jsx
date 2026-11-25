import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, Navigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Button, Card, CardActionArea, Chip, Container,
  Grid, Stack, Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditNoteIcon from "@mui/icons-material/EditNote";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PhoneDisabledOutlinedIcon from "@mui/icons-material/PhoneDisabledOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import SensorsIcon from "@mui/icons-material/Sensors";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import api from "../api/client";
import { CATEGORIES, POPULAR_CATEGORIES } from "../constants/data";
import CategoryIcon from "../components/CategoryIcon";

const FIND = "/tap";
const findFor = (category) => `${FIND}?xidmet=${encodeURIComponent(category)}`;

const STEPS = [
  { icon: <EditNoteIcon />, title: "Problemi yaz", text: "“Kombi xəta verir”, “işıq sönüb” — öz sözlərinlə yaz, uyğun ustanı sistem özü tapır." },
  { icon: <MyLocationIcon />, title: "Yerini seç", text: "Bir toxunuşla avtomatik və ya ünvanı yazaraq. Yalnız 20 km-dəki aktiv ustalar göstərilir." },
  { icon: <StarRoundedIcon />, title: "Ustanı seç", text: "Reytinqə, rəylərə və real yol məsafəsinə bax. Yaz və ya saytdan zəng et." },
  { icon: <DirectionsCarFilledIcon />, title: "Sifariş ver, izlə", text: "Usta qəbul edir, yola çıxır — gəlişini xəritədə canlı izləyirsən." },
];

const FEATURES = [
  { icon: <VerifiedOutlinedIcon />, title: "Şəffaf reytinq", text: "Rəyi yalnız işi tamamlanmış müştəri yaza bilər. Hər ulduzun haradan gəldiyi görünür." },
  { icon: <PhoneDisabledOutlinedIcon />, title: "Nömrən gizli qalır", text: "Ustaya saytdan zəng edirsən — telefon nömrəsi heç kimlə paylaşılmır." },
  { icon: <RouteOutlinedIcon />, title: "Real məsafə", text: "Məsafə və vaxt quş uçuşu ilə yox, real yollarla hesablanır." },
  { icon: <SensorsIcon />, title: "Canlı izləmə", text: "Usta yola çıxanda harada olduğunu və nə vaxt çatacağını görürsən." },
];

const FAQ = [
  ["Əlüstü pulsuzdur?", "Bəli. Usta axtarmaq, yazışmaq, zəng etmək və sifariş vermək müştəri üçün tam pulsuzdur. İşin qiymətini usta ilə birbaşa razılaşırsan."],
  ["Ödənişi necə edirəm?", "Ödəniş iş bitəndən sonra birbaşa ustaya edilir. Usta sifarişi qəbul edərkən təxmini qiyməti yazır, sürpriz olmur."],
  ["Telefon nömrəm görünür?", "Xeyr. Zənglər sayt üzərindən gedir, yazışma da saytdadır — nə sənin, nə də ustanın nömrəsi paylaşılmır."],
  ["Usta gəlməsə və ya iş pis olsa?", "Sifarişin içindən bir kliklə şikayət göndərə bilərsən — komanda araşdırır. Rəyin də ustanın reytinqinə təsir edir."],
];

function useStats() {
  const [masters, setMasters] = useState(null);
  useEffect(() => {
    api.get("/api/master").then(({ data }) => setMasters(data)).catch(() => setMasters([]));
  }, []);
  return useMemo(() => {
    if (!masters) return null;
    const real = masters.filter((m) => !m.isDemo); // nümunə profillər sayılmır
    const active = real.filter((m) => m.isAvailable !== false);
    const counts = {};
    active.forEach((m) => (counts[m.category] = (counts[m.category] || 0) + 1));
    return {
      masters: real.length,
      active: active.length,
      counts,
    };
  }, [masters]);
}

// Sağ tərəfdəki vizual: tətbiqdən kiçik "kəsiklər" (usta kartı, izləmə)
function HeroVisual() {
  const card = { bgcolor: "background.paper", borderRadius: 4, boxShadow: "0 20px 50px rgba(15,23,42,.14)", border: 1, borderColor: "divider" };
  return (
    <Box sx={{ position: "relative", height: { xs: 330, md: 420 }, maxWidth: 440, mx: "auto" }}>
      {/* xəritə fonu */}
      <Box sx={{
        position: "absolute", inset: { xs: "10px 20px 40px", md: "0 30px 60px" }, borderRadius: 6, overflow: "hidden",
        background: (t) => `linear-gradient(135deg, ${t.vars.palette.surface.tint} 0%, ${t.vars.palette.surface.subtle} 100%)`, border: 1, borderColor: "divider",
      }}>
        <svg width="100%" height="100%" viewBox="0 0 300 320" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-10 90 L310 130 M-10 230 L310 190 M70 -10 L110 330 M210 -10 L190 330" stroke="var(--mui-palette-background-paper)" strokeWidth="14" fill="none" />
          <path d="M-10 90 L310 130 M-10 230 L310 190 M70 -10 L110 330 M210 -10 L190 330" stroke="var(--mui-palette-divider)" strokeWidth="1.5" fill="none" />
          <path d="M200 70 C180 120 150 150 120 210" stroke="var(--mui-palette-primary-main)" strokeWidth="4" strokeDasharray="8 7" fill="none" />
          <circle cx="120" cy="212" r="11" fill="#0F172A" stroke="#fff" strokeWidth="4" />
        </svg>
        <Box sx={{
          position: "absolute", left: "63%", top: "17%", width: 40, height: 40, borderRadius: "50%", bgcolor: "secondary.main",
          display: "grid", placeItems: "center", border: "3px solid #fff", color: "#422006",
          animation: "heroPulse 1.8s infinite", "@keyframes heroPulse": { "0%": { boxShadow: "0 0 0 0 rgba(245,158,11,.55)" }, "100%": { boxShadow: "0 0 0 18px rgba(245,158,11,0)" } },
        }}>
          <DirectionsCarFilledIcon sx={{ fontSize: 22 }} />
        </Box>
      </Box>

      {/* usta kartı */}
      <Box sx={{ ...card, position: "absolute", left: 0, bottom: { xs: 0, md: 10 }, width: { xs: 250, md: 280 }, p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: "primary.main", fontWeight: 800 }}>RH</Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" noWrap>Rauf H. · Kombi ustası</Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <StarRoundedIcon sx={{ color: "secondary.main", fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>4.9</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>· 12 rəy · 2.1 km</Typography>
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Chip size="small" icon={<CallOutlinedIcon />} label="Zəng" variant="outlined" />
          <Chip size="small" icon={<ChatBubbleOutlineIcon />} label="Mesaj" variant="outlined" />
          <Chip size="small" label="Sifariş" color="primary" />
        </Stack>
      </Box>

      {/* izləmə bildirişi */}
      <Box sx={{ ...card, position: "absolute", right: 0, top: { xs: 0, md: 24 }, px: 1.75, py: 1.25, display: "flex", alignItems: "center", gap: 1.25, bgcolor: "surface.warm" }}>
        <SensorsIcon sx={{ color: "secondary.dark" }} />
        <Box>
          <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>Usta yoldadır</Typography>
          <Typography variant="caption" color="text.secondary">~6 dəqiqəyə çatır</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function Home() {
  const [params] = useSearchParams();
  const stats = useStats();
  const { hash } = useLocation();

  // Başqa səhifədən "/#nece-isleyir" linki ilə gələndə həmin bölməyə sürüşdür
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 100);
    return () => clearTimeout(t);
  }, [hash]);

  // Köhnə paylaşılmış linklər (/?xidmet=..&lat=..) usta axtarışına yönləndirilir
  if (params.get("xidmet") || params.get("lat")) return <Navigate to={`${FIND}?${params}`} replace />;

  return (
    <>
      {/* HERO */}
      <Box sx={{ background: (t) => `linear-gradient(180deg, ${t.vars.palette.surface.tint} 0%, ${t.vars.palette.background.default} 100%)`, borderBottom: 1, borderColor: "divider", overflow: "hidden" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 9 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                icon={<Box component="span" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#22C55E", ml: "10px !important" }} />}
                label={stats ? `Hazırda ${stats.active} usta sifariş qəbul edir` : "Ustalar yüklənir..."}
                sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider", mb: 2.5, fontWeight: 600 }}
              />
              <Typography variant="h2" sx={{ fontSize: { xs: "2.3rem", md: "3.4rem" }, lineHeight: 1.08, letterSpacing: "-0.03em", fontWeight: 800 }}>
                Usta lazımdır?{" "}
                <Box component="span" sx={{ color: "primary.main", display: "block" }}>
                  Əl<Box component="span" sx={{ color: "secondary.main" }}>üstü</Box>.
                </Box>
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mt: 2, mb: 3.5, maxWidth: 520, lineHeight: 1.5 }}>
                Problemi yaz, yaxınlıqdakı reytinqli ustanı tap, yaz və ya zəng et — gəlişini xəritədə izlə.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button component={RouterLink} to={FIND} variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ px: 4, py: 1.5, fontSize: 17, borderRadius: 3 }}>
                  Usta tap
                </Button>
                <Button href="#nece-isleyir" variant="outlined" size="large" sx={{ py: 1.5, borderRadius: 3, bgcolor: "background.paper" }}>
                  Necə işləyir?
                </Button>
              </Stack>
              <Stack direction="row" spacing={2.5} sx={{ mt: 3, color: "text.secondary" }} flexWrap="wrap" useFlexGap>
                {["Pulsuz", "Nömrən gizli qalır", "Şəffaf reytinq"].map((t) => (
                  <Stack key={t} direction="row" spacing={0.75} alignItems="center">
                    <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{t}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <HeroVisual />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* XİDMƏTLƏR */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Nə lazımdır?</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>Xidməti seç — yaxınlıqdakı ustalar dərhal xəritədə</Typography>
          </Box>
          <Button component={RouterLink} to={FIND} endIcon={<ArrowForwardIcon />} sx={{ display: { xs: "none", sm: "inline-flex" } }}>
            Bütün {CATEGORIES.length} xidmət
          </Button>
        </Stack>
        <Grid container spacing={1.5}>
          {POPULAR_CATEGORIES.map((c) => (
            <Grid item xs={6} sm={4} md={3} key={c}>
              <Card sx={{ height: "100%", transition: "border-color .15s, transform .15s", "&:hover": { borderColor: "primary.main", transform: "translateY(-3px)", boxShadow: "0 12px 28px rgba(15,23,42,.10)" } }}>
                <CardActionArea component={RouterLink} to={findFor(c)} sx={{ p: 2.25, height: "100%" }}>
                  <Box sx={{ width: 46, height: 46, borderRadius: 3, bgcolor: "surface.tint", color: "primary.main", display: "grid", placeItems: "center", mb: 1.25 }}>
                    <CategoryIcon category={c} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1.3, fontWeight: 700 }}>{c}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats?.counts[c] ? `${stats.counts[c]} aktiv usta` : "Usta axtar"}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Button component={RouterLink} to={FIND} fullWidth variant="outlined" sx={{ mt: 2, display: { sm: "none" } }}>
          Bütün {CATEGORIES.length} xidmət
        </Button>
      </Container>

      {/* NECƏ İŞLƏYİR */}
      <Box id="nece-isleyir" sx={{ bgcolor: "background.paper", borderBlock: 1, borderColor: "divider", scrollMarginTop: 72 }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <Typography variant="h4" sx={{ textAlign: "center", fontWeight: 800 }}>Necə işləyir?</Typography>
          <Typography color="text.secondary" sx={{ textAlign: "center", mt: 0.5, mb: 5 }}>Problemdən həllə qədər 4 addım</Typography>
          <Grid container spacing={3}>
            {STEPS.map((s, i) => (
              <Grid item xs={12} sm={6} md={3} key={s.title}>
                <Stack sx={{ height: "100%", p: 2.5, borderRadius: 4, bgcolor: "surface.subtle", border: 1, borderColor: "divider" }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: "primary.main", color: "primary.contrastText", display: "grid", placeItems: "center" }}>{s.icon}</Box>
                    <Typography sx={{ fontWeight: 900, fontSize: 34, color: "surface.muted", lineHeight: 1 }}>0{i + 1}</Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{s.title}</Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>{s.text}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button component={RouterLink} to={FIND} variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 3, px: 4 }}>
              İndi sına
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ÜSTÜNLÜKLƏR + RƏQƏMLƏR */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Niyə Əlüstü?</Typography>
        <Grid container spacing={2}>
          {FEATURES.map((f) => (
            <Grid item xs={12} sm={6} md={3} key={f.title}>
              <Card sx={{ p: 2.5, height: "100%" }}>
                <Box sx={{ color: "primary.main", mb: 1, "& svg": { fontSize: 30 } }}>{f.icon}</Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>{f.text}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {[
            [stats?.masters, "qeydiyyatlı usta"],
            [CATEGORIES.length, "xidmət növü"],
            ["0 ₼", "müştəri üçün haqq"],
          ].map(([value, label]) => (
            <Grid item xs={4} key={label}>
              <Box sx={{ textAlign: "center", py: { xs: 2, md: 3 }, borderRadius: 4, bgcolor: "surface.tint" }}>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: 26, md: 40 }, color: "primary.main", lineHeight: 1.1 }}>{value ?? "—"}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* USTALAR ÜÇÜN + SUALLAR */}
      <Box sx={{ bgcolor: "background.paper", borderTop: 1, borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Card sx={{ p: { xs: 3, md: 4 }, height: "100%", bgcolor: "primary.dark", color: "#fff", border: "none", display: "flex", flexDirection: "column" }}>
                <Typography variant="overline" sx={{ color: "secondary.light", fontWeight: 800 }}>Ustalar üçün</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Yaxınlığındakı müştərilər səni gözləyir</Typography>
                <Stack spacing={1} sx={{ mt: 2, mb: 3, flex: 1 }}>
                  {["Pulsuz profil, işlərini şəkil və videoyla göstər", "Sifarişləri qəbul et, qiyməti özün yaz", "Yaxşı rəylər — daha çox müştəri"].map((t) => (
                    <Stack key={t} direction="row" spacing={1} alignItems="flex-start">
                      <CheckCircleRoundedIcon sx={{ fontSize: 20, color: "secondary.light", mt: "1px" }} />
                      <Typography sx={{ opacity: 0.92 }}>{t}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Box>
                  <Button component={RouterLink} to="/qeydiyyat?rol=usta" variant="contained" color="secondary" endIcon={<ArrowForwardIcon />}>
                    Usta kimi qoşul
                  </Button>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Tez-tez verilən suallar</Typography>
              {FAQ.map(([q, a]) => (
                <Accordion key={q} disableGutters elevation={0} sx={{ border: 1, borderColor: "divider", "&:not(:last-of-type)": { borderBottom: 0 }, "&:before": { display: "none" } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 700 }}>{q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>{a}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SON ÇAĞIRIŞ */}
      <Box sx={{ bgcolor: "#0B3B36", color: "#fff" }}>
        <Container maxWidth="md" sx={{ py: { xs: 6, md: 7 }, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Bir şey xarab oldu?</Typography>
          <Typography sx={{ mt: 1, mb: 3, color: "#99F6E4" }}>Usta bir neçə dəqiqəyə tapılır.</Typography>
          <Button component={RouterLink} to={FIND} variant="contained" color="secondary" size="large" endIcon={<ArrowForwardIcon />} sx={{ px: 5, py: 1.5, borderRadius: 3, fontSize: 17 }}>
            Usta tap
          </Button>
        </Container>
      </Box>
    </>
  );
}
