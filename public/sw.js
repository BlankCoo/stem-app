self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", e => {
  // Clear all caches from previous service worker versions
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Push notification received
self.addEventListener("push", e => {
  let data = { title: "STEM", body: "Someone you follow is live!", url: "/" };
  try { data = { ...data, ...e.data.json() }; } catch {}
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: data.streamer_id || "stem-notif",
      data: { url: data.url || "/" },
    })
  );
});

// Notification click — open the app
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
      for (const c of windowClients) {
        if (c.url.startsWith(self.location.origin) && "focus" in c) {
          c.postMessage({ type: "PUSH_CLICK", url });
          return c.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
