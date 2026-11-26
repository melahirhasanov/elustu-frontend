// Build sonrası: hər xidmət üçün öz başlığı və mətni olan statik HTML, sitemap.xml və robots.txt.
// Axtarış robotu JavaScript-i işlətməsə belə səhifənin nə haqqında olduğunu görür; React açılanda məzmunu əvəz edir.
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SERVICES, SITE_URL } from "../src/constants/seo.js";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const template = readFileSync("dist/index.html", "utf8");
if (!template.includes("<!--SEO_STATIC-->")) throw new Error("index.html-də SEO_STATIC bloku yoxdur");

const page = (path, title, description, body) => {
  let html = template
    .replaceAll(`<title>${DEFAULT_TITLE}</title>`, `<title>${esc(title)}</title>`)
    .replaceAll(`content="${esc(DEFAULT_TITLE)}"`, `content="${esc(title)}"`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(description)}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(description)}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${SITE_URL}${path}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${SITE_URL}${path}"`)
    .replace(/<!--SEO_STATIC-->[\s\S]*<!--\/SEO_STATIC-->/, `<!--SEO_STATIC--><main style="max-width:880px;margin:0 auto;padding:48px 16px;font-family:Inter,Arial,sans-serif">${body}</main><!--/SEO_STATIC-->`);
  if (!html.includes(`<title>${esc(title)}</title>`)) throw new Error("Başlıq dəyişmədi: " + path);
  // "/xidmetler/santexnik" -> dist/xidmetler/santexnik.html: Netlify sonuna "/" əlavə edib yönləndirmir
  const file = "dist" + path + ".html";
  mkdirSync(file.slice(0, file.lastIndexOf("/")), { recursive: true });
  writeFileSync(file, html);
};

const link = (s) => `<a href="/xidmetler/${s.slug}">${esc(s.name)}</a>`;
const popular = SERVICES.filter((s) => s.popular);

page("/xidmetler", "Bütün usta xidmətləri Bakıda | Əlüstü", `Əlüstü-də ${SERVICES.length} xidmət növü: santexnik, elektrikçi, kombi, kondisioner, mebel, təmir-tikinti ustası və s.`,
  `<h1>Usta xidmətləri</h1><p>${esc(DEFAULT_DESCRIPTION)}</p><ul>${SERVICES.map((s) => `<li>${link(s)}</li>`).join("")}</ul>`);

for (const s of SERVICES) {
  const short = s.name.replace(/\s*\(.*?\)/, "");
  page(`/xidmetler/${s.slug}`, s.title, s.description,
    `<h1>${esc(short)} Bakıda</h1><p>${esc(s.description)}</p>` +
    `<p><a href="/tap?xidmet=${encodeURIComponent(s.name)}">Yaxınlıqdakı ${esc(short.toLowerCase())} tap</a></p>` +
    (s.problems.length ? `<h2>Hansı işlər üçün ${esc(short.toLowerCase())} çağırılır?</h2><ul>${s.problems.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : "") +
    `<h2>Digər xidmətlər</h2><p>${popular.filter((x) => x.slug !== s.slug).map(link).join(" · ")}</p>`);
}

// Ana səhifənin statik məzmununa populyar xidmət linkləri
writeFileSync("dist/index.html", template.replace("</main><!--/SEO_STATIC-->", `<p>${popular.map(link).join(" · ")}</p></main><!--/SEO_STATIC-->`));

const today = new Date().toISOString().slice(0, 10);
const urls = [["/", "1.0"], ["/tap", "0.9"], ["/xidmetler", "0.9"], ["/ustalar", "0.7"], ["/qeydiyyat", "0.4"],
  ...SERVICES.map((s) => [`/xidmetler/${s.slug}`, s.popular ? "0.8" : "0.6"])];
writeFileSync("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, p]) => `  <url><loc>${SITE_URL}${u}</loc><lastmod>${today}</lastmod><priority>${p}</priority></url>`).join("\n")}
</urlset>
`);
writeFileSync("dist/robots.txt", `User-agent: *
Allow: /
Disallow: /admin
Disallow: /profil
Disallow: /sifarisler
Disallow: /mesajlar
Disallow: /new-password/

Sitemap: ${SITE_URL}/sitemap.xml
`);
console.log(`SEO: ${SERVICES.length + 1} statik səhifə, sitemap (${urls.length} ünvan), robots.txt`);
