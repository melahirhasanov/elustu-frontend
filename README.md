# Əlüstü — frontend

Yaxınlıqdakı ustanı xəritədə tapmaq, yazışmaq, zəng etmək və sifariş vermək üçün veb tətbiq.
React 18, Vite, MUI, Redux Toolkit, MapLibre. Backend ayrıca repo-dadır. Canlı sayt: https://elustu.netlify.app

## İşə salma

```bash
npm ci
cp .env.example .env
npm run dev        # http://localhost:5173
npm run lint
npm run build && npm run csp-hash
```

## Struktur

| Qovluq | Məzmun |
|---|---|
| `src/pages/` | Səhifələr (`admin/` — admin panel, `auth/` — giriş və qeydiyyat) |
| `src/components/` | Təkrar istifadə olunan hissələr: xəritə, sifariş, profil, rəy |
| `src/layouts/` | Menyu, footer, telefon naviqasiyası |
| `src/calls/` | Saytdan zəng (WebRTC) |
| `src/api/` | REST və socket bağlantısı |
| `src/store/` | Redux: sessiya |
| `src/hooks/`, `src/utils/`, `src/constants/` | Köməkçilər |

`VITE_` ilə başlayan dəyərlər brauzerə gedir: ora heç vaxt gizli açar yazmayın.
Təhlükəsizlik başlıqları (CSP, HSTS) `netlify.toml` faylındadır.
