import type { MetadataRoute } from 'next'

// Bu dosya Next.js tarafından otomatik olarak /manifest.webmanifest'e dönüştürülür.
// Telefonda "Ana Ekrana Ekle" ile kurulabilir hale gelmesini sağlayan dosya budur.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BRN Depo WMS',
    short_name: 'Depo WMS',
    description: 'BRN Sleep Products depo talep ve iş emri yönetimi',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0b3c5d',
    lang: 'tr',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
