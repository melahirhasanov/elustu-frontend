import { useEffect } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import Announcement from "./Announcement";

export default function MainLayout({ hideFooter = false }) {
  const { pathname } = useLocation();

  // Səhifə dəyişəndə yuxarıdan başla
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    // Tam ekran səhifələr (xəritə, chat) üçün layout ekran hündürlüyündə sabitlənir, sürüşmə olmur
    <Box sx={{ display: "flex", flexDirection: "column", ...(hideFooter ? { height: "100dvh", overflow: "hidden" } : { minHeight: "100vh" }) }}>
      <Header />
      <Announcement />
      <Box component="main" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </Box>
      {!hideFooter && <Footer />}
      <MobileNav />
    </Box>
  );
}
