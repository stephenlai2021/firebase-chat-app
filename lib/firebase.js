// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDjcWHQ2wTL--qPZcbXp6K8DA67v4LYxgo",
  authDomain: "nextjs-14.firebaseapp.com",
  projectId: "nextjs-14",
  storageBucket: "nextjs-14.appspot.com",
  messagingSenderId: "596214663576",
  appId: "1:596214663576:web:bb72ecfc6611e1a12dc3ed",
  measurementId: "G-3XV73FT63T",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app)

export { firestore, auth, storage };
