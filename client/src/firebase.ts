import axios from "axios";
import firebase from "firebase/app";
import "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBulzkKXdcTDfncXlQRldzTPrstZeLLcqs",
  authDomain: "test-807f2.firebaseapp.com",
  projectId: "test-807f2",
  storageBucket: "test-807f2.appspot.com",
  messagingSenderId: "402722921559",
  appId: "1:402722921559:web:d1155197285e5d499f1712",
  measurementId: "G-LH91ZZDV2S",
};
const vapidKey = "BERNilgT6cUDoiqTS1biGQn-syDgYRSWAUsvKYbVOReP2xN09H5BiNzFoz2W64nXcDZiWQ-szKE4uH1ZMsJ1PJg";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

/*
Called if/when we want foreground notifications to be handled in some way
*/
export const setupForegroundHandling = () => {
  const messaging = firebase.messaging();
  messaging.onMessage((payload) => {
    console.log("Payload is ", payload);
  });
};

/*
Retrieves token for the current device and makes request to add it to the database
*/
export const addToken = () => {
  const messaging = firebase.messaging();
  messaging
    .getToken({ vapidKey: vapidKey })
    .then((currentToken) => {
      if (currentToken) {
        const fcm_token = {
          fcm_token: currentToken,
        };
        axios.post(process.env.NEXT_PUBLIC_API_URL + "/add_fcm_tokens/", fcm_token).catch((error) => {
          console.error({ error });
        });
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    })
    .catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
    });
};

/*
Retrieves token for the current device/browser and requests it be removed from the database
*/
export const removeToken = () => {
  const messaging = firebase.messaging();
  return messaging
    .getToken({ vapidKey: vapidKey })
    .then((currentToken) => {
      if (currentToken) {
        const fcm_token = {
          fcm_token: currentToken,
        };
        axios.post(process.env.NEXT_PUBLIC_API_URL + "/remove_fcm_tokens/", fcm_token).catch((error) => {
          console.error({ error });
        });
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    })
    .catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
    });
};

/*
Delete the token associated with the instance of firebase.messaging() associated with this app
*/
export const deleteToken = async () => {
  const messaging = firebase.messaging();
  const res = await messaging.deleteToken();
  return res;
}