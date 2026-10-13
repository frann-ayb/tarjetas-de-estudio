/* Service worker de Mediflashy. Lo completa vite.config.ts en cada compilación (versión y lista de archivos). */
const VERSION = 'c46ecbe88dfb'
const CACHE = `mediflashy-${VERSION}`
const ARCHIVOS = [
  "./",
  "assets/index-D3ASQzYF.css",
  "assets/index-DE5lWV3J.js",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "index.html",
  "manifest.webmanifest",
  "pack/muestra.json"
]

// El mazo cifrado y la tabla de códigos van siempre a la red.
const SIEMPRE_RED = /\/pack\/(codigos\.json|mazo\.bin)$/

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((k) => k.startsWith('mediflashy-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const pedido = event.request
  if (pedido.method !== 'GET') return
  const url = new URL(pedido.url)
  if (url.origin !== self.location.origin) return
  if (SIEMPRE_RED.test(url.pathname)) return

  // Abrir la app: la portada guardada, con o sin parámetros en la dirección.
  if (pedido.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html', { ignoreSearch: true }).then((r) => r || caches.match('./') || fetch(pedido))
    )
    return
  }

  event.respondWith(caches.match(pedido, { ignoreSearch: true }).then((r) => r || fetch(pedido)))
})
