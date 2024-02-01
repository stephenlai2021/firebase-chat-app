// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
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

  // apiKey: process.env.NEXT_PUBLIC_APIKEY,
  // authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  // projectId: process.env.NEXT_PUBLIC_PROJECTID,
  // storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  // messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  // appId: process.env.NEXT_PUBLIC_APPID,
  // measurementId: process.env.NEXT_PUBLIC_MEASUREMENTID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleAuthProvider = new GoogleAuthProvider()
const firestore = getFirestore(app);
const storage = getStorage(app)

export { auth, googleAuthProvider, firestore, storage };
