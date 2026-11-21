import { Link as RouterLink } from "react-router-dom";
import { Button, Container, Stack, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ py: 12, textAlign: "center" }}>
      <Typography variant="h1" sx={{ fontSize: "6rem", color: "primary.main" }}>404</Typography>
      <Typography variant="h5" gutterBottom>Səhifə tapılmadı</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>Axtardığınız səhifə silinib və ya ünvan səhvdir.</Typography>
      <Stack direction="row" spacing={1.5} justifyContent="center">
        <Button variant="contained" component={RouterLink} to="/">Ana səhifə</Button>
        <Button variant="outlined" component={RouterLink} to="/ustalar">Ustalar</Button>
      </Stack>
    </Container>
  );
}
