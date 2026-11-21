import { useEffect, useState } from "react";
import { Box, Button, Collapse, LinearProgress, Skeleton, Stack, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import api from "../../api/client";
import { Stars } from "../RatingBadge";
import { formatDate } from "../../utils/date";

// Şəffaf reytinq: orta bal, paylanma (5★…1★), hesablama qaydası və rəylər.
// compact=true — xəritə kartında qısa görünüş (ilk 3 rəy)
export default function ReviewsSection({ masterId, compact = false }) {
  const [data, setData] = useState(null);
  const [showHow, setShowHow] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setData(null);
    api.get(`/api/orders/reviews/${masterId}`)
      .then(({ data }) => setData(data))
      .catch(() => setData({ summary: { average: 0, count: 0, distribution: {}, completedOrders: 0 }, reviews: [] }));
  }, [masterId]);

  if (!data) return <Skeleton variant="rounded" height={compact ? 90 : 160} />;

  const { summary, reviews } = data;
  const shown = compact ? reviews.slice(0, 3) : showAll ? reviews : reviews.slice(0, 5);

  return (
    <Box>
      <Stack direction="row" spacing={2.5} alignItems="center">
        <Box sx={{ textAlign: "center", minWidth: 84 }}>
          <Typography sx={{ fontSize: compact ? 32 : 40, fontWeight: 800, lineHeight: 1 }}>
            {summary.count ? summary.average.toFixed(1) : "—"}
          </Typography>
          <Stars value={summary.average} />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            {summary.count} rəy
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const n = summary.distribution?.[star] || 0;
            const pct = summary.count ? (n / summary.count) * 100 : 0;
            return (
              <Stack key={star} direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" sx={{ width: 22, fontWeight: 600 }}>{star}★</Typography>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{ flex: 1, height: 7, borderRadius: 4, bgcolor: "#EEF2F6", "& .MuiLinearProgress-bar": { bgcolor: "secondary.main", borderRadius: 4 } }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ width: 22, textAlign: "right" }}>{n}</Typography>
              </Stack>
            );
          })}
        </Box>
      </Stack>

      <Button size="small" startIcon={<InfoOutlinedIcon />} onClick={() => setShowHow((v) => !v)} sx={{ mt: 1, px: 0.5 }} color="inherit">
        Reytinq necə hesablanır?
      </Button>
      <Collapse in={showHow}>
        <Box sx={{ p: 1.5, bgcolor: "#F1F5F9", borderRadius: 2, mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Reytinq yalnız <b>tamamlanmış sifarişlərdən</b> sonra həmin sifarişin müştərisinin yazdığı rəylərdən hesablanır —
            hər sifarişə bir rəy. Heç bir gizli əmsal və ya pullu yüksəltmə yoxdur, sadə ortadır:
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontFamily: "monospace" }}>
            {summary.count
              ? `${summary.sum} ulduz ÷ ${summary.count} rəy = ${summary.average.toFixed(1)}`
              : "Hələ rəy yoxdur — usta “Yeni usta” kimi göstərilir"}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Tamamlanmış sifariş: {summary.completedOrders} · Rəy yazılan: {summary.count}
          </Typography>
        </Box>
      </Collapse>

      {shown.length > 0 && (
        <Stack spacing={1.75} sx={{ mt: 2 }}>
          {shown.map((r) => (
            <Box key={r._id} sx={{ pb: 1.5, borderBottom: 1, borderColor: "divider", "&:last-of-type": { borderBottom: 0, pb: 0 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Typography variant="subtitle2">{r.customerName}</Typography>
                  <VerifiedOutlinedIcon sx={{ fontSize: 15, color: "success.main" }} titleAccess="Təsdiqlənmiş sifariş" />
                </Stack>
                <Typography variant="caption" color="text.secondary">{formatDate(r.createdAt)}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Stars value={r.rating} />
                <Typography variant="caption" color="text.secondary">{r.category}</Typography>
              </Stack>
              {r.comment && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{r.comment}</Typography>}
            </Box>
          ))}
        </Stack>
      )}
      {!compact && reviews.length > 5 && (
        <Button size="small" onClick={() => setShowAll((v) => !v)} sx={{ mt: 1 }}>
          {showAll ? "Daha az göstər" : `Bütün rəylər (${reviews.length})`}
        </Button>
      )}
      {summary.count === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Hələ rəy yoxdur. Rəylər yalnız tamamlanmış sifarişlərdən sonra yazılır.
        </Typography>
      )}
    </Box>
  );
}
