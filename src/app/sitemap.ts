export default function sitemap() {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000'
  return [
    { url: `${base}/quote/start`, priority: 1.0 },
    { url: `${base}/select-product`, priority: 0.8 },
    { url: `${base}/configure`, priority: 0.7 },
    { url: `${base}/summary`, priority: 0.6 },
  ]
}
