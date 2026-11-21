import { useRef, useState } from "react";
import { Marker } from "@vis.gl/react-maplibre";
import { Box, Button, Stack, Typography } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PlaceIcon from "@mui/icons-material/Place";
import BaseMap from "./BaseMap";
import { DEFAULT_VIEW, getCurrentPosition } from "./mapUtils";

// Yer seçimi: xəritəyə klik, pin-i sürüşdürmə və ya "Mənim yerim". value = [lat, lng]
export default function LocationPicker({ value, onChange, height = 280, label }) {
  const mapRef = useRef(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const useMyLocation = async () => {
    setLocating(true);
    setError("");
    try {
      const pos = await getCurrentPosition();
      onChange(pos);
      mapRef.current?.flyTo({ center: [pos[1], pos[0]], zoom: 15 });
    } catch (e) {
      setError(e.message);
    } finally {
      setLocating(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {label || (value ? "Yer seçildi — dəqiqləşdirmək üçün pin-i sürüşdürün" : "Xəritəyə klikləyərək yeri seçin")}
        </Typography>
        <Button size="small" startIcon={<MyLocationIcon />} onClick={useMyLocation} disabled={locating}>
          {locating ? "Təyin edilir..." : "Mənim yerim"}
        </Button>
      </Stack>
      <Box sx={{ height, borderRadius: 3, overflow: "hidden", border: 2, borderColor: value ? "primary.main" : "divider" }}>
        <BaseMap
          ref={mapRef}
          initialViewState={value ? { latitude: value[0], longitude: value[1], zoom: 15 } : DEFAULT_VIEW}
          onClick={(e) => onChange([e.lngLat.lat, e.lngLat.lng])}
          cursor="crosshair"
        >
          {value && (
            <Marker
              latitude={value[0]}
              longitude={value[1]}
              anchor="bottom"
              draggable
              onDragEnd={(e) => onChange([e.lngLat.lat, e.lngLat.lng])}
            >
              <PlaceIcon sx={{ fontSize: 46, color: "secondary.main", filter: "drop-shadow(0 3px 4px rgba(0,0,0,.35))", cursor: "grab" }} />
            </Marker>
          )}
        </BaseMap>
      </Box>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
