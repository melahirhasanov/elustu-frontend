// Əlüstü loqosu: açar (usta) + kəhrəba nöqtə ("dərhal", əlinin altında). public/favicon.svg ilə eynidir.
export default function BrandMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Əlüstü" style={{ display: "block", flexShrink: 0 }}>
      <rect width="64" height="64" rx="16" fill="#0F766E" />
      <path d="M41.5 14.5a10 10 0 0 0-12.8 12.3L15.6 39.9a4 4 0 0 0 5.7 5.7l13.1-13.1a10 10 0 0 0 12.3-12.8l-6 6-5.2-1.4-1.4-5.2z" fill="#fff" />
      <circle cx="46" cy="46" r="6" fill="#F59E0B" />
    </svg>
  );
}
