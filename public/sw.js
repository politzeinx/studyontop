/// <reference lib="webworker" />

const CACHE_NAME = "studyontop-v1";
const OFFLINE_URL = "/dashboard";

const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/flashcards",
  "/flashcards/revisar",
  "/plano-estudos",
  "/banco-erros",
  "/simulados",
  "/manifest.json",
  "/icons/icon.svg",
];

self.addEventListener("install", (event) => {
  const e = event as ExtendableEvent;
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  (self as any).skipWaiting();
});

self.addEventListener("activate", (event) => {
  const e = event as ExtendableEvent;
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  (self as any).clients.claim();
});

self.addEventListener("fetch", (event) => {
  const e = event as FetchEvent;
  const { request } = e;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API routes — always go to network
  if (request.url.includes("/api/")) return;

  // Network-first strategy for pages, cache-first for static assets
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL) as Promise<Response>)
    );
  } else {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      }) as Promise<Response>
    );
  }
});
