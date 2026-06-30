const BUILD_ID = new URL(self.location.href).searchParams.get("build") || "1";
const STATIC_CACHE = `wedding-static-${BUILD_ID}`;
const PHOTO_CACHE = `wedding-photos-${BUILD_ID}`;

const PRECACHE_URLS = [
  "/party/person-placeholder.svg",
  "/annita-help.png",
  "/annita-thinking.png",
  "/hero.jpg",
  "/icon-192",
  "/glow-up/teeth-whitening-party.png",
  "/glow-up/botox-pump-party.png",
  "/transfers/airport-express-departure.png",
];

function isPhotoRequest(url) {
  return (
    url.pathname === "/api/guest/profile/photo" ||
    url.pathname === "/api/guest/profile/companion-photo"
  );
}

function isStaticAsset(url) {
  if (url.pathname.startsWith("/_next/static/")) return true;
  if (url.pathname.startsWith("/_next/image")) return true;
  return /\.(?:png|jpe?g|webp|svg|gif|ico|avif)$/i.test(url.pathname);
}

function shouldSkipCache(url) {
  if (url.pathname.startsWith("/api/auth/")) return true;
  if (url.pathname === "/api/app-version") return true;
  if (url.pathname.startsWith("/api/admin/")) return true;
  return false;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        void cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    void network;
    return cached;
  }

  const response = await network;
  if (response) return response;
  return Response.error();
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([STATIC_CACHE, PHOTO_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("wedding-") && !keep.has(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || shouldSkipCache(url)) return;

  if (isPhotoRequest(url)) {
    event.respondWith(staleWhileRevalidate(event.request, PHOTO_CACHE));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(event.request, STATIC_CACHE));
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = { title: "J&J's wedding", body: "", icon: "/annita-help.png", badge: "/icon-192" };
  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    payload.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon ?? "/annita-help.png",
      badge: payload.badge ?? "/icon-192",
      tag: payload.tag,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/");
    }),
  );
});
