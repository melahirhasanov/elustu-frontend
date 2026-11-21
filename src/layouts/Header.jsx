import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar, Badge, Box, Button, Container, Divider, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Menu, MenuItem, Stack, Toolbar, Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HandymanIcon from "@mui/icons-material/Handyman";
import SearchIcon from "@mui/icons-material/Search";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import { logout, selectDisplayName } from "../store/authSlice";
import UserAvatar from "../components/UserAvatar";
import socketService from "../api/socket";
import useUnreadMessages from "../hooks/useUnreadMessages";
import usePendingOrders from "../hooks/usePendingOrders";

export function Logo() {
  return (
    <Stack component={RouterLink} to="/" direction="row" alignItems="center" spacing={1}
      sx={{ textDecoration: "none", color: "text.primary" }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: "primary.main", color: "#fff", display: "grid", placeItems: "center" }}>
        <HandymanIcon fontSize="small" />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
        Usta<Box component="span" sx={{ color: "secondary.main" }}>.az</Box>
      </Typography>
    </Stack>
  );
}

const NAV = [
  { label: "Xəritə", to: "/", icon: <MapOutlinedIcon /> },
  { label: "Ustalar", to: "/ustalar", icon: <SearchIcon /> },
  { label: "Sifarişlər", to: "/sifarisler", icon: <AssignmentOutlinedIcon />, auth: true, badge: "orders" },
  { label: "Haqqımızda", to: "/haqqimizda", icon: <InfoOutlinedIcon />, wideOnly: true },
];

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useSelector((s) => s.auth);
  const displayName = useSelector(selectDisplayName);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const unread = useUnreadMessages();
  const pendingOrders = usePendingOrders();
  const isAdmin = role === "admin";
  const nav = isAdmin
    ? [NAV[0], { label: "Admin panel", to: "/admin", icon: <AdminPanelSettingsOutlinedIcon /> }]
    : NAV.filter((item) => !item.auth || user);
  const badgeFor = (item) => (item.badge === "orders" ? pendingOrders : 0);

  const go = (to) => {
    setMenuAnchor(null);
    setDrawerOpen(false);
    navigate(to);
  };

  const handleLogout = () => {
    socketService.disconnect();
    dispatch(logout());
    go("/");
  };

  const isActive = (item) => (item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to));

  const navLinkSx = (item) => ({
    color: isActive(item) ? "primary.main" : "text.secondary",
    bgcolor: isActive(item) ? "rgba(15,118,110,.08)" : "transparent",
    fontWeight: 600,
  });

  return (
    <AppBar position="sticky" sx={{ bgcolor: "rgba(255,255,255,.9)", backdropFilter: "blur(8px)", borderBottom: 1, borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2, minHeight: { xs: 60, md: 68 } }}>
          <Logo />

          <Stack direction="row" spacing={0.5} sx={{ ml: 3, display: { xs: "none", md: "flex" } }}>
            {nav.map((item) => (
              <Button key={item.label} component={RouterLink} to={item.to} sx={{ ...navLinkSx(item), display: item.wideOnly ? { md: "none", lg: "inline-flex" } : undefined, whiteSpace: "nowrap" }}>
                <Badge badgeContent={badgeFor(item)} color="secondary" sx={{ "& .MuiBadge-badge": { right: -10, top: 2 } }}>
                  {item.label}
                </Badge>
              </Button>
            ))}
          </Stack>

          <Box sx={{ flex: 1 }} />

          {user ? (
            <Stack direction="row" spacing={1} alignItems="center">
              {!isAdmin && <IconButton component={RouterLink} to="/mesajlar" aria-label="Mesajlar">
                <Badge badgeContent={unread} color="secondary" max={99}>
                  <ChatBubbleOutlineIcon />
                </Badge>
              </IconButton>}
              <Button
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ color: "text.primary", pl: 0.5, pr: 1, borderRadius: 99 }}
                startIcon={<UserAvatar name={displayName} size={32} />}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName}
                </Box>
              </Button>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { mt: 1, minWidth: 220, border: 1, borderColor: "divider" } } }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2">{displayName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isAdmin ? "Administrator" : role === "master" ? "Usta hesabı" : "Müştəri hesabı"}
                  </Typography>
                </Box>
                <Divider />
                {isAdmin && (
                  <MenuItem onClick={() => go("/admin")}>
                    <ListItemIcon><AdminPanelSettingsOutlinedIcon fontSize="small" /></ListItemIcon>
                    Admin panel
                  </MenuItem>
                )}
                {!isAdmin && <MenuItem onClick={() => go("/profil")}>
                  <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                  Profilim
                </MenuItem>}
                {!isAdmin && <MenuItem onClick={() => go("/sifarisler")}>
                  <ListItemIcon><AssignmentOutlinedIcon fontSize="small" /></ListItemIcon>
                  Sifarişlər
                  {pendingOrders > 0 && <Badge badgeContent={pendingOrders} color="secondary" sx={{ ml: "auto", mr: 1 }} />}
                </MenuItem>}
                {!isAdmin && <MenuItem onClick={() => go("/mesajlar")}>
                  <ListItemIcon><ChatBubbleOutlineIcon fontSize="small" /></ListItemIcon>
                  Mesajlar
                  {unread > 0 && <Badge badgeContent={unread} color="secondary" sx={{ ml: "auto", mr: 1 }} />}
                </MenuItem>}
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                  <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                  Çıxış
                </MenuItem>
              </Menu>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
              <Button component={RouterLink} to="/qeydiyyat?rol=usta" color="inherit" sx={{ color: "text.secondary", display: { md: "none", lg: "inline-flex" }, whiteSpace: "nowrap" }}>
                Usta kimi qoşul
              </Button>
              <Button component={RouterLink} to="/giris" variant="outlined">
                Daxil ol
              </Button>
              <Button component={RouterLink} to="/qeydiyyat" variant="contained">
                Qeydiyyat
              </Button>
            </Stack>
          )}

          <IconButton sx={{ display: { md: "none" } }} onClick={() => setDrawerOpen(true)} aria-label="Menyu">
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Logo />
          <List sx={{ mt: 2 }}>
            {nav.map((item) => (
              <ListItemButton key={item.label} onClick={() => go(item.to)} sx={{ borderRadius: 2 }}>
                <ListItemIcon>
                  <Badge badgeContent={badgeFor(item)} color="secondary">{item.icon}</Badge>
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
            {user && (
              <ListItemButton onClick={() => go("/mesajlar")} sx={{ borderRadius: 2 }}>
                <ListItemIcon><ChatBubbleOutlineIcon /></ListItemIcon>
                <ListItemText primary="Mesajlar" />
              </ListItemButton>
            )}
          </List>
          <Divider sx={{ my: 1 }} />
          {user ? (
            <List>
              <ListItemButton onClick={() => go("/profil")} sx={{ borderRadius: 2 }}>
                <ListItemIcon><PersonOutlineIcon /></ListItemIcon>
                <ListItemText primary="Profilim" />
              </ListItemButton>
              <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: "error.main" }}>
                <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                <ListItemText primary="Çıxış" />
              </ListItemButton>
            </List>
          ) : (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Button variant="contained" onClick={() => go("/qeydiyyat")}>Qeydiyyat</Button>
              <Button variant="outlined" onClick={() => go("/giris")}>Daxil ol</Button>
              <Button startIcon={<EngineeringOutlinedIcon />} onClick={() => go("/qeydiyyat?rol=usta")}>
                Usta kimi qoşul
              </Button>
            </Stack>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
}
