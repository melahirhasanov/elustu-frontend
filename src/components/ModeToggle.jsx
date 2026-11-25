import { IconButton, Tooltip } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";

// Gecə / gündüz rejimi. İlk dəfə cihazın ayarı götürülür, sonra seçim bu brauzerdə yadda qalır.
export default function ModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const isDark = (mode === "system" ? systemMode : mode) === "dark";
  const label = isDark ? "Gündüz rejimi" : "Gecə rejimi";
  return (
    <Tooltip title={label}>
      <IconButton onClick={() => setMode(isDark ? "light" : "dark")} aria-label={label}>
        {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
}
