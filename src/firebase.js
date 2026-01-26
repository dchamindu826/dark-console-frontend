// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCLWvKDIZQTPPndhGfKE_cuP49XBix6eiw",
  authDomain: "dark--console-web.firebaseapp.com",
  projectId: "dark--console-web",
  storageBucket: "dark--console-web.firebasestorage.app",
  messagingSenderId: "857969802774",
  appId: "1:857969802774:web:e552b6a5cbedff78263f37",
  measurementId: "G-N3NFRVHZ3V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();