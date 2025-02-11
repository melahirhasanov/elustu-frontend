import React from 'react'
import Header from '../Header/Header'
import { Outlet } from "react-router-dom"
import Footer from '../Footer/Footer'
import { Box, Container } from '@mui/material'

const MainLayout = () => {
  return (
    <Box sx={{ 
      display: "flex",
      flexDirection: "column",
       
      width:"100%"// Səhifəni tam ekran boyunda saxlayır
    }}>
      <Header />

      {/* Ana məzmun sahəsi */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Container sx={{ flex: 1 }}>  
          <Outlet />
        </Container>
      </Box>

      <Footer />
    </Box>
  )
}

export default MainLayout
