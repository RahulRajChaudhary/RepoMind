// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDO36uC8R94Vbsd8-7S_sv778bGkOkXnNw",
  authDomain: "repomind-7a118.firebaseapp.com",
  projectId: "repomind-7a118",
  storageBucket: "repomind-7a118.firebasestorage.app",
  messagingSenderId: "518961111553",
  appId: "1:518961111553:web:b8c2ce6fdd160f807b9600",
  measurementId: "G-XNMBZC58KY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);