import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
	authDomain: process.env.REACT_APP_AUTH_DOMAIN,
	projectId: process.env.REACT_APP_PROJECT_ID,
	storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
	measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);