import { useEffect } from "react";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from "../constants/seo";

const setMeta = (selector, attr, value) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith("link") ? "link" : "meta");
    const [, key, name] = selector.match(/\[(\w+)="([^"]+)"\]/);
    el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

// Səhifənin başlığı, təsviri və kanonik ünvanı (axtarış nəticələrində görünən mətn)
// null verilsə heç nə dəyişmir (səhifə başlığını özü qoyur)
export default function usePageMeta(meta) {
  const { title, description, path, noindex } = meta || {};
  const skip = !meta;
  useEffect(() => {
    if (skip) return;
    document.title = title || DEFAULT_TITLE;
    setMeta('meta[name="description"]', "content", description || DEFAULT_DESCRIPTION);
    setMeta('meta[property="og:title"]', "content", title || DEFAULT_TITLE);
    setMeta('meta[property="og:description"]', "content", description || DEFAULT_DESCRIPTION);
    setMeta('meta[name="robots"]', "content", noindex ? "noindex, follow" : "index, follow");
    if (path !== undefined) {
      setMeta('link[rel="canonical"]', "href", SITE_URL + path);
      setMeta('meta[property="og:url"]', "content", SITE_URL + path);
    }
  }, [skip, title, description, path, noindex]);
}
