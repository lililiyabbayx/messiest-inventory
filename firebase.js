// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAbRyKJR6wRmofLXWDH53hZs0ROICUGsnc",
  authDomain: "inventory-management-1475d.firebaseapp.com",
  projectId: "inventory-management-1475d",
  storageBucket: "inventory-management-1475d.appspot.com",
  messagingSenderId: "508872752498",
  appId: "1:508872752498:web:768814254a90349dca71eb",
  measurementId: "G-NLQT81P81Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
export { firestore };
