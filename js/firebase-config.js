// js/firebase-config.js
// Simple browser-friendly Firebase config for the compat SDK used by the site.
// Replace the values below with the ones from your Firebase Console (Web App).
// Make sure Realtime Database is created in the Console and set rules appropriately for testing.

window.firebaseConfig = {
  apiKey: "AIzaSyBFJpzUKVYhieOk7hHOrP4mihxh4nokFSU",
  authDomain: "site-velha-manna.firebaseapp.com",
  // Please confirm the correct Realtime Database URL in your Firebase Console and update if needed:
  databaseURL: "https://site-velha-manna-default-rtdb.firebaseio.com",
  projectId: "site-velha-manna",
  storageBucket: "site-velha-manna.firebasestorage.app",
  messagingSenderId: "37609798132",
  appId: "1:37609798132:web:f8a7b4b71251529348e1a1",
  measurementId: "G-KBSN1ZPQS1",
};

// Note: we intentionally do NOT call firebase.initializeApp() here;
// `js/storage.js` will initialize using the compat global SDK when loaded.
