/* SPARK WALLET service worker — receives push notifications when app is closed */
self.addEventListener("install", (e) => { self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(self.clients.claim()); });

self.addEventListener("push", (event) => {
  let data = { title: "SPARK WALLET", body: "" };
  try { if (event.data) data = { ...data, ...event.data.json() }; }
  catch { if (event.data) data.body = event.data.text(); }

  const options = {
    body: data.body,
    icon: "/icon-512.png",
    badge: "/icon-512.png",
    vibrate: [200, 100, 200, 100, 200],
    tag: data.id || "spark-notify",
    renotify: true,
    requireInteraction: false,
    data: { url: "/notifications" },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ("focus" in c) { c.navigate(url); return c.focus(); } }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
