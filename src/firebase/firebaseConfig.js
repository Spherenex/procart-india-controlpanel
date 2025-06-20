// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

// const firebaseConfig = {
//   apiKey: "AIzaSyAOFbpbOwdren9NlNtWvRVyf4DsDf9-2H4",
//   authDomain: "procart-8d2f6.firebaseapp.com",
//   projectId: "procart-8d2f6",
//   storageBucket: "procart-8d2f6.firebasestorage.app",
//   messagingSenderId: "1026838026898",
//   appId: "1:1026838026898:web:56b3889e347862ca37a44b",
//   measurementId: "G-RW7V299RPY"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Firebase services
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);

// export default app;



import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAOFbpbOwdren9NlNtWvRVyf4DsDf9-2H4",
  authDomain: "procart-8d2f6.firebaseapp.com",
  projectId: "procart-8d2f6",
  storageBucket: "procart-8d2f6.firebasestorage.app",
  messagingSenderId: "1026838026898",
  appId: "1:1026838026898:web:56b3889e347862ca37a44b",
  measurementId: "G-RW7V299RPY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;