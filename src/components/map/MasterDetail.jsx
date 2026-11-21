import { useSelector } from "react-redux";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Badge, Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import NearMeOutlinedIcon from "@mui/icons-material/NearMeOutlined";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import UserAvatar from "../UserAvatar";
import CategoryIcon from "../CategoryIcon";
import RatingBadge from "../RatingBadge";
import CallButton from "../../calls/CallButton";
import { distanceText, formatDistance } from "./mapUtils";
import ReviewsSection from "../reviews/ReviewsSection";

// Xəritədə seçilmiş ustanın kartı: əsas məlumat və hərəkətlər (sifariş, zəng, mesaj, profil)
export default function MasterDetail({ master, distance, duration, isRoad, online, onBack, onOrder }) {
  const { user, role } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const fullName = `${master.name} ${master.surname}`;
  const isSelf = role === "master" && user?.id === master._id;
  const canOrder = role !== "master";

  const order = () => {
    if (!user) return navigate("/giris", { state: { from: location.pathname } });
    onOrder(master);
  };

  return (
    <Box sx={{ p: 2.5 }}>
      {onBack && (
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} size="small" sx={{ mb: 1.5, ml: -1 }} color="inherit">
          Siyahıya qayıt
        </Button>
      )}
      <Stack direction="row" spacing={2} alignItems="center">
        <Badge overlap="circular" variant="dot" invisible={!online} color="success" anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{ "& .MuiBadge-dot": { width: 14, height: 14, borderRadius: "50%", border: "2px solid #fff" } }}>
          <UserAvatar name={fullName} size={64} />
        </Badge>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ lineHeight: 1.2 }}>{fullName}</Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: "primary.main", mt: 0.25 }}>
            <CategoryIcon category={master.category} sx={{ fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{master.category}</Typography>
          </Stack>
          <Box sx={{ mt: 0.5 }}><RatingBadge master={master} /></Box>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
        <Chip size="small" icon={<PlaceOutlinedIcon />} label={master.city} variant="outlined" />
        {distance != null && (
          <Chip
            size="small"
            icon={isRoad ? <DirectionsCarOutlinedIcon /> : <NearMeOutlinedIcon />}
            label={isRoad ? `Yolla ${distanceText(distance, duration, true)}` : `Düz xətt ${formatDistance(distance)}`}
            color="primary"
            variant="outlined"
          />
        )}
        {master.experience > 0 && <Chip size="small" icon={<WorkHistoryOutlinedIcon />} label={`${master.experience} il`} variant="outlined" />}
        {master.completedOrders > 0 && <Chip size="small" icon={<TaskAltIcon />} label={`${master.completedOrders} iş`} variant="outlined" />}
        <Chip size="small" label={online ? "Onlayn" : "Oflayn"} color={online ? "success" : "default"} variant={online ? "filled" : "outlined"} />
      </Stack>

      {master.bio && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {master.bio}
        </Typography>
      )}

      {!isSelf && (
        <Stack spacing={1} sx={{ mt: 2.5 }}>
          {canOrder && (
            <Button variant="contained" size="large" startIcon={<AssignmentOutlinedIcon />} onClick={order}>
              Sifariş ver
            </Button>
          )}
          <Stack direction="row" spacing={1}>
            <Box sx={{ flex: 1, "& > span, & button": { width: "100%" } }}>
              <CallButton peerId={master._id} peerName={fullName} online={online} />
            </Box>
            <Button variant="outlined" startIcon={<ChatBubbleOutlineIcon />} component={RouterLink} to={`/mesajlar?usta=${master._id}`} sx={{ flex: 1 }}>
              Mesaj
            </Button>
          </Stack>
        </Stack>
      )}
      <Button component={RouterLink} to={`/usta/${master._id}`} fullWidth sx={{ mt: 1 }}>
        Profilə və işlərinə bax
      </Button>

      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" sx={{ mb: 1.5 }}>Reytinq və rəylər</Typography>
      <ReviewsSection masterId={master._id} compact />
    </Box>
  );
}

// Siyahıdakı kompakt sətir
export function MasterRow({ master, distance, duration, online, selected, onClick }) {
  const fullName = `${master.name} ${master.surname}`;
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex", gap: 1.5, alignItems: "center", px: 2, py: 1.5, cursor: "pointer",
        borderBottom: 1, borderColor: "divider",
        bgcolor: selected ? "rgba(15,118,110,.08)" : "transparent",
        "&:hover": { bgcolor: "rgba(15,118,110,.05)" },
      }}
    >
      <Badge overlap="circular" variant="dot" invisible={!online} color="success" anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <UserAvatar name={fullName} size={44} />
      </Badge>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Typography variant="subtitle2" noWrap>{fullName}</Typography>
          {distance != null && (
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
              {distanceText(distance, duration, duration != null)}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary" noWrap>{master.category} · {master.city}</Typography>
          <RatingBadge master={master} showCount={false} />
        </Stack>
      </Box>
    </Box>
  );
}
