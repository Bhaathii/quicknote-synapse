
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdL5aneLOPY_hYKX5Ql0m9gDwfXetX5eo",
  authDomain: "quicknote5.firebaseapp.com",
  projectId: "quicknote5",
  storageBucket: "quicknote5.firebasestorage.app",
  messagingSenderId: "759611982586",
  appId: "1:759611982586:web:f104f216bad7e61b49bf43",
  measurementId: "G-99L2KH5SZP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
