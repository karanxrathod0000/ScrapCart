// IMPORTANT: Replace with your Firebase project's configuration
// You can find this in your Firebase project settings.
// Go to Project Settings > General > Your apps > Web app > Firebase SDK snippet > Config

// To enable Google Sign-In:
// 1. Go to Firebase Console > Authentication > Sign-in method.
// 2. Enable the "Google" provider.

// To setup Firestore and Storage:
// 1. Go to Firestore Database > Create database (start in test mode for now).
// 2. Go to Storage > Get started (start in test mode for now).

const firebaseConfig = {
  apiKey: "AIzaSyDvOAqEAkReVqmdoQcW6rVaBgoU_PhY070",
  authDomain: "studio-917578335-c9fa7.firebaseapp.com",
  projectId: "studio-917578335-c9fa7",
  storageBucket: "studio-917578335-c9fa7.firebasestorage.app",
  messagingSenderId: "409029486175",
  appId: "1:409029486175:web:fe243dbe3f0bdfabdaddea"
};

// NOTE: For this code to work, you would need to import the Firebase SDKs in your importmap.
// Since that is not possible in this environment, we will assume these are globally available
// through a script tag that would be added to index.html in a real project.
// For example:
/*
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-storage-compat.js"></script>
<script>
  firebase.initializeApp(firebaseConfig);
</script>
*/

// For the purpose of this simulation, we'll expose a mock firebase object.
// In a real application, you would initialize and export the real services.
// This is a simplified mock to allow the rest of the code to compile.
const mockAuth = {
    onAuthStateChanged: () => () => {},
    // Add other methods used in the app as needed for compilation
};
const mockDb = {};
const mockStorage = {};
const mockGoogleProvider = {};

const isFirebaseConfigured = () => {
    return firebaseConfig.apiKey !== "AIzaSyDvOAqEAkReVqmdoQcW6rVaBgoU_PhY070";
};


// In a real app, you'd do:
//
// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
//
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);
// export const googleProvider = new GoogleAuthProvider();

// We'll export the mock objects for now.
export const auth = mockAuth;
export const db = mockDb;
export const storage = mockStorage;
export const googleProvider = mockGoogleProvider;
export { isFirebaseConfigured };
