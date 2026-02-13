importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAWRWzPfFDVvH93WjN0AUzwj48bBpOWVS4',
  authDomain: 'junplid-6dc90.firebaseapp.com',
  projectId: 'junplid-6dc90',
  messagingSenderId: '899622631464',
  appId: '1:899622631464:web:c58ea73bbea0e3fdf49d1d',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async payload => {
  const allClients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

 const isOnSamePage = allClients.some(client =>
    client.url.includes(url) &&
    client.visibilityState === "visible"
  );

  if (isOnSamePage) {
    // Usuário já está exatamente nessa página
    return;
  }


  const { title, body, url, tag } = payload.data;

  self.registration.showNotification(title, {
    body,
    data: { url },
    tag,
    renotify: false
  });
});

self.addEventListener('notificationclick', async event => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";
 
  const allClients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of allClients) {
    if (client.url.includes(targetUrl)) {
      await client.focus();
      return;
    }
  }

  await self.clients.openWindow(targetUrl); 
});
