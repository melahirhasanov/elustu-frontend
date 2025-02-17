import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { logout } from '../../../../../Server/features/authSlice';
import AdbIcon from '@mui/icons-material/Adb';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];
const Header = () => {
  const dispatch=useDispatch()
  const navigate=useNavigate()
  const {isAuthenticated}=useSelector((state)=>state.auth)
  const handleLogOut=()=>{
    dispatch(logout())
    navigate("/login")
  }
    const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
    <AppBar position="fixed" sx={{backgroundColor:"white",color:"black"}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'black',
              textDecoration: 'none',
            }}
          >
            USTA.AZ
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="black"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
                <MenuItem key={"Navbar"} onClick={handleCloseNavMenu} sx={{display:"flex",flexDirection:"column"}}>
                  <Button  onClick={()=>{if(!isAuthenticated){navigate("signup")}}} style={{textDecoration:"none"}} ><Typography sx={{ textAlign: 'center' }}>Qeydiyyatdan Keç</Typography></Button>
                  <Button  onClick={()=>{if(!isAuthenticated){navigate("login")}}} style={{textDecoration:"none"}} ><Typography sx={{ textAlign: 'center' }}>Daxil Ol</Typography></Button>
                  <Button  style={{textDecoration:"none"}} ><Typography sx={{ textAlign: 'center' }}>Servislerimiz</Typography></Button>
                  <Button  style={{textDecoration:"none"}} ><Typography sx={{ textAlign: 'center' }}>Usta Qeydiyyatı</Typography></Button>

                </MenuItem>
              
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'black',
              textDecoration: 'none',
            }}
          >
            USTA.AZ
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              <>
              
              <Button
                key={"Navbar"}
                onClick={()=>{if(!isAuthenticated){navigate("signup")}}}
                sx={{ color: 'black', display: 'block',my:4,mx:3}}
                
              >
                Qeydiyyatdan Keç
              </Button>
             <Button
              key={"Navbar"}
              onClick={()=>{if(!isAuthenticated){navigate("login")}}}
              sx={{  color: 'black', display: 'block',my:4,mx:3}}
            >
              Daxil Ol
            </Button>
            <NavLink style={{textDecoration:"none"}} to={"/servislərimiz"}><Button
            key={"Navbar"}
            onClick={handleCloseNavMenu}
            sx={{ color: 'black', display: 'block',my:4,mx:3}}
          >
           Servislərimiz
          </Button></NavLink>
          <NavLink style={{textDecoration:"none"}} to={"/signup"}><Button
          key={"Navbar"}
          onClick={handleCloseNavMenu}
          sx={{  color: 'black', display: 'block',my:4,mx:3}}
        >
          Usta Ol
        </Button></NavLink></>
            
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
                <MenuItem key="R" onClick={handleCloseUserMenu}>
                  <Typography sx={{ textAlign: 'center' }}>Profilim</Typography>
                </MenuItem>
                <MenuItem key="R" onClick={handleCloseUserMenu}>
                  <Typography sx={{ textAlign: 'center' }}>Parametrler</Typography>
                </MenuItem><MenuItem  key="logout" onClick={handleLogOut}>
                  <Typography sx={{ textAlign: 'center' }}>Cixis</Typography>
                </MenuItem><MenuItem key="R" onClick={handleCloseUserMenu}>
                  <Typography sx={{ textAlign: 'center' }}>Komek</Typography>
                </MenuItem>
              
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
    </>
  )
}

export default Header