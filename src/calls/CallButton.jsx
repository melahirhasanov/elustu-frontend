import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, IconButton, Tooltip } from "@mui/material";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import { useCall } from "./CallProvider";

// "Zəng et" düyməsi: daxil olmayanı girişə aparır, öz-özünə zəngin qarşısını alır
export default function CallButton({ peerId, peerName, online, iconOnly, ...props }) {
  const { user } = useSelector((s) => s.auth);
  const { startCall, call } = useCall();
  const navigate = useNavigate();
  const location = useLocation();

  const handle = () => {
    if (!user) return navigate("/giris", { state: { from: location.pathname + location.search } });
    startCall(String(peerId), peerName);
  };

  const title = online === false ? "Hazırda oflayndır — zəng çatmaya bilər" : "Saytdan zəng et (nömrə paylaşılmır)";

  if (iconOnly) {
    return (
      <Tooltip title={title}>
        <span>
          <IconButton onClick={handle} disabled={Boolean(call)} color="primary" aria-label="Zəng et" {...props}>
            <CallOutlinedIcon />
          </IconButton>
        </span>
      </Tooltip>
    );
  }
  return (
    <Tooltip title={title}>
      <span>
        <Button variant="outlined" startIcon={<CallOutlinedIcon />} onClick={handle} disabled={Boolean(call)} {...props}>
          Zəng et
        </Button>
      </span>
    </Tooltip>
  );
}
