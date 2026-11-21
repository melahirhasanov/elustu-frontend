import PlumbingIcon from "@mui/icons-material/Plumbing";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import ChairIcon from "@mui/icons-material/Chair";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import ConstructionIcon from "@mui/icons-material/Construction";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import KeyIcon from "@mui/icons-material/Key";
import ComputerIcon from "@mui/icons-material/Computer";
import WindowIcon from "@mui/icons-material/Window";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import PoolIcon from "@mui/icons-material/Pool";
import HandymanIcon from "@mui/icons-material/Handyman";

// Kateqoriya adındakı açar sözə görə ikon seçilir; uyğun gəlməyənlər üçün ümumi "usta" ikonu
const RULES = [
  [/santexnik|kanalizasiya/i, PlumbingIcon],
  [/avtomobil elektrik|elektrik/i, ElectricalServicesIcon],
  [/kondisioner|soyutma/i, AcUnitIcon],
  [/kombi|qaz|isitmə/i, WhatshotIcon],
  [/mebel|dülgər|qapı|parket|laminat/i, ChairIcon],
  [/malyar|oboy|fasad/i, FormatPaintIcon],
  [/təmizlik|xalça/i, CleaningServicesIcon],
  [/tikinti|alçıpan|kafel|fayans|metlax|tavan|pol|memar|metal/i, ConstructionIcon],
  [/avtomobil|vulkanizasiya/i, DirectionsCarIcon],
  [/bərbər/i, ContentCutIcon],
  [/çilingər/i, KeyIcon],
  [/İT|mühəndis/i, ComputerIcon],
  [/pəncərə|şüşə|vitraj/i, WindowIcon],
  [/işıqlandırma/i, LightbulbIcon],
  [/hovuz/i, PoolIcon],
];

export default function CategoryIcon({ category = "", ...props }) {
  const Icon = RULES.find(([rx]) => rx.test(category))?.[1] || HandymanIcon;
  return <Icon {...props} />;
}
