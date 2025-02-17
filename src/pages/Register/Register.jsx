import React, { useState } from "react";
import { TextField, Button, Typography, Container, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import GoogleIcon from "@mui/icons-material/Google"; // Google İkonu
import { useDispatch, useSelector } from "react-redux";
import { register } from "../../../../../Server/features/authSlice";
import axios from "axios";

const PhoneContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "100%",
});

const CountryButton = styled(Button)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "110px",
  padding: "10px",
  background: "#e0e0e0",
  color: "black",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "default",
  "&:hover": {
    background: "#d6d6d6",
  },
});

const PhoneInput = styled(TextField)({
  flex: 1,
  "& input": {
    padding: "14px",
    fontSize: "16px",
  },
});

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const dispatch = useDispatch();
  const { loading, error,isRegistered } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    navigate("/login");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData))
      .then(() => {
        if(!isRegistered){
        navigate("/login")};
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  };

  const registerUser = async (userData) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/register",
        userData,
        { withCredentials: true }
      );
      console.log(response.data);
      if(!isRegistered){
      navigate("/login")};
    } catch (error) {
      console.error(error.response.data);
    }
  };

  const handleGoogleLogin = () => {
    window.open("http://localhost:8080/auth/google","_self")
  };

  return (
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
          padding: 4,
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 3,
          width: "100%",
          maxWidth: "450px",
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Istifadəçi Yarat
        </Typography>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <TextField
            name="username"
            label="Username"
            fullWidth
            variant="outlined"
            margin="normal"
            required
            onChange={handleChange}
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            margin="normal"
            required
            onChange={handleChange}
          />

          {/* 📌 Telefon nömrəsi sahəsi */}
          <PhoneContainer>
            <CountryButton disableRipple>
              <img
                src="https://flagcdn.com/w40/az.png"
                alt="Azerbaijan Flag"
                style={{ width: "24px", marginRight: "6px" }}
              />
              +994
            </CountryButton>

            <PhoneInput
              type="tel"
              variant="outlined"
              placeholder="50 123 45 67"
              onChange={handleChange}
              required
              name="phoneNumber"
            />
          </PhoneContainer>

          <TextField
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            margin="normal"
            required
            onChange={handleChange}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>

          {/* Google ilə qeydiyyat düyməsi */}
          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}
            onClick={handleGoogleLogin}
          >
            <GoogleIcon /> Google ilə Qeydiyyat
          </Button>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Button onClick={() => {navigate("/login")}} sx={{ textTransform: "none" }}>
              Log In
            </Button>
          </Typography>
        </form>
      </Box>
    </Container>
  );
};

export default Register;
