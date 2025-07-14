import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBT9Xy3thyN8V21JjpM8gXh5gWciLGEIO8",
  authDomain: "swipeit-994b9.firebaseapp.com",
  projectId: "swipeit-994b9",
  storageBucket: "swipeit-994b9.appspot.com",
  messagingSenderId: "854755101370",
  appId: "1:854755101370:web:c81040eca8634859d51083",
  measurementId: "G-XLXD0VYG7N"
};

const app = initializeApp(firebaseConfig);

// AsyncStorage destekli Auth başlat
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };
