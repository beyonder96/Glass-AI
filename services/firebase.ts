import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAPSwSIFJlGBNaKzpKC5pdBfXaOsaIdL1M",
  authDomain: "gen-lang-client-0215607229.firebaseapp.com",
  projectId: "gen-lang-client-0215607229",
  storageBucket: "gen-lang-client-0215607229.firebasestorage.app",
  messagingSenderId: "346105987804",
  appId: "1:346105987804:web:251f1b3e34ae471cf9ea19",
  // ... outras chaves
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();