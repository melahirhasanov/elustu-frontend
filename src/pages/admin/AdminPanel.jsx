import { useSearchParams } from "react-router-dom";
import { Box, Container, Tab, Tabs, Typography } from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AdminOverview from "./AdminOverview";
import AdminComplaints from "./AdminComplaints";
import { AdminCustomers, AdminOrders } from "./AdminTables";
import AdminMasters from "./AdminMasters";
import { AdminLogs, AdminPosts, AdminReviews } from "./AdminContent";
import AdminSettings from "./AdminSettings";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import HistoryIcon from "@mui/icons-material/History";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

const TABS = [
  { key: "overview", label: "İcmal", icon: <DashboardOutlinedIcon /> },
  { key: "complaints", label: "Şikayətlər", icon: <ReportOutlinedIcon /> },
  { key: "orders", label: "Sifarişlər", icon: <AssignmentOutlinedIcon /> },
  { key: "masters", label: "Ustalar", icon: <EngineeringOutlinedIcon /> },
  { key: "customers", label: "Müştərilər", icon: <PeopleOutlineIcon /> },
  { key: "posts", label: "Paylaşımlar", icon: <PhotoLibraryOutlinedIcon /> },
  { key: "reviews", label: "Rəylər", icon: <StarOutlineIcon /> },
  { key: "settings", label: "Parametrlər", icon: <SettingsOutlinedIcon /> },
  { key: "logs", label: "Jurnal", icon: <HistoryIcon /> },
];

export default function AdminPanel() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.key === params.get("bolme")) ? params.get("bolme") : "overview";
  const go = (key) => setParams(key === "overview" ? {} : { bolme: key });

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
      <Typography variant="h4">Admin panel</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Saytın bütün idarəsi bir yerdə</Typography>
      <Tabs value={tab} onChange={(_, v) => go(v)} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
        {TABS.map((t) => <Tab key={t.key} value={t.key} label={t.label} icon={t.icon} iconPosition="start" sx={{ minHeight: 48 }} />)}
      </Tabs>
      <Box>
        {tab === "overview" && <AdminOverview onNavigate={go} />}
        {tab === "complaints" && <AdminComplaints />}
        {tab === "orders" && <AdminOrders />}
        {tab === "masters" && <AdminMasters />}
        {tab === "customers" && <AdminCustomers />}
        {tab === "posts" && <AdminPosts />}
        {tab === "reviews" && <AdminReviews />}
        {tab === "settings" && <AdminSettings />}
        {tab === "logs" && <AdminLogs />}
      </Box>
    </Container>
  );
}
