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

messaging.onBackgroundMessage(payload => {
  const { title, body, url } = payload.data;

  self.registration.showNotification(title, {
    body,
    data: { url },
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.openWindow(url)
  );
});
