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
  // Customize notification here
  const notificationTitle = `Piqued message from ${group}`;
  const notificationOptions = {
    body: message,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});