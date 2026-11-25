import api, { errorMessage } from "../../api/client";

const get = (o, path) => path.split(".").reduce((v, k) => v?.[k], o);

// Görünən səhifəni Excel-də açılan CSV kimi yükləyir. "=+-@" ilə başlayan xana formula kimi işləməsin deyə qabağına ' qoyulur.
export function downloadCsv(name, items, fields) {
  const cell = (v) => {
    let s = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = [fields.join(","), ...items.map((i) => fields.map((f) => cell(get(i, f))).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `elustu-${name}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Birdəfəlik şifrə bərpa linki (1 saat). Link hesaba giriş verir — yalnız sahibinə göndərilməlidir.
export async function showResetLink(url) {
  if (!window.confirm("Bu hesab üçün şifrə bərpa linki yaradılsın? Link 1 saat işləyir və jurnala yazılır. Yalnız hesabın sahibinə göndərin.")) return;
  try {
    const { data } = await api.post(url);
    window.prompt("Linki kopyalayın (Ctrl+C):", data.link);
  } catch (e) {
    window.alert(errorMessage(e));
  }
}
