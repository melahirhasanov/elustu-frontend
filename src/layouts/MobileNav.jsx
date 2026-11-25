import { useSelector } from "react-redux";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Badge, BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import useUnreadMessages from "../hooks/useUnreadMessages";
import usePendingOrders from "../hooks/usePendingOrders";

// Telefonda əsas bölmələr baş barmağın altında
export default function MobileNav() {
  const { pathname } = useLocation();
  const { user, role } = useSelector((s) => s.auth);
  const unread = useUnreadMessages();
  const pending = usePendingOrders();
  if (role === "admin" || pathname.startsWith("/admin")) return null;

  const items = [
    ["/", "Ana səhifə", <HomeOutlinedIcon key="i" />],
    ["/tap", "Usta tap", <MapOutlinedIcon key="i" />],
    ...(user
      ? [
          ["/sifarisler", "Sifarişlər", <Badge key="i" badgeContent={pending} color="secondary"><AssignmentOutlinedIcon /></Badge>],
          ["/mesajlar", "Mesajlar", <Badge key="i" badgeContent={unread} color="secondary"><ChatBubbleOutlineIcon /></Badge>],
          ["/profil", "Profil", <PersonOutlineIcon key="i" />],
        ]
      : [["/giris", "Daxil ol", <PersonOutlineIcon key="i" />]]),
  ];
  const active = items.find(([to]) => (to === "/" ? pathname === "/" : pathname.startsWith(to)))?.[0] ?? false;

  return (
    <Paper component="nav" aria-label="Əsas bölmələr" square elevation={0} sx={{ display: { md: "none" }, position: "sticky", bottom: 0, zIndex: 1100, borderTop: 1, borderColor: "divider", flexShrink: 0, pb: "env(safe-area-inset-bottom)" }}>
      <BottomNavigation value={active} showLabels sx={{ height: 60, bgcolor: "transparent" }}>
        {items.map(([to, label, icon]) => (
          <BottomNavigationAction key={to} value={to} label={label} icon={icon} component={RouterLink} to={to} sx={{ minWidth: 0, px: 0.5, "& .MuiBottomNavigationAction-label, & .MuiBottomNavigationAction-label.Mui-selected": { fontSize: 11 } }} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
