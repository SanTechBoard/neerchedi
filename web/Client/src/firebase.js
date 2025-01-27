import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FBRTDBAPI,
    databaseURL: import.meta.env.VITE_FBRTDBURL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app); 