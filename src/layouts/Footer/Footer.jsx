import React from "react";
import { Box, Typography, Container } from "@mui/material";
import { NavLink } from "react-router-dom";
import style from "./Footer.module.css";

const Footer = () => {
  return (<div style={{display:"flex",}}>
    <Box
      className={style.ELM}
      component="footer"
      sx={{
        position: "relative",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "orange",
        color: "white",
        py: 3,
        textAlign: "center",
        minWidth:"100%",
        flexWrap:"wrap",
        width:"100vw",
        overflow:"hidden",
        margin:"auto",
        padding:"20px"
      }}
    >
      <Container maxWidth={false} disableGutters sx={{width:"100%"}}>
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          Bizi izləyin: @Facebook
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap", 
            justifyContent: "center", 
            alignItems: "center",
            gap: 3, 
            mt: 2,
          }}
        >
          {/* Sol hissə */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: "1rem", md: "1.25rem" }, textAlign: "center" }}>
              Kəşf edin
            </Typography>
            <NavLink style={{ textDecoration: "none", color: "white", whiteSpace: "normal", wordWrap: "break-word" }} to="#">Tasker Ol</NavLink>
            <NavLink style={{ textDecoration: "none", color: "white" }} to="#">Şəhər Üzrə Xidmətlər</NavLink>
            <NavLink style={{ textDecoration: "none", color: "white" }} to="#">Yaxınlıqdakı Xidmətlər</NavLink>
          </Box>

          {/* Sağ hissə */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: "1rem", md: "1.25rem" }, textAlign: "center" }}>
              Şirkət
            </Typography>
            <NavLink style={{ textDecoration: "none", color: "white" }} to="#">Haqqımızda</NavLink>
            <NavLink style={{ textDecoration: "none", color: "white" }} to="#">Karyera</NavLink>
            <NavLink style={{ textDecoration: "none", color: "white" }} to="#">Şərtlər & Məxfilik</NavLink>
          </Box>
        </Box>
      </Container>
    </Box>
    <Box
      className={style.ELMİ}
      component="footer"
      sx={{
        position: "relative",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "orange",
        color: "white",
        py: 3,
        textAlign: "center",
        minWidth:"100%",
        flexWrap:"wrap",
        width:"100vw",
        overflow:"hidden",
        margin:"auto",
        padding:"20px"
      }}
    >
      <Container maxWidth={false} disableGutters sx={{width:"100%"}}>
        <Typography variant="body1" sx={{ textAlign: "center" ,color:"orange"}}>
          Bizi izləyin: @Facebook
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap", 
            justifyContent: "center", 
            alignItems: "center",
            gap: 3, 
            mt: 2,
            color:"orange"
          }}
        >
          {/* Sol hissə */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: "1rem", md: "1.25rem" }, textAlign: "center" ,color:"orange"}}>
              Kəşf edin
            </Typography>
            <NavLink style={{color:"orange", textDecoration: "none",  whiteSpace: "normal", wordWrap: "break-word" }} to="#">Tasker Ol</NavLink>
            <NavLink style={{color:"orange", textDecoration: "none",  }} to="#">Şəhər Üzrə Xidmətlər</NavLink>
            <NavLink style={{color:"orange", textDecoration: "none",  }} to="#">Yaxınlıqdakı Xidmətlər</NavLink>
          </Box>

          {/* Sağ hissə */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="h6" sx={{ fontSize: { xs: "1rem", md: "1.25rem" }, textAlign: "center" }}>
              Şirkət
            </Typography>
            <NavLink style={{ textDecoration: "none", color: "orange" }} to="#">Haqqımızda</NavLink>
            <NavLink style={{ textDecoration: "none", color: "orange" }} to="#">Karyera</NavLink>
            <NavLink style={{ textDecoration: "none", color: "orange" }} to="#">Şərtlər & Məxfilik</NavLink>
          </Box>
        </Box>
      </Container>
    </Box>
    </div>
  );
};

export default Footer;
