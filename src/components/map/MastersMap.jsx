import { useMemo } from "react";
import { Marker } from "@vis.gl/react-maplibre";
import { Box } from "@mui/material";
import BaseMap from "./BaseMap";
import MasterPin from "./MasterPin";
import { boundsOf, masterLatLng } from "./mapUtils";

// Kiçik xəritə (məs. profildə "İş yeri"): verilən ustaları göstərir və onlara yaxınlaşır
export default function MastersMap({ masters, height = "100%", interactive = true }) {
  const points = useMemo(
    () => masters.map((m) => ({ master: m, pos: masterLatLng(m) })).filter((x) => x.pos),
    [masters]
  );

  const initialViewState = useMemo(() => {
    if (points.length === 1) return { latitude: points[0].pos[0], longitude: points[0].pos[1], zoom: 14 };
    if (points.length > 1) return { bounds: boundsOf(points.map((p) => p.pos)), fitBoundsOptions: { padding: 40, maxZoom: 14 } };
    return undefined;
  }, [points]);

  return (
    <Box sx={{ height, width: "100%", borderRadius: 3, overflow: "hidden" }}>
      <BaseMap initialViewState={initialViewState} interactive={interactive} controls={interactive}>
        {points.map(({ master, pos }) => (
          <Marker key={master._id} latitude={pos[0]} longitude={pos[1]} anchor="bottom">
            <MasterPin master={master} />
          </Marker>
        ))}
      </BaseMap>
    </Box>
  );
}
