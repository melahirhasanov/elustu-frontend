import { Link as RouterLink, useParams } from "react-router-dom";
import { Box, Breadcrumbs, Button, Card, CardActionArea, Chip, Container, Grid, Link, Stack, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CategoryIcon from "../components/CategoryIcon";
import usePageMeta from "../hooks/usePageMeta";
import { SERVICES, serviceBySlug } from "../constants/seo";
import NotFound from "./NotFound";

const findFor = (name) => `/tap?xidmet=${encodeURIComponent(name)}`;

function ServiceGrid({ items }) {
  return (
    <Grid container spacing={1.5}>
      {items.map((s) => (
        <Grid item xs={6} sm={4} md={3} key={s.slug}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardActionArea component={RouterLink} to={`/xidmetler/${s.slug}`} sx={{ p: 1.5, height: "100%" }}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <CategoryIcon category={s.name} color="primary" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography>
              </Stack>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function ServiceList() {
  usePageMeta({
    title: "Bütün usta xidmətləri Bakıda | Əlüstü",
    description: `Əlüstü-də ${SERVICES.length} xidmət növü: santexnik, elektrikçi, kombi, kondisioner, mebel, təmir-tikinti ustası və s. Yaxınlıqdakı ustanı tapın.`,
    path: "/xidmetler",
  });
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h1" sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" }, mb: 1 }}>Usta xidmətləri</Typography>
      <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 640 }}>
        Ehtiyacınız olan ustanı seçin: Bakıda və Azərbaycanın digər şəhərlərində yaxınlıqdakı ustaları xəritədə görün, rəylərə baxın və sifariş verin.
      </Typography>
      <ServiceGrid items={SERVICES} />
    </Container>
  );
}

function ServiceDetail({ service }) {
  usePageMeta({ title: service.title, description: service.description, path: `/xidmetler/${service.slug}` });
  const short = service.name.replace(/\s*\(.*?\)/, "");
  const related = SERVICES.filter((s) => s.popular && s.slug !== service.slug).slice(0, 8);
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">Əlüstü</Link>
        <Link component={RouterLink} to="/xidmetler" underline="hover" color="inherit">Xidmətlər</Link>
        <Typography color="text.primary">{short}</Typography>
      </Breadcrumbs>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: "action.hover", display: "flex" }}>
          <CategoryIcon category={service.name} color="primary" fontSize="large" />
        </Box>
        <Typography variant="h1" sx={{ fontSize: { xs: "1.7rem", md: "2.3rem" } }}>{short} Bakıda</Typography>
      </Stack>
      <Typography sx={{ mb: 3, fontSize: "1.05rem" }} color="text.secondary">{service.description}</Typography>
      <Button size="large" variant="contained" startIcon={<SearchIcon />} component={RouterLink} to={findFor(service.name)}>
        Yaxınlıqdakı {short.toLowerCase()} tap
      </Button>

      {service.problems.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h2" sx={{ fontSize: "1.3rem", mb: 1.5 }}>Hansı işlər üçün {short.toLowerCase()} çağırılır?</Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
            {service.problems.map((p) => <Chip key={p} label={p} variant="outlined" />)}
          </Stack>
        </Box>
      )}

      <Box sx={{ mt: 5 }}>
        <Typography variant="h2" sx={{ fontSize: "1.3rem", mb: 1.5 }}>Necə işləyir?</Typography>
        <Typography color="text.secondary" component="ol" sx={{ pl: 2.5, "& li": { mb: 0.75 } }}>
          <li>Problemi öz sözlərinizlə yazın və ya “{short}” seçin.</li>
          <li>Yerinizi göstərin: yaxınlıqdakı ustalar xəritədə məsafəyə görə düzülür.</li>
          <li>Profilə, işlərin şəkillərinə və rəylərə baxın, saytdan zəng edin və ya yazın.</li>
          <li>Sifariş verin; iş bitəndən sonra rəy yazın.</li>
        </Typography>
      </Box>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h2" sx={{ fontSize: "1.3rem", mb: 1.5 }}>Digər populyar xidmətlər</Typography>
        <ServiceGrid items={related} />
        <Button component={RouterLink} to="/xidmetler" sx={{ mt: 2 }}>Bütün xidmətlər</Button>
      </Box>
    </Container>
  );
}

export default function Services() {
  const { slug } = useParams();
  if (!slug) return <ServiceList />;
  const service = serviceBySlug(slug);
  return service ? <ServiceDetail service={service} /> : <NotFound />;
}
