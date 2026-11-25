import { forwardRef } from "react";
import { useColorScheme } from "@mui/material/styles";
import Map, { AttributionControl, NavigationControl } from "@vis.gl/react-maplibre";
import { setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// maplibre-gl worker faylını dinamik yolla axtarır; Vite onu build-ə daxil etsin deyə açıq bundle edib ünvanını veririk
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

setWorkerUrl(workerUrl);
import { DEFAULT_VIEW, MAP_STYLE, MAP_STYLE_DARK } from "./mapUtils";

// Tətbiqin bütün xəritələri üçün ortaq əsas: üslub, idarəetmə düymələri, attribution
const BaseMap = forwardRef(function BaseMap({ children, initialViewState, controls = true, style, ...props }, ref) {
  const { mode, systemMode } = useColorScheme();
  const isDark = (mode === "system" ? systemMode : mode) === "dark";
  return (
    <Map
      ref={ref}
      mapStyle={isDark ? MAP_STYLE_DARK : MAP_STYLE}
      initialViewState={initialViewState || DEFAULT_VIEW}
      style={{ width: "100%", height: "100%", ...style }}
      attributionControl={false}
      dragRotate={false}
      touchPitch={false}
      {...props}
    >
      <AttributionControl compact position="bottom-right" />
      {controls && <NavigationControl position="bottom-right" showCompass={false} />}
      {children}
    </Map>
  );
});

export default BaseMap;
