import { Chip, Tooltip } from "@mui/material";

// Nümunə profil: real adam deyil, saytın necə görünəcəyini göstərir (Server/scripts/seedDemo.js)
export default function DemoChip() {
  return (
    <Tooltip title="Bu profil nümunədir, real usta deyil. Sifariş, mesaj və zəng qəbul etmir.">
      <Chip size="small" label="Nümunə profil" color="info" variant="outlined" sx={{ fontWeight: 700, flexShrink: 0 }} />
    </Tooltip>
  );
}
