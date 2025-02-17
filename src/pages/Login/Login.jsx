import * as React from "react";
import { TextField, Button, Typography, Container, Box } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import GoogleIcon from "@mui/icons-material/Google"; // Google İkonu
import { login } from "../../../../../Server/features/authSlice"; // Redux login action
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useEffect } from "react";
import style from "./Login.module.css"
const StyledTextField = styled(TextField)({
  "& input": {
    padding: "18px",
    fontSize: "18px",
  },
});

const StyledButton = styled(Button)({
  fontSize: "18px",
  padding: "14px",
  borderRadius: "10px",
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const { isAuthenticated,loading, error } = useSelector((state) => state.auth); // Redux auth state
  const navigate = useNavigate();
useEffect(()=>{console.log("isAuth:",isAuthenticated)

  if(isAuthenticated){
    navigate("/")
  }
},[isAuthenticated,navigate])
  // ✅ Düzəliş olunmuş handleSubmit funksiyası
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(login({email, password})).then((result) => {
        console.log("Login nəticəsi:", result); // Debug üçün
        if (result?.payload) {
          navigate("/"); // Uğurlu olduqda yönləndir
        } else {
          console.error("Login uğursuz oldu:", result);
        }
      });
    } catch (err) {
      console.error("Xəta baş verdi:", err);
    }
  };

  // Google login
  const handleGoogleLogin = () => {
    window.open("http://localhost:8080/auth/google","_self")
  };

  return (<div  className={style.Medium}>
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 5,
          backgroundColor: "white",
          borderRadius: 3,
          boxShadow: 4,
          width: "100%",
          maxWidth: "550px",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Xoş Gəlmişsiniz!
        </Typography>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <StyledTextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
            required
          />
          <StyledTextField
            label="Password"
            type="password"
            value={password}
            fullWidth
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            margin="normal"
            required
          />
          <NavLink to="/reset">forget Password?</NavLink>
          <StyledButton fullWidth variant="contained" color="primary" sx={{ mt: 3 }} type="submit">
            Log In
          </StyledButton>

          <StyledButton
            fullWidth
            variant="outlined"
            color="inherit"
            sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}
            onClick={handleGoogleLogin}
          >
            <GoogleIcon /> Google ilə Daxil ol
          </StyledButton>

          <Typography variant="body1" sx={{ mt: 2 }}>
            Hesabınız yoxdur?{" "}
            <Button onClick={() => navigate("/signup")} sx={{ textTransform: "none", fontSize: "16px" }}>
              Qeydiyyat
            </Button>
          </Typography>
        </form>
      </Box>
    </Container></div>
  );
};

export default Login;
