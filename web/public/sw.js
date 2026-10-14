self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = data.title || "La Factory";
  const options = {
    body: data.body || "",
    // The same alert arriving twice (e.g. two old subscriptions on this
    // device) replaces itself instead of stacking up.
    tag: [data.url || "", title, data.body || ""].join("|"),
    icon: "/brand/logo-cuadrado-original.jpg",
    badge: "/brand/logo-cuadrado-original.jpg",
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => "focus" in c);
      if (existing) {
        existing.navigate(url);
        return existing.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
