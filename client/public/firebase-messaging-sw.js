importScripts('https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.3.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: 'api-key',
  authDomain: 'project-id.firebaseapp.com',
  databaseURL: 'https://project-id.firebaseio.com',
  projectId: 'project-id',
  storageBucket: 'project-id.appspot.com',
  messagingSenderId: 'sender-id',
  appId: 'app-id',
  measurementId: 'G-measurement-id',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  group = payload['data']['group'];
  message = payload['data']['message'];
  sender = payload['data']['sender'];

  const notificationTitle = `${sender} sent a message to ${group}`;
  const notificationOptions = {
    body: message,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
  self.addEventListener('notificationclick', function(event) {
    let localUrl = "http://localhost:3000/";
    let prodUrl = "DOMAIN"
    event.notification.close();
    event.waitUntil(
        clients.matchAll({includeUncontrolled: true, type: 'window'}).then( windowClients => {
            // Check if there is already a window/tab open with the target URL
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                // If so, just focus it.
                if (client.url.includes(prodUrl) || client.url.includes(localUrl)) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
  });
});