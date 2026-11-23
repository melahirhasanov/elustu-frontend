import { useEffect, useState } from "react";
import { Box, Card, Grid, LinearProgress, Skeleton, Stack, Typography } from "@mui/material";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import api from "../../api/client";
import { STATUS } from "../../components/orders/orderStatus";

function Stat({ icon, label, value, sub, color = "primary.main", onClick }) {
  return (
    <Card onClick={onClick} sx={{ p: 2.5, height: "100%", cursor: onClick ? "pointer" : "default", "&:hover": onClick ? { borderColor: "primary.light" } : {} }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: "#F1F5F9", color, display: "grid", placeItems: "center" }}>{icon}</Box>
        <Box>
          <Typography variant="h5" sx={{ lineHeight: 1.1 }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </Box>
      </Stack>
    </Card>
  );
}

export default function AdminOverview({ onNavigate }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/api/admin/stats").then(({ data }) => setStats(data)).catch(() => setStats(false));
  }, []);

  if (stats === null) return <Grid container spacing={2}>{[0, 1, 2, 3].map((i) => <Grid item xs={12} sm={6} md={3} key={i}><Skeleton variant="rounded" height={96} /></Grid>)}</Grid>;
  if (stats === false) return <Typography color="error">Statistika yüklənmədi</Typography>;

  const statusOrder = ["pending", "accepted", "on_the_way", "in_progress", "completed", "cancelled", "rejected"];

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Stat icon={<ReportOutlinedIcon />} color="error.main" label="Açıq şikayət" value={stats.complaintsOpen} onClick={() => onNavigate("complaints")} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Stat icon={<AssignmentOutlinedIcon />} label="Sifariş (cəmi)" value={stats.ordersTotal} sub={`Son 7 gün: ${stats.ordersWeek}`} onClick={() => onNavigate("orders")} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Stat icon={<EngineeringOutlinedIcon />} label="Usta" value={stats.masters} sub={`Aktiv: ${stats.availableMasters} · Bloklu: ${stats.blockedMasters}`} onClick={() => onNavigate("masters")} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Stat icon={<PeopleOutlineIcon />} label="Müştəri" value={stats.customers} onClick={() => onNavigate("customers")} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>Sifarişlər statusa görə</Typography>
            <Stack spacing={1.5}>
              {statusOrder.map((s) => {
                const n = stats.orders[s] || 0;
                const pct = stats.ordersTotal ? (n / stats.ordersTotal) * 100 : 0;
                return (
                  <Box key={s}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">{STATUS[s].label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{n}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4, bgcolor: "#EEF2F6" }} />
                  </Box>
                );
              })}
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>Platforma reytinqi</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <StarRoundedIcon sx={{ color: "secondary.main", fontSize: 40 }} />
              <Typography variant="h3">{stats.reviews.count ? stats.reviews.average.toFixed(1) : "—"}</Typography>
            </Stack>
            <Typography color="text.secondary">{stats.reviews.count} rəyin ortası (yalnız tamamlanmış sifarişlərdən)</Typography>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
