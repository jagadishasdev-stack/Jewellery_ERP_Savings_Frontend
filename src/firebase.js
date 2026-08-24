import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAuQajILf4ngpVZYS_PeduuEsx2cqU5lZA",
  authDomain: "nr-jewellery.firebaseapp.com",
  projectId: "nr-jewellery",
  storageBucket: "nr-jewellery.firebasestorage.app",
  messagingSenderId: "767997337403",
  appId: "1:767997337403:android:0d3320739dd4fbaa97e11e"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
